# 06 Logical Schema

## 1. Purpose
본 문서는 LAMS-v0 시스템의 개념 데이터를 실제 데이터베이스 구조로 변환하기 위해 필요한 기술 독립적인 논리적 명세(Logical Schema)를 기술합니다. 각 논리 레코드의 필드 타입, 제약 조건, 관계형 카디널리티 및 상태 변경 규칙을 구체화합니다.

## 2. Inputs Used
- [06_conceptual_data_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_conceptual_data_model.md)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- [05_api_contracts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_api_contracts.md)

## 3. Schema Overview
LAMS-v0 시스템은 Firebase Firestore를 물리 저장소로 채택하였으므로, 논리 스키마는 컬렉션-서브컬렉션 계층 관계 및 이에 상응하는 고유 식별자(ID) 조합과 필드 유효성 가드에 초점을 맞춰 설계되었습니다. 

---

## 4. Logical Records / Entities / Documents

### DSCH-001 — Conversation Record (상담 대화)
- Purpose: 개별 상담 대화 본문 및 평가 진척 요약 정보를 보관
- Related conceptual object: DATA-OBJ-001
- Related requirements: FR-001, FR-002, FR-003, FR-007, NFR-001
- Related domain concepts: DC-001, ENT-001
- Storage intent: source-of-truth
- Ownership: Admin (ROLE-001)
- Lifecycle: Admin 업로드 시 일괄 생성 -> 평가 제출 시 진행 카운트 갱신 -> 3차 완료 혹은 전원 일치 시 `Consensus Reached` 상태 변경 -> 삭제 확인 후 일괄 파괴.

#### Fields
| Field | Meaning | Type | Required | Editable By | Sensitive | Constraint / Validation | Notes |
|---|---|---|---|---|---|---|---|
| `call_id` | 대화 고유 비즈니스 키 | String | Yes | System (Upload) | No | 고유성 (Unique) | Firestore Document ID와 매핑 |
| `status` | Adjudication 진행 상태 | String | Yes | System (Mutation) | No | `"Round 1 Active"`, `"Round 2 Active"`, `"Round 3 Active"`, `"Consensus Reached"` 만 허용 | 상태 전이 다이어그램 준수 |
| `created_at` | 적재 시간 | Timestamp | Yes | System | No | 현재 서버 시간 | |
| `label_completion_count` | 현재 제출 완료된 라벨 수 | Integer | Yes | System | No | 0 이상 6 이하 | 진행률 산출 및 3인 제출 여부 탐지용 |
| `turns` | 대화 턴 배열 | Array of Map | Yes | System (Upload) | Yes | 비식별화 사전 처리 완료 확인 | `DSCH-002` 구조의 리스트 |

#### Relationships
| Relationship | Target | Cardinality | Required | Delete Behavior | Notes |
|---|---|---|---|---|---|
| Embedded Turns | DSCH-002 | 1 : N | Yes | Cascade (Embedded) | 별도 컬렉션 없이 내장 |
| Round Labels | DSCH-003 | 1 : N | No | Cascade Delete | 서브컬렉션으로 존재 |
| LLM Results | DSCH-004 | 1 : 1 | No | Cascade Delete | 서브컬렉션의 단일 문서 |
| Gold Standard | DSCH-005 | 1 : 1 | No | Cascade Delete | 서브컬렉션의 단일 문서 |

#### Constraints
- `call_id`는 공백을 제외한 유일 문자로만 구성되어야 함.
- `turns` 배열은 sequence_no 기준 오름차순 정렬이 유지되어야 함.

---

### DSCH-002 — Turn Value Object (대화 턴)
- Purpose: 대화 내부의 턴(발화자, 텍스트)을 순차 기록
- Related conceptual object: DATA-OBJ-002
- Related requirements: FR-003
- Related domain concepts: DC-002, VO-001
- Storage intent: source-of-truth (Embedded)
- Ownership: Admin
- Lifecycle: DSCH-001 내에 종속 생멸.

