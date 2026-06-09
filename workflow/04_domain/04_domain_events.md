# 04 Domain Events

## 1. Status
- **Status**: Draft
- **Source artifacts**:
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
  - [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
  - [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- **Last updated**: 2026-06-09

## 2. Domain Events
| Event ID | Event Name | Source Concept / Aggregate | Trigger | Why It Matters | Interested Contexts / Actors | Linked Requirement |
|---|---|---|---|---|---|---|
| EVT-001 | **DatasetImported** | Conversation | Admin이 유효한 대화 JSON 파일을 업로드하여 Firestore에 적재 완료 시 | 새로운 분석 및 평가 대상 데이터가 준비됨을 나타냄 | Toxicity Evaluation Context, Admin | FR-001 |
| EVT-002 | **DatasetDeleted** | Conversation | Admin이 "DELETE ALL DATASET" 안전 가드 검증을 통과하여 전체 삭제 완료 시 | 프로젝트의 전체 상담 대화, 인간 평가 라벨 및 Gold Standard가 완전히 초기화됨 | Toxicity Evaluation Context, Admin | FR-002, SEC-004 |
| EVT-003 | **LabelSaved** | Label | Evaluator가 특정 대화 상세에서 유해성 판정을 기입하고 [제출] 완료 시 | 인간의 개별 평가 라벨이 기록/갱신되어 진척도가 업데이트됨 | Project Management Context, Admin | FR-004 |
| EVT-004 | **LLMResultsImported** | Conversation / LLM Decision | Admin이 외부 LLM 판정 결과 JSON 파일을 업로드하여 기존 대화에 연동 완료 시 | 외부 모델들의 예측값 비교 분석을 대시보드에 노출할 수 있게 됨 | Project Management Context, Admin | FR-005 |
| EVT-006 | **AuditLogCreated** | Audit Log | 중요 액션(DatasetImported, DatasetDeleted, LabelSaved, GoldStandardLabelEstablished) 처리가 완료된 즉시 | 보안 및 규정 준수 조치를 위해 감사 로그가 영구적으로 보존됨 | Audit Context | OPS-001 |
| EVT-007 | **Round1EvaluationsCompleted** | Conversation / Label | 특정 대화에 대해 배정된 3인의 평가자가 모두 1차 평가 라벨 제출 완료 시 | 합의 일치 여부 체크 및 차수 전이 연산(`Adjudication Consensus Policy`)을 개시해야 함 | Toxicity Evaluation Context | User Request |
| EVT-008 | **AdjudicationRound2Escalated** | Conversation | 1차 평가 불일치 상태로 2차 공유 재평가 단계(Round 2)로 이송이 완료된 시점 | 2차 대기 목록에 대화가 추가되고 타 평가자의 1차 결과 조회가 허용됨 | Evaluator, Toxicity Evaluation Context | User Request |
| EVT-009 | **AdjudicationRound3Escalated** | Conversation | 2차 불일치 혹은 2차 스킵 설정 활성화 하에 3차 최종 결정 단계(Round 3)로 이송 완료 시 | 3차 최종 대기 목록에 대화가 추가되고 Adjudicator가 결정을 내릴 수 있게 됨 | Adjudicator, Toxicity Evaluation Context | User Request |
| EVT-010 | **GoldStandardLabelEstablished** | Conversation / Gold Standard Label | 1차/2차 일치 또는 3차 Adjudicator 최종 저장에 의해 최종 정답 데이터 수립이 완료된 시점 | 대화의 최종 정답 라벨이 고정되고 대시보드의 평가 완료 진척에 누적 합산됨 | Project Management Context, Admin, Evaluator | User Request |

## 3. Event Ordering or Causality Notes
| Note ID | Event(s) | Ordering / Causality Rule | Linked Requirement | Notes |
|---|---|---|---|---|
| EC-001 | `DatasetImported` -> `LabelSaved` / `LLMResultsImported` | `DatasetImported`가 먼저 발행되어 DB에 `call_id` 묶음이 확보되어야만 개별 대화 평가 기입(`LabelSaved`)이나 외부 LLM 매핑(`LLMResultsImported`)이 허용됨 | FR-001, FR-004, FR-005 | DB 참조 무결성 유지 목적 |
| EC-002 | `LabelSaved` / `DatasetDeleted` / `GoldStandardLabelEstablished` -> `AuditLogCreated` | 라벨 저장, 데이터셋 업로드 및 삭제, 최종 합의 수립 완료 등의 도메인 상태 변경이 완료되는 즉시 감사 로그 생성 완료 이벤트를 동기식 발행해야 함 | OPS-001 | 보안 감사 정책 준수 |
| EC-003 | `Round1EvaluationsCompleted` -> `AdjudicationRound2Escalated` / `AdjudicationRound3Escalated` / `GoldStandardLabelEstablished` | 1차 평가 3인 모두 완료 시점(`Round1EvaluationsCompleted`)의 라벨 일치 여부 스캔 및 skip_round2 플래그 설정 값에 따라 2차 전이, 3차 전이, 혹은 합의 수립 중 1개의 이벤트만 분기 발행됨 | User Request | 중복 상태 전이를 방지하기 위한 베타적 분기 규칙 |

## 4. Events Rejected as Technical or UI Events
| Candidate | Rejection Reason | Revisit If |
|---|---|---|
| UserLoggedIn | 단순히 인증 세션이 시작된 기술적 사실이며 비즈니스 도메인 상태 변화가 아니므로 기각 | 로그인 이력에 대한 감사 로그 수집 요건이 도입될 시 통합 검토 |
| ToxicityWarningTriggered | 대화셋 업로드 중 국내 휴대전화 포맷 PII 감지 시 브라우저 단에서 띄우는 UI 경고 모달 이벤트이므로 기각 | 경고 노출 이력을 감사 기록에 영구 적재하라는 요건 발생 시 재조정 |
| Round2SkippedToggleClicked | Admin이 설정 페이지에서 2차 생략 토글을 클릭하여 UI 상태를 바꾼 액션이며, 실제 3차 이송 실행이 일어나기 전의 입력 인터랙션이므로 기각 | 설정 값 저장 시의 도메인 변경 감사로그 이벤트로 전환 고려 가능 |

## 5. Event Open Questions
- **Q-104 (감사 로그 영구 적재 흐름의 간소화)**: 본 v0에서는 복잡한 분산 이벤트 아키텍처 대신 Firestore의 트랜잭션 배치 쓰기 기능으로 `GoldStandardLabelEstablished` 및 `AuditLogCreated`를 원자적으로 동시 기입하는 단순 구조를 지향하며, 기술 복잡도를 억제합니다.