# 10 Implementation Prompts

## 1. Document Status
- **Status**: Draft (Ready for Review)
- **Stage**: 10 Implementation Prompt Writing
- **Source Task Set**: [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md)
- **Prepared By**: Antigravity AI Agent
- **Last Updated**: 2026-06-10

## 2. Prompt Set Summary
- **Total task cards reviewed**: 17 Tasks
- **Prompts created**: 7 Prompts
- **Prompts blocked**: 0
- **Prompt groups**: 7 Sequential Execution Prompts
- **Execution order source**: [09_dependency_order.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_dependency_order.md)
- **Major constraints**: Vanilla CSS (No Tailwind CSS), strict client-side Firestore authentication rules, read-only append-only audit logging, 2-stage delete confirmation, round 1 blind-spot query isolation.

## 3. Prompt Execution Order

| Order | Prompt ID | Linked Task IDs | Title | Depends On | Status |
|---|---|---|---|---|---|
| 1 | **PROMPT-R0-001** | TSK-R0-001, TSK-R0-002 | React Setup & CSS Theme Scaffold | None | Draft |
| 2 | **PROMPT-R0-002** | TSK-R0-003, TSK-R0-004 | AuthGuard & Routing Pages Structure | PROMPT-R0-001 | Draft |
| 3 | **PROMPT-R1-001** | TSK-R1-001, TSK-R1-002, TSK-R1-005 | Emulator Config & Firestore Security Rules | PROMPT-R0-002 | Draft |
| 4 | **PROMPT-R1-002** | TSK-R1-003, TSK-R1-004 | File Ingest Parser & Admin panel | PROMPT-R1-001 | Draft |
| 5 | **PROMPT-R1-003** | TSK-R1-006, TSK-R1-007, TSK-R1-008 | Workspace List, Bubbles, and Label Form | PROMPT-R1-002 | Draft |
| 6 | **PROMPT-R1-004** | TSK-R1-009, TSK-R1-012 | Form Prefill & Consensus State Solver | PROMPT-R1-003 | Draft |
| 7 | **PROMPT-R1-005** | TSK-R1-010, TSK-R1-011, TSK-R1-013 | LLM Results/Stats Ingestion & Dashboard | PROMPT-R1-004 | Draft |

---

## 4. Implementation Prompts

### PROMPT-R0-001 — React Setup & CSS Theme Scaffold

#### Linked Tasks
- `TSK-R0-001`: React & Firebase Setup
- `TSK-R0-002`: CSS Token Scaffolding

#### 1. Goal
Set up the Greenfield React repository using Vite, verify the configuration builds, and build the Vanilla CSS theme containing global design tokens.

#### 2. Context
This is the setup prompt for the entire application. It establishes the folder structure, installs dependencies, and creates the baseline CSS variables that will be used by all UI elements.

#### 3. Approved Inputs
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md#L183-L186) (NFR-002 Visual standard)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md#L15-L53) (TSK-R0-001 & TSK-R0-002)

#### 4. Files to Inspect First
- `package.json`
- `src/index.css`
- `vite.config.js`

#### 5. Allowed Change Scope
- Project dependencies and package setup.
- Core configs (`vite.config.js`, `package.json`).
- Root styles and global visual definitions (`src/index.css`, `src/App.css`).
- Scaffolding templates (`index.html`, `src/main.jsx`, `src/App.jsx`).

#### 6. Forbidden Changes
- **Do NOT use or install TailwindCSS**. All styling must remain Vanilla CSS.
- Do not add routing, authentication services, or page views yet.

