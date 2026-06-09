# 09 Task Cards

## 1. Scope Basis
This document contains the detailed implementation task cards for LAMS-v0. These tasks cover **Release R0** (Scaffolding & Auth Setup) and **Release R1** (Consensus Labeling Loop & Ingestions).

## 2. Task ID Convention
Tasks are prefix-coded:
- `TSK-R0-XXX` for Release R0 (Scaffolding).
- `TSK-R1-XXX` for Release R1 (MVP Loop).

---

## 3. Foundation Release Cards (Release R0)

### TSK-R0-001: React & Firebase Setup
- **Title**: React & Firebase Project Scaffolding
- **Linked Requirements**: SEC-001, NFR-002
- **Linked Release Slice**: Release R0
- **Size**: 1.0 Day
- **Objective**: Create the Greenfield React repository structure, verify build tools, and install initial developer dependencies.
- **Preconditions**: Empty workspace with access to Node/npm.
- **Implementation Steps**:
  1. Initialize React app in current directory using Vite: `npx -y create-vite@latest ./ --template react` (if not already initialized).
  2. Install core application dependencies: `npm install firebase react-router-dom`.
  3. Install dev dependencies: `npm install --save-dev vitest @firebase/rules-unit-testing playwright lint-staged eslint typescript`.
  4. Configure initial `vite.config.js` to ensure production bundle compilation runs without warnings.
- **Validation / Verification Command**:
  - `npm run build` (Should compile without errors)
- **Definition of Done (DoD)**:
  - React project compiles cleanly, and package dependencies match required test frameworks and Firebase SDK versions.
  - Verification Evidence: Terminal output of successful `npm run build` compilation.

---

### TSK-R0-002: CSS Token Scaffolding
- **Title**: Vanilla CSS Theme & Token Configurations
- **Linked Requirements**: NFR-002
- **Linked Release Slice**: Release R0
- **Size**: 1.0 Day
- **Objective**: Scaffolder root layout variables and colors using Vanilla CSS, establishing the project design theme.
- **Preconditions**: `src/index.css` is initialized.
- **Implementation Steps**:
  1. Load Outfit and Inter web fonts from Google Fonts API at the top of `index.css`.
  2. Define CSS `:root` color tokens (Tailored HSL palettes for Slate Gray dark mode, vibrant toxicity-level status highlights, glassmorphism transparency, and backdrop blur variables).
  3. Establish base resets: margins, scrollbar styling, box-sizing, and body background color.
  4. Create standard utilities for flex centers, grid structures, glass cards (`background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px);`), and micro-animations for button hovers.
