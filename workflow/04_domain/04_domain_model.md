# 04 Domain Model

## 1. Status
- **Status**: Draft
- **Source artifacts**:
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
  - [04_ubiquitous_language.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_ubiquitous_language.md)
- **Last updated**: 2026-06-09

## 2. Domain Overview
본 도메인 모델은 콜센터 상담 유해 발화 탐지 연구용 LAMS-v0 시스템의 비즈니스 논리를 나타냅니다. 본 시스템은 외부에서 사전에 비식별화 처리가 완료된 **상담 대화(Conversation)** 데이터를 관리하고, 다중 **평가자(Evaluator)**가 차수별(**Evaluation Round**)로 평가를 수행하여 최종적인 **합의 정답 라벨(Gold Standard Label)**을 도출하는 3단계 전문가 합의 프로세스(Adjudication)를 제어합니다. 또한, 시스템 관리 효율성을 극대화하기 위해 사용자 관리, 데이터셋 관리, 평가 결과 조회, 평가 진행 상황 모니터링을 전담하는 통합 **Dashboard** 도메인 및 감사 기능에 필요한 **감사 로그(Audit Log)** 영역을 구성합니다.

## 3. Core Domain Concepts
| Concept ID | Name | Type | Definition | Linked Requirements | Source Terms | Notes |
|---|---|---|---|---|---|---|
| DC-001 | **Conversation** (상담 대화) | entity candidate | 텍스트 기반 콜센터 상담 대화의 단위. 턴(Turn)들의 집합체 | FR-001, FR-003, FR-002 | TERM-003 | call_id를 고유 식별자로 가짐 |
| DC-002 | **Turn** (대화 턴) | value object candidate | 상담 대화 내부를 구성하는 개별 발화 요소. 화자 정보와 텍스트를 포함 | FR-003 | TERM-004 | 단독 식별자 없이 대화에 귀속됨 |
| DC-003 | **Label** (평가 라벨) | entity candidate | 특정 상담 대화에 대해 개별 평가자가 특정 차수(Round)에 제출한 유해 판정 기록 | FR-004 | TERM-005 | call_id, user_id, round_no의 조합으로 복합 identity 형성 |
| DC-004 | **LLM Decision** (LLM 판정 결과) | value object candidate | 외부 오프라인 실행을 거쳐 일괄 등록되는 모델별 판정 데이터의 컬렉션 | FR-005 | TERM-010 | 대화의 하위 값으로 매핑됨 |
| DC-006 | **Audit Log** (감사 로그) | entity candidate | 시스템 내 일어나는 주요 비즈니스 변경 사항을 영구 추적하는 로그 레코드 | OPS-001 | TERM-012 | 도메인 보안 감사 정책 준수 |
| DC-007 | **Gold Standard Label** (합의 정답 라벨) | entity candidate | 1~3단계 전문가 합의 프로세스를 완전히 거쳐 확정된 공식적인 유해성 정답 판정 정보 | User Request | TERM-022 | 연구 분석의 절대적 기준점 |
| DC-008 | **Adjudication Policy** (합의 도출 정책) | policy / rule candidate | 평가 차수 전환, 2차 단계 생략 여부 통제 및 3차 Adjudicator 최종 의사결정을 관장하는 도메인 정책 | User Request | TERM-018 | 3단계 합의 모델의 논리 엔진 |

