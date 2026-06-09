# 03 Requirements Traceability Matrix

## 1. Document Status
- **Status**: Draft
- **Source artifacts used**:
  - [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
  - [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md)
  - [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md)
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- **Approval state**: Pending Human Approval
- **Supersedes**: None

## 2. Traceability Matrix

| Source Type | Source ID / Artifact | Requirement ID | Acceptance Criteria ID | Validation Method | Status | Notes |
|---|---|---|---|---|---|---|
| Service Goal | G-001 | FR-001 | AC-FR-001-01, AC-FR-001-02 | Integration, Unit | Draft | 대화 데이터셋 Import 관련 요구사항 매핑 |
| Service Goal | G-001 | FR-002 | AC-FR-002-01 | E2E | Draft | 대화 데이터셋 전체 삭제 요구사항 매핑 |
| Service Goal | G-002 | FR-003 | AC-FR-003-01 | E2E | Draft | 대화 목록 및 상세 조회 요구사항 매핑 |
| Service Goal | G-002 | FR-004 | AC-FR-004-01, AC-FR-004-02 | Integration, E2E | Draft | 평가자 라벨링 피드백 저장 요구사항 매핑 |
| Service Goal | G-003 | FR-005 | AC-FR-005-01 | Integration | Draft | 외부 LLM 결과 업로드 매핑 |
| Service Goal | G-003 | FR-006 | AC-FR-006-01 | Integration | Draft | 외부 통계 지표 업로드 매핑 |
| Service Goal | G-004 | FR-007 | AC-FR-007-01 | Manual / Review | Draft | Dashboard 표시 요구사항 매핑 |
| Risk / Privacy | RISK-001 | SEC-001 | AC-SEC-001 | E2E | Draft | 미인증 사용자 REST API 및 URL 차단 매핑 |
| Risk / Privacy | RISK-002 | SEC-002 | AC-FR-004-01 | Integration | Draft | 평가자 Uid별 쓰기 격리 규칙 매핑 |
| Risk / Privacy | RISK-003 | NFR-003 | AC-FR-001-02 | Unit | Draft | 업로드 JSON 데이터 파싱 장애 방어 NFR 매핑 |
| Risk / Privacy | RISK-004 | SEC-003 | AC-SEC-003 | E2E | Draft | 사전 비식별화 미비 대비 PII 감지 경고 매핑 |
| Admin Power | AUD-001, AUD-002 | OPS-001 | - | Review | Draft | 중요 관리 행위 및 라벨 이력 로깅 매핑 |

## 3. IDs Introduced in This Stage
- **Functional Requirements**: `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-005`, `FR-006`, `FR-007`
- **Non-Functional Requirements**: `NFR-001`, `NFR-002`, `NFR-003`
- **Security Requirements**: `SEC-001`, `SEC-002`, `SEC-003`, `SEC-004`
- **Operational Requirements**: `OPS-001`
- **Integration Requirements**: `INT-001`
- **Acceptance Criteria**: `AC-FR-001-01`, `AC-FR-001-02`, `AC-FR-002-01`, `AC-FR-003-01`, `AC-FR-004-01`, `AC-FR-004-02`, `AC-FR-005-01`, `AC-FR-006-01`, `AC-FR-007-01`, `AC-SEC-001`, `AC-SEC-003`

## 4. Traceability Gaps
- **Q-101(Adjudication 프로세스)** 의 미확정 상태로 인해, 합의 라벨 상세 기능 명세 및 이에 직접 대응되는 Requirements와 Acceptance Criteria는 공백으로 남겨져 있으며 추후 확정 시 해소될 예정입니다.
- **외부 JSON 포맷 스키마 명세 부재**로 인해, 파일 임포트 유효성(AC-FR-001-02 등)의 구체적인 스펙은 Stage 6 데이터 설계 단계 이전까지 공백(Gap) 상태를 유지합니다.

## 5. Do Not Trace Yet
- **미도입 추적 대상**: Stage 4 Domain Entity, Stage 5 Architecture Component, Stage 6 Database Schema, Stage 8 Test Cases, Stage 9 Tasks. 
- 본 추적성 행렬은 Stage 3 요구사항 수준에 국한되며, 승인되지 않은 물리적 코드/DB 요소로의 조기 매핑은 엄격히 배제합니다.