#### Fields
| Field | Meaning | Type | Required | Editable By | Sensitive | Constraint / Validation | Notes |
|---|---|---|---|---|---|---|---|
| `sequence_no` | 턴 순서 번호 | Integer | Yes | None (ReadOnly) | No | 1부터 시작하는 순차값 | 정렬 순서 기준 |
| `speaker` | 발화 주체 | String | Yes | None (ReadOnly) | No | `"customer"` 또는 `"agent"` | |
| `text` | 발화 텍스트 본문 | String | Yes | None (ReadOnly) | Yes | PII Warning 정규식 1차 검사 적용 | 사전 비식별화 필수 |

---

### DSCH-003 — Label Record (평가 라벨)
- Purpose: 평가자가 특정 차수(1 or 2)에 제출한 유해성 기록을 보관
- Related conceptual object: DATA-OBJ-003
- Related requirements: FR-004, SEC-002, BR-002
- Related domain concepts: DC-003, ENT-002, AGG-002
- Storage intent: source-of-truth
- Ownership: Evaluator (ROLE-002)
- Lifecycle: Evaluator 평가 저장/수정 시 폼 데이터를 받아 적재. parent `Conversation` 상태가 `Consensus Reached`인 경우 모든 수정 거부됨.

#### Fields
| Field | Meaning | Type | Required | Editable By | Sensitive | Constraint / Validation | Notes |
|---|---|---|---|---|---|---|---|
| `call_id` | 대화 식별자 | String | Yes | System | No | 부모 `call_id`와 동일 | |
| `user_id` | 평가자 식별자 | String | Yes | System (Session) | No | 로그인 유저 UID | |
| `round_no` | 평가 진행 차수 | Integer | Yes | System | No | `1` 또는 `2` | |
| `toxicity` | 유해 발화 판단 여부 | String | Yes | Evaluator | No | `"Present"` 또는 `"Absent"` | |
| `category_id` | 유해 발화 주 유형 코드 | Integer | No | Evaluator | No | `INV-002` (Present 인 경우에만 1~7 정수 필수) | 1:폭언/욕설, 2:성희롱, 3:위협, 4:기타유해... |
| `risk_level` | 위험 수준 | Integer | No | Evaluator | No | `INV-002` (Present 인 경우에만 1~3 정수 필수) | 1:낮음, 2:보통, 3:높음 |
| `evidence_phrases` | 판단 근거 구절 | Array of String | Yes | Evaluator | Yes | `INV-002` (Present 시 최소 1건 필수, Absent 시 빈 배열) | 본문 턴 내부의 핵심 구절 복사 |
| `submitted_at` | 제출 및 변경 시간 | Timestamp | Yes | System | No | 현재 서버 시간 | |

#### Relationships
| Relationship | Target | Cardinality | Required | Delete Behavior | Notes |
|---|---|---|---|---|---|
| Belongs to Conversation | DSCH-001 | N : 1 | Yes | Cascade Delete | Parent Aggregate |

#### Constraints
- **INV-001**: 동일 `call_id` + `user_id` + `round_no` 당 Document 유일성 보장. Document ID를 `{user_id}_{round_no}` 조합식으로 생성하여 멱등성 보장.
- **INV-002**: `toxicity == "Absent"`인 경우 `category_id = null`, `risk_level = null`, `evidence_phrases = []`가 강제 적용됨.

---

### DSCH-004 — LLM Decision Record (LLM 판정 결과)
- Purpose: 외부 3개 모델 x 3개 프롬프트 오프라인 연산 판정을 매핑 적재
- Related conceptual object: DATA-OBJ-004
- Related requirements: FR-005, INT-001
- Related domain concepts: DC-004, VO-003
- Storage intent: external
- Ownership: Admin
- Lifecycle: Admin JSON 업로드로 생성 -> 대화셋 삭제 시 동시 소멸.

