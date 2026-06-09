# 04 Bounded Contexts

## 1. Status
- **Status**: Draft
- **Source artifacts**:
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
  - [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
  - [04_domain_events.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_events.md)
- **Last updated**: 2026-06-09

## 2. Context Strategy Summary
LAMS-v0는 소규모 연구용 Greenfield Serverless 웹 플랫폼(React + Firebase)으로 설계되지만, 논리적 도메인 수준에서는 언어 의미의 혼동을 막고 보안/감사 격리 요건을 엄격히 충족하기 위해 **Project Management Context**, **Toxicity Evaluation Context**, **Audit Context** 3가지 Bounded Context로 분할하여 접근합니다. 이들은 하나의 모놀리식 클라이언트와 단일 Firestore 데이터베이스에 통합 배포되지만, 논리적인 데이터 접근 규칙과 도메인 이벤트 수신 모델을 분리하여 설계 정합성을 유지합니다.

## 3. Bounded Contexts
| Context ID | Name | Purpose | Owned Language | Owned Concepts | Owned Rules / Policies | Linked Requirements |
|---|---|---|---|---|---|---|
| BC-001 | **Project Management Context** (프로젝트 관리 컨텍스트) | 연구 프로젝트 관련 관리 업무(사용자 계정 생성/관리, 대화 데이터셋 수명주기, 외부 LLM 판정 결합, 평가 진행 상황 대시보드 렌더링)를 관장함 | Admin, Conversation, LLM Decision, Progress Rate | Conversation, LLM Decision | 대화셋 중복 업로드 방지 정책(`BR-006`), 삭제 확인 인터락 정책(`DSP-003`) | FR-001, FR-002, FR-005, FR-007 |
| BC-002 | **Toxicity Evaluation Context** (유해성 평가 컨텍스트) | 다중 평가자의 1~3차 평가 수행, 의견 불일치 스캔 및 최종 Adjudicator의 Gold Standard 정답 기입 및 저장 제어 | Evaluator, Adjudicator, Label, Evaluation Round, Gold Standard | Label, Gold Standard Label, Evaluation Round Info | 평가자 쓰기 권한 격리 정책(`DSP-002`), 합의 판정 조건(`INV-004`), 3차 결정 독점(`BR-010`) | FR-003, FR-004, SEC-002, User Request |
| BC-003 | **Audit Context** (감사 컨텍스트) | 시스템 보안 위변조 방지를 위한 핵심 비즈니스 액션의 Append-only 감사 영구 로깅 보장 | Audit Log, Append-only | Audit Log | 감사 로그 Append-only 불변식(`INV-003`) | OPS-001 |

## 4. Context Relationships
| Relationship ID | Upstream Context | Downstream Context | Relationship Type | Translation / Contract Need | Notes |
|---|---|---|---|---|---|
| BCR-001 | Project Management Context | Toxicity Evaluation Context | Upstream / Downstream candidate | 관리 컨텍스트에서 `DatasetImported`를 통해 `call_id`가 할당된 대화 데이터가 생성되어야 하위 평가 라벨 및 Gold Standard가 작성될 수 있으므로, 대화 스키마를 고유 계약으로 공유함 | 대화 식별자 참조를 통해 느슨한 결합 유지 |
| BCR-002 | Project Management Context | Audit Context | Upstream / Downstream candidate | 대화셋 임포트(`DatasetImported`) 및 전체 삭제(`DatasetDeleted`) 이벤트를 수신하여 비동기 또는 원자적으로 로그를 작성함 | 동기 트랜잭션 혹은 영구 적재 트리거 |
| BCR-003 | Toxicity Evaluation Context | Audit Context | Upstream / Downstream candidate | 평가 완료 및 수정 제출(`LabelSaved`), 합의 확정(`GoldStandardLabelEstablished`) 이벤트를 수신하여 감사 내역에 로그를 작성함 | 사용자 행동 및 최종 정답 확정 감사 추적용 |
| BCR-004 | External LLM System (외부 시스템) | Project Management Context | External integration candidate | 외부에서 가공 완료되어 업로드되는 LLM JSON 파일로부터 데이터셋을 안전하게 수용하기 위해 프론트엔드 검증 계약 적용 | 외부와 웹의 키 포맷을 1대1 매핑 파싱하는 Anti-Corruption Layer 후보 적용 |

## 5. Single-Context Rationale, if Applicable
- **N/A**: 본 LAMS-v0 프로젝트는 비록 단일 데이터베이스(Firestore) 및 React 단일 클라이언트로 물리 배포되지만, 평가자 쓰기 격리 규정(SEC-002), 3차 Adjudicator 최종 결정권 독점(BR-010), 감사 로그 영구 불변성(OPS-001, SEC-001)이라는 명확히 구분되는 비즈니스 정책들이 존재합니다. 따라서 단일 컨텍스트로 융합하여 흐리게 설계하는 대신, 비즈니스 규칙의 안전한 분리 및 테스트 가시성 향상을 위해 3개의 논리 컨텍스트 분리를 유지합니다.

## 6. Context Split Candidates Requiring Approval
- **N/A**: 본 v0 도메인 모델에서는 관리(Project Management), 평가 및 합의 조정(Toxicity Evaluation & Adjudication), 보안 감사(Audit)의 3가지 논리적 구분을 고정하였으며, 현재 범위 내에서 추가적인 임의적 분리는 제안하지 않습니다.

## 7. Context Open Questions
- **Q-105 (대시보드 상 개별 평가자 진척도 조회 범위)**: 대시보드가 통계 시각화에서 사용자 관리/진척 상황 관리로 목적이 변경됨에 따라 관리자 대시보드 화면 상에서 노출될 평가자별 진척 뷰의 권한 제어 규칙을 아키텍처 설계 단계에서 보완해야 합니다.