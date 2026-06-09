# 07a Scope Input Review

## 1. Task Summary
본 단계(Stage 7)는 콜센터 유해 발화 탐지 연구(LAMS-v0) 시스템의 MVP(Minimum Viable Product) 범위와 후속 릴리즈 슬라이싱을 정의합니다. 본 sub-skill 07a에서는 이전 단계(Stage 1~6)에서 생성된 전체 승인 및 드래프트 아티팩트를 전수 검토하고, 요구사항 및 제약사항을 목록화하여 MVP 분류를 위한 체계적인 기준 정보를 수립합니다. 본 문서 및 관련 인벤토리 작업은 MVP 분류를 최종 확정하지 않으며, 다음 단계인 `07b_mvp_scope_classification`의 입력을 위한 정량적 근거 자료를 제공합니다.

## 2. Inputs Checked
- [/workflow/context/artifact_manifest.yml](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/artifact_manifest.yml)
- [/workflow/context/context_packet.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/context_packet.md)
- [/workflow/context/DECISIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/DECISIONS.md)
- [/workflow/context/APPROVAL_LOG.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/APPROVAL_LOG.md)
- [/workflow/context/ASSUMPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/ASSUMPTIONS.md)
- [/workflow/context/OPEN_QUESTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/OPEN_QUESTIONS.md)
- [/workflow/context/REJECTED_OPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/REJECTED_OPTIONS.md)
- [/workflow/context/TRACEABILITY_MATRIX.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/TRACEABILITY_MATRIX.md)
- [/workflow/01_goal/01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
- [/workflow/03_requirements/03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
- [/workflow/03_requirements/03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- [/workflow/03_requirements/03_traceability_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_traceability_matrix.md)
- [/workflow/04_domain/04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
- [/workflow/04_domain/04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- [/workflow/05_architecture/05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md)
- [/workflow/05_architecture/05_module_boundaries.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_module_boundaries.md)
- [/workflow/05_architecture/05_architecture_decisions.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_decisions.md)
- [/workflow/06_data/06_conceptual_data_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_conceptual_data_model.md)
- [/workflow/06_data/06_logical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_logical_schema.md)
- [/workflow/06_data/06_physical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_physical_schema.md)
- [/workflow/06_data/06_indexes.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_indexes.md)
- [/workflow/06_data/06_data_security_rules.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_security_rules.md)
- [/workflow/06_data/06_migration_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_migration_plan.md)
- [/workflow/06_data/06_seed_fixture_strategy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_seed_fixture_strategy.md)
- [/workflow/06_data/result.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/result.md)

## 3. Source Artifact Status
- **Stage 1 (Goal)**: Draft (Pending Human Approval)
- **Stage 2 (Stakeholders & Risk)**: Draft (Pending Human Approval)
- **Stage 3 (Requirements)**: Draft (Pending Human Approval)
- **Stage 4 (Domain)**: Draft (Pending Human Approval)
- **Stage 5 (Architecture)**: Draft (Pending Human Approval)
- **Stage 6 (Data Design)**: Draft (Completed - Pending Human Approval)
*특이 사항*: 상위 단계의 문서들이 현재 공식적인 '인간 개발자 승인 기입'이 유보된 'Draft' 또는 'Pending Approval' 상태이나, Stage 6 최종 검수까지 마치고 Stage 7 진입 명령이 들어왔으므로 현재까지 작성된 내용을 확정된 논리적 사실로서 준용합니다.

## 4. Missing / Draft / Superseded / Rejected Inputs
- **Missing Inputs**: `USER_DIRECTIVES.md`는 `/workflow/07_mvp_release/` 경로에 존재하지 않음 (스킵 가능 확인).
- **Superseded Inputs**: 06_data 단계 이전의 데이터 구조나 turns를 별도 컬렉션으로 갖는 아키텍처 초안은 present data logic에서 제외됨.
- **Rejected Inputs**: 
  - 실시간 LLM API 추론 연동 직접 처리 기각됨.
  - 실시간 웹 통계 계산 엔진 기각됨.
  - 자동 비식별화 처리 엔진 기각됨.

## 5. Conflicts Found
- **갈등 사항 없음**: 현재까지의 상위 요구사항(FR-001~007), 아키텍처 ADRs, 스키마 설계 내용 사이에 충돌하는 의존성이나 불일치 요소를 감지하지 못했습니다.

## 6. Scope-Relevant Goals
- **G-001 (대화 데이터셋 수집 및 관리)**: 대화 정보 일괄 적재 및 2단계 삭제 안전 장치.
- **G-002 (평가자 라벨 UI)**: 대화 턴 말풍선 및 본인 작성 라벨 폼 (유해 여부, 유형, 위험 수준, 근거 구절) 조회/저장.
- **G-003 (LLM 판정 및 Kappa 비교 연동)**: 오프라인 LLM 판정 매핑 적재 및 오프라인 Kappa 통계 정보 적재.
- **G-004 (진척 상황 Dashboard 모니터링)**: 진척 상황(%) 시각화 및 모델별 Kappa 차트 테이블 단순 렌더링.

## 7. Scope-Relevant Constraints
- **기술적 제약**: Pure Client-side Serverless (React Web SDK + Firebase Auth & Firestore). TailwindCSS 배제 및 Vanilla CSS 기반 Glassmorphism/Outfit 테마 필수 적용.
- **기능적 제약**: 
  - 실시간 LLM 추론 직접 처리 배제 (오프라인 JSON 업로드로 대체).
  - 실시간 Kappa 연산 배제 (외부 연산된 통계 파일 업로드로 대체).
  - 브라우저 내 자동 PII 마스킹 배제 (외부 사전 비식별화 준수).
  - Admin/Evaluator 동일한 평가 폼 UI 공유.

## 8. Security / Privacy / Data Concerns
- **SEC-001 (인증 경계)**: 미인증 게스트의 전체 차단.
- **SEC-002 (평가자 격리 규칙)**: 타인의 Label 문서에 대한 쓰기/수정 차단 (본인 Uid 매핑 영역만 허용).
- **SEC-003 (PII 스캔 경고)**: 업로드 시 국내 휴대전화번호 포맷을 클라이언트단에서 정규식으로 1차 스캔하여 경고 팝업 강제 노출.
- **BR-004 & INV-003 (감사 로그)**: 삭제/수정이 전면 거부된 Append-only 감사 로그 (`audit_logs`) 구축.
- **BR-007 (Round 1 격리)**: `status == "Round 1 Active"` 인 상황에서 일반 평가자는 타인의 labels 서브도큐먼트를 조회할 수 없도록 차단 (Firestore Security Rules 및 UI 가드 적용).

## 9. Decision Candidates
- 본 단계에서 새로 제안되는 의사결정 후보는 없으며, 기존 Stage 5~6에서 제안된 Direct Client-to-DB SDK(`ADR-001`) 및 Append-only Audit Logging(`ADR-004`)을 MVP 핵심 기술로 선정합니다.

## 10. Working Assumptions
- **A-101**: 동시 사용자는 10명 내외이므로 Cloud Functions 트리거가 불필요하며 client-side batched write 무결성으로도 충돌 리스크가 안전하게 수렴된다는 가정 유지.
- **DATA-ASM-003**: 3인의 평가 완료 여부는 Conversation의 `label_completion_count` 필드를 확인하여 최소 비용으로 파악한다고 가정.

## 11. Open Questions
- **Q-105 (개별 평가자 세부 진척도 뷰 구현 여부)**: MVP Dashboard에서 전체 진척률 외에 개별 평가자 단위의 상세 잔여량 표시 요구가 미정 상태이나, MVP 스코프 슬라이싱의 부담을 최소화하기 위해 R1에서는 전체 aggregate 통계만 노출하고, R2(Post-MVP)에서 개별 사용자 세부 모니터링 테이블을 구현하기로 가정합니다.
- **Q-201 (JSON 세부 스키마)**: CSV/JSON 임포트 시의 필드 포맷에 관하여, Stage 6에서 논리/물리 스키마를 확정하였으므로, MVP 릴리즈는 Stage 6의 스키마 명세를 준수하여 빌드될 것을 보장합니다.

## 12. Risks
- **Firestore Security Rules 테스팅 누락**: 클라이언트가 Firestore를 직접 쿼리하므로 blind spot 격리 규칙(`DSR-002`) 오동작 시 독립 평가 규칙이 무너질 우려가 있음.
  - *조치*: Stage 8에서 로컬 Firestore 에뮬레이터 기반의 보안 규칙 Unit 테스트 구축을 필수 검증 요건으로 넘겨 완수해야 합니다.

## 13. Handoff to 07b
- 07a를 통해 7대 요구사항 및 보안/감사 제약 요건이 모두 식별되었으며, 유기적인 `SCOPE-0*` 아이템 매핑을 위한 `07a_scope_inventory.md`를 즉시 수립하여 `07b_mvp_scope_classification` 단계로 이관합니다.