#### Fields
| Field | Meaning | Type | Required | Editable By | Sensitive | Constraint / Validation | Notes |
|---|---|---|---|---|---|---|---|
| `call_id` | 대화 식별자 | String | Yes | System | No | 부모 `call_id` 일치 | |
| `model_verdicts` | 모델별 판정 데이터 맵 | Map of Map | Yes | System (Upload) | No | 3개 지정 모델명 키 필수 (예: `gpt4`, `gemini15`, `claude3`) | 각 모델별로 `toxicity`, `category_id`, `risk_level`, `reasoning`을 포함 |

---

### DSCH-005 — Gold Standard Label Record (합의 정답 라벨)
- Purpose: 최종적으로 확정 수립된 공식 유해성 정답 데이터를 보관
- Related conceptual object: DATA-OBJ-005
- Related requirements: User Request, BR-010
- Related domain concepts: DC-007, ENT-003
- Storage intent: source-of-truth
- Ownership: Adjudicator (ADJUD-01) / System
- Lifecycle: 1/2차 일치에 따른 자동 생성 또는 3차 Adjudicator 저장 시 생성. 대화 삭제 시 소멸.

#### Fields
| Field | Meaning | Type | Required | Editable By | Sensitive | Constraint / Validation | Notes |
|---|---|---|---|---|---|---|---|
| `call_id` | 대화 식별자 | String | Yes | System | No | 부모 `call_id`와 동일 | |
| `toxicity` | 최종 합의 유해 여부 | String | Yes | System / Adjudicator | No | `"Present"` 또는 `"Absent"` | |
| `category_id` | 최종 합의 유형 코드 | Integer | No | System / Adjudicator | No | Present인 경우 1~7 정수 필수 | |
| `risk_level` | 최종 합의 위험도 | Integer | No | System / Adjudicator | No | Present인 경우 1~3 정수 필수 | |
| `evidence_phrases` | 최종 합의 판단 근거 구절 | Array of String | Yes | System / Adjudicator | Yes | | |
| `finalized_at` | 최종 결정일 | Timestamp | Yes | System | No | 현재 서버 시간 | |
| `determined_by` | 정답 결정 도출 유형 | String | Yes | System | No | `"consensus_r1"`, `"consensus_r2"`, `"adjudicator"` 중 하나 | |
| `adjudicator_id` | 결정자 식별자 | String | No | Adjudicator | No | 3차 기입 완료 시에만 UID 기록 | 자동 합의 시 `null` |

---

### DSCH-006 — Audit Log Record (감사 로그)
- Purpose: 시스템 내 주요 데이터 변경 사항의 이력을 투명하게 영구 추적
- Related conceptual object: DATA-OBJ-006
- Related requirements: OPS-001, BR-004, INV-003
- Related domain concepts: DC-006, ENT-004, AGG-003
- Storage intent: audit
- Ownership: System (Immutable)
- Lifecycle: 데이터 변경 세션 트랜잭션 수행 시 동시 추가. 수정/삭제가 영구 불가한 Append-only.

#### Fields
| Field | Meaning | Type | Required | Editable By | Sensitive | Constraint / Validation | Notes |
|---|---|---|---|---|---|---|---|
| `log_id` | 로그 식별자 | String | Yes | System | No | UUID 혹은 auto-generated ID | |
| `timestamp` | 액션 시간 | Timestamp | Yes | System | No | 서버 시간 동기화 | |
| `actor_id` | 액션 수행자 UID | String | Yes | System (Session) | No | request.auth.uid | |
| `actor_email` | 수행자 이메일 | String | Yes | System (Session) | No | request.auth.token.email | |
| `action_type` | 액션 분류 | String | Yes | System | No | `"Ingest Dataset"`, `"Clear All Datasets"`, `"Save Evaluator Label"`, `"Save Adjudicator Label"`, `"Export Statistics"` | |
| `target_id` | 대상 엔티티 식별값 | String | Yes | System | No | call_id 혹은 "ALL_DATASETS" 등 | |
| `details` | 추가 정보 메타데이터 | Map | Yes | System | Yes (Text) | 변경 전/후 요약 데이터 | 개인정보 포함 불가 |

