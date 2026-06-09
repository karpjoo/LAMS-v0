# Result: 04_domain_modeling

## 1. Task Summary
본 테스크는 LAMS-v0 프로젝트의 **Stage 4 Domain Modeling / DDD** 단계를 수행하였습니다. 특히, 사용자의 수정 요구사항(통계 연산 완전 제외 및 무시, 대시보드 목적 갱신, 전문가 평가 불일치 해결을 위한 3단계 합의 모델 도입)을 수용하여 도메인 모델링 설계 전체를 개정하였습니다. 1차 각자 평가 → 2차 의견 불일치 대화 참고 재평가 (선택적 스킵 가능) → 3차 최종 결정자(Adjudicator) 독점 결정에 이르는 전문가 합의 프로세스 상태 전이 규칙과 데이터 무결성 가드를 정교화하여 아키텍처 및 구현 설계(Stage 5)로의 안전한 이양 준비를 마쳤습니다.

## 2. Inputs Used
- [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md) (서비스 목표 지표)
- [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md) (이해관계자 역할)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (요구사항)
- [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md) (인수 조건)
- 사용자 직접 개정 피드백 (통계 무시, 대시보드 목적 갱신, 3단계 합의 도출 모델 도입)

## 3. Outputs Created or Updated
- [04_ubiquitous_language.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_ubiquitous_language.md) [UPDATED] (통계 용어 제거, 합의/차수/Adjudicator 신규 용어 반영)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md) [UPDATED] (통계 제거, 3차 합의 정책 및 Adjudicator 역할 모델링 반영)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md) [UPDATED] (3단계 합의 상태 전이 및 불변식 추가)
- [04_domain_events.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_events.md) [UPDATED] (합의 완성, 에스컬레이션 도메인 이벤트 반영)
- [04_bounded_contexts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_bounded_contexts.md) [UPDATED] (3개 바운디드 컨텍스트 전략 갱신)
- [04_domain_risk_notes.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_risk_notes.md) [UPDATED] (Adjudicator 최종 권한 격리 요건 추가)
- [04_domain_traceability_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_traceability_matrix.md) [UPDATED] (통계 제거 및 합의 요건 신규 추적성 매핑)
- [context_packet.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/context_packet.md) [UPDATED] (Stage 5 기술 인계서 갱신)
- [ASSUMPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/ASSUMPTIONS.md) [UPDATED]
- [OPEN_QUESTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/OPEN_QUESTIONS.md) [UPDATED]
- [REJECTED_OPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/REJECTED_OPTIONS.md) [UPDATED]
- [TRACEABILITY_MATRIX.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/TRACEABILITY_MATRIX.md) [UPDATED]

## 4. Domain Modeling Summary
본 개정은 LAMS-v0 비즈니스의 초점을 통계 분석 업로드 시각화에서 **사용자/데이터 관리 및 3단계 전문가 합의 프로세스 제어**로 안전하게 선회시켰습니다. 1차 평가의 독립 수행 보장(`BR-007`), 2차 평가 시 1차 결과 노출 참고 허용(`BR-008`), 2차 생략 시 다이렉트 3차 에스컬레이션 정책(`BR-009`), 3차 Adjudicator 최종 결정권 격리(`BR-010`)를 설계에 탑재하여 복잡할 수 있는 다인 합의 워크플로를 Firestore Document 기반의 serverless 아키텍처 상에서 일관성 있게 다룰 수 있도록 구조화하였습니다.

## 5. Key Domain Findings
- **3단계 합의 전이 비선형성 제어**: 관리자가 2차 라벨링을 생략(`skip_round2 = true`)하도록 설정할 수 있어, 1차 불일치 시 2차(Round 2)를 건너뛰고 3차(Round 3)로 다이렉트 전이되는 상태 가드 규칙(`ST-004`)을 설계함으로써 프로세스 제어의 유연성을 100% 확보하였습니다.
- **최종 정답의 오염 차단**: 3차 최종 결정자가 합의 정답을 생성(`GoldStandardLabelEstablished`)하는 즉시 해당 대화의 평가 상태를 Consensus Reached로 영구 잠금 처리하여, 타 평가자의 1차/2차 사후 무단 편집에 의한 정답 오염을 완벽히 방지하는 불변식(`INV-005`)을 도출하였습니다.