#### 7. Required Implementation Steps
1. Run Vite initialization in the current directory: `npx -y create-vite@latest ./ --template react` (if not already initialized).
2. Install application dependencies: `npm install firebase react-router-dom`.
3. Install developer testing frameworks: `npm install --save-dev vitest @firebase/rules-unit-testing playwright lint-staged eslint typescript`.
4. Configure Google Fonts API imports for `Outfit` and `Inter` at the top of `src/index.css`.
5. Define CSS `:root` variables in `src/index.css` for:
   - Slate Gray Dark Mode Palette (Backgrounds, Cards, Borders, Typography, Hover states).
   - Glassmorphism properties (`background: rgba(255,255,255,0.05); backdrop-filter: blur(12px);`).
   - Toxicity high-contrast highlights (Present vs Absent colors, risk levels 1 to 3).
6. Build global resets, custom scrollbars, flex layout helpers, and button hover transition rules.
7. Verify build pipeline compiles cleanly.

#### 8. Required Tests
- No automated spec tests are required for setup. Compilation and layout verification is the validation target.

#### 9. Commands to Run
- `npm run build` (Must compile with exit code 0)

#### 10. Expected Evidence
- Terminal build stdout showing successful asset compilation.
- Text snippet or file link to color token variables defined in `src/index.css`.

#### 11. Output Files to Update
- `package.json`
- `vite.config.js`
- `src/index.css`
- `src/App.jsx`
- `src/main.jsx`

#### 12. Context Packet Update Instructions
- Update `/workflow/context/context_packet.md` status showing `TSK-R0-001` and `TSK-R0-002` complete.

#### 13. Stop Conditions
- Build fails due to missing dependencies.
- Vite compilation errors.

#### 14. Completion Report Format
```markdown
### PROMPT-R0-001 Completion Report
- React & Firebase packages installed: [Yes/No]
- Developer frameworks loaded (Vitest/Playwright): [Yes/No]
- CSS Variables defined in index.css: [List of main HSL colors]
- Build Compilation Signal: [Output logs snippet]
```

---

### PROMPT-R0-002 — AuthGuard & Routing Pages Structure

#### Linked Tasks
- `TSK-R0-003`: Routing & AuthGuard
- `TSK-R0-004`: Login Interface View

#### 1. Goal
Establish router navigation, create a React Error Boundary around main paths, implement an `AuthGuard` that blocks guest requests, and build the centerted Glassmorphism Login View card integrated with Firebase Auth client SDK.

#### 2. Context
Depends on: `PROMPT-R0-001`.
Prevents unauthenticated users from accessing system features and routes. Centerted login card forms the entry gate of the system.

#### 3. Approved Inputs
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md#L56-L97) (FR-003, SEC-001, NFR-003)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md#L56-L95) (TSK-R0-003, TSK-R0-004)

#### 4. Files to Inspect First
- `src/App.jsx`
- `src/index.css`

#### 5. Allowed Change Scope
- Router paths in `src/App.jsx` (`/login`, `/workspace`, `/admin`, `/dashboard`).
- Creation of `src/components/AuthGuard.jsx`, `src/components/ErrorBoundary.jsx`.
- Creation of `src/pages/Login.jsx`, mock landing layouts for other pages.

#### 6. Forbidden Changes
- Do not query Firestore databases or handle collections yet.

#### 7. Required Implementation Steps
1. Configure React Router in `src/App.jsx` with routes: `/login`, `/workspace`, `/admin`, `/dashboard`.
2. Implement `AuthGuard.jsx` using Firebase Auth state checks (`onAuthStateChanged`). If session is null, immediately redirect page routing to `/login`.
3. Wrap main routing layout in `ErrorBoundary.jsx` which catches JavaScript errors and displays a fallback warning/toast instead of letting the browser render a white screen.
4. Implement a centered Glassmorphism card login view inside `src/pages/Login.jsx`.
5. Bind login form fields (email, password) to Firebase Auth Client SDK: `signInWithEmailAndPassword`.
6. Add validation warnings showing visual error messages when invalid credentials are submit.
7. Redirect users to appropriate directories (Admin to `/admin`, Evaluator to `/workspace`) upon authentication.

