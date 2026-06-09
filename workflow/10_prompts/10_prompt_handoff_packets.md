# 10 Prompt Handoff Packets

## 1. Document Status
- **Status**: Draft (Ready for Review)
- **Stage**: 10 Implementation Prompt Writing
- **Source Prompt Set**: [10_implementation_prompts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/10_prompts/10_implementation_prompts.md)
- **Last Updated**: 2026-06-10

## 2. How to Use These Packets
Each packet is designed to be fed into a fresh Stage 11 coding-agent session. It specifies dependencies, constraints, source files, and validation commands to ensure smooth execution without drift.

---

## 3. Handoff Packets

### HANDOFF-R0-001 — React Setup & CSS Theme Scaffold

#### Execution Metadata
- **Prompt ID**: `PROMPT-R0-001`
- **Task IDs**: `TSK-R0-001`, `TSK-R0-002`
- **Execution Order**: 1
- **Parallelization Limits**: Cannot be parallelized. Must run first as it constructs the project shell and styling rules.

#### Source of Truth
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (NFR-002)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md) (TSK-R0-001, TSK-R0-002)

#### Start-of-Session Instructions
1. Inspect the workspace root. If React setup is not initialized, run the Vite initialization command.
2. Load and verify package dependencies and configure the dev dependencies.
3. Open `src/index.css` and create standard CSS variables and resets.

#### Implementation Boundaries
- **Allowed**: `package.json`, `vite.config.js`, `src/index.css`, `index.html`, `src/main.jsx`, `src/App.jsx`.
- **Forbidden**: Do not install Tailwind CSS or import external styling libraries. Do not implement router switches or authentication calls.

#### Validation Requirements
- Build compilation check must run clean: `npm run build`
- Review layout variables in index.css manually or via screenshot inspection.

#### Result Artifacts
- `package.json`
- `vite.config.js`
- `src/index.css`

#### Stop Conditions
- `npm install` fails due to package version mismatches.
- Vite build throws linting errors or compilation blocks.

#### Handoff Notes
Ensure Outfit and Inter fonts are loaded via Google Fonts web import at the top of index.css. Glassmorphism backdrop-blur parameters must utilize standard CSS variables.

---

### HANDOFF-R0-002 — AuthGuard & Routing Pages Structure

#### Execution Metadata
- **Prompt ID**: `PROMPT-R0-002`
- **Task IDs**: `TSK-R0-003`, `TSK-R0-004`
- **Execution Order**: 2
- **Parallelization Limits**: Sequential execution. Depends on: `HANDOFF-R0-001`.

#### Source of Truth
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-003, SEC-001, NFR-003)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md) (TSK-R0-003, TSK-R0-004)

#### Start-of-Session Instructions
1. Read the routing specifications.
2. Initialize `react-router-dom` navigation within `src/App.jsx`.
3. Build the login card page and auth guard checking logic.

#### Implementation Boundaries
- **Allowed**: Router routes setup, AuthGuard wrapper creation, Error Boundary toast UI fallback, centered Login view layout, Firebase Auth client sign-in integration.
- **Forbidden**: Do not connect Firestore data bindings or call collection models.

#### Validation Requirements
- Playwright E2E router checks. Verify guest redirect triggers.
- Run: `npm run test:e2e` (Specifically checking test ID: `AT-010`)

#### Result Artifacts
- `src/App.jsx`
- `src/components/AuthGuard.jsx`
- `src/components/ErrorBoundary.jsx`
- `src/pages/Login.jsx`

#### Stop Conditions
- App crashes due to infinite redirect loops.
- Sign-in triggers throw uncaught promise exceptions.

#### Handoff Notes
Create placeholder pages for `/workspace`, `/admin`, and `/dashboard` to prevent router link broken errors.

---

### HANDOFF-R1-001 — Emulator Config & Firestore Security Rules

#### Execution Metadata
- **Prompt ID**: `PROMPT-R1-001`
- **Task IDs**: `TSK-R1-001`, `TSK-R1-002`, `TSK-R1-005`
- **Execution Order**: 3
- **Parallelization Limits**: Sequential execution. Depends on: `HANDOFF-R0-002`.