---

### DSCH-007 — User Profile Record (사용자 프로필)
- Purpose: 인증된 사용자의 이메일과 시스템 역할을 매핑 관리
- Related conceptual object: DATA-OBJ-007
- Related requirements: SEC-001, SEC-002, BR-002
- Related domain concepts: Actor, Roles
- Storage intent: source-of-truth
- Ownership: Admin
- Lifecycle: Admin 가입 생성 시 추가 -> 삭제 시 소멸.

#### Fields
| Field | Meaning | Type | Required | Editable By | Sensitive | Constraint / Validation | Notes |
|---|---|---|---|---|---|---|---|
| `uid` | 계정 식별 고유 ID | String | Yes | System (Auth) | No | Firebase Auth UID와 동일 | Firestore Document ID로 매핑 |
| `email` | 계정 이메일 | String | Yes | Admin | Yes | 이메일 유효 포맷 검증 | |
| `role` | 계정 권한 역할 코드 | String | Yes | Admin | No | `"Admin"` 또는 `"Evaluator"` | |
| `is_adjudicator` | Adjudicator 지정 여부 | Boolean | Yes | Admin | No | `true` 또는 `false` | Evaluator 중 지정된 1인에 대해 true 부여 |
| `created_at` | 생성 일자 | Timestamp | Yes | System | No | | |

---

### DSCH-008 — Dashboard Statistics Record (대시보드 통계)
- Purpose: 시각화용 외부 Fleiss' Kappa 및 진행 상태 연산 테이블을 보관
- Related conceptual object: DATA-OBJ-008
- Related requirements: FR-006, FR-007
- Related domain concepts: 없음.
- Storage intent: derived
- Ownership: Admin
- Lifecycle: Admin 업로드 시 갱신(Overwrite) -> 데이터셋 삭제 시 소멸.

#### Fields
| Field | Meaning | Type | Required | Editable By | Sensitive | Constraint / Validation | Notes |
|---|---|---|---|---|---|---|---|
| `updated_at` | 최종 업로드 갱신 시각 | Timestamp | Yes | System | No | | |
| `updated_by` | 업로드 수행자 UID | String | Yes | System | No | | |
| `kappa_statistics` | 모델별 Kappa 통계 데이터 맵 | Map of Map | Yes | Admin (Upload) | No | | 외부 연산 수치 |

---

## 5. Fields and Field Semantics
- **비식별화 필수 텍스트**: `DSCH-002.text`와 `DSCH-003.evidence_phrases`는 민감 등급으로 분류되며, 데이터베이스 레이어에 평문 PII(주민번호, 휴대전화 등)가 원본 상태 그대로 들어오지 못하도록 사전 정밀 마스킹 처리가 완료된 상태이어야 합니다.
- **immutable**: `DSCH-006` (Audit Log Record)의 모든 필드는 생성된 이후 물리적인 변경이 불가능합니다.

## 6. Identifiers and References
- **`call_id`**: 모든 상담 대화의 Primary Key. JSON 데이터셋 내의 비즈니스 고유 키를 Surrogate Key로 변환하지 않고 그대로 사용합니다.
- **`uid`**: 사용자 프로필(`DSCH-007`)의 Primary Key. Firebase Auth가 발급하는 UID와 정확히 동치 관계를 이룹니다.
- **Subcollection Nested Reference**:
  - `Label` (`DSCH-003`)의 경로: `/conversations/{call_id}/labels/{user_id_round_no}`. `{user_id_round_no}`는 `uid + "_" + round_no` 형식의 고유 문자로 구성하여 INV-001 중복 저장 방지 제약을 달성합니다.