#### 8. Required Tests
- E2E routing verification. Check if access to `/workspace` gets redirected to `/login` for unauthenticated sessions.

#### 9. Commands to Run
- `npm run test:e2e` (Specifically checking guest redirect to `/login` - Target E2E ID: `AT-010`)

#### 10. Expected Evidence
- Playwright E2E test report showing successful guest session routing redirection and login success redirects.

#### 11. Output Files to Update
- `src/App.jsx`
- `src/components/AuthGuard.jsx`
- `src/components/ErrorBoundary.jsx`
- `src/pages/Login.jsx`
- `src/pages/Workspace.jsx` (Placeholder Layout)
- `src/pages/Admin.jsx` (Placeholder Layout)
- `src/pages/Dashboard.jsx` (Placeholder Layout)

#### 12. Context Packet Update Instructions
- Verify routes are established and active. Update `/workflow/context/context_packet.md` status.

#### 13. Stop Conditions
- Router loop failures or navigation crashes.
- Firebase Client SDK connection errors.

#### 14. Completion Report Format
```markdown
### PROMPT-R0-002 Completion Report
- Protected route links blocked when guest: [Yes/No]
- Error Boundary registered: [Yes/No]
- Login panel styling uses HSL theme variables: [Yes/No]
- Routing redirect E2E test result: [Pass/Fail with output log snippet]
```

---

### PROMPT-R1-001 — Emulator Config & Firestore Security Rules

#### Linked Tasks
- `TSK-R1-001`: Firebase Emulator Setup
- `TSK-R1-002`: Security Rules & Tests
- `TSK-R1-005`: Append-only Action Auditor

#### 1. Goal
Configure local Firebase emulators for Firestore & Auth, draft the firestore security rules to restrict reading and writing permissions, write security rules unit tests, and implement a client audit log utility.

#### 2. Context
Depends on: `PROMPT-R0-002`.
Secures the Firestore database by checking permissions on write operations, locking audit trails, and isolating client updates.

#### 3. Approved Inputs
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md#L193-L218) (SEC-001, SEC-002, OPS-001)
- [06_data_security_rules.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_security_rules.md)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md#L100-L141,L188-L207) (TSK-R1-001, TSK-R1-002, TSK-R1-005)

#### 4. Files to Inspect First
- `firebase.json`
- `firestore.rules`
- `src/firebase.js`

#### 5. Allowed Change Scope
- Emulators configuration (`firebase.json`, `firestore.indexes.json`).
- DB initialization code `src/firebase.js`.
- Security policies in `firestore.rules`.
- Testing script creation under `test/rules.spec.js`.
- Logging auditor tool `src/utils/auditLogger.js`.

#### 6. Forbidden Changes
- Do not modify pages in a way that bypasses authentication rules validation.

#### 7. Required Implementation Steps
1. Run firebase configurations to enable Emulators for Auth (port 9099) and Firestore (port 8080) in `firebase.json`.
2. Connect Firebase instances in `src/firebase.js` to local ports via `connectAuthEmulator` and `connectFirestoreEmulator` when localhost hostname is detected.
3. Write `firestore.rules`:
   - Block all read/write unless `request.auth != null`.
   - Prevent updating or deleting documents in `/audit_logs/{logId}` (`allow update, delete: if false`).
   - Limit label updates under `/conversations/{id}/labels/{userId}` to the matching user `uid` only (`allow write: if request.auth.uid == userId`).
   - Round 1 Blind spot: Evaluators cannot read label documents of other users if status of the conversation is `'Round 1 Active'`.
4. Setup unit testing pipeline in `test/rules.spec.js` using `@firebase/rules-unit-testing` and Vitest. Write assertions for unauthorized access blocks, audit logs lockups, and blind-spot restrictions.
5. Create `src/utils/auditLogger.js` containing `logAction(db, actionType, actorEmail, metadata)` to execute append-only log insertions.

