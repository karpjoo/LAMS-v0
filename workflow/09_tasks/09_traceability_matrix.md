# 09 Traceability Matrix

## 1. Traceability Basis
This document registers the mappings of requirements from [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md), scope definitions from [07_mvp_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_mvp_scope.md), and validation specs from [08_acceptance_tests.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md) to active implementation tasks.

## 2. Requirement-to-Task Matrix

| Requirement ID | Acceptance Criteria ID | Release Slice | Mapped Task ID(s) | Notes |
|---|---|---|---|---|
| **FR-001** | AC-FR-001-01, AC-FR-001-02 | R1 | TSK-R1-003, TSK-R1-004 | Parser logic separated from UI drop handler. |
| **FR-002** | AC-FR-002-01 | R1 | TSK-R1-004 | Implemented inside admin dataset panel view. |
| **FR-003** | AC-FR-003-01 | R1 | TSK-R1-006, TSK-R1-007 | Sidebar call selection and bubbles timeline. |
| **FR-004** | AC-FR-004-01, AC-FR-004-02 | R1 | TSK-R1-008, TSK-R1-009, TSK-R1-012 | Evaluation form components, submission prefill, and state solver. |
| **FR-005** | AC-FR-005-01 | R1 | TSK-R1-010 | Import scripts for predictions mapping. |
| **FR-006** | AC-FR-006-01 | R1 | TSK-R1-011 | Ingest script for Kappa/F1 metrics. |
| **FR-007** | AC-FR-007-01 | R1 | TSK-R1-013 | Dashboard rendering gauge and charts. |
| **SEC-001** | AC-SEC-001 | R0 | TSK-R0-003, TSK-R0-004 | Session validation routing guards. |
| **SEC-002** | AC-FR-004-01 | R1 | TSK-R1-002 | Firestore client rules for document write checks. |
| **SEC-003** | AC-SEC-003 | R1 | TSK-R1-003 | PII warning regex scanners. |
| **SEC-004** | AC-FR-002-01 | R1 | TSK-R1-004 | Deletion confirmation modal string interlock. |
| **OPS-001** | AC-FR-002-01, AC-FR-004-01 | R1 | TSK-R1-005 | Atomic batched logs to /audit_logs. |
| **NFR-001** | - | R1 | TSK-R1-009, TSK-R1-012 | Enforced transaction write boundaries. |
| **NFR-002** | NFR-002 (Visual standard) | R0 | TSK-R0-002, TSK-R1-013 | CSS stylesheet, layout structure variables. |
| **NFR-003** | - | R0 | TSK-R0-003 | React Error Boundary around page paths. |
| **User Request** | (Round 1 Blind-spot) | R1 | TSK-R1-002 | Lock query reads to other users' labels in rules. |
| **User Request** | (3-stage consensus) | R1 | TSK-R1-012 | State solver that writes gold standards. |

## 3. Task-to-Validation Matrix

| Task ID | Task Title | Mapped Test ID(s) | Validation Method | Verification Command / Manual ID |
|---|---|---|---|---|
| **TSK-R0-001** | React & Firebase Setup | N/A | Build compile check | `npm run build` |
| **TSK-R0-002** | CSS Token Scaffolding | N/A | Manual UI inspection | [MAN-001](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_manual_test_plan.md#MAN-001) |
| **TSK-R0-003** | Routing & AuthGuard | AT-010 | E2E Routing guard checks | `npm run test:e2e` |
| **TSK-R0-004** | Login Interface View | AT-010 | E2E authentication flow | `npm run test:e2e` |
| **TSK-R1-001** | Firebase Emulator Setup | N/A | Active port validations | `npm run emulators` |
| **TSK-R1-002** | Security Rules & Tests | AT-005, AT-012, AT-013, AT-014, AT-015 | Rules unit assertions | `npm run test:rules` |
| **TSK-R1-003** | JSON Dataset Ingest Parser | AT-002, AT-011 | Ingest parser unit checks | `npm run test:unit` |
| **TSK-R1-004** | Admin Dataset Panel | AT-001, AT-003, AT-011 | Admin action flow testing | `npm run test:e2e` |
| **TSK-R1-005** | Append-only Action Auditor | AT-014 | Rules unit assertions | `npm run test:rules` |
| **TSK-R1-006** | Workspace Sidebar List | N/A | Manual UI check | Search filter verification |
| **TSK-R1-007** | turn bubble viewer | AT-004 | Timeline sort E2E checks | `npm run test:e2e` |
| **TSK-R1-008** | Toxicity Evaluation Form | N/A | Form inputs state check | `npm run test:unit` |
| **TSK-R1-009** | Form Prefill & Submission | AT-005, AT-006 | Prefill E2E write checks | `npm run test:e2e` |
| **TSK-R1-010** | Admin LLM Import Script | AT-007 | Parser mapping checks | `npm run test:unit` |
| **TSK-R1-011** | Admin Stats Import Panel | AT-008 | Schema conformance checks | `npm run test:unit` |
| **TSK-R1-012** | Consensus Transition Solver | AT-015 | Solver logic checks | `npm run test:unit` |
| **TSK-R1-013** | Dashboard Analytics View | AT-009 | Manual layout & stats check | [MAN-003](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_manual_test_plan.md#MAN-003) |

## 4. Enabling Task Justification
The following tasks are enabling tasks that establish baseline configurations:
- **TSK-R0-001 (React Setup)**: Required to initialize compilation tools and test dependencies.
- **TSK-R0-002 (CSS Scaffolding)**: Required to set design tokens and colors. Enforces visual style consistency across subsequent page views.
- **TSK-R1-001 (Firebase Emulator)**: Creates local mock servers for Auth and Firestore to allow local unit testing.

## 5. Coverage Gaps
- **VG-001 (Import Schema Details)**: Mapped to **TSK-R1-003**, **TSK-R1-010**, and **TSK-R1-011**. 
  - *Resolution*: These parser tasks will define temporary schemas using mock JSON fixtures, resolving the gap prior to E2E compilation.

## 6. Oversized or Vague Tasks
- *None identified*: Tasks represent granular activities estimated at 1 to 2 developer days, preventing single-task bottlenecks.

## 7. Security / Privacy Traceability
- Authentication, Firestore document isolation, PII detection, and audit logging parameters are mapped across:
  - TSK-R0-003, TSK-R0-004 (Auth boundary check).
  - TSK-R1-002 (Rules enforcement unit testing).
  - TSK-R1-003 (PII Regex warning triggers).
  - TSK-R1-005 (Append-only auditor class writes).

## 8. Migration / Data Traceability
- Seeding tasks and database layout initializations are mapped to:
  - TSK-R1-001 (Database emulator seeds).
  - TSK-R1-004 (Idempotent merge parsing uploads).

## 9. Integration Traceability
- JSON import operations for external predictive outputs and calculated stats are mapped to:
  - TSK-R1-010 (Comparative predictions uploader).
  - TSK-R1-011 (Dashboard stats updater).

## 10. Stage 10 Readiness Review
The task inventory provides complete bidirectional traceability. Definitions of Done incorporate validation command executions, ensuring task handoffs to Stage 10 prompt writing are fully prepared.

## 11. Handoff Notes for 09e
- Ready for finalizer consolidation.
- The global traceability matrix `/workflow/context/TRACEABILITY_MATRIX.md` needs to be updated with task ID mapping links.