## 4. Actors and Roles
| Actor ID | Name | Domain Meaning | Permissions / Responsibilities | Linked Requirements | Notes |
|---|---|---|---|---|---|
| ACT-001 | **Admin** (관리자) | 연구 프로젝트 관리 책임을 가진 최상위 도메인 주체 | 데이터셋 업로드/삭제, LLM 파일 업로드, 사용자 계정 생성/관리, 대시보드 모니터링, 감사로그 전체 열람, 2차 라벨링 생략 설정 제어 | FR-001, FR-002, FR-005, OPS-001, User Request | ROLE-001과 일대일 매핑 |
| ACT-002 | **Evaluator** (평가자) | 상담 대화를 열람하고 유해성 여부를 판정 기입하는 도메인 행위자 | 배정된 상담 대화 목록 조회, 1차 및 2차 평가 라벨 저장 및 수정, 본인 진척 상황 대시보드 조회 | FR-003, FR-004, SEC-002 | 일반 상담원과 언어학 전문가를 총칭 (ROLE-002) |
| ACT-003 | **Adjudicator** (최종 결정자) | 의견 불일치 대화에 대해 최종 판정을 강제하는 특수 권한 행위자 | 3차 Adjudication 대상 대화에 대해 앞선 1차, 2차 평가 결과를 한눈에 조회하고 최종 Gold Standard Label을 기입/저장함 | User Request | 지정된 1인의 언어학 전문가 역할 |

## 5. Entities
| Entity ID | Name | Identity | Lifecycle Summary | Linked Requirements | Notes |
|---|---|---|---|---|---|
| ENT-001 | **Conversation** (상담 대화) | `call_id` (비즈니스 고유 번호) | Admin에 의해 일괄 업로드되어 Firestore에 적재되며, 데이터셋 일괄 삭제 전까지 영구 보존됨 | FR-001, FR-003, FR-002 | 턴들의 순차 정렬 목록을 포함 |
| ENT-002 | **Label** (평가 라벨) | `call_id` + `user_id` + `round_no` (복합 식별자) | 평가자가 특정 대화의 특정 차수(Round 1 또는 2)에 평가를 저장할 때 생성되고 수정 업데이트됨. 데이터셋 일괄 삭제 시 함께 삭제됨 | FR-004, SEC-002, User Request | 2차 차수 시 타인의 1차 결과를 조회할 수 있는 읽기 권한 연동 |
| ENT-003 | **Gold Standard Label** (합의 정답 라벨) | `call_id` (대화당 1개만 유효) | 1차 평가 일치 시 자동 생성되거나, 2차/3차 Adjudication 단계를 통과하여 최종 결정자가 저장할 때 생성 및 보존됨. 대화 삭제 시 함께 영구 삭제됨 | User Request | 최종 정답 레코드 |
| ENT-004 | **Audit Log** (감사 로그) | `log_id` (자동 생성 고유 번호) | 주요 상태 변화 트리거 시 자동 기록 생성(Append-only). 비즈니스 규칙상 수정 및 삭제가 영구 배제됨 | OPS-001 | 일시, 행위자 ID, 변경 유형, 상세 항목 기록 |

## 6. Value Objects
| Value Object ID | Name | Value Equality / Validation | Linked Requirements | Notes |
|---|---|---|---|---|
| VO-001 | **Turn** (대화 턴) | `speaker`, `text`, `sequence_no` 필드의 값이 모두 동일할 때 동등성이 성립함 | FR-003 | Conversation의 내부 구성 요소 |
| VO-002 | **Toxicity Evaluation Form** (유해성 평가 폼) | 유해 여부(`toxicity`), 유형(`category_id`), 위험수준(`risk_level`), 판단 근거 구절(`evidence_phrases`)로 구성됨 | FR-004 | 필수 입력 항목 누락 시 유효성 검증 실패 (INV-002 적용) |
| VO-003 | **LLM Model Decision Item** (LLM 모델별 판정 데이터) | 외부에서 산출된 개별 모델 및 프롬프트의 판단 결과 묶음. 모델 정보, 유해 여부, 위험수준, 근거가 값으로 비교됨 | FR-005 | `calls/{callId}/llm_results` 내에 매핑 적재 |
| VO-004 | **Evaluation Round Info** (평가 차수 정보) | 현재 대화가 위치한 평가 단계(`round_no`: 1~3) 및 합의 완료 플래그(`is_consensus_reached`)의 조합 | User Request | 대화 상태를 제어하기 위한 값 오브젝트 |