#### 8. Required Tests
- Rules unit tests ensuring write blocks and read isolations operate correctly.

#### 9. Commands to Run
- `npm run test:rules` (Runs Vitest rules assertions - Targets: `AT-005`, `AT-012`, `AT-013`, `AT-014`, `AT-015`)
- `firebase emulators:start` (In background)

#### 10. Expected Evidence
- CLI execution outputs demonstrating all unit test cases in `test/rules.spec.js` pass successfully.

#### 11. Output Files to Update
- `firebase.json`
- `firestore.rules`
- `src/firebase.js`
- `src/utils/auditLogger.js`
- `test/rules.spec.js`

#### 12. Context Packet Update Instructions
- Confirm emulators and rules unit test pipelines are operational. Update global context.

#### 13. Stop Conditions
- Firebase rules fail compilation.
- Testing runner fails to load emulators suite.

#### 14. Completion Report Format
```markdown
### PROMPT-R1-001 Completion Report
- Emulator configuration complete (Auth: 9099, Firestore: 8080): [Yes/No]
- Audit logs allow delete or update: [Yes/No - Checked to be blocked]
- Blind-spot isolation verified in rules spec: [Yes/No]
- Rules unit test execution output: [Snippet of passing tests]
```

---

### PROMPT-R1-002 — File Ingest Parser & Admin Panel

#### Linked Tasks
- `TSK-R1-003`: JSON Dataset Ingest Parser
- `TSK-R1-004`: Admin Dataset Panel

#### 1. Goal
Implement a JSON data file ingestion parser that scans conversations text for phone number patterns, build the Admin management view containing file upload modals and safety confirmation inputs, and write the import transactions.

#### 2. Context
Depends on: `PROMPT-R1-001`.
Enables system administrators to load target conversation datasets and clean database tables. Ensures that PII warnings are flagged and deletes require explicit human authorization checks.

#### 3. Approved Inputs
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md#L33-L76,L203-L209) (FR-001, FR-002, SEC-003, SEC-004, INT-001)
- [06_migration_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_migration_plan.md)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md#L144-L186) (TSK-R1-003, TSK-R1-004)

#### 4. Files to Inspect First
- `src/pages/Admin.jsx`
- `src/utils/datasetParser.js`

#### 5. Allowed Change Scope
- Dataset parser configuration in `src/utils/datasetParser.js` & tests.
- UI layouts in `src/pages/Admin.jsx`.
- Modal popup dialog modules (`src/components/PIIWarningModal.jsx`, `src/components/DeleteConfirmationModal.jsx`).

#### 6. Forbidden Changes
- Do not process external LLM stats uploads or dashboard charting integrations yet.

#### 7. Required Implementation Steps
1. Create `src/utils/datasetParser.js` validating schema containing array of records with `call_id` and array of `turns`.
2. Implement regular expression analyzer scanning turn text entries for domestic phone format patterns (`010-\d{4}-\d{4}` and unhyphenated instances). Return warnings.
3. Write parser assertions in `test/datasetParser.spec.js` checking schema checks and PII triggers.
4. Implement Admin page `/admin` with drop targets for JSON files.
5. If warning matches return, show `PIIWarningModal` prompting `[Confirm & Upload]`. Commit using Firestore Batched Write to write documents into `/conversations/{id}`.
6. Connect dataset insert actions to log records via `auditLogger.js` `logAction` (Type: `Upload`).
7. Implement database clear button triggering `DeleteConfirmationModal` that requires manual entry of `"DELETE ALL DATASET"`. Run batch delete operations upon verification, logging the delete action (Type: `Delete`).

#### 8. Required Tests
- Ingest schema unit tests and Playwright E2E script covering warnings confirmation dialogs.

#### 9. Commands to Run
- `npm run test:unit` (Parser verification - Targets: `AT-002`, `AT-011`)
- `npm run test:e2e` (Admin file upload and interlock tests - Targets: `AT-001`, `AT-003`)

