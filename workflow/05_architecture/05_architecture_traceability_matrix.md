# 05 Architecture Traceability Matrix

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-001 ~ FR-007, SEC-001 ~ SEC-004, NFR-001 ~ NFR-003, OPS-001)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md) (DC-001 ~ DC-008, ENT-001 ~ ENT-004)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md) (BR-001 ~ BR-010, INV-001 ~ INV-005)
- [05_module_boundaries.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_module_boundaries.md) (MOD-001 ~ MOD-005)
- [05_api_contracts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_api_contracts.md) (API-001 ~ API-006)
- [05_integration_contracts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_integration_contracts.md) (INT-001, INT-002)
- [05_event_contracts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_event_contracts.md) (EVT-001 ~ EVT-005)

---

## 3. Traceability Summary
This matrix validates that every approved functional, security, and operational requirement maps cleanly to a defined architecture component, interface contract, and deployment configuration policy. It also traces domain aggregates and invariants to their respective enforcement rules.

---

## 4. Requirement to Architecture Mapping

| Requirement ID | Acceptance Criteria | Domain Concept | Architecture Component | Contract | Auth/Security/Operational Policy | Data Design Implication | Test Implication |
|---|---|---|---|---|---|---|---|
| FR-001 (Ingest) | AC-FR-001-01 | Conversation | MOD-001 (Mgmt) | API-005 (Import) | Admin privilege check | Batch write query optimization | Mock parse loops |
| FR-002 (Delete) | AC-FR-002-01 | Conversation | MOD-001 (Mgmt) | API-006 (Purge) | SEC-004 (2-step check) | Cascade delete queries | Verify input interlock |
| FR-003 (List) | AC-FR-003-01 | Conversation | MOD-002 (Eval) | API-001, API-002 | SEC-001 (Auth Guard) | Query index on status | List filters correctness |
| FR-004 (Label) | AC-FR-004-01 | Label | MOD-002 (Eval) | API-003 (Write) | SEC-002 (Isolation) | `/labels` subcollection write | Verify INV-002 blocks invalid Present/Absent shapes |
| FR-005 (LLM Ingest) | AC-FR-005-01 | LLM Decision | MOD-001 (Mgmt) | API-005 (Import) | BR-005 (Existing call_id match) | nested map fields in Conversation doc | Parse duplicate mappings |
| FR-007 (Dashboard) | AC-FR-007-01 | Dashboard | MOD-001 (Mgmt) | API-001 (GET) | Auth Guard | Progress collection indexes | UI widget counts check |
| SEC-001 (Auth Guard) | AC-SEC-001 | User, Roles | MOD-005 (Auth) | INT-001 (SDK) | Redirect to `/login` | `/users` profiles | Test security rule blocks on guest session |
| SEC-002 (Isolation) | AC-SEC-002 | Label | MOD-002 (Eval) | API-003 | DSP-002 (Rules isolation) | Write permissions bound to uid | Attempt writes from alien uid |
| SEC-003 (PII Warning) | AC-SEC-003 | Conversation | MOD-001 (Mgmt) | INT-002 (Import) | DSP-001 (Regex warning check) | Warning logging in Audit logs | Test triggers on PII matches |
| SEC-004 (Interlock) | AC-SEC-004 | Conversation | MOD-001 (Mgmt) | API-006 | DSP-003 (UI validation string) | Admin audit log write | Verify input validation |
| NFR-001 (Integrity) | AC-NFR-001 | Invariants | MOD-001 ~ MOD-003 | EVT-001 ~ EVT-005 | Batch/Transaction rollback | Unified repository methods | Verify single-write fails roll back transaction |
| NFR-003 (Error resilience) | AC-NFR-003 | Error Boundary | MOD-001, MOD-005 | SDK calls | React error boundaries | Local state recovery logs | Mock SDK error responses |
| OPS-001 (Auditing) | AC-OPS-001 | Audit Log | MOD-004 (Audit) | API-004, API-005 | Write-once collection permissions | `/audit_logs` collections | Attempt audit edits/deletions |

---

## 5. Domain to Architecture Mapping

| Domain Concept / Invariant / Event | Architecture Component | Contract / Policy | Notes |
|---|---|---|---|
| `INV-001` (One label per user/round) | MOD-002 (Evaluation Module) | API-003 (Upsert query path) | Unique route `/labels/{uid_round_no}` prevents duplicate record creation |
| `INV-002` (Conditional Category rules) | MOD-002 (Evaluation Module) | API-003 (Form validators) | Duplicated in client forms and firestore validation rules |
| `INV-003` (Audit Log Append-only) | MOD-004 (Audit Module) | Firestore Security Rules | Security rules enforce `allow create: if true; allow update, delete: if false;` |
| `INV-004` (3-label Consensus triggers) | MOD-002 (Evaluation Module) | EVT-003 (Save Label Event loop) | Client-side service evaluates counts and dispatches status transitions |
| `INV-005` (Adjudicator lock-in) | MOD-003 (Adjudication Module) | API-004, Firestore rules | Write to `gold_standard` blocks future edits to `/labels/*` on that `call_id` |

---

## 6. Architecture Decision Mapping

| ADR ID | Related Requirements | Related Domain Concepts | Related Artifacts | Stage 6 Implication |
|---|---|---|---|---|
| ADR-001 | NFR-001, SEC-001 | Serverless, React | 05_architecture_plan.md | Direct client access to Firestore data |
| ADR-002 | FR-005, INT-001 | LLM Ingestion | 05_integration_contracts.md | Nested mapping document layout |
| ADR-003 | User Request, BR-007 ~ BR-010 | Adjudication | 05_event_contracts.md | Status and round flags inside conversation documents |
| ADR-004 | OPS-001, BR-004, INV-003 | Auditing | 05_event_contracts.md | Flat `/audit_logs` collections |
| ADR-005 | SEC-001, SEC-002, BR-002 | Access Control | 05_authn_authz_model.md | Role validation lookup requirements |

---

## 7. Traceability Gaps
- None. Every requirement is mapped, and all invariants are explicitly mapped to corresponding database constraints or code rules.

---

## 8. Human Approval Required
- Approval of the mapping links validating compliance checks across specifications.