## 6. Decision Candidates
- 3단계 합의(Adjudication) 프로세스의 도메인 개념 및 차수 상태 분리.
- 3차 최종 합의 라벨을 기입하는 지정된 1인의 Adjudicator 역할 분리 및 쓰기 독점권 부여.
- 2차 차수 재평가 시 1차 결과(3인) 데이터 노출 계약.
- 통계 분석의 LAMS 유입 차단 및 무시 결정.
- 대시보드의 목적을 통계 시각화에서 관리 및 모니터링 툴로 정의 갱신.

## 7. Working Assumptions
- **A-401**: 동일 `call_id` 재등록 시 덮어쓰기하지 않고 기존 인간 라벨 및 최종 합의 정보를 보호하며 병합한다는 멱등적 보존 처리 가정.

## 8. Open Questions
- **Q-105**: 관리자가 대시보드 상에서 평가자별 완료 건수 등 개별 상세 진척도(누락 대화 call_id 목록 포함)를 조회할 수 있게 할 것인지 여부.
- **Q-201**: 대화 및 LLM JSON 파일의 상세 포맷 규격 정의 (Stage 6 데이터 설계 단계에서 정의할 것인지 동의 여부).

## 9. Risks and Constraints
- PII(개인정보) 노출 방지를 위한 시스템 외부의 사전 마스킹 보장.
- 3차 Adjudicator 이외의 유저가 Gold Standard 정답 라벨에 대해 편집/삭제하지 못하도록 하는 격리 가드 규칙 Firestore Rules에 통제 필수.
- 감사 로그의 수정/삭제 영구 차단 보장.

## 10. Rejected or Superseded Options
- **실시간 LLM API 추론 연동 직접 처리**: 오프라인 JSON 임포트 방식으로 대체 기각.
- **실시간 Kappa 수학 통계 엔진 탑재 및 사전 통계 파일 업로드**: LAMS 시스템 복잡도를 억제하기 위해 통계 처리는 LAMS 외부로 격리하고 업로드 요건도 전면 배제 기각.
- **웹 내부 실시간 비식별화 마스킹 엔진**: 외부 선행 처리 후 업로드하도록 격리하고, 웹 내부 가공 필터를 기각.

## 11. Traceability Updates
- **TR-007**: Bounded Contexts 도출 추적 정보 추가.
- **TR-008**: Aggregate 경계 도출 추적 정보 추가.
- **TR-009**: 보안 관련 Invariants (Write Isolation, Adjudicator Exclusivity, Append-only) 추적 정보 추가.

## 12. Conditional Artifacts Not Created
| Artifact | Why Not Applicable | Revisit If |
|---|---|---|
| `04_state_lifecycle.md` | 평가 라벨 및 대화 합의 상태 상태전이가 `Round 1` -> `Round 2` -> `Round 3` -> `Consensus Reached`로 정립되었으며, 별도 파일 생성 대신 `04_business_rules_invariants.md` 내 테이블(ST-001 ~ ST-007)로 충분히 상세화되어 생략함 | 향후 평가 승인 단계나 워크플로 마일스톤이 한층 더 복잡해져 파일 분리가 불가피할 경우 |
| `04_context_map.md` | Greenfield 단일 React-Firebase 물리 배포 환경으로, 컨텍스트 간 결합이 느슨하여 물리 맵 대신 `04_bounded_contexts.md` 내 neutral 텍스트 관계로 기술 종결함 | 추후 물리적으로 독립된 마이크로서비스 또는 별도 데이터베이스로 백엔드가 분리될 경우 |
| `04_domain_model_diagrams.md` | 모델 복잡도가 3개 단순 엔티티 범위에 머물러 있어 UML 다이어그램 제작을 생략함 | 에그리게이트 멤버 및 복잡한 벨류 오브젝트가 다수 추가될 경우 |
| `04_domain_open_questions.md` | 미해결 질문의 수가 2건으로 적어 context 레벨의 open questions에 일치 통합 관리함 | 도메인 로컬 질문이 다수 파생될 경우 |