#### 10. Expected Evidence
- Vitest console results confirming dataset parser validators succeed.
- E2E Playwright logs verifying delete confirmation text interlock blocks unauthorized clicks.

#### 11. Output Files to Update
- `src/utils/datasetParser.js`
- `test/datasetParser.spec.js`
- `src/pages/Admin.jsx`
- `src/components/PIIWarningModal.jsx`
- `src/components/DeleteConfirmationModal.jsx`

#### 12. Context Packet Update Instructions
- Confirm parser logic and admin functions work. Update `/workflow/context/context_packet.md`.

#### 13. Stop Conditions
- Database bulk upload operations crash or partial records get stuck due to transaction timeouts.
- Interlock validation string match checks fail.

#### 14. Completion Report Format
```markdown
### PROMPT-R1-002 Completion Report
- Dataset schema validation handles missing fields: [Yes/No]
- Mobile phone PII scanner detects unhyphenated digits: [Yes/No]
- Confirm & Delete button is disabled until interlock text matches: [Yes/No]
- Parser unit tests result: [Pass/Fail logs]
```

---

### PROMPT-R1-003 — Workspace List, Bubbles, and Label Form

#### Linked Tasks
- `TSK-R1-006`: Workspace Sidebar List
- `TSK-R1-007`: turn bubble viewer
- `TSK-R1-008`: Toxicity Evaluation Form

#### 1. Goal
Build the evaluator workspace containing a conversation sidebar selector with filter search and status markers, a chronological turn message bubble list (Customer left, Agent right), and the toxicity evaluation input panel.

#### 2. Context
Depends on: `PROMPT-R1-002`.
Provides the main environment where human labelers review dialogues and select categorization values.

#### 3. Approved Inputs
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md#L78-L121) (FR-003, FR-004, NFR-002)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md#L209-L270) (TSK-R1-006, TSK-R1-007, TSK-R1-008)

#### 4. Files to Inspect First
- `src/pages/Workspace.jsx`
- `src/index.css`

#### 5. Allowed Change Scope
- Creation of `src/components/EvaluationForm.jsx`.
- Creation of conversation bubbles UI elements inside `src/pages/Workspace.jsx`.
- CSS structures in `src/index.css` for flexible message alignment and active status tags.

#### 6. Forbidden Changes
- Do not write save operations to Firestore subcollections yet. Form must operate in mock-save modes.

#### 7. Required Implementation Steps
1. Retrieve conversations from `/conversations` in the workspace sidebar.
2. Implement text input search filter in sidebar sorting matches by `call_id`.
3. Add status tag highlights (`Round 1 Active`, `Consensus Reached`) beside items using CSS tokens.
4. Load selected conversation turns chronologically, sorted by `sequence_no`.
5. Align Customer bubbles to the left (e.g. gray bubble background) and Agent bubbles to the right (e.g. blue dark-tint background) using flex properties.
6. Create `src/components/EvaluationForm.jsx` rendering:
   - Toxicity Present/Absent radio options.
   - 7 categories checklists/radios (Sexual, Violence, Abuse, Hate, etc.). Disable if Absent.
   - Risk levels 1 to 3 indicators. Disable if Absent.
   - Up to 3 Evidence Phrase input fields.
7. Implement validation checking (submit button disabled until all criteria are satisfied if Toxicity is Present). Write test suite in `test/EvaluationForm.spec.js`.

#### 8. Required Tests
- Form component input validations unit tests.
- Playwright E2E verifying turns sorting and float alignment rules.

#### 9. Commands to Run
- `npm run test:unit` (Form validations test - Target: `TSK-R1-008`)
- `npm run test:e2e` (Workspace visual checking - Target: `AT-004`)

#### 10. Expected Evidence
- Unit test suite run summary proving disabled fields states when toxicity is Absent.
- Playwright screenshot proof showing Customer and Agent messages float on opposite layout sides.