## 7. Domain Services / Policies
| Service / Policy ID | Name | Responsibility | Inputs / Outputs | Linked Requirements | Notes |
|---|---|---|---|---|---|
| DSP-001 | **PII Scan Policy** (개인정보 스캔 정책) | 대화 데이터셋 업로드 시, 개인정보 원본 노출을 방지하기 위한 정규식 기반 클라이언트 사전 탐지 및 경고 경보 정책 | Input: 업로드할 대화 텍스트 데이터 / Output: 경고 모달 노출 플래그(Boolean) | SEC-003, AC-SEC-003 | 업로드를 강제로 차단하지는 않고 경고만 강제 노출함 |
| DSP-002 | **Write Isolation Policy** (평가 데이터 쓰기 격리 정책) | 평가자 계정이 자신의 UID 범주 바깥의 평가 결과(`Label`) 문서에 접근 및 쓰기를 하지 못하도록 세션 수준에서 차단하는 정책 | Input: request.auth.uid, target.userId / Output: 허용 또는 거절(Authorization Result) | SEC-002, AC-FR-004-01 | Firestore Rule의 핵심 기반 비즈니스 규칙 |
| DSP-003 | **Deletion Interlock Policy** (삭제 확인 장치 정책) | 전체 대화 데이터셋과 관련된 평가 정보를 삭제할 때 실수로 클릭하여 파괴하는 오작동을 차단하기 위한 확인 정책 | Input: 사용자 입력 문자열 / Output: 삭제 승인 여부 (문자열 일치 시에만 활성화) | SEC-004, AC-FR-002-01 | "DELETE ALL DATASET" 텍스트 타이핑 필요 |
| DSP-004 | **Adjudication Consensus Policy** (합의 분석 및 차수 제어 정책) | 특정 차수의 전문가 평가 등록 완료 시 합의 여부(Toxicity 여부 및 Category 일치)를 체크하고 불일치 시 다음 차수 또는 최종 결정 대상을 지정하는 정책 | Input: 3인의 Round 1/2 Labels / Output: Consensus 여부(Boolean), Next Round (1~3) | User Request | 1차 완료 시 2차 생략 설정 값에 따라 2차를 건너뛰고 3차로 전이 가능 |

## 8. Relationships
| Relationship ID | Source Concept | Target Concept | Domain Meaning | Cardinality / Lifecycle Notes | Linked Requirements |
|---|---|---|---|---|---|
| REL-001 | Conversation | Turn | 상담 대화는 여러 개의 순서가 지정된 대화 턴으로 구성됨 | 1 : N / Turn의 수명 주기는 Conversation에 전적으로 귀속됨 | FR-003 |
| REL-002 | Conversation | Label | 상담 대화에 대해 다중 평가자가 각각 차수별로 평가 라벨을 매길 수 있음 | 1 : N / Conversation 삭제 시 관련 Label도 연쇄 영구 삭제됨 | FR-004, User Request |
| REL-003 | Evaluator (Actor) | Label | 평가자는 하나의 상담 대화의 각 차수당 단 하나의 평가 라벨만 가짐 | 1 : 1 (대화 차수당) / 본인 소유 라벨에 대한 단독 쓰기 격리 | FR-004, SEC-002 |
| REL-004 | Conversation | LLM Decision | 상담 대화에 대해 외부에서 연산된 복수 LLM 모델의 판정 결과가 대응됨 | 1 : 1 / Conversation 삭제 시 관련 LLM Decision도 연쇄 영구 삭제됨 | FR-005 |
| REL-005 | Conversation | Gold Standard Label | 한 대화는 최종 합의 완료 시점에 오직 하나의 최종 정답 라벨만을 가짐 | 1 : 1 / Conversation 삭제 시 Gold Standard Label도 연쇄 영구 삭제됨 | User Request |
| REL-006 | Adjudicator (Actor) | Gold Standard Label | 3차 최종 결정자는 의견 불일치 대화에 대해 3차 최종 합의 라벨을 결정함 | 1 : N / 3차 최종 합의 작성 권한을 독점적으로 가짐 | User Request |

