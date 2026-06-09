# 09 Dependency Order

## 1. Ordering Basis
The ordering of tasks is determined by the **Incremental Vertical Slicing** strategy defined in [07_release_slices.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_release_slices.md). Release R0 (Foundation setup) tasks must be fully completed first to configure dependencies, routings, and styles. Within Release R1, technical dependencies (Firebase Emulator and Security Rules) are placed before workspace features to guarantee that data mutations are validated from day one.

## 2. Dependency Summary Table

| Task ID | Task Title | Direct Prerequisites (Task IDs) | Type of Dependency |
|---|---|---|---|
| **TSK-R0-001** | React & Firebase Setup | None | Project Scaffold |
| **TSK-R0-002** | CSS Token Scaffolding | None | Style Resource |
| **TSK-R0-003** | Routing & AuthGuard | TSK-R0-001 | Code scaffolding |
| **TSK-R0-004** | Login Interface View | TSK-R0-003 | Page entry |
| **TSK-R1-001** | Firebase Emulator Setup | TSK-R0-001 | Local server config |
| **TSK-R1-002** | Security Rules & Tests | TSK-R1-001 | Database protection |
| **TSK-R1-003** | JSON Dataset Ingest Parser | None | Pure parsing logic |
| **TSK-R1-004** | Admin Dataset Panel | TSK-R0-003, TSK-R1-003 | Admin UI & action binding |
| **TSK-R1-005** | Append-only Action Auditor | TSK-R1-002 | Logs security dependency |
| **TSK-R1-006** | Workspace Sidebar List | TSK-R0-003, TSK-R1-004 | Requires uploaded data list |
| **TSK-R1-007** | turn bubble viewer | TSK-R1-006 | Workspace listing details |
| **TSK-R1-008** | Toxicity Evaluation Form | TSK-R0-002, TSK-R0-003 | Form controls layout |
| **TSK-R1-009** | Form Prefill & Submission | TSK-R1-002, TSK-R1-007, TSK-R1-008 | Data writes & prefill logic |
| **TSK-R1-010** | Admin LLM Import Script | TSK-R1-004 | Ingest mapping target |
| **TSK-R1-011** | Admin Stats Import Panel | TSK-R1-004 | Ingest mapping target |
| **TSK-R1-012** | Consensus Transition Solver | TSK-R1-009 | Evaluator submits trigger |
| **TSK-R1-013** | Dashboard Analytics View | TSK-R1-009, TSK-R1-011 | Layout and stats source |

## 3. Sequential Task Chain
To implement LAMS-v0 on a single-developer track, execute tasks in this exact topological order:
```text
TSK-R0-001 (React Setup)
→ TSK-R0-002 (CSS Scaffold)
→ TSK-R0-003 (Routing & AuthGuard)
→ TSK-R0-004 (Login Interface)
→ TSK-R1-001 (Firebase Emulator Setup)
→ TSK-R1-002 (Security Rules & Tests)
→ TSK-R1-005 (Append-only Action Auditor)
→ TSK-R1-003 (JSON Dataset Ingest Parser)
→ TSK-R1-004 (Admin Dataset Panel)
→ TSK-R1-006 (Workspace Sidebar List)
→ TSK-R1-007 (turn bubble viewer)
→ TSK-R1-008 (Toxicity Evaluation Form)
→ TSK-R1-009 (Form Prefill & Submission)
→ TSK-R1-012 (Consensus Transition Solver)
→ TSK-R1-010 (Admin LLM Import Script)
→ TSK-R1-011 (Admin Stats Import Panel)
→ TSK-R1-013 (Dashboard Analytics View)
```

## 4. Parallelizable Task Groups
If multiple agents or developers are working, tasks can be distributed across three parallel tracks after `TSK-R0-003` is completed:

- **Track A (Infrastructure & Security Rules)**:
  - TSK-R1-001 (Emulator) → TSK-R1-002 (Rules) → TSK-R1-005 (Auditor).
- **Track B (Workspace Core UI & Form)**:
  - TSK-R1-008 (Toxicity Form) → TSK-R1-006 (Sidebar) → TSK-R1-007 (Turns viewer) → TSK-R1-009 (Form submit & prefill - *requires rules from Track A*).
- **Track C (Ingestion Parsers)**:
  - TSK-R1-003 (JSON Parser) → TSK-R1-004 (Admin Panel UI) → TSK-R1-010 (LLM predictions import) & TSK-R1-011 (Stats import).

## 5. Blocked Tasks
- No tasks are blocked by outstanding external specifications or open questions.
- *Dependency Blocks*: `TSK-R1-013` (Dashboard view) is blocked until `TSK-R1-011` (Dashboard stats import) is complete. `TSK-R1-012` (Consensus Solver) is blocked until `TSK-R1-009` (Form submission) is operational.

## 6. Human Decision Required Before Execution
The Human developer must approve:
- The execution order mapping and topological dependencies.
- The Vitest rules testing approach (`TSK-R1-002`) and Vitest unit testing framework.
- The use of Playwright as the E2E validation test runner framework.

## 7. Risk-Based Ordering Notes
- Security rules setup (`TSK-R1-002`) is scheduled immediately after the emulator is active. Writing rules tests first ensures that any subsequent UI coding cannot accidentally bypass security boundaries (e.g. bypassing role authorization or editing audit logs).

## 8. Validation-First Ordering Notes
- Parser unit tests (`TSK-R1-003`) are implemented before the Admin panel integration (`TSK-R1-004`). This guarantees that ingestion file parsers are verified for schema correctness independently from UI lifecycle updates.

## 9. Security / Privacy Ordering Notes
- The append-only action auditor task (`TSK-R1-005`) is built right after security rules are written. This prevents developers from deploying feature pages without the mandatory audit log hooks.

## 10. Migration / Data Ordering Notes
- Seeding tasks (test user roles mapping to `/users` collection) are grouped inside `TSK-R1-001` (Emulator configuration) so that mock accounts are active for E2E tests in subsequent UI tasks.

## 11. Recommended Stage 10 Prompt Writing Order
Stage 10 coding agent handoff prompts should be written in this order:
1. `Prompt-R0-001` (React Setup & CSS Theme scaffold)
2. `Prompt-R0-002` (AuthGuard & routing pages structure)
3. `Prompt-R1-001` (Emulator config & Firestore rules)
4. `Prompt-R1-002` (File parser, admin panel, and delete interlock)
5. `Prompt-R1-003` (Workspace sidebar, conversation bubbles, and labeling form)
6. `Prompt-R1-004` (Form prefill loader and consensus solver)
7. `Prompt-R1-005` (LLM prediction & stats upload panel, and dashboard charts)

## 12. Ordering Assumptions
- **A-ORD-001**: Assumes that local firebase tools emulator works natively on the development machine.
- **A-ORD-002**: Assumes that Vitest + `@firebase/rules-unit-testing` can run unit tests locally without external internet connections.

## 13. Handoff Notes for 09d
- Verify that every task in the dependency order is present in the traceability matrix.
- Ensure validation test commands from Stage 8 correspond directly to the execution order.