#### 11. Output Files to Update
- `src/pages/Workspace.jsx`
- `src/components/EvaluationForm.jsx`
- `test/EvaluationForm.spec.js`

#### 12. Context Packet Update Instructions
- Verify layout styles and form states. Update `/workflow/context/context_packet.md`.

#### 13. Stop Conditions
- Out of order turn renders.
- Layout breaks or overflows on smaller screens.

#### 14. Completion Report Format
```markdown
### PROMPT-R1-003 Completion Report
- Workspace conversation filter operates: [Yes/No]
- Dialogues sorted by sequence_no key: [Yes/No]
- Label fields disabled when Toxicity is Absent: [Yes/No]
- Unit test assertions verify form completeness constraints: [Yes/No]
```

---

### PROMPT-R1-004 — Form Prefill & Consensus State Solver

#### Linked Tasks
- `TSK-R1-009`: Form Prefill & Submission
- `TSK-R1-012`: Consensus Transition Solver

#### 1. Goal
Connect evaluation forms to Firebase Firestore database transactions, reload prior evaluator records on click (prefill), and build the client-side 3-stage consensus solver transaction checking mechanism.

#### 2. Context
Depends on: `PROMPT-R1-003`.
Saves labeled records securely. Evaluates consensus automatically once a call receives three human validations.

#### 3. Approved Inputs
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md#L99-L121,L179-L182) (FR-004, NFR-001)
- [05_event_contracts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_event_contracts.md)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md#L272-L292,L335-L359) (TSK-R1-009, TSK-R1-012)

#### 4. Files to Inspect First
- `src/components/EvaluationForm.jsx`
- `src/utils/consensusSolver.js`

#### 5. Allowed Change Scope
- Write bindings in `src/components/EvaluationForm.jsx`.
- Creation of `src/utils/consensusSolver.js` and tests.

#### 6. Forbidden Changes
- Do not build dashboard progress trackers or analytics charts.

#### 7. Required Implementation Steps
1. In `EvaluationForm.jsx` read current active userId. On selection load user label doc: `/conversations/{id}/labels/{uid}`. Prefill inputs if values exist.
2. Disable save button actions when selected conversation status is Locked (`Consensus Reached`).
3. Create `src/utils/consensusSolver.js` that checks for consensus.
4. When label is submit, run a Firestore Transaction:
   - Save the label record.
   - Increment conversation's `label_completion_count`.
   - If completion count reaches 3, retrieve all 3 user labels from subcollection.
   - Match toxicity decisions and category classifications:
     - If all 3 match: update status = `"Consensus Reached"`. Create document in `/gold_standards/{call_id}` mapping matched fields.
     - If any mismatch: update status = `"Round 2 Active"`.
   - Add append action audit log entries.
5. Implement unit tests verifying matching and mismatching path flows in `test/consensusSolver.spec.js`.

#### 8. Required Tests
- Solver unit tests and Playwright evaluation submission E2E validations.

#### 9. Commands to Run
- `npm run test:unit` (Solver logic tests - Target: `AT-015`)
- `npm run test:e2e` (Prefill loading and submit transactions checking - Targets: `AT-005`, `AT-006`)

#### 10. Expected Evidence
- Vitest console outputs proving solver detects matches and sets gold standard documents.
- Playwright logs verifying re-selected call inputs load prefilled fields.

#### 11. Output Files to Update
- `src/components/EvaluationForm.jsx`
- `src/utils/consensusSolver.js`
- `test/consensusSolver.spec.js`

#### 12. Context Packet Update Instructions
- Confirm transaction solver operations and update `/workflow/context/context_packet.md`.

#### 13. Stop Conditions
- Transaction locking failures or double increments.
- State checks bypass rules.

