# 07 Scope Traceability Matrix

| Goal ID | Requirement ID | Acceptance Criteria ID | Domain Concept | Architecture / Module | Data Artifact | Scope Category | Release Slice | Validation Handoff |
|---|---|---|---|---|---|---|---|---|
| **G-001** | FR-001 (Import Dataset) | AC-FR-001-01, AC-FR-001-02 | DC-001 (Conversation) | MOD-001 (Dataset Management) | `/conversations` doc | Must-Have (`SCOPE-001`) | **R1 (MVP)** | `VAL-002` (Import parser verification) |
| **G-001** | FR-002 (Delete Dataset) | AC-FR-002-01 | DC-001 (Conversation) | MOD-001 (Dataset Management) | `/conversations` clean | Must-Have (`SCOPE-002`) | **R1 (MVP)** | `VAL-002` (Deletion interlock verify) |
| **G-002** | FR-003 (View Chat) | AC-FR-003-01 | DC-001, DC-002 (Turn) | MOD-002 (Workspace Viewer) | embedded turns array | Must-Have (`SCOPE-003`) | **R1 (MVP)** | `VAL-001` (Blind-spot Rules get block) |
| **G-002** | FR-004 (Record Label) | AC-FR-004-01, AC-FR-004-02 | DC-003 (Label) | MOD-003 (Labeling Service) | `/conversations/{id}/labels` | Must-Have (`SCOPE-004`) | **R1 (MVP)** | `VAL-001` (Evaluator Write Isolation) |
| **G-003** | FR-005 (Import LLM) | AC-FR-005-01 | DC-004 (LLM Decision) | MOD-001 (Dataset Management) | `/conversations/{id}/llm_results` | Must-Have (`SCOPE-005`) | **R1 (MVP)** | `VAL-002` (LLM map parser test) |
| **G-003** | FR-006 (Import Stats) | AC-FR-006-01 | DC-007 (Gold Standard) | MOD-001 (Dataset Management) | `/dashboard/statistics` | Must-Have (`SCOPE-006`) | **R1 (MVP)** | `VAL-002` (Stats field schema compliance) |
| **G-004** | FR-007 (Dashboard) | AC-FR-007-01 | DC-007, DC-008 | MOD-004 (Dashboard UI) | `/conversations` status & stats | Must-Have (`SCOPE-007`) | **R1 (MVP)** | `VAL-002` (Progress bar aggregate query) |
| **G-002** | Q-101 (Disagreement Filter) | N/A | DC-008 (Adjudication) | MOD-002 (Workspace Viewer) | status query indexing | Could-Have (`SCOPE-CLD-001`) | **R2 (Post-MVP)** | 수동 목록 스크롤 조작 |
| **G-004** | Q-105 (Evaluator Detail stats) | N/A | DC-006 (Dashboard) | MOD-004 (Dashboard UI) | `/users` 진척도 필드 | Later (`SCOPE-LTR-001`) | **R2 (Post-MVP)** | 사용자 개별 완료 건수 시각화 |

## Traceability Gaps
| Gap ID | Missing Link | Why Missing | Risk | Required Action |
|---|---|---|---|---|
| **GAP-001** | Q-101 및 Q-105의 인수 테스트 코드 매핑 | MVP 스코프에서 R2(Post-MVP)로 이월되어 세부 설계와 인수 시나리오가 미정 상태임 | R2 개발 단계에서 세부 요건 검증이 누락될 리스크 | R2 이행 시점에 03_acceptance_criteria.md에 관련 검증 시나리오를 공식 보완함 |
