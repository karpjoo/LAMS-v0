# 04 Business Rules and Invariants

## 1. Status
- **Status**: Draft
- **Source artifacts**:
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
  - [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
- **Last updated**: 2026-06-09

## 2. Business Rules
| Rule ID | Rule | Rule Type | Applies To | Linked Requirement | Acceptance Criteria | Enforcement Notes |
|---|---|---|---|---|---|---|
| BR-001 | 모든 상담 대화 데이터는 업로드 전에 외부 시스템에 의해 개인정보(PII) 마스킹 등 비식별화 처리가 완료되어야 함 | audit / compliance rule | Conversation, Turn | RISK-001, SEC-003 | AC-SEC-003 | 웹 업로드 시 PII 스캔 경고 모달로 사전 체크 보증 |
| BR-002 | 평가자는 오직 본인이 작성한 평가 라벨 데이터만 작성 및 수정할 수 있으며, 타 평가자의 문서 수정은 엄격히 거부되어야 함 | permission rule | Label | SEC-002 | AC-FR-004-01 | Firebase Auth 기반 권한 검증 및 Firestore Rules 통제 |
| BR-003 | 잘못 입력된 데이터 초기화를 위한 대화셋 전체 삭제 시 오작동 방지를 위해 수동으로 "DELETE ALL DATASET" 문자열을 타이핑해야 함 | workflow rule | Conversation | SEC-004, FR-002 | AC-FR-002-01 | UI 확인 버튼 활성화 가드 인터락 적용 |
| BR-004 | 데이터셋 업로드, 삭제, 라벨 저장 및 수정, Adjudicator 최종 결정 등 도메인 핵심 액션은 삭제나 수정이 불가능한 Append-only 데이터로 감사 로그에 기입되어야 함 | audit / compliance rule | Audit Log | OPS-001 | AC-FR-002-01 | Write-once, No-delete/No-update 컬렉션 보안 설정 |
| BR-005 | 외부 LLM 결과 업로드 시 이미 데이터베이스에 등록되어 있는 유효한 대화 식별자(`call_id`)와 매핑되는 것만 데이터베이스에 적재됨 | validation rule | LLM Decision | FR-005 | AC-FR-005-01 | 파일 임포터 파서에서 미등록 `call_id` 검출 및 예외 안내 |
| BR-006 | 동일 `call_id`를 가진 상담 대화가 다시 업로드될 때, 기존 평가(`Label`) 및 LLM 데이터를 보존하기 위해 강제 덮어쓰기(Overwrite)를 배제함 | validation rule | Conversation | NFR-001 | Q-103 | 덮어쓰기 시 확인 대화상자 노출 혹은 무시 처리 방식 적용 |
| BR-007 | **Round 1 (1차 평가) 각자 독립 수행**: 1차 평가에 참가하는 3인의 Evaluator는 서로의 평가 내용이나 진행 여부를 볼 수 없으며 완벽히 독립적으로 기록해야 함 | permission rule | Label, Evaluator | User Request | - | 1차 상세 화면 진입 시 타인 평가 데이터 로드 차단 |
| BR-008 | **Round 2 (2차 평가) 불일치 의견 공유**: 1차 결과가 불일치하여 2차 평가가 수행될 때, Evaluator는 앞선 3인의 1차 평가 결과(Toxicity 여부, 유형, 위험도, 근거) 전체를 상세 화면에서 참고하며 평가를 재작성함 | workflow rule | Label, Evaluator | User Request | - | 1차 평가 문서 정보 조회 뷰 활성화 |
| BR-009 | **2차 평가의 선택적 스킵 정책**: 관리자는 시스템 설정 값을 통해 1차 평가 완료 후 의견이 일치하지 않을 때, 2차 단계를 스킵하고 즉시 3차 최종 결정 단계(Round 3)로 전이되도록 통제할 수 있음 | policy rule | Adjudication Policy | User Request | - | Admin 관리 페이지 내 `skip_round2` 토글 필드 적용 |
| BR-010 | **Round 3 (3차 평가) 최종 결정권 독점**: 2차(또는 생략 시 1차) 결과도 불일치하여 최종 3차 단계에 진입했을 때, 지정된 1인의 Adjudicator만이 1, 2차 결과를 조회하여 최종 Gold Standard Label을 수동 기입할 수 있음 | permission rule | Gold Standard Label | User Request | - | Uid 검증을 통한 Adjudicator 전용 API 및 Rules 통제 |

## 3. Invariants
| Invariant ID | Invariant | Protected By | Invalid State Prevented | Linked Requirement | Future Test Target | Notes |
|---|---|---|---|---|---|---|
| INV-001 | 동일한 `call_id` 및 `round_no`에 대해 특정 평가자(`user_id`)가 소유하는 `Label` 도큐먼트는 반드시 단 1개만 존재해야 함 | Label Aggregate | 동일 대화 차수에 대해 한 명의 유저가 중복 평가 결과를 가지는 데이터 불일치 상태 방지 | FR-004 | DB 쓰기 유닛 테스트 시 중복 key 혹은 단일 도큐먼트 Upsert 규칙 작동 검증 | 동일 call_id + user_id + round_no 멱등성 보장 |
| INV-002 | 유해성 여부(`toxicity`)가 `Present`인 경우에만 유형(`category_id`)과 위험 수준(`risk_level`) 및 근거 구절이 존재해야 함 | Label Aggregate | `Absent`(유해 안함)로 선택되었으나 유형 코드나 위험 심각도가 잘못 남겨져 적재되는 논리 모순 상태 방지 | FR-004 | 유효하지 않은 속성값을 포함해 저장을 시도할 때 도메인 밸리데이션 검사에서 거부되는지 테스트 | Absent 시 하위 필드는 null 처리 |
| INV-003 | 감사 로그(`Audit Log`) 레코드는 생성(Create)만 가능하며 어떠한 편집(Update) 및 제거(Delete) 조작도 허용하지 않음 | Audit Log Aggregate | 보안 사고 발생 시 사후 임의 변조를 통한 감사 회피 상태 방지 | OPS-001 | 모의 세션으로 감사 로그 도큐먼트 수정/삭제 트랜잭션 전송 시 API 차단 여부 검증 | Firestore Rules 상에서 영구 차단 |
| INV-004 | **합의 판정 조건 불변식**: 특정 대화 차수(Round 1 또는 2)의 3인 평가 결과 중 Toxicity 판정과 Category 코드가 모두 일치하는 즉시, 추가 전이 없이 `Gold Standard Label`이 자동 생성/확정됨 | Conversation Aggregate | 합의에 도출했음에도 불구하고 다음 차수(Round 2 또는 3)로 잘못 대화가 넘어가 대기하는 비정합성 상태 방지 | User Request | 3인의 라벨이 일치할 때 자동으로 Gold Standard가 확정 생성되는 비즈니스 로직 유닛 테스트 | 100% 일치 시 합의 도출 |
| INV-005 | **3차 Adjudicator 최종성 불변식**: 3차 최종 결정자가 `Gold Standard Label`을 수동 저장하는 순간 대화의 최종 정답 라벨이 완전히 고정되며, 이후 타 평가자가 이전 차수 라벨을 강제 수정하더라도 불변함 | Conversation Aggregate | 최종 결정이 사후 일반 평가자에 의해 오염되거나 갱신되는 비보안 상태 방지 | User Request | Gold Standard 레코드 저장 완료 후, 하위 라벨 수정 요청 유입 시 최종 정답 변경이 거절되는지 검증 | 최종 정답의 최상위 고정 |

## 4. State Transition Rules
| Transition ID | Concept | From State | To State | Trigger | Guard / Precondition | Invalid Transitions | Linked Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| ST-001 | **Label** | `Not Started` | `Round 1 Completed` | 1차 평가자가 1차 폼 작성 후 [제출] | `toxicity` 선택에 따른 `INV-002` 검증 통과 | 필수값 누락 폼 제출 불가 | AC-FR-004-01 |
| ST-002 | **Conversation** / Adjudication Stage | `Round 1 Active` | `Consensus Reached` | 3인의 1차 평가 제출 완료 | 3인의 1차 평가 결과 `Toxicity` 및 `Category`가 100% 일치할 것 (`INV-004`) | 의견 불일치 시 Consensus 상태로 전이 불가 | User Request |
| ST-003 | **Conversation** / Adjudication Stage | `Round 1 Active` | `Round 2 Active` | 3인의 1차 평가 제출 완료 | 3인의 결과가 불일치하고, Admin의 `skip_round2` 설정이 `false` 일 것 | 의견 일치 시 또는 2차 스킵 활성화 시 Round 2로 전이 불가 | User Request |
| ST-004 | **Conversation** / Adjudication Stage | `Round 1 Active` | `Round 3 Active` | 3인의 1차 평가 제출 완료 | 3인의 결과가 불일치하고, Admin의 `skip_round2` 설정이 `true` 일 것 | 2차 스킵이 비활성화 상태일 때 3차로 다이렉트 전이 불가 | User Request |
| ST-005 | **Conversation** / Adjudication Stage | `Round 2 Active` | `Consensus Reached` | 3인의 2차 평가 제출 완료 | 3인의 2차 결과 `Toxicity` 및 `Category`가 일치할 것 (`INV-004`) | 2차 의견 불일치 시 Consensus 상태로 전이 불가 | User Request |
| ST-006 | **Conversation** / Adjudication Stage | `Round 2 Active` | `Round 3 Active` | 3인의 2차 평가 제출 완료 | 3인의 2차 결과가 여전히 불일치할 것 | 2차 합의 도출 시 3차 전이 불가 | User Request |
| ST-007 | **Conversation** / Adjudication Stage | `Round 3 Active` | `Consensus Reached` | Adjudicator가 3차 최종 합의 라벨 저장 클릭 | 세션 유저 Uid가 지정된 `Adjudicator` Uid와 일치할 것 (`BR-010`) | 비인가 유저의 최종 결정 저장 승인 불가 | User Request |

## 5. Rule Conflicts or Gaps
| Gap ID | Type | Description | Affected Requirement / Concept | Impact | Human Decision Needed |
|---|---|---|---|---|---|
| RG-001 | data gap | 외부에서 수집/제작되어 업로드될 JSON(대화, LLM)들의 정밀 키 구조 및 데이터 자료형 검증 규칙이 아직 미정 상태임 | FR-001, FR-005 | 임포트 파일 파서 내 도메인 유효성 판단 검사가 일부 추상적으로 유보됨 | Stage 6 (데이터 설계) 단계 진입 시 각 JSON 스키마 필드 유형을 최종 검수 및 확정할 예정 |

## 6. Handoff Notes for 04d
- **도메인 이벤트 후보**:
  - `Round1EvaluationsCompleted` (대화당 3인의 1차 평가가 완료되어 합의 체크가 트리거되는 시점)
  - `AdjudicationRound2Escalated` (1차 불일치로 인해 2차 평가 단계로 이관된 시점)
  - `AdjudicationRound3Escalated` (2차 불일치 또는 2차 스킵 설정에 의해 3차 최종 결정 단계로 이관된 시점)
  - `GoldStandardLabelEstablished` (1차/2차 일치 또는 3차 Adjudicator 최종 저장에 의해 Gold Standard 정답이 수립 완료된 시점)
- **이벤트 방출이 필요한 상태 전이**:
  - `ST-002`, `ST-005`, `ST-007` 완료 시 `GoldStandardLabelEstablished` 이벤트를 발행하여 감사 로그(`Audit Log`)를 영구 적재.
  - `ST-003` 완료 시 `AdjudicationRound2Escalated`, `ST-004` 및 `ST-006` 완료 시 `AdjudicationRound3Escalated` 이벤트를 발행하여 대기 중인 전문가들에게 알림이 가도록 지원(v0에서는 대시보드 상태 갱신 트리거로 활용).