#### 14. Completion Report Format
```markdown
### PROMPT-R1-004 Completion Report
- Saved labels are loaded and prefilled on reload: [Yes/No]
- Evaluations locked when status is Consensus Reached: [Yes/No]
- Mismatched inputs transition status to Round 2 Active: [Yes/No]
- Solver spec assertions run successfully: [Yes/No]
```

---

### PROMPT-R1-005 — LLM Results/Stats Ingestion & Dashboard

#### Linked Tasks
- `TSK-R1-010`: Admin LLM Import Script
- `TSK-R1-011`: Admin Stats Import Panel
- `TSK-R1-013`: Dashboard Analytics View

#### 1. Goal
Add Admin file inputs and JSON parser validators for LLM prediction outputs and Fleiss' Kappa statistics, and implement the `/dashboard` route displaying user progress metrics and responsive analysis charts.

#### 2. Context
Depends on: `PROMPT-R1-004`.
Finishes the visual dashboard reporting of comparative analytics.

#### 3. Approved Inputs
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md#L122-L175) (FR-005, FR-006, FR-007, NFR-002)
- [09_task_cards.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_cards.md#L294-L333,L361-L380) (TSK-R1-010, TSK-R1-011, TSK-R1-013)

#### 4. Files to Inspect First
- `src/pages/Admin.jsx`
- `src/pages/Dashboard.jsx`

#### 5. Allowed Change Scope
- File upload handlers in `src/pages/Admin.jsx`.
- Ingestion validators `src/utils/llmParser.js` and `src/utils/statsParser.js`.
- Design layout in `src/pages/Dashboard.jsx`.

#### 6. Forbidden Changes
- Do not import complex charting packages (like D3 or Chart.js) unless lightweight SVG elements or CSS tables cannot fulfill presentation requirements. Keep bundles clean.

#### 7. Required Implementation Steps
1. Add LLM JSON file selection field in `/admin`. Create `src/utils/llmParser.js`. Check that predictions match existing `call_id` keys in database before write.
2. Ingest valid prediction objects using batch commits to `/conversations/{id}/llm_results/{modelId}`. Log action.
3. Setup Stats upload selector in `/admin`. Create `src/utils/statsParser.js`. Store values into `/dashboard/statistics`. Log action.
4. Implement `src/pages/Dashboard.jsx` accessible under `/dashboard`.
5. Calculate user evaluation progress percentage (completed labels divided by total dataset items) and display in glass progress meter.
6. Retrieve stats from `/dashboard/statistics`. Draw Fleiss' Kappa metrics and F1 model metrics charts using responsive Vanilla CSS grids and clean inline SVG shapes.
7. Verify dashboard container widths scale properly across screens.

#### 8. Required Tests
- Importers logic unit tests and Playwright visual dashboard integration test.

#### 9. Commands to Run
- `npm run test:unit` (Validation parsers tests - Targets: `AT-007`, `AT-008`)
- `npm run test:e2e` (Dashboard rendering checks - Target: `AT-009`)

#### 10. Expected Evidence
- Unit test execution logs showing correct parsing limits.
- E2E checks proving graphs render cleanly.

#### 11. Output Files to Update
- `src/pages/Admin.jsx`
- `src/utils/llmParser.js`
- `src/utils/statsParser.js`
- `test/llmParser.spec.js`
- `test/statsParser.spec.js`
- `src/pages/Dashboard.jsx`

#### 12. Context Packet Update Instructions
- Verification of imports and dashboard displays. Set all tasks to complete and update context packet.

#### 13. Stop Conditions
- Ingest schema warnings fail to block uploads.
- Dashboard graphs break grid boundaries on small resolutions.

#### 14. Completion Report Format
```markdown
### PROMPT-R1-005 Completion Report
- Predictions with invalid call_id are rejected: [Yes/No]
- Agreement stats uploaded successfully: [Yes/No]
- Progress bar calculates exact completion ratio: [Yes/No]
- SVG charts scale responsively in container grid: [Yes/No]
```