## 7. Relationships
- **Conversation (1) : Turn (N)** - Conversation에 턴 배열로 하위 내장됨.
- **Conversation (1) : Label (N)** - 서브컬렉션 계층 관계. Parent call_id 삭제 시 하위 Labels도 Firestore Emulator/SDK 일괄 처리 또는 client batch delete에 의해 동시 Cascade 삭제됨.
- **Conversation (1) : Gold Standard (1)** - 최종 결과 매핑. 서브컬렉션 `/gold_standard/verdict` 단일 도큐먼트 바인딩.

## 8. Constraints and Validation Rules
- **INV-002 (유해성-유형/위험도 정합성)**: 
  - `toxicity == "Present"` $\rightarrow$ `category_id` $\in [1, 7]$, `risk_level` $\in [1, 3]$, `evidence_phrases` 크기 $\ge 1$.
  - `toxicity == "Absent"` $\rightarrow$ `category_id = null`, `risk_level = null`, `evidence_phrases = []`.
- **ST-002 ~ ST-007 (상태 전이 가드)**: 
  - `status == "Consensus Reached"` 상태인 Conversation에 대해, `DSCH-003` (Label)의 신규 생성 또는 업데이트 쓰기 요청 시 Firestore Security Rules 레벨에서 강제 에러(Permission Denied)를 반환해 최종 정답 훼손을 차단합니다.

## 9. Lifecycle State Fields
- `DSCH-001.status`: 상담 대화의 Adjudication 프로세스 제어 상태를 나타냄.
  - `"Round 1 Active"`: 1차 평가 대기/진행 중.
  - `"Round 2 Active"`: 1차 불일치에 의한 2차 평가 공유 진행 중 (Admin의 skip_round2가 false인 경우).
  - `"Round 3 Active"`: 2차(혹은 스킵에 의한 1차) 불일치에 따른 Adjudicator 최종 결정 대기 중.
  - `"Consensus Reached"`: 합의 정답(`Gold Standard`) 확정 및 수정 불가 잠금 완료.

## 10. Audit and Metadata Fields
- 모든 라벨링 레코드 및 정답 라벨에는 `submitted_at`/`finalized_at` 타임스탬프와 `user_id`/`adjudicator_id`가 바인딩되어 데이터의 이력과 투명성을 보증합니다.

## 11. Sensitive Fields
- `DSCH-002.text` (대화 턴 본문 텍스트): 개인정보 포함 여부 검증 대상.
- `DSCH-003.evidence_phrases` (판단 근거 텍스트): 대화 내용의 일부 구절 복사본이 포함되므로 보호 대상.

## 12. Derived Fields
- `label_completion_count`: 해당 대화에 등록된 1차/2차 라벨 제출 개수를 누적 카운트. 3인 전원 완료 여부를 탐지하기 위한 필드로, client 트랜잭션 제출 시 `increment(1)` 연산으로 atomic 갱신합니다.

## 13. Schema Risks
- **Firestore 1MB Document 한계**: 한 대화 내 turns 배열이 과도하게 커질 경우 Firestore Document 제한 용량에 도달할 수 있으나, 콜센터 평균 턴 길이를 대입할 때 유의미한 초과 리스크는 극히 낮음.
- **Client-Side 동시 업데이트 경합**: Cloud Functions 트리거 대신 Client 트랜잭션을 사용하므로 동시 2인이 동일 대화 라벨 제출 시 트랜잭션 충돌이 재시도(Retry)될 수 있음. 동시 사용자가 약 10명 내외이므로 트랜잭션 충돌 확률은 안전 범주 내에 있음.

## 14. Decision Candidates
- 없음.

## 15. Working Assumptions
- **DATA-ASM-002**: 대화에 대한 3인의 평가 완료 여부는 `label_completion_count` 필드의 정수값을 활용하여 대시보드 및 리스트 조회 조건에서 신속하게 쿼리할 수 있다고 가정합니다.

## 16. Open Questions
- 없음.