## 13. Consistency Review
- 도메인 용어집(`Preferred Terms`)이 개념(Concepts), 규칙(Rules), 이벤트(Events), 컨텍스트(Contexts) 내에 모두 일관성 있게 사용되었음을 검증하였습니다 (통계 관련 단어 배제 및 합의 관련 용어 동기화).
- 도메인 에그리게이트 루트(`Conversation`, `Label`, `Audit Log`)들을 중심으로 내부 3단계 합의 상태 전이 규칙과 최종성 불변식이 모순 없이 설계되었음을 크로스체크하였습니다.

## 14. Human Approval Required

### Decisions to Approve
- **Preferred ubiquitous language terms**: LAMS-v0 개정 도메인 용어집 정의 및 deprecated term 기각 결정 (`04_ubiquitous_language.md`).
- **Entity and value object classifications**: Conversation, Label, Gold Standard Label, Audit Log의 Entity 분류 및 Turn, Toxicity Form, LLM Item, Round Info의 VO 분류 의사결정.
- **Aggregate roots and aggregate boundaries**: 3개 Aggregate(AGG-001 ~ AGG-003)의 consistency boundary 범위 지정.
- **Business rules and invariants**: 덮어쓰기 방지 병합 규칙(`BR-006`), 1차 독립성(`BR-007`), 2차 참고 허용(`BR-008`), 3차 Adjudicator 독점(`BR-010`), 3인 일치 합의 성공(`INV-004`), Adjudicator 최종성 보증(`INV-005`), 감사로그 불변성(`INV-003`).
- **Domain events**: DatasetImported, DatasetDeleted, LabelSaved, Round1EvaluationsCompleted, AdjudicationRound2Escalated, AdjudicationRound3Escalated, GoldStandardLabelEstablished, AuditLogCreated.
- **Bounded contexts and context relationships**: 관리, 평가 및 합의, 감사의 3개 컨텍스트 영역 정의 및 관계.
- **Single-context rationale, if applicable**: 논리적 3개 분리를 유지하며 물리적 단일 Firebase 상에 구현하는 단일 서비스 연동 아키텍처 배경.

### Assumptions to Confirm
- **A-401**: 동일 `call_id` 대화 데이터 재업로드 시 기존 인간 평가 및 최종 합의 정보가 임의로 덮어씌워져 유실되지 않도록 멱등적인 보존 병합 처리를 따른다는 비즈니스 가정.

### Open Questions to Resolve
- **Q-105**: 관리자가 대시보드 상에서 평가자별 완료 건수 등 개별 상세 진척도(누락 대화 call_id 목록 포함)를 조회할 수 있게 해야 하나요?
- **Q-201**: 대화 및 LLM JSON 파일의 상세 포맷 규격 정의 (Stage 6 데이터 설계 단계에서 정의할 것인지 동의 여부).

### Risks to Review
- **DRN-001 ~ DRN-005**: 개인정보(PII)의 외부 선행 마스킹 의무, 평가자 간 쓰기 격리 가드, 감사 로그 Append-only, 데이터셋 전체 삭제 확인 인터락 UI 조건, 3차 Adjudicator 최종 결정권 독점 가드 준수.

### Artifacts Ready for Review
- [04_ubiquitous_language.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_ubiquitous_language.md)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
- [04_bounded_contexts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_bounded_contexts.md)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- [04_domain_events.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_events.md)
- [04_domain_risk_notes.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_risk_notes.md)
- [04_domain_traceability_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_traceability_matrix.md)
- [result.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/result.md)

### Recommended Next Step
- Review and approve or revise Stage 4 artifacts before running Stage 5 Architecture & Technical Contracts.

## 15. Recommended Next Step
본 Stage 4 도메인 모델링 설계 결과물에 대한 Human Developer의 최종 검수 및 승인을 얻은 후, Stage 5 (Architecture & Technical Contracts) 아키텍처 설계 단계로 진입하여 물리 Security Rules 및 서비스 모듈 구조를 구체화할 것을 추천합니다.