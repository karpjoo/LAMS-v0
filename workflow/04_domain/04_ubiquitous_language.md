# 04 Ubiquitous Language

## 1. Status
- **Status**: Draft
- **Source artifacts**:
  - [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
  - [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md)
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- **Last updated**: 2026-06-09

## 2. Language Scope
본 문서에서 정의하는 유비쿼터스 언어(Ubiquitous Language)는 LAMS-v0 시스템의 도메인 분석, 아키텍처 계약, 데이터 설계, 테스트 시나리오, UI 및 구현 코드에 이르기까지 일관되게 사용되는 핵심 도메인 용어집입니다. 이 플랫폼은 콜센터 상담 유해 발화 위험성 탐지 연구의 다중 평가(상담원 및 언어학 전문가) 기록과 외부 LLM 판정 결과 비교, 3단계 합의 도출 모델(Adjudication Process) 제어, 사용자/데이터셋 관리 및 평가 진척 현황(Dashboard) 표시를 주요 범위로 삼고 있으며, 이에 기반한 비즈니스 용어의 정합성을 확립합니다.

## 3. Preferred Domain Terms
| Term ID | Preferred Term | Definition | Term Type | Source Requirement / Stakeholder | Preserve In | Notes |
|---|---|---|---|---|---|---|
| TERM-001 | **Admin** (관리자) | 시스템 내 데이터셋 업로드/삭제, 외부 LLM 판정 결과 업로드, 사용자 관리 및 감사로그 열람 등 연구 환경을 통제하는 최고 권한 역할 | role / actor | STK-001, ROLE-001 | UI, DB Rules, Code, Docs | 계정 발급 및 데이터 조작을 전담함 |
| TERM-002 | **Evaluator** (평가자) | 상담 대화 데이터를 조회하고, 유해성 판정 결과를 기입하는 평가 수행 주체. 일반 상담원과 언어학 전문가가 공용 UI를 통해 이 역할을 수행함 | role / actor | STK-002, STK-003, ROLE-002 | UI, DB Rules, Code, Docs | 상담원 계정 및 전문가 계정은 동일 권한 그룹으로 묶임 |
| TERM-003 | **Conversation** (상담 대화) | 유해 발화 탐지 대상이 되는 고객과 상담원 간의 통화 내용 텍스트 묶음. 고유 ID(`call_id`)를 가짐 | core concept | G-001, FR-001 | DB, UI, Code, API | 데이터셋 일괄 등록 및 삭제의 기본 단위 |
| TERM-004 | **Turn** (대화 턴) | 상담 대화 내에서 화자(고객 또는 상담원)가 한 번 말한 발화 텍스트 단위. 발화자, 시간 정보, 텍스트 본문 등으로 구성됨 | core concept | FR-003, AC-FR-003-01 | DB, UI, Code | 대화 목록 상세 렌더링 시 사용되는 내부 개념 |
| TERM-005 | **Label** (평가 라벨) | 특정 상담 대화(`call_id`)에 대해 개별 평가자(`user_id`)가 특정 평가 차수(Round)에 작성한 유해 여부, 유형, 위험수준, 판단 근거의 집합 | core concept | G-002, FR-004, AC-FR-004-01 | DB, UI, Code | 1차 및 2차 평가 시 개별적으로 적재됨 |
| TERM-006 | **Toxicity** (유해성) | 대화 내용 중 고객의 폭언, 성희롱 등 유해 요소 존재 여부. `Present`(유해함) 또는 `Absent`(유해하지 않음)로 판정함 | core concept | FR-004, AC-FR-004-01 | DB, UI, Code | 유해성 평가 양식의 핵심 구분 필드 |
| TERM-007 | **Toxicity Category** (유해 유형) | 유해성 판정이 `Present`일 때, 유해 발화가 해당하는 7가지 분류 유형 중 하나 (예: 폭언/욕설 등) | core concept | FR-004, AC-FR-004-01 | DB, UI, Code | 카테고리 ID(`category_id`)로 관리됨 |
| TERM-008 | **Risk Level** (위험 수준) | 유해 발화에 따른 위험 심각도를 나타내는 3단계 정수 척도 (Level 1 ~ 3) | core concept | FR-004, AC-FR-004-01 | DB, UI, Code | 유해 판정 양식 필수 입력 필드 |
| TERM-009 | **Evidence Phrase** (근거 구절) | 평가자가 상담 대화 내에서 유해하다고 판단한 핵심 구절 텍스트. 대화당 최대 3개까지 입력 가능 | core concept | FR-004, AC-FR-004-01 | DB, UI, Code | 비정형 근거 기록 장치 |
| TERM-010 | **LLM Decision** (LLM 판정 결과) | 외부 오프라인 추론 시스템이 생성하여 업로드하는 3개 모델(예: OpenAI, Claude, Gemini) x 3개 프롬프트별 탐지 결과 데이터셋 | core concept | G-003, FR-005 | DB, UI, Docs | 실시간 API 호출 대신 JSON 파일 임포트 방식 채택 |
| TERM-012 | **Audit Log** (감사 로그) | 데이터셋 등록/삭제, 평가 최초 저장/수정, 최종 합의 강제 등 도메인 내 중요 액션을 기록하는 Append-only 형태의 영구 시스템 로그 | core concept | OPS-001, FR-002 | DB, Audit, Security | 데이터 수정/삭제가 금지된 고보안 컬렉션에 적재 |
| TERM-013 | **Progress Rate** (진척률) | 전체 상담 대화 건수 대비 로그인된 평가자가 평가 라벨 작성을 완료한 건수의 백분율(%). 대시보드에서 평가자별 현황을 시각화함 | workflow / process | FR-007, AC-FR-007-01 | UI, Code | 대시보드 메트릭 정보로 사용됨 |
| TERM-014 | **Prefill** (자동 채우기) | 이미 평가가 저장된 상담 대화 상세 페이지에 재진입 시 기존 저장 데이터로 입력 폼을 자동으로 활성화하는 처리 방식 | workflow / process | FR-004, AC-FR-004-02 | UI, Code | 기 저장된 DB 데이터 기반 바인딩 기법 |
| TERM-015 | **PII Scan** (개인정보 스캔) | 관리자가 대화 데이터셋을 업로드할 때 브라우저(클라이언트)단에서 국내 휴대전화번호 등 PII 포맷을 검색하여 경고 모달을 띄우는 절차 | sensitive / security-relevant term | SEC-003, AC-SEC-003 | UI, Code | 사전 비식별화 보증을 보조하기 위한 UI 장치 |
| TERM-016 | **Deletion Interlock** (삭제 확인 장치) | 전체 대화 데이터셋 삭제 시 실수 방지를 위해 "DELETE ALL DATASET" 텍스트를 직접 입력하도록 제한하는 확인 프로세스 | workflow / process | SEC-004, AC-FR-002-01 | UI, Code | 관리자 권한 오용 및 실수 방지 장치 |
| TERM-017 | **Personally Identifiable Information** (개인정보) | 이름, 연락처 등 상담 대화 원본에서 식별 가능한 모든 개인 식별 정보. 시스템 외부에서 사전 마스킹 처리되어 유입되어야 함 | sensitive / security-relevant term | RISK-001, SEC-003 | Docs, UI, Code | 비식별화 사전 처리 보장을 위한 규제 용어 |
| TERM-018 | **Adjudication** (합의 판정) | 평가자들의 평가 의견이 일치하지 않을 때, 최종 정답 라벨에 도출하기 위해 진행하는 3단계의 논리적 합의 조정 프로세스 | workflow / process | G-002, User Request | UI, DB, Code, Docs | 1차(각자) -> 2차(일부 노출 재평가) -> 3차(1인 최종결정)로 수행 |
| TERM-019 | **Adjudicator** (최종 결정자) | 3차 Adjudication 단계에서 앞선 1차, 2차 평가 결과를 조회하여 최종 결정 라벨을 기입하는 고유 권한의 1인 전문가 역할 | role / actor | User Request | UI, DB Rules, Code | 3차 최종 결정권을 독점하며, 타 평가자는 이 영역 조작 불가 |
| TERM-020 | **Discrepant Conversation** (불일치 상담 대화) | 1차 평가 결과, 유해성 유무(Toxicity) 또는 유형(Category)에 대해 평가자 간 의견이 일치하지 않아 2차 또는 3차 Adjudication 대상으로 전이된 대화 | core concept | User Request | UI, DB, Code | 합의 프로세스의 필터링 대상이 됨 |
| TERM-021 | **Evaluation Round** (평가 차수) | 합의 프로세스 단계를 나타내는 지표. Round 1(각자 평가), Round 2(불일치 재평가 - 생략 가능), Round 3(Adjudicator 최종 판정) | core concept | User Request | DB, UI, Code | 대화 및 라벨 문서 상에 차수 정보가 저장됨 |
| TERM-022 | **Gold Standard Label** (최종 합의 라벨) | 1~3단계의 합의 프로세스를 완전히 거쳐 LAMS 도메인 내에서 공식 확정한 최종 정답 유해성 판정 레코드 | core concept | User Request | DB, UI, Code, Docs | 연구 분석의 기준 정보로 고정됨 |

## 4. Synonyms and Deprecated Terms
| Term ID | Preferred Term | Synonyms | Deprecated / Rejected Terms | Reason |
|---|---|---|---|---|
| TERM-003 | **Conversation** | 상담 대화, 통화 기록, 대화 데이터셋 | Raw Call Data, Voice Stream | 음성 오디오 스트리밍을 제공하지 않으므로 오해의 소지가 있는 Voice/Audio 명칭은 배제하고 텍스트 상담 대화의 단위인 Conversation으로 통일함 |
| TERM-005 | **Label** | 평가 라벨, 유해성 판정 기록, 피드백 | Annotation, Rating, Tagging | 타 시스템에서 범용적으로 사용되는 Annotation/Rating보다 LAMS 연구 평가 목적에 부합하는 Label(또는 Evaluation Feedback)로 일치시킴 |
| TERM-006 | **Toxicity** | 유해성, 유해 여부 | Abuse, Harassment, Offensive | 7개 카테고리를 포괄해야 하므로, 특정 유형만을 뜻하는 Abuse 등은 하위 개념으로 한정하고 상위 판정 지표명은 Toxicity로 단일화함 |
| TERM-010 | **LLM Decision** | LLM 판정 결과, 모델 평가 결과 | Real-time LLM Response, Inference Engine | 실시간 API 연동이 아니며 외부 실행 결과를 임포트하는 것이므로 실시간 반응/추론 개념은 배제하고 LLM Decision으로 통일함 |
| TERM-022 | **Gold Standard Label** | 최종 합의 라벨, 합의 정답 | Consolidated Standard, Consensus Label | 다수결 합의 및 최종 결정을 통해 도출된 데이터셋의 기준값임을 명확히 하기 위해 Gold Standard Label로 통일함 |

## 5. Ambiguous or Conflicting Terms
| Term ID | Term | Conflict / Ambiguity | Sources | Impact | Human Decision Needed |
|---|---|---|---|---|---|
| TERM-002 | **Evaluator** (평가자) | 일반 상담원과 언어학 전문가의 역할 차이가 2차/3차 Adjudication 프로세스에서 다르게 취급될 여지 | User Request | 1차 평가는 모든 Evaluator가 참여하지만, 3차 결정은 지정된 1인의 Adjudicator 전문가만 제어 가능함 | 2차/3차 단계 진입에 필요한 특별 권한이나 평가자 임명 규칙을 도메인 수준에서 정밀 차단할 수 있도록 역할 그룹 구분을 명확히 해야 함 (아키텍처 및 Security Rules에서 Uid 기반 가드로 해결) |
| TERM-021 | **Evaluation Round** | 2차 Round의 선택적 생략 가능성에 따른 상태 전이의 비선형성 | User Request | 1차 평가 완료 후 즉시 3차(Adjudicator 최종 판정)로 넘어갈 수 있으므로, 상태 transition 조건 분기가 필요함 | 2차 단계 생략 여부를 결정하는 주체(Admin)와 그 플래그에 따라 도메인 전이 규칙이 유연하게 작동하도록 설계해야 함 |

## 6. Terms to Preserve in Later Stages
| Term ID | Preferred Term | Later Stage Impact | Notes |
|---|---|---|---|
| TERM-003 | **Conversation** | Firestore 컬렉션 명칭(`calls` 또는 `conversations`) 및 스키마 구조의 최상위 루트 엔티티명으로 사용함 | 물리 DB 설계(Stage 6) 시 최상위 컬렉션명으로 바인딩 |
| TERM-005 | **Label** | 특정 사용자가 대화에 매핑해둔 평가 문서의 속성 구조 및 서브컬렉션 이름으로 보존함 | Firestore에서 `calls/{callId}/labels/{userId}` 또는 `evaluations` 명세로 고정 예정 |
| TERM-006 | **Toxicity** | 유해 여부를 가리는 Boolean형 또는 Enum형 필드명으로 시스템 전반(DB, API, State)에 고정함 | `toxicity: "Present" \| "Absent"` 형태로 정합성 유지 |
| TERM-012 | **Audit Log** | Firestore의 `audit_logs` 컬렉션명으로 고정하며, Append-only 쓰기 룰을 Firestore Security Rules에 그대로 보존함 | 보안 설계(Stage 5) 시 Rules 구문 작성에 직접 적용 |
| TERM-022 | **Gold Standard Label** | 최종 합의 데이터 컬렉션 혹은 대화 도큐먼트 내 `gold_standard` 필드 맵 명칭으로 보존하여 API 및 DB와 격리 | 최종 정답 라벨 조회 쿼리에 직접적인 필드명으로 바인딩 예정 |

## 7. Handoff Notes for 04b
- **Entities로 전환이 확실시되는 개념**: `Conversation`(상담 대화, 턴 및 LLM 판정의 부모), `Label`(평가자별/차수별 평가 라벨), `GoldStandardLabel`(최종 합의 완료된 정답 데이터), `AuditLog`(감사 로그)
- **Value Objects로 설계될 개념**: `Turn`(대화 턴 말풍선), `ToxicityCategory`(유해 유형), `RiskLevel`(위험 수준), `EvidencePhrase`(판단 근거), `LLMModelDecisionItem`(외부 모델 결과)
- **도메인 정책 / 비즈니스 규칙**:
  - **1차 합의 판정 규칙**: 1차 평가 완료 시점(평가자 3인 모두 등록 완료)에서 의견 불일치 조건(Toxicity 여부 또는 Category의 상이함)을 스캔하여 `Discrepant` 여부를 판단하고 Round 2 또는 Round 3 타겟으로 격리함.
  - **3차 Adjudicator 결정 독점 정책**: Round 3 상태인 대화의 `Gold Standard Label`은 오직 지정된 1인의 `Adjudicator` Uid를 가진 세션만 쓸 수 있으며 타 Evaluator는 조작 불가.

## 8. Missing Information
- 1차/2차 평가에 참여하는 전문가 수가 3명으로 명시되었으나, 시스템에 등록되는 전체 평가자(Evaluator) 풀에서 3명을 임의 배정하는 로직이나 계정 권한 스키마가 부재하므로, 본 v0에서는 Admin이 계정을 생성할 때 전문가 Uid 목록 혹은 지정 플래그를 할당하는 가벼운 구현을 가정함.

## 9. Open Questions
- **Q-105 (대시보드 상 개별 평가자 진척도 조회 범위)**: 대시보드가 통계 시각화에서 사용자 관리/진척 상황 관리로 목적이 변경됨에 따라, 어떤 평가자가 어떤 call_id에 라벨을 누락했는지 세부 진행률을 관리자가 직접 관찰할 수 있도록 대시보드 뷰 스키마를 고도화해야 함.