## 9. External Domain Actors or Systems
| External ID | Name | Domain Role | Interaction Meaning | Linked Requirements | Notes |
|---|---|---|---|---|---|
| EXT-001 | **External LLM Inference System** (외부 LLM 추론 시스템) | 유해 발화 탐지 모델 연산 엔진 | 3개 LLM 모델 x 3개 프롬프트 평가를 실행하고 최종 판정 JSON 파일을 LAMS-v0에 제공 | FR-005 | 웹 시스템 내부의 실시간 추론 연동은 완전히 배제됨 |
| EXT-003 | **De-identification Processor** (비식별화 처리 도구) | 개인정보 보호 비식별화 필터링 도구 | 상담 대화 데이터셋 업로드 전, 상담 데이터 원본 속의 PII(이름, 번호 등)를 마스킹 처리하여 안전한 JSON을 생성 | RISK-001, SEC-003 | 웹에는 이미 비식별화된 데이터만 유입됨을 전제 |

## 10. Aggregates
| Aggregate ID | Root | Members | Protected Invariants | Consistency Boundary | Linked Requirements | Notes |
|---|---|---|---|---|---|---|
| AGG-001 | **Conversation** (상담 대화) | Turn (VO), LLM Decision (VO), Gold Standard Label (Entity) | 대화 업로드 시 턴과 외부 LLM 판정이 일관되게 생성 및 파괴됨. 합의 완료 또는 최종 Adjudicator의 저장 액션 시 `Gold Standard Label`이 대화 식별자 하위 혹은 1:1로 원자적으로 바인딩되어 불일치 상태가 복원됨 | 단일 `call_id` 범위 내의 대화 본문, 외부 모델 결과 및 합의 정답 정보의 무결성 | FR-001, FR-002, FR-005, User Request | 대화 단위 수명주기 통제 핵심 Aggregate |
| AGG-002 | **Label** (평가 라벨) | Toxicity Evaluation Form (VO), Evaluation Round Info (VO) | `INV-001` (1인당 1개 대화 차수 평가 유일성), `INV-002` (유해성 선택에 따른 입력 필드 타당성), `ST-002` (2차 차수 시 타인의 1차 결과 노출 가드 규칙 준수) | 동일 `call_id`, `user_id`, `round_no` 경계 내의 평가 정합성 보호 | FR-004, SEC-002, User Request | Evaluator의 라벨링 행위 일관성 가드 |
| AGG-003 | **Audit Log** (감사 로그) | (없음 - 단독 root) | `INV-003` (Append-only 보존 법칙) | 로그 레코드 생성 시점의 위변조 방지 | OPS-001 | 도메인 내 쓰기 전용의 독립 보안 범위 |

## 11. Modeling Uncertainties
- 1차 평가 완료 시 3명의 전문가 평가를 수집하는 물리 배치 스캔이나 트리거 방식(예: Firestore Function을 태울지, 클라이언트 세션에서 제출할 때 계산할지)은 Stage 5 아키텍처 수준에서 유연하게 선택할 수 있으므로, 본 도메인에서는 3인의 라벨이 채워지는 시점에 자동으로 불일치 여부를 탐지한다는 정책(`DSP-004`) 수준으로만 가이드하고 논리적 유연성을 남깁니다.

## 12. Open Questions
- **Q-105 (사용자 관리 및 개별 진척도 시각화 노출 범위)**: Dashboard가 사용자 관리, 데이터 관리, 평가 결과 조회, 평가 진행 상황 모니터링으로 목적이 명확해짐에 따라 관리자 대시보드 화면 상에서 노출될 평가자별 진척 뷰의 권한 제어 규칙을 아키텍처 설계 단계에서 보완해야 합니다.