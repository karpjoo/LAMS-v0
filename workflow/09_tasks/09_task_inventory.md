# 09 Task Inventory

## 1. Scope Basis
This task inventory covers **Release R0 (Foundation / Setup)** and **Release R1 (MVP Release)** as defined in [07_release_slices.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_release_slices.md). It is designed to implement the complete 3-stage consensus labeling loop with all security, validation, and visual requirements.

## 2. Task ID Convention
Tasks are identified using a hierarchical stable structure:
- **`TSK-R0-XXX`**: Core foundation, scaffolding, routing, and setup tasks (Release R0).
- **`TSK-R1-XXX`**: Core functional MVP and security loop tasks (Release R1).

## 3. Task Summary Table

| Task ID | Task Title | Description Summary | Size (Est. Days) | Linked Requirement ID(s) | Release Slice |
|---|---|---|---|---|---|
| **TSK-R0-001** | React & Firebase Setup | Initialize project directory, configure package.json dependencies, and verify basic build chain. | 1.0 | SEC-001 | R0 |
| **TSK-R0-002** | CSS Token Scaffolding | Define Vanilla CSS HSL colors, Outfit/Inter fonts loading, glassmorphism variables, and responsive layout grid. | 1.0 | NFR-002 | R0 |
| **TSK-R0-003** | Routing & AuthGuard | Configure React Router, build page scaffold with layout header, and implement user auth routing guard. | 1.5 | SEC-001 | R0 |
| **TSK-R0-004** | Login Interface View | Create login interface page and connect to Firebase Authentication client SDK login. | 1.0 | SEC-001 | R0 |
| **TSK-R1-001** | Firebase Emulator Setup | Configure local Firestore and Auth Emulator suite, and write startup configuration scripts. | 1.0 | SEC-001, SEC-002 | R1 |
| **TSK-R1-002** | Security Rules & Tests | Draft firestore.rules and implement rules unit tests using Vitest + `@firebase/rules-unit-testing`. | 2.0 | SEC-001, SEC-002, OPS-001 | R1 |
| **TSK-R1-003** | JSON Dataset Ingest Parser | Implement JSON file selection, parser module, schema validation, and PII warning regex scanner. | 1.5 | FR-001, SEC-003 | R1 |
| **TSK-R1-004** | Admin Dataset Panel | Build dataset management UI for upload triggers and delete database command with confirmation text interlock. | 1.5 | FR-001, FR-002, SEC-004 | R1 |
| **TSK-R1-005** | Append-only Action Auditor | Write client-side helper to record actions (upload, delete, label save) to `/audit_logs` collection. | 1.0 | OPS-001 | R1 |
| **TSK-R1-006** | Workspace Sidebar List | Build Workspace list of uploaded calls with search box and progress/status tags. | 1.0 | FR-003 | R1 |
| **TSK-R1-007** | turn bubble viewer | Render chronological client-agent conversation turn cards inside workspace bubble layout. | 1.0 | FR-003 | R1 |
| **TSK-R1-008** | Toxicity Evaluation Form | Build toxicity evaluation inputs (toxicity binary check, category radios, risk levels, evidence text inputs). | 1.5 | FR-004 | R1 |
| **TSK-R1-009** | Form Prefill & Submission | Integrate Firestore label data read/write bindings, form prefilling for completed calls, and submission triggers. | 1.5 | FR-004, NFR-001 | R1 |
| **TSK-R1-010** | Admin LLM Import Script | Create comparative LLM results upload panel, parser, call_id validation, and collection write execution. | 1.5 | FR-005 | R1 |
| **TSK-R1-011** | Admin Stats Import Panel | Create stats upload panel, statistics parser, and write to `/dashboard/statistics` collection. | 1.0 | FR-006 | R1 |
| **TSK-R1-012** | Consensus Transition Solver | Implement evaluation submission hook that detects 3 completions, checks agreement, and writes `/gold_standards`. | 2.0 | FR-004, NFR-001 | R1 |
| **TSK-R1-013** | Dashboard Analytics View | Create dashboard view with progress bar gauge (user progress %) and Fleiss' Kappa statistics tables/charts. | 1.5 | FR-007, NFR-002 | R1 |