#### Source of Truth
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (SEC-001, SEC-002, OPS-001)
- [06_data_security_rules.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_security_rules.md)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md) (TSK-R1-001, TSK-R1-002, TSK-R1-005)

#### Start-of-Session Instructions
1. Initialize firebase CLI configuration for Firestore and Authentication Emulators.
2. Connect client service initializers in `src/firebase.js`.
3. Set up the unit testing directory and rules assertions code in `test/rules.spec.js`.

#### Implementation Boundaries
- **Allowed**: `firebase.json` configuration, `firestore.rules`, `src/firebase.js` port connections, `test/rules.spec.js` rule assertions, and `src/utils/auditLogger.js` helper.
- **Forbidden**: Do not modify UI pages layout or elements.

#### Validation Requirements
- Firestore Rules Unit test suite: `npm run test:rules` (Must pass all access checks and constraints)
- Emulator startup verify: `firebase emulators:start`

#### Result Artifacts
- `firebase.json`
- `firestore.rules`
- `src/firebase.js`
- `test/rules.spec.js`
- `src/utils/auditLogger.js`

#### Stop Conditions
- Emulator port conflicts (port 8080/9099 already in use).
- Security rule syntax errors block compilation.

#### Handoff Notes
Audit log collection must enforce write-only append behavior (`allow update, delete: if false`). Ensure Round 1 query isolation blocks evaluators from viewing others' files.

---

### HANDOFF-R1-002 — File Ingest Parser & Admin Panel

#### Execution Metadata
- **Prompt ID**: `PROMPT-R1-002`
- **Task IDs**: `TSK-R1-003`, `TSK-R1-004`
- **Execution Order**: 4
- **Parallelization Limits**: Sequential execution. Depends on: `HANDOFF-R1-001`.

#### Source of Truth
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-001, FR-002, SEC-003, SEC-004, INT-001)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md) (TSK-R1-003, TSK-R1-004)

#### Start-of-Session Instructions
1. Build the client data ingestion helper utility.
2. Develop the Admin Page view with upload file fields and delete dataset buttons.
3. Configure warning and confirmation modal structures.

#### Implementation Boundaries
- **Allowed**: JSON validator schema checks, phone number Regex scanners, Admin views in `/admin`, warnings dialog overlays, database bulk batch upload commits, delete interlock string confirmation checking.
- **Forbidden**: Do not connect evaluation inputs or load dashboard graphs.

#### Validation Requirements
- Parser schema checks and PII regex matches unit tests: `npm run test:unit`
- Admin file upload and safety deletes E2E: `npm run test:e2e` (Targets: `AT-001`, `AT-003`, `AT-011`)

#### Result Artifacts
- `src/utils/datasetParser.js`
- `test/datasetParser.spec.js`
- `src/pages/Admin.jsx`
- `src/components/PIIWarningModal.jsx`
- `src/components/DeleteConfirmationModal.jsx`

#### Stop Conditions
- Ingestion fails to reject files with duplicate `call_id` or invalid structures.
- Delete dataset executes before typing confirmation.

#### Handoff Notes
All uploads and deletes must call the audit logger class. Scan for unhyphenated phone digits as well as standard dashes.

---

### HANDOFF-R1-003 — Workspace List, Bubbles, and Label Form

#### Execution Metadata
- **Prompt ID**: `PROMPT-R1-003`
- **Task IDs**: `TSK-R1-006`, `TSK-R1-007`, `TSK-R1-008`
- **Execution Order**: 5
- **Parallelization Limits**: Sequential execution. Depends on: `HANDOFF-R1-002`.

#### Source of Truth
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-003, FR-004, NFR-002)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md) (TSK-R1-006, TSK-R1-007, TSK-R1-008)

#### Start-of-Session Instructions
1. Inspect the workspace CSS grid properties.
2. Implement the side list panel query and search filters.
3. Design chronological speaker turn conversation bubbles and the toxicity form inputs.

#### Implementation Boundaries
- **Allowed**: Workspace sidebar list rendering, status marker checks, flex turn dialogue alignments, toxicity inputs (Toxicity Present/Absent, 7 categories, risk ratings, evidence texts), client form state checks.
- **Forbidden**: Do not connect write queries or submission commits to Firestore collections. Form must run in validation/mock modes.

