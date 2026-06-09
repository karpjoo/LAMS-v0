# Traceability Matrix

This 행렬은 프로젝트 초기 요구사항 및 소스 입력(User-provided source)에서부터 유스케이스, 기능, 테스트로의 추적성을 매핑하는 데 사용됩니다.

## 1. Project Traceability Records

| Trace ID | Source | Intake Finding | Classification | Affected Future Stage | Status |
|---|---|---|---|---|---|
| TR-001 | USER_DIRECTIVES.md | Greenfield React + Firebase serverless stack | Technology Constraint | Stage 5 Architecture / Stage 6 Data Design | Proposed |
| TR-002 | USER_DIRECTIVES.md | MVP scope should be kept small and lightweight | Project Preference | Stage 1 Goal / Stage 9 Tasks | Proposed |
| TR-003 | docs/research/260528-revised-research-overview.md | 7-category linguistic risk cues taxonomy | Domain / Requirements | Stage 1 Goal / Stage 4 Domain Modeling | Proposed |
| TR-004 | docs/research/260528-revised-research-overview.md | 3 prompt types vs 3 LLM models evaluation comparison | AI/Data Evaluation | Stage 1 Goal / Stage 3 Requirements / Stage 7 MVP Release | Proposed |
| TR-005 | docs/research/260528-revised-research-overview.md | Real data (390 items) & Synthetic data (980 items) | Data Requirements | Stage 6 Data Design | Proposed |
| TR-006 | docs/research/260528-revised-research-overview.md | 3 expert linguists consensus labels as gold standard | Process / Security | Stage 1 Goal / Stage 4 Domain / Stage 6 Data Design | Proposed |
| TR-007 | Stage 4 Domain | 3 Bounded Contexts (Project Mgmt, Toxicity Eval, Audit) | Domain Boundary | Stage 5 Architecture / Stage 11 Implementation | Draft |
| TR-008 | Stage 4 Domain | 3 Aggregates (Conversation, Label, Audit Log) | Consistency Boundary | Stage 6 Data Design / Stage 11 Implementation | Draft |
| TR-009 | Stage 4 Domain | Write Isolation & Append-only Audit Invariants | Security Invariant | Stage 5 Architecture (Rules) / Stage 8 Test | Draft |
| TR-010 | Stage 7 MVP Scope | Must-Have Scope (SCOPE-001 ~ SCOPE-014) | Scope Boundary | Stage 8 Test / Stage 11 Implementation | Draft |
| TR-011 | Stage 7 Release Slices | R0 (Scaffolding), R1 (MVP Core), R2 (Post-MVP) | Release Slicing | Stage 8 Test / Stage 11 Implementation | Draft |
| TR-012 | Stage 7 Deferrals | Defer Q-105 progress metrics and Q-101 filter to R2 | Scope Deferral | Stage 11 Implementation / Stage 12 Release | Draft |

---

## 2. Stage 8 Validation Traceability Mapping

| Goal ID | Requirement ID | Acceptance Criteria ID | Acceptance Test ID | Validation Method | Command / Manual ID | Fixture ID | Status | Task ID |
|---|---|---|---|---|---|---|---|---|
| **G-001** | FR-001 | AC-FR-001-01 | AT-001 | E2E (UI Import) | CMD-003 | FX-001 | Draft | TSK-R1-004 |
| **G-001** | FR-001 | AC-FR-001-02 | AT-002 | Unit (Parser error) | CMD-001 | FX-002 | Draft | TSK-R1-003 |
| **G-001** | FR-002 | AC-FR-002-01 | AT-003 | E2E & Manual | CMD-003 / MAN-002 | N/A | Draft | TSK-R1-004 |
| **G-002** | FR-003 | AC-FR-003-01 | AT-004 | E2E (Chat bubble list) | CMD-003 | FX-001 | Draft | TSK-R1-007 |
| **G-002** | FR-004 | AC-FR-004-01 | AT-005 | E2E & Rules check | CMD-003 / CMD-002 | FX-001 | Draft | TSK-R1-009 |
| **G-002** | FR-004 | AC-FR-004-02 | AT-006 | E2E (Form Prefill) | CMD-003 | FX-001 | Draft | TSK-R1-009 |
| **G-003** | FR-005 | AC-FR-005-01 | AT-007 | Integration (LLM map) | CMD-003 / CMD-002 | FX-004 | Draft | TSK-R1-010 |
| **G-003** | FR-006 | AC-FR-006-01 | AT-008 | Integration (Stats upload) | CMD-003 / CMD-002 | FX-005 | Draft | TSK-R1-011 |
| **G-004** | FR-007 | AC-FR-007-01 | AT-009 | E2E & Manual (Dashboard) | CMD-003 / MAN-003 | N/A | Draft | TSK-R1-013 |
| **N/A** | SEC-001 | AC-SEC-001 | AT-010 | E2E & Rules check | CMD-003 / CMD-002 | N/A | Draft | TSK-R0-003 |
| **G-001** | SEC-003 | AC-SEC-003 | AT-011 | E2E (PII regex warning) | CMD-003 / MAN-004 | FX-003 | Draft | TSK-R1-003 |
| **N/A** | SEC-002 | AC-FR-004-01 | AT-012 | Integration (Rules isol) | CMD-002 | N/A | Draft | TSK-R1-002 |
| **N/A** | User Request | N/A | AT-013 | Integration (Blind spot) | CMD-002 | N/A | Draft | TSK-R1-002 |
| **G-001** | OPS-001 | AC-FR-002-01 | AT-014 | Integration (Audit immutable)| CMD-002 | N/A | Draft | TSK-R1-005 |
| **G-002** | User Request | N/A | AT-015 | Integration (Adjudication) | CMD-002 | N/A | Draft | TSK-R1-012 |

## 3. Validation Traceability Gaps

| Gap ID | Affected Requirement | Affected Acceptance Criteria | Description / Needed Action |
|---|---|---|---|
| **VG-001** | FR-001, FR-005, FR-006 | AC-FR-001-02, AC-FR-005-01, AC-FR-006-01 | 외부 JSON 스키마 필드 유형 미지정. 08c에서 Mock Schema를 주입하여 1차 보완하였으나, 실제 연동 데이터 유입 시 파싱 오류 방지를 위한 정밀 스키마 확정 필요. |