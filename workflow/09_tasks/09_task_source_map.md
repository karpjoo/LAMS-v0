# 09 Task Source Map

## 1. Source Inputs Used
The following approved artifacts were read and utilized as the basis for mapping tasks:
- [/workflow/context/context_packet.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/context_packet.md)
- [/workflow/context/ASSUMPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/ASSUMPTIONS.md)
- [/workflow/context/OPEN_QUESTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/OPEN_QUESTIONS.md)
- [/workflow/context/REJECTED_OPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/REJECTED_OPTIONS.md)
- [/workflow/context/TRACEABILITY_MATRIX.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/TRACEABILITY_MATRIX.md)
- [/workflow/03_requirements/03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
- [/workflow/03_requirements/03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- [/workflow/07_mvp_release/07_mvp_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_mvp_scope.md)
- [/workflow/07_mvp_release/07_release_slices.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_release_slices.md)
- [/workflow/07_mvp_release/07_out_of_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_out_of_scope.md)
- [/workflow/08_test_strategy/08_test_strategy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_test_strategy.md)
- [/workflow/08_test_strategy/08_acceptance_tests.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md)
- [/workflow/08_test_strategy/08_validation_commands.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_validation_commands.md)

## 2. Active Scope Basis
The active scope for this task breakdown covers:
- **Release R0 (Foundation / Setup)**: Project initialization, React + Firebase SDK bindings, Auth routing guard, Vanilla CSS layout scaffolding with premium visual elements.
- **Release R1 (MVP Release)**: The core 3-stage expert consensus toxicity evaluation loop, dataset import and deletion interlock, LLM & stats upload, progress dashboard, append-only audit logging, and Firestore blind-spot security rules.
- **Excluded / Deferred Items**: Real-time LLM inference, real-time Kappa calculations, automatic UI masking, and audio player UI are completely out of scope. Evaluator-level stats tables (Q-105) and disagreement filters (Q-101) are deferred to **Release R2**.

## 3. Requirement Source Map
Each requirement from [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) is mapped to one or more candidate task concepts:
- **FR-001** (Dataset Ingest): Candidate tasks for local JSON file parsing, client-side validation, and batched write execution.
- **FR-002** (Dataset Deletion): Candidate tasks for dataset deletion trigger and UI confirm dialog logic.
- **FR-003** (Conversation View): Candidate tasks for listing conversations and rendering turns as bubbles in chronological order.
- **FR-004** (Evaluator Labeling): Candidate tasks for evaluation form inputs, document write bindings, and existing record prefilling.
- **FR-005** (LLM Results Ingest): Candidate tasks for LLM prediction JSON upload, schema validation, and mapping to target calls.
- **FR-006** (Stats Ingest): Candidate tasks for statistics JSON upload and dashboard stats update.
- **FR-007** (Dashboard Render): Candidate tasks for progress calculation and stats tables/charts rendering.
- **SEC-001** (Auth Session): Candidate tasks for routing guard and login form integration.
- **SEC-002** (Rules Write Isolation): Firestore Security Rule logic configuration tasks.
- **SEC-003** (PII Warning Scanner): Candidate tasks for regex scanners on file selection and rendering modal dialog alert.
- **SEC-004** (Deletion Confirm Interlock): Candidate tasks for disabling button unless target string matches "DELETE ALL DATASET".
- **OPS-001** (Audit Logs): Candidate tasks for writing to `/audit_logs` for sensitive actions.
- **NFR-001** (Data Integrity): Candidate tasks for client-side batch write transaction boundaries.
- **NFR-002** (Premium Aesthetics): CSS themes, fonts loading, responsive layout styling.
- **NFR-003** (Error Recovery): React Error Boundary wrapper integration.

## 4. Architecture / Module Source Map
Based on [05_module_boundaries.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_module_boundaries.md), tasks will correspond to specific code directories or modules:
- **Authentication Guard**: `/src/components/AuthGuard.jsx`, `/src/views/Login.jsx`
- **Dashboard**: `/src/views/Dashboard.jsx` (Progress charts, Kappa tables)
- **Dataset Manager**: `/src/views/AdminDataset.jsx` (Import buttons, PII scan modal, Deletion text field)
- **Labeling Workspace**: `/src/views/Workspace.jsx`, `/src/components/ConversationList.jsx`, `/src/components/TurnBubble.jsx`, `/src/components/EvaluationForm.jsx`
- **Consensus Engine (State Transition)**: Client-side consensus solver script that determines transitions during batch writes.
- **Security Rules**: `/firestore.rules` (deployed via Firebase CLI)

## 5. Domain / Business Rule Source Map
Domain invariants and rules from Stage 4 map directly to tasks to ensure business logic correctness:
- **BR-003 (Deletion Interlock)** & **BR-004 (Audit Logs)**: Audit record insertion must occur in the same transaction batch as dataset deletion or label writes.
- **BR-006 (Dataset Merge Idempotency)**: Re-uploading datasets must preserve existing labels. Requires pre-upload checking and updating instead of collection deletion.
- **BR-007 (Consensus Transitions)**:
    - 3 independent evaluations completed -> If all match toxicity status and category, transition to `Consensus Reached` and write to `/gold_standards`.
    - If mismatch exists, transition to `Round 2 Active` (or `Round 3 Active` if Round 2 is skipped).
    - Blind-spot isolation rule: Prevent reading `labels` of other users while `status` is `Round 1 Active`.

## 6. Data / Migration Source Map
Database collections mapped from [06_physical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_physical_schema.md):
- `/users/{userId}`: User registration metadata (includes `role`, `is_adjudicator`).
- `/conversations/{call_id}`: Central conversation metadata (status, sequence, labels count, metrics).
- `/conversations/{call_id}/labels/{userId}`: Individual user's evaluations.
- `/conversations/{call_id}/llm_results/{modelId}`: LLM prediction imports.
- `/gold_standards/{call_id}`: Finalized consensus label records.
- `/audit_logs/{logId}`: Audit trail.
- `/dashboard/statistics`: Comparative Fleiss' Kappa statistics.

## 7. Validation Source Map
Mappings to validation strategies from Stage 8:
- **Rules Unit Tests** (`Vitest` + `@firebase/rules-unit-testing`): Core tasks for setting up local rules testing framework and writing test cases for Auth rules, write isolation, Round 1 blind-spot lock, and audit logging append-only.
- **Application Unit Tests** (`Vitest`): Unit testing for parser validations, domestic phone number PII regex matching, and adjudication status solvers.
- **UI E2E Tests** (`Playwright`): Automated test suite for user flows (Login redirection, Admin file uploads with PII warning, workspace form submissions, deletion interlock, progress bar updating).
- **Manual Verification**: Tasks for manual inspection of Glassmorphism styles and layout responsiveness across multiple viewports.

## 8. Candidate Task Areas
We define 7 logical task groups to structure the full task cards inventory:
1. **FOUNDATION (R0)**: Init React workspace, Firebase direct SDK config, routing, AuthGuard, login page, CSS scaffolding.
2. **SECURITY & INFRA (R1)**: Setup Firestore Emulator local test runner, draft security rules, write rules unit tests (AT-005, AT-010, AT-012, AT-013, AT-014).
3. **DATASET INGESTION & DELETION (R1)**: Admin dataset workspace interface, JSON parser module (unit tested), PII warning modal (AT-011), delete interlock text field (AT-003), audit logging logic (AT-014).
4. **EVALUATION WORKSPACE (R1)**: Conversation list, chronological turns bubble viewer (AT-004), toxicity labeling evaluation form (AT-005), form prefill data loading (AT-006).
5. **LLM & STATS UPLOAD (R1)**: Admin comparative results upload panel, parser and mapping script for LLM results (AT-007) and pre-calculated stats (AT-008).
6. **ADJUDICATION CORE (R1)**: Client-side state transition solver script, unit tests for consensus detection, automatic writing to `/gold_standards` on agreement (AT-015).
7. **DASHBOARD & PRESENTATION (R1)**: Dashboard view, personal progress calculator (active users complete count vs total), Vanilla CSS stats tables/graphs rendering (AT-009).

## 9. Coverage Gaps
- **VG-001 (Import Schema Details)**: The lack of exact JSON schemas for LLM and stats uploads remains a validation gap. 
  - *Mitigation Task*: We must define a specific task in the breakdown to design and validate schema specifications using mock JSON fixtures before implementing the client-side parser.

## 10. Blocking Questions
No blocking questions are outstanding.
- **Q-105 (Detailed Evaluator Stats)**: Confirmed deferred to R2.
- **Q-101 (Disagreement Filter)**: Confirmed deferred to R2.

## 11. Handoff Notes for 09b
- Task IDs should follow the format `TSK-R0-XXX` for Foundation release and `TSK-R1-XXX` for MVP release.
- Tasks must represent small, atomic pieces of work, each taking less than 2-3 developer days.
- Each task card must explicitly name its verification command or manual plan (using CMD-XXX or MAN-XXX codes from Stage 8).