#### Validation Requirements
- Form layout and conditional states unit test: `npm run test:unit`
- Visual checks for speaker bubble floats: `npm run test:e2e` (Target: `AT-004`)

#### Result Artifacts
- `src/pages/Workspace.jsx`
- `src/components/EvaluationForm.jsx`
- `test/EvaluationForm.spec.js`

#### Stop Conditions
- Text content overflowing boundaries or dialogue messages rendering out of chronological sequence.
- Submission enables when toxicity categories remain unselected.

#### Handoff Notes
Toxicity detail fields (categories, risk levels) must remain disabled or hidden when toxicity is marked Absent. Apply Outfit font variables for titles.

---

### HANDOFF-R1-004 — Form Prefill & Consensus State Solver

#### Execution Metadata
- **Prompt ID**: `PROMPT-R1-004`
- **Task IDs**: `TSK-R1-009`, `TSK-R1-012`
- **Execution Order**: 6
- **Parallelization Limits**: Sequential execution. Depends on: `HANDOFF-R1-003`.

#### Source of Truth
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-004, NFR-001)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md) (TSK-R1-009, TSK-R1-012)

#### Start-of-Session Instructions
1. Integrate Firestore document queries inside the workspace loader to retrieve user data.
2. Build the database submission write transactions.
3. Design the consensus matching checks in `src/utils/consensusSolver.js`.

#### Implementation Boundaries
- **Allowed**: Firebase label get/set queries, form prefill triggers, Firestore Transaction hooks, consensus state solver script, gold standards insertion actions, audit logs integrations.
- **Forbidden**: Do not write dashboard layout views or external metrics loaders.

#### Validation Requirements
- Unit testing for consensus conditions: `npm run test:unit` (Target: `AT-015`)
- Submission prefill and locks verification E2E: `npm run test:e2e` (Targets: `AT-005`, `AT-006`)

#### Result Artifacts
- `src/utils/consensusSolver.js`
- `test/consensusSolver.spec.js`
- `src/components/EvaluationForm.jsx` (Updated with Firestore transactions)

#### Stop Conditions
- Mismatched inputs fail to increment state counts or transition status.
- Evaluators can override locked inputs.

#### Handoff Notes
Double-check database transactions operate as atomic boundaries (All-or-Nothing) to preserve database integrity.

---

### HANDOFF-R1-005 — LLM Results/Stats Ingestion & Dashboard

#### Execution Metadata
- **Prompt ID**: `PROMPT-R1-005`
- **Task IDs**: `TSK-R1-010`, `TSK-R1-011`, `TSK-R1-013`
- **Execution Order**: 7
- **Parallelization Limits**: Sequential execution. Depends on: `HANDOFF-R1-004`.

#### Source of Truth
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-005, FR-006, FR-007, NFR-002)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md) (TSK-R1-010, TSK-R1-011, TSK-R1-013)

#### Start-of-Session Instructions
1. Write the prediction and statistics JSON file validators.
2. Set up the admin file select targets.
3. Construct the dashboard reporting layout utilizing the CSS HSL theme.

#### Implementation Boundaries
- **Allowed**: Predictions file ingestion parsing and nonexistent check, stats file upload, Dashboard `/dashboard` pages, user progress calculations, CSS SVG progress charts.
- **Forbidden**: Do not import charting frameworks unless SVG vectors are incapable of drawing grid bars. Keep scripts light.

#### Validation Requirements
- Upload parsers schema tests: `npm run test:unit` (Targets: `AT-007`, `AT-008`)
- Dashboard grid resize integration checking: `npm run test:e2e` (Target: `AT-009`)

#### Result Artifacts
- `src/utils/llmParser.js`
- `src/utils/statsParser.js`
- `test/llmParser.spec.js`
- `test/statsParser.spec.js`
- `src/pages/Dashboard.jsx`
- `src/pages/Admin.jsx` (Updated with prediction/stats uploads)

#### Stop Conditions
- Ingesting files with invalid keys or empty values succeeds without raising errors.
- Charts overflow layout boundaries or cause scrolling problems.

#### Handoff Notes
Ensure the progress bar gauge computes correctly based on completed files counts divided by total dataset entries. Keep styling strictly inline SVG and grid layouts.
