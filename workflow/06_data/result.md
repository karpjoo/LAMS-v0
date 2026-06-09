# Result: 06 Data Design

## 1. Task Summary
본 Stage 6 Data Design 단계에서는 이전에 승인된 요구사항, 3단계 합의 도메인 모델 및 React-Firebase 아키텍처 계약을 바탕으로 Firestore NoSQL 기반의 데이터를 정의하고 설계하였습니다. 개념 모델 수립부터 시작하여 기술 독립적 논리 스키마를 거쳐, 실제 서브컬렉션 계층 및 batch 트랜잭션 경계를 지닌 물리적 컬렉션 상세 설계 및 복합 인덱스 요건을 수립하였습니다. 또한, 1차 평가의 독립성(Blind Spot)과 감사 로그 위변조 불가능(Append-Only) 규칙을 데이터베이스 수준에서 강제하는 Firestore Security Rules 설계와, 데이터 일괄 삭제/임포트/테스트 시드 적재 계획을 완수하였습니다.

## 2. Inputs Used
- [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
- [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md)
- [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
- [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- [05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md)
- [05_api_contracts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_api_contracts.md)
- [05_authn_authz_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_authn_authz_model.md)

## 3. Outputs Created or Updated
- [06_conceptual_data_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_conceptual_data_model.md) (갱신)
- [06_logical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_logical_schema.md) (갱신)
- [06_query_patterns.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_query_patterns.md) [NEW]
- [06_physical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_physical_schema.md) (갱신)
- [06_indexes.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_indexes.md) (갱신)
- [06_data_security_rules.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_security_rules.md) (갱신)
- [06_retention_deletion_policy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_retention_deletion_policy.md) [NEW]
- [06_migration_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_migration_plan.md) (갱신)
- [06_seed_fixture_strategy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_seed_fixture_strategy.md) [NEW]
- [06_data_design_traceability.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_design_traceability.md) [NEW]
- [result.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/result.md) (본 문서 - 갱신)

## 4. Approved Decisions Used
- **ADR-001 (Direct SDK Serverless)**: React client가 중간 API 중계 노드 없이 Firestore에 직접 쿼리하여 데이터 읽기/쓰기를 처리합니다.
- **ADR-004 (Append-only Audit Logging)**: 감사 로그 저장을 트리거할 때, 본 데이터 변이와 감사 로그 쓰기를 원자적 Client Batched Write 트랜잭션으로 결합하여 처리합니다.
- **ADR-005 (Firestore Rules Access)**: 1차 평가자 blind 검증 등 핵심 권한 격리를 데이터베이스 규칙 자체에서 강제합니다.

## 5. Key Data Design Findings
- **Turns Embedding 최적화**: 대화 내용 턴 데이터를 별도 컬렉션으로 물리 분리하지 않고 `conversations` 단일 문서 내에 Map List 형태로 Embedding 시켜, 1회 document read로 대화 로드가 완수되는 비용/성능 최적화 설계를 확립하였습니다.
- **1차 평가 격리(Blind Spot) 규칙 보장**: conversations status가 `"Round 1 Active"`인 동안에는 로그인 사용자 자신의 UID 문서가 아닌 하위 Labels 도큐먼트의 GET 요청을 데이터베이스 규칙에서 에러 거부하도록 `DSR-002`를 정밀 수립하여, 독립적 1차 평가 수행 원칙을 인프라 레벨에서 달성했습니다.
- **감사 로그 보호**: 전체 데이터셋 삭제("DELETE ALL DATASET")가 수행되는 시점에도, audit_logs 컬렉션의 데이터는 물리적 수정(Update)과 삭제(Delete)가 거부되어 영구 누적 보존되도록 Rules 설계를 확정하였습니다.

## 6. Decision Candidates
- 없음.

## 7. Working Assumptions
- **DATA-ASM-003**: 3명의 평가자 라벨이 적재되었는지 여부는 상위 Conversation의 `label_completion_count` 값을 쿼리하여 빠르고 값싸게 판단한다고 가정합니다.

## 8. Open Questions
- 없음.

## 9. Risks and Constraints
- **클라우드 복합 인덱스 누락 리스크**: 로컬 Firestore 에뮬레이터에서는 복합 정렬 쿼리가 인덱스 없이 작동할 수 있으나, 클라우드 실 배포 환경에서는 거부됩니다.
  - *조치*: MVP 기동에 필수적인 `IDX-001` (status, created_at) composite index를 설계서에 확정하였으며, 배포 시 firebase 구성 파일에 선제 정의할 것입니다.

## 10. Rejected or Superseded Options
- ** turns 하위 컬렉션 분리 옵션 (Superseded)**: 읽기 비용 급증 위험성으로 인해 conversations 단일 문서 내부 embedding 구조로 대체 결정되었습니다.

## 11. N/A Items
| Artifact | Why Not Applicable | Revisit If | Human Confirmation Needed |
|---|---|---|---|
| **06_data_dictionary.md** | 스키마 구조가 단순하여 logical schema 필드 정의 테이블로 완전 대체 가능함. | 컬렉션/필드 종류가 50개 이상 늘어날 시 작성. | No |
| **06_external_data_mapping.md** | 외부 API 연동이 존재하지 않고, 단순 local JSON 임포트 파일만 존재하므로 migration plan 내의 스키마 명세로 갈음함. | 타 외부 시스템과 직접적인 데이터베이스 동기화가 추가될 시. | No |
| **06_event_data_model.md** | Kafka/RabbitMQ 등의 비동기 이벤트 큐 스토리지를 보유하지 않고, client batch write로 로그를 적재하므로 불필요. | 서버리스 백엔드에 전용 이벤트 메시지 브로커가 배포될 시. | No |
| **06_analytics_reporting_model.md** | Kappa 등의 정밀 통계는 외부 시스템에서 오프라인 계산되어 업로드되므로 웹 내 전용 통계 데이터 웨어하우스 설계는 불요. | 앱 내부에 실시간 통계 분석 연산 엔진이 직접 이식될 시. | No |
| **06_blob_object_storage_model.md** | PDF나 오디오 등 파일 형태의 스토리지(S3 등) 연동이 배제되고 오직 텍스트만 관리하므로 스토리지 메타데이터 스키마 불요. | 상담 음성 파일 직접 재생용 오디오 클라우드 스토리지가 도입될 시. | No |

## 12. Traceability Updates
- 본 설계 이력에 맞추어 [06_data_design_traceability.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_design_traceability.md) 문서를 전면 신규 생성하였으며, 전체 요구사항(FR/SEC/OPS)이 데이터 오브젝트, 쿼리, 보안 규칙과 유기적으로 매핑됨을 검증 완료하였습니다.

---

## 13. Human Approval Required

### Decisions to Approve
- **Conceptual data model**: 8대 데이터 개념 및 수명주기 설계안 승인.
- **Logical schema & Field Semantics**: toxicity 여부에 따른 category 및 risk_level 맵 매핑 제약 조건(`INV-002`) 및 데이터 구조 승인.
- **Physical schema**: nested subcollection 구조 (`/conversations/{call_id}/labels`, `/gold_standard`) 및 turns Embedding 구조 승인.
- **Data ownership**: Admin, Evaluator, Adjudicator 간의 쓰기/수정 권한 소유 경계 승인.
- **Access-control rules**: 1차 blind rules 적용 및 2/3차 의견 공유에 대한 Firestore Security Rules(`DSR-002`) 설계안 승인.
- **Retention/deletion policy**: 대화셋 삭제 시 hard-delete 및 audit_logs 삭제 거부 permanent 보존 방침 승인.
- **Migration & Seed strategy**: 벌크 JSON 임포트 flow (`MIG-001`, `MIG-002`) 및 로컬 검증용 mock profiles (`SEED-001`) 주입 방침 승인.
- **Conditional artifacts marked N/A**: Data Dictionary, Event Data, External Mapping, Analytics 및 Blob Storage 모델 설계 스킵 Rationale 승인.

### Assumptions to Confirm
- 동시 사용자가 10명 내외이므로 Cloud Functions 트리거가 불필요하며 client-side batched write 무결성으로도 충돌 리스크가 안전하게 수렴된다는 가정 확인.
- Turn 텍스트의 데이터 크기가 1MB Firestore 도큐먼트 한계를 안정적으로 하회한다는 가정 확인.

### Open Questions to Resolve
- 없음.

### Risks to Review
- status 필터 조회와 created_at 정렬 수행 시 composite index(`IDX-001`) 누락에 따른 런타임 쿼리 거부 위험 검토.

### Artifacts Ready for Review
- [06_conceptual_data_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_conceptual_data_model.md)
- [06_logical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_logical_schema.md)
- [06_query_patterns.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_query_patterns.md)
- [06_physical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_physical_schema.md)
- [06_indexes.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_indexes.md)
- [06_data_security_rules.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_security_rules.md)
- [06_retention_deletion_policy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_retention_deletion_policy.md)
- [06_migration_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_migration_plan.md)
- [06_seed_fixture_strategy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_seed_fixture_strategy.md)
- [06_data_design_traceability.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_design_traceability.md)

## 14. Recommended Next Step
- Admin(User)의 최종 승인 획득 후, Stage 7 MVP Scope & Release Slicing 단계로의 전이를 수행합니다.