## 4. Task Type Classification
Tasks are classified by their primary characteristics to determine review and validation focus:
- **Enabling Tasks**: TSK-R0-001, TSK-R0-002, TSK-R1-001 (Setup/Infrastructure).
- **Core Functional Tasks**: TSK-R0-003, TSK-R0-004, TSK-R1-003, TSK-R1-004, TSK-R1-006, TSK-R1-007, TSK-R1-008, TSK-R1-009, TSK-R1-010, TSK-R1-011, TSK-R1-013.
- **Security / Compliance Tasks**: TSK-R1-002, TSK-R1-005.
- **Domain Logic Tasks**: TSK-R1-012 (Consensus Solver).

## 5. Requirement Coverage Summary
All functional, non-functional, security, and operational requirements from [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) are mapped:
- **FR-001**: Covered by TSK-R1-003 (Parsing) and TSK-R1-004 (Upload panel UI).
- **FR-002**: Covered by TSK-R1-004 (Deletion action and interlock).
- **FR-003**: Covered by TSK-R1-006 (Call list) and TSK-R1-007 (Turns bubbles).
- **FR-004**: Covered by TSK-R1-008 (Form inputs), TSK-R1-009 (Prefill & load), and TSK-R1-012 (Consensus solver).
- **FR-005**: Covered by TSK-R1-010 (LLM results ingestion).
- **FR-006**: Covered by TSK-R1-011 (Stats ingestion).
- **FR-007**: Covered by TSK-R1-013 (Dashboard layout and charts).
- **NFR-001**: Covered by TSK-R1-009 & TSK-R1-012 (Batch transactions).
- **NFR-002**: Covered by TSK-R0-002 (CSS scaffolding) and TSK-R1-013 (Responsive UI).
- **NFR-003**: Covered by TSK-R0-003 (Error Boundary).
- **SEC-001**: Covered by TSK-R0-003 (AuthGuard) and TSK-R0-004 (Login page).
- **SEC-002**: Covered by TSK-R1-002 (Firestore Rules write isolation).
- **SEC-003**: Covered by TSK-R1-003 (PII Warning scanning).
- **SEC-004**: Covered by TSK-R1-004 (Delete text validation confirm).
- **OPS-001**: Covered by TSK-R1-005 (Audit logs implementation).
- **INT-001**: Covered by TSK-R1-003, TSK-R1-010, TSK-R1-011 (JSON parsers).

## 6. Release Slice Coverage Summary
- **Release R0**: TSK-R0-001 ~ TSK-R0-004.
- **Release R1**: TSK-R1-001 ~ TSK-R1-013.

## 7. Blocked or Deferred Tasks
- **Deferred Tasks (R2)**:
  - Evaluation disagreement filtering component (Q-101).
  - Individual evaluator progress details stats table (Q-105).
  - *No current R1 tasks are blocked as design schemas will be defined with mock data in TSK-R1-003, TSK-R1-010, and TSK-R1-011.*

## 8. Out-of-Scope Items Not Converted to Tasks
The following items are explicitly excluded from implementation tasks:
- Real-time LLM inference API bindings.
- Client-side Fleiss' Kappa mathematics processor.
- Audio file media streaming player.
- Live regex masking editor.

## 9. Conditional Task Groups
Specific task domains are categorized into sub-files to clarify their requirements and validation mechanisms:
- **Database/Ingestion**: Mapped to [09_migration_tasks.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_migration_tasks.md).
- **Access Control & Auditing**: Mapped to [09_security_privacy_tasks.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_security_privacy_tasks.md).
- **LLM/Stats Integration**: Mapped to [09_integration_tasks.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_integration_tasks.md).
- **Spikes & Prototype research**: Mapped to [09_risk_reduction_spikes.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_risk_reduction_spikes.md).
- **Coordination**: [09_frontend_backend_coordination.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_frontend_backend_coordination.md) is marked **N/A** (Pure client-side serverless app).

## 10. Notes for 09c Dependency Ordering
- Foundation tasks (`TSK-R0-XXX`) must compile first.
- Emulator setup (`TSK-R1-001`) and Security Rules configuration (`TSK-R1-002`) are technical enablers for database writes.
- Dataset parsing (`TSK-R1-003`) must proceed before Workspace pages can query and display list items.
- Solvers and Dashboard charts depend on basic evaluation forms being operational.