- **Validation / Verification Command**:
  - View layout styling by running local developer server: `npm run dev`
  - Manual check: [08_manual_test_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_manual_test_plan.md#MAN-001)
- **Definition of Done (DoD)**:
  - Global styles define HSL tokens and card structures. CSS classes utilize standard variables without inline stylesheet overrides.
  - Verification Evidence: Screenshot or code view of `index.css` layout definitions.

---

### TSK-R0-003: Routing & AuthGuard
- **Title**: Routing Structure & Authentication Page Guard
- **Linked Requirements**: SEC-001, NFR-003
- **Linked Release Slice**: Release R0
- **Size**: 1.5 Days
- **Objective**: Establish path routing and routing protection logic to prevent guest users from accessing system workspaces.
- **Preconditions**: `react-router-dom` is installed.
- **Implementation Steps**:
  1. Setup router hierarchy in `src/App.jsx` supporting: `/login`, `/workspace`, `/admin`, `/dashboard`.
  2. Implement an `AuthGuard.jsx` component that monitors Firebase Auth state.
  3. Redirect non-authenticated sessions targeting protected paths (`/workspace`, `/admin`, `/dashboard`) back to `/login` immediately.
  4. Integrate a React Error Boundary component around the main router layout to display a recovery toast instead of a white crash screen on Javascript runtime errors.
- **Validation / Verification Command**:
  - `npm run test:e2e` (Specifically running E2E routing redirections)
  - E2E Test ID: [AT-010](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-010)
- **Definition of Done (DoD)**:
  - Direct URI navigation to `/workspace` by a guest session automatically redirects to `/login` within 500ms.
  - Verification Evidence: Playwright console log proving redirection behavior.

---

### TSK-R0-004: Login Interface View
- **Title**: Login Panel Interface & SDK Bindings
- **Linked Requirements**: SEC-001
- **Linked Release Slice**: Release R0
- **Size**: 1.0 Day
- **Objective**: Provide the user login page integrated with Firebase Auth client SDK.
- **Preconditions**: Router endpoints and Firebase config are setup.
- **Implementation Steps**:
  1. Build a Glassmorphism login card centered in the viewport.
  2. Add email and password inputs with active focus indicators.
  3. Bind form submission to Firebase Auth SDK: `signInWithEmailAndPassword`.
  4. Implement visual error feedback for incorrect credentials (e.g. displaying error toast without crashing the form).
  5. Redirect successful authentications to `/workspace` or `/dashboard` based on user role claim.
- **Validation / Verification Command**:
  - Manual E2E login interaction verification using emulator accounts.
- **Definition of Done (DoD)**:
  - Valid user credentials trigger session generation, state updates, and redirect to the application home dashboard page.
  - Verification Evidence: Form submission and redirect logs.

---

## 4. MVP Release Cards (Release R1)

### TSK-R1-001: Firebase Emulator Setup
- **Title**: Local Firebase Emulators Configuration
- **Linked Requirements**: SEC-001, SEC-002
- **Linked Release Slice**: Release R1
- **Size**: 1.0 Day
- **Objective**: Setup local sandbox configurations for Firestore and Auth to support offline verification.
- **Preconditions**: Firebase CLI is installed.
- **Implementation Steps**:
  1. Initialize firebase configuration: `firebase init emulators` selecting Firestore and Auth.
  2. Define emulator ports in `firebase.json` (Auth: 9099, Firestore: 8080).
  3. Create client initialization logic in `src/firebase.js` that checks for `window.location.hostname === 'localhost'` and binds services to the emulator ports via `connectAuthEmulator` and `connectFirestoreEmulator`.
  4. Write npm script shortcut: `"emulators": "firebase emulators:start"`.
- **Validation / Verification Command**:
  - `npm run emulators`
- **Definition of Done (DoD)**:
  - Firebase Local Emulator dashboard runs successfully, and React client binds to local ports when run in development mode.
  - Verification Evidence: Startup terminal logs indicating active emulator ports.

---

### TSK-R1-002: Security Rules & Tests
- **Title**: Firestore Security Rules Invariants & Rules Unit Tests
- **Linked Requirements**: SEC-001, SEC-002, OPS-001
- **Linked Release Slice**: Release R1
- **Size**: 2.0 Days
- **Objective**: Implement server-side document isolation, audit trail locking, and write unit tests to prevent unauthorized data mutations.
- **Preconditions**: Firebase emulator is configured.
- **Implementation Steps**:
  1. Draft `firestore.rules` containing rules:
     - `request.auth != null` access control constraint.
     - Document write isolation: `calls/{id}/evaluators/{uid}` can only be written if `request.auth.uid == uid`.
     - Append-only audit records: `/audit_logs/{id}` cannot be updated or deleted (`allow update, delete: if false`).
     - Blind-spot rules: Prevent reading labels collection of other users if `status == 'Round 1 Active'`.
  2. Implement unit tests in `test/rules.spec.js` using `@firebase/rules-unit-testing`.
  3. Write test cases for: Auth denial, user collection isolation, audit log immutability, and blind-spot queries.
- **Validation / Verification Command**:
  - `npm run test:rules`
  - Integration Test IDs: [AT-005](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-005), [AT-012](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-012), [AT-013](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-013), [AT-014](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-014).
- **Definition of Done (DoD)**:
  - All test cases pass assertions (denying illegal updates/reads and allowing matching writes).
  - Verification Evidence: Vitest execution reports showing 100% rules test success.

---

### TSK-R1-003: JSON Dataset Ingest Parser
- **Title**: Dataset Upload Parser & PII Scanner
- **Linked Requirements**: FR-001, SEC-003, INT-001
- **Linked Release Slice**: Release R1
- **Size**: 1.5 Days
- **Objective**: Implement client-side JSON file ingestion, fields validation, and mobile number PII scanning alerts.
- **Preconditions**: Schema specifications mapped.
- **Implementation Steps**:
  1. Build a client-side parser utility (`src/utils/datasetParser.js`).
  2. Validate incoming JSON file schema (requires array of items with `call_id` and `turns` array containing sequence, speaker, and text).
  3. Scan texts of turns using domestic phone number regex pattern: `010-\d{4}-\d{4}` (also detect unhyphenated sequences).
  4. If matches are found, store warnings to return to UI for warning display.
  5. Add unit tests for parser file validation and PII detection.
- **Validation / Verification Command**:
  - `npm run test:unit`
  - Test IDs: [AT-002](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-002), [AT-011](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-011)
- **Definition of Done (DoD)**:
  - File selections containing phone numbers return warnings, and invalid JSONs throw schema violations.
  - Verification Evidence: Vitest parser suite unit test passes.

---

### TSK-R1-004: Admin Dataset Panel
- **Title**: Admin Dataset Management Panel
- **Linked Requirements**: FR-001, FR-002, SEC-004
- **Linked Release Slice**: Release R1
- **Size**: 1.5 Days
- **Objective**: Implement the admin upload view, PII warnings popup confirm triggers, and delete database confirmation.
- **Preconditions**: Ingest parser is completed.
- **Implementation Steps**:
  1. Create `/admin` view accessible only by Admin users.
  2. Implement file drop target input linked to dataset parser.
  3. If PII warning list returns, display a warning modal dialog alert. The actual database commit occurs only after the Admin clicks `[Confirm & Upload]`.
  4. Commit updates using a Firestore Batched Write to write documents to `/conversations` collection.
  5. Implement `[Delete All Dataset]` button that triggers a modal dialog requiring the Admin to type `"DELETE ALL DATASET"`. The final delete button remains disabled until string matches.
- **Validation / Verification Command**:
  - `npm run test:e2e`
  - Test IDs: [AT-001](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-001), [AT-003](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-003), [AT-011](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-011).
- **Definition of Done (DoD)**:
  - Dataset deletion requires typing confirmation, and uploading valid files updates database list collections.
  - Verification Evidence: Playwright E2E dataset flow test reports.

---

### TSK-R1-005: Append-only Action Auditor
- **Title**: Append-Only User Actions Auditor
- **Linked Requirements**: OPS-001
- **Linked Release Slice**: Release R1
- **Size**: 1.0 Day
- **Objective**: Ensure that user interactions (file uploads, deletions, and label saving) are logged atomically to a read-only audit log collection.
- **Preconditions**: Security rules protect `/audit_logs` from updates/deletes.
- **Implementation Steps**:
  1. Build an audit logger utility (`src/utils/auditLogger.js`).
  2. Expose `logAction(db, actionType, actorEmail, metadata)` returning a Firestore document write reference.
  3. Integrate `logAction` inside Dataset Upload, Dataset Deletion, and Workspace Label Save functions.
  4. Execute the audit log write within the same transaction or batch as the main data operation to guarantee atomicity (all-or-nothing).
- **Validation / Verification Command**:
  - `npm run test:rules` (Verifying audit log lock rules)
  - Integration Test ID: [AT-014](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-014).
- **Definition of Done (DoD)**:
  - User mutations trigger document creation in `/audit_logs`, and direct attempts to modify log indices fail.
  - Verification Evidence: Database document snapshot and terminal rules test reports.

---

### TSK-R1-006: Workspace Sidebar List
- **Title**: Workspace Conversation Selector Sidebar
- **Linked Requirements**: FR-003
- **Linked Release Slice**: Release R1
- **Size**: 1.0 Day
- **Objective**: Build the conversation selector list inside `/workspace` with search capabilities and status tags.
- **Preconditions**: Base layout has grid boundaries.
- **Implementation Steps**:
  1. Query `/conversations` collection in the workspace sidebar.
  2. Implement local state text filter to search by `call_id`.
  3. Render active status tags beside call list entries (`Round 1 Active`, `Round 2 Active`, `Consensus Reached`, etc.) using color variables from the CSS theme.
  4. Track active selection and render loading indicators when retrieving details.
- **Validation / Verification Command**:
  - Manual visual inspection of search functionality and styling in browser.
- **Definition of Done (DoD)**:
  - Typing in search filter updates sidebar item counts, and status colors visually contrast.
  - Verification Evidence: UI layout rendering check.

---

### TSK-R1-007: turn bubble viewer
- **Title**: Turn Bubble Viewer
- **Linked Requirements**: FR-003
- **Linked Release Slice**: Release R1
- **Size**: 1.0 Day
- **Objective**: Render chronological turns of a conversation inside a bubble layout.
- **Preconditions**: Conversation object has a `turns` array.
- **Implementation Steps**:
  1. Map `turns` collection array from conversation details.
  2. Sort turns numerically based on `sequence_no` to prevent dialogue mixing.
  3. Render turns inside a vertical bubble queue. Distinguish customer message cards from agent message cards using float alignments (e.g. Customer on Left, Agent on Right) and contrasting colors.
  4. Apply smooth scroll into view behaviors for long dialogues.
- **Validation / Verification Command**:
  - `npm run test:e2e`
  - E2E Test ID: [AT-004](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-004).
- **Definition of Done (DoD)**:
  - Conversation bubbles align correctly by speaker type and render in order of sequence numbers.
  - Verification Evidence: Playwright dialogue layout test results.

---

### TSK-R1-008: Toxicity Evaluation Form
- **Title**: Toxicity Evaluation Input Form Elements
- **Linked Requirements**: FR-004
- **Linked Release Slice**: Release R1
- **Size**: 1.5 Days
- **Objective**: Build toxicity evaluation inputs (Toxicity, Category, Risk Level, Evidence phrases).
- **Preconditions**: Workspace page frame is setup.
- **Implementation Steps**:
  1. Build `/src/components/EvaluationForm.jsx` workspace panel.
  2. Render Toxicity Present/Absent radio options.
  3. Render 7-category linguistic risk checkboxes/radios (e.g., Sexual, Violence, Abuse, Hate, etc.). Disable these options if toxicity is marked Absent.
  4. Render Risk Level selectors (Levels 1 to 3). Disable if toxicity is marked Absent.
  5. Render up to 3 evidence phrase input fields allowing evaluators to copy-paste toxic sentences.
  6. Add client-side form validation (Prevent submission if toxicity is Present but categories or risk levels are unselected).
- **Validation / Verification Command**:
  - `npm run test:unit` (Form state validation check)
- **Definition of Done (DoD)**:
  - Submission button remains disabled unless input criteria are satisfied. Marking toxicity Absent disables detail inputs.
  - Verification Evidence: Form components unit tests.

---

### TSK-R1-009: Form Prefill & Submission
- **Title**: Form Prefill & Label Submission Integration
- **Linked Requirements**: FR-004, NFR-001
- **Linked Release Slice**: Release R1
- **Size**: 1.5 Days
- **Objective**: Connect form outputs to Firestore `/conversations/{id}/labels/{userId}` collections and prefill existing evaluations on page reload.
- **Preconditions**: Evaluation form controls are created.
- **Implementation Steps**:
  1. Retrieve active user credentials (`auth.currentUser.uid`).
  2. On conversation selection, fetch existing user label document: `getDoc(doc(db, 'conversations', callId, 'labels', uid))`.
  3. If data is returned, prefill form fields using retrieved values.
  4. On form submit, invoke a batched write transaction that writes the label document, increments the conversation's `label_completion_count` field, and appends an action audit record.
  5. Disable submit actions if the conversation status is locked (`Consensus Reached`).
- **Validation / Verification Command**:
  - `npm run test:e2e`
  - Test IDs: [AT-005](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-005), [AT-006](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-006).
- **Definition of Done (DoD)**:
  - Re-navigating to evaluated calls loads prior fields, and submitting records updates document fields atomically.
  - Verification Evidence: Playwright E2E flow tests success logs.

---

### TSK-R1-010: Admin LLM Import Script
- **Title**: Admin LLM Predictions Import and Mapping
- **Linked Requirements**: FR-005, INT-001
- **Linked Release Slice**: Release R1
- **Size**: 1.5 Days
- **Objective**: Implement model prediction JSON files parsing and mapping execution.
- **Preconditions**: Ingestion schema specs mapped.
- **Implementation Steps**:
  1. Build an import script panel in the Admin page.
  2. Implement parser validator verifying LLM prediction schema structure (requires model ID mapping, target `call_id` link, prediction toxicity categorization, and evidence).
  3. Verify that the file's target `call_id` entries already exist in the `/conversations` collection. Reject records with nonexistent call references.
  4. Write matching records to `/conversations/{call_id}/llm_results/{modelId}` collection.
- **Validation / Verification Command**:
  - `npm run test:unit` (Parser validation specifications check)
  - Integration Test ID: [AT-007](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-007).
- **Definition of Done (DoD)**:
  - Predictions are mapped to pre-uploaded calls, and uploads with invalid IDs return alerts.
  - Verification Evidence: Playwright E2E import results metrics.

---

### TSK-R1-011: Admin Stats Import Panel
- **Title**: Admin Fleiss' Kappa Statistics Upload Ingestion
- **Linked Requirements**: FR-006, INT-001
- **Linked Release Slice**: Release R1
- **Size**: 1.0 Day
- **Objective**: Upload and parse external pre-calculated agreement statistics.
- **Preconditions**: Admin dashboard structure is configured.
- **Implementation Steps**:
  1. Provide a statistics JSON file input controller in `/admin` portal.
  2. Parse statistics schema structure (e.g. Fleiss' Kappa metric values, model F1 accuracy, category scores).
  3. Write parsed statistics variables into `/dashboard/statistics` collection to update system metrics.
- **Validation / Verification Command**:
  - `npm run test:unit` (Schema verification check)
  - Integration Test ID: [AT-008](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-008).
- **Definition of Done (DoD)**:
  - Statistics file ingestion parses numbers and updates the central dashboard statistics document.
  - Verification Evidence: Vitest unit parser tests report.

---

### TSK-R1-012: Consensus Transition Solver
- **Title**: 3-Stage Consensus State Solver
- **Linked Requirements**: FR-004, NFR-001
- **Linked Release Slice**: Release R1
- **Size**: 2.0 Days
- **Objective**: Check and transition conversation status when evaluators complete submissions.
- **Preconditions**: Evaluation form is integrated.
- **Implementation Steps**:
  1. Build a client-side consensus solver module (`src/utils/consensusSolver.js`).
  2. Implement verification function triggered during label commit when `label_completion_count` reaches 3.
  3. Evaluate consensus conditions:
     - Get all 3 user label documents from `/conversations/{id}/labels`.
     - Compare toxicity statuses (Present vs Absent) and categories (category_ids).
     - If all 3 match: status = `"Consensus Reached"`. Create a `/gold_standards/{call_id}` record containing the agreed label values.
     - If any mismatch: status = `"Round 2 Active"` (or `"Round 3 Active"` if Round 2 is skipped).
  4. Execute status updates and `/gold_standards` insertion within a Firestore Transaction.
  5. Write unit tests for all consensus matching and mismatching path permutations.
- **Validation / Verification Command**:
  - `npm run test:unit` (Unit testing state rules)
  - Integration Test ID: [AT-015](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md#AT-015).
- **Definition of Done (DoD)**:
  - Identical evaluations generate gold standards and lock status, while disagreeing entries transition status to active review rounds.
  - Verification Evidence: Vitest solver spec results.

---

### TSK-R1-013: Dashboard Analytics View
- **Title**: Dashboard Analytics & Progress View
- **Linked Requirements**: FR-007, NFR-002
- **Linked Release Slice**: Release R1
- **Size**: 1.5 Days
- **Objective**: Render overall user evaluation progress and pre-calculated statistics graphs.
- **Preconditions**: CSS layouts and scaffolding are configured.
- **Implementation Steps**:
  1. Build `/dashboard` route view.
  2. Retrieve user labeling metrics (completed counts vs total conversations).
  3. Render progress percentage in a glassmorphism progress gauge.
  4. Fetch `/dashboard/statistics` data.
  5. Render comparative statistics charts or styled tables displaying Fleiss' Kappa indices and F1 scores using Vanilla CSS elements.
  6. Implement responsive design ensuring graphs resize gracefully across viewports.
- **Validation / Verification Command**:
  - Manual visual verification of CSS layout and rendering in browser.
  - Manual CSS check: [08_manual_test_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_manual_test_plan.md#MAN-003).
- **Definition of Done (DoD)**:
  - Progress counters compute correctly, and dashboard charts fit within responsive container grid boundaries without layout breakage.
  - Verification Evidence: Browser inspector checklist validation.
