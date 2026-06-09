# Result: 07 MVP Scope & Release Slicing

## 1. Task Summary
본 Stage 7 MVP Scope & Release Slicing 단계에서는 이전의 요구사항정의(Stage 3), 도메인설계(Stage 4), 아키텍처설계(Stage 5) 및 데이터설계(Stage 6) 산출물을 기반으로 LAMS-v0의 최적 MVP 범위를 정의하고 순차적 릴리즈 계획을 수립하였습니다. R0 (Foundation), R1 (MVP), R2 (Post-MVP)의 릴리즈 슬라이스를 정렬하여 선행 아키텍처/데이터 의존성을 만족시켰으며, 개인정보 스캔 및 감사 로그 무결성 등 중요 비기능적 제약사항을 MVP 코어 범위에 완전히 내재시켰습니다.

## 2. Inputs Used
- [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
- [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- [05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md)
- [06_conceptual_data_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_conceptual_data_model.md)
- [result.md (06 Data Design)](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/result.md)

## 3. Outputs Created or Updated
- [07_mvp_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_mvp_scope.md) [NEW]
- [07_release_slices.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_release_slices.md) [NEW]
- [07_dependency_map.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_dependency_map.md) [NEW]
- [07_out_of_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_out_of_scope.md) [NEW]
- [07_scope_traceability_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_scope_traceability_matrix.md) [NEW]
- [result.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/result.md) (본 문서 - 신규)
- [context_packet.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/context_packet.md) (갱신 예정)

## 4. MVP Scope Summary
- **Must-Have Core**: 대화 데이터셋 수집 및 2단계 삭제 인터락, 버블 대화창 렌더링, 본인 UID 기반 멱등적 유해성 판정 기록(Prefilled 포함), 외부 LLM 결과 및 외부 오프라인 Kappa 통계 업로드, Dashboard 모니터링.
- **Supporting Boundaries**: 3단계 Adjudication 상태 전이 머신, Firestore Security Rules (1차 blind-spot lock, 본인 쓰기 격리, Append-only 감사 로그).

## 5. Release Slice Summary
- **R0 (Foundation)**: Firebase 연동, 로그인 세션 검증, Vanilla CSS 기본 글래스모피즘 스캐폴딩 레이아웃.
- **R1 (MVP Release)**: 핵심 라벨링 수명주기, 오프라인 임포트 파서, 감사 및 보안 규칙 배포.
- **R2 (Post-MVP)**: Adjudicator용 불일치 대화 목록 필터(`SCOPE-CLD-001`), 관리자용 개별 평가자 단위 진척 모니터링 표(`SCOPE-LTR-001`).

## 6. Out-of-Scope Summary
- **Explicit Non-Scope**: 실시간 외부 LLM API 호출, 앱 내부 실시간 Kappa 산출 수식 연산, 웹 내부 자동 마스킹 가공 에디터 UI, 상담 오디오 녹취 스트리밍 재생.
- **Deferred Items**: 평가자별 상세 진척도 조회 표(Q-105), 불일치 대화 필터링 뷰(Q-101) -> **R2로 공식 이월**.

## 7. Decision Candidates
- **MVP 핵심 기술 및 릴리즈 경로 확정**: Pure Client-side Serverless (`ADR-001`) 구조를 채택하고, 인프라 보안과 무결성을 위한 R0 선행 릴리즈 전략을 릴리즈 의사결정 후보로 기입합니다.

## 8. Working Assumptions
- **A-101**: 동시 사용자가 10명 내외이므로 Cloud Functions 트리거 없이 client-side batched write 무결성으로 충돌 리스크가 안전하게 수렴된다는 가정 유지.
- **DATA-ASM-003**: 3인의 평가 완료 여부는 Conversation의 `label_completion_count` 필드 단일 쿼리로 최적화하여 판정.

## 9. Open Questions
- **Q-105의 이월 처리**: 개별 평가자별 세부 진척도 대시보드 테이블 렌더링 요건을 MVP(R1)에서 배제하고 R2(Post-MVP)로 이월하는 것에 대한 관리자 승인 최종 확인.

## 10. Risks and Constraints
- **보안 규칙 오작동 및 에뮬레이터 테스트 (RSK-REL-001)**: Blind-spot Rules 및 audit_logs append-only 규칙 설계의 오작동 방지를 위해, Stage 8에서 로컬 Firestore 에뮬레이터 기반의 rules 검증 테스트 코드 작성을 필수로 연계합니다.

## 11. Rejected or Superseded Options
- **실시간 API 연동 직접 처리 및 실시간 Kappa 계산**: 오프라인 업로드로 전면 대체 기각됨.
- **turns 턴 데이터의 별도 서브컬렉션 분리**: 1MB 한계 내 Embedding 구조 채택으로 기각됨.

## 12. Traceability Updates
- 신규 생성된 [07_scope_traceability_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_scope_traceability_matrix.md)를 통해 모든 Goal(G-001~004), 요구사항(FR-001~007), 인 invariants(INV-001~005) 및 릴리즈 슬라이스(R0~R2)가 상호 추적 가능함을 확인하였습니다.

## 13. N/A Items
| Artifact | Why Not Applicable | Revisit If | Human Confirmation Needed |
|---|---|---|---|
| **07_release_risk_register.md** | 릴리즈 리스크가 2개(복합 인덱스 배포 누락, turns 1MB 초과)로 매우 단순하여 release slices 내의 리스크 장에 병합해 관리함. | 타 시스템 연동 등 배포 파이프라인 리스크가 5개 이상 증가할 시. | No |
| **07_scope_tradeoff_analysis.md** | MVP 바운더리에 대해 연구원과 평가자 사이의 충돌 요소가 없고, 오프라인 임포트 제약이 확실하여 단일 MVP 안으로 의견이 수렴됨. | MVP 기능 조율 시 스코프 이월에 대한 이견 대립이 발생할 시. | No |
| **07_specialization_scope_notes.md** | 상담원과 언어 전문가는 UI 화면을 완전 공유하기로 합의(`Q-101` 해결)하였으므로, 역할 전용 UI 특화 명세는 불요함. | 향후 상담원 전용 화면과 전문가 전용 화면을 완벽히 분리하라는 지시가 내려올 시. | No |

## 14. Stage 8 Handoff Notes
- **우선 검증 요건**:
  - `VAL-001`: **Firestore Security Rules Unit Tests**: Firebase Emulator를 통한 blind-spot 및 쓰기 격리 rules 자동 검증.
  - `VAL-002`: **Batched Write 무결성 테스트**: client-side label submission 시 call count 갱신의 원자성 검증.
  - `VAL-003`: **Audit Log Append-only 테스트**: audit_logs 문서 수정/삭제 차단 검증.

## 15. Human Approval Required

### Decisions to Approve
- **Must-Have MVP 범위**: `SCOPE-001` ~ `SCOPE-014` 전체 승인.
- **Later/Could-Have 이월**: `SCOPE-LTR-001` (평가자 세부 진척 뷰) 및 `SCOPE-CLD-001` (목록 필터)의 이월 승인.
- **Won't 범주**: 실시간 LLM 추론, 웹 내 통계 연산 및 오디오 재생 기능의 비스코프 제외 승인.

### Assumptions to Confirm
- **A-101**: 동시 사용자 10명 내외에 따른 동시성 충돌 우회(Transactions/Batches 사용) 가정 확인.
- **DATA-ASM-003**: 3인의 평가 완료 여부를 `label_completion_count` 필드 단일 쿼리로 최적화 판정하는 가정 확인.

### Open Questions to Resolve
- 개별 평가자 모니터링(`DEF-001`) 및 불일치 필터(`DEF-002`)의 R2 이월 계획 수락 확인.

### Risks to Review
- Cloud 배포 시 복합 인덱스(`IDX-001`) 누락에 따른 쿼리 거부 리스크 및 turns 1MB 한계 검토.

### Artifacts Ready for Review
- [07_mvp_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_mvp_scope.md)
- [07_release_slices.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_release_slices.md)
- [07_dependency_map.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_dependency_map.md)
- [07_out_of_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_out_of_scope.md)
- [07_scope_traceability_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_scope_traceability_matrix.md)

## 16. Recommended Next Step
- Admin(User)의 최종 승인 획득 후, Stage 8 Test Strategy & Validation Harness 단계로 전이하여 Emulator 테스트 코드를 설계합니다.
