# LAMS-v0 Release Notes (v0.1.0-MVP)

## 1. Release Summary
LAMS-v0 is a lightweight research tool built using React and Classic Firebase Serverless architecture. Version v0.1.0-MVP delivers the core 3-stage expert consensus labeling workflow, dialogue dataset uploader controls, offline statistics visualization dashboard, and Firestore database security protections.

## 2. Included Changes

### Architecture & Foundation
- Setup Vite React development scaffold and Vanilla CSS custom design tokens theme.
- Configured AuthGuard context to isolate protected routes (`/workspace`, `/admin`, `/dashboard`) for non-logged-in users.

### Dataset Management
- Admin dashboard file uploader parsing CSV/JSON datasets.
- Deletion interlock confirm requiring exact text validation string.
- Cascade reset behavior wiping nested sub-collections recursively.

### Evaluation Workspace
- EvaluationForm renders radio selection matrices, custom annotations inputs, and text evidence excerpts.
- Navigation sidebar listing conversations with search/filtering capabilities.
- Chronological speaker turns bubble alignment.

### Consensus Solver
- Three-evaluator consensus solver determining consensus status (`Consensus Reached`, `Round 2 Active`, `Round 3 Active`) via Firebase transaction updates.
- Designated Adjudicator review view for resolving Round 3 disagreements.

### Analytics & Logging
- Append-only write protection on `/audit_logs` collection.
- Native inline SVG graphs and progress bars.

## 3. Known Limitations
- dynamic Cohen's/Fleiss' Kappa metrics are calculated offline and uploaded rather than computed on-the-fly.
- No direct database encryption or masking inside web app; files must be de-identified before ingestion.

## 4. Operator Notes
- Firebase emulator suite ports (8080 and 9099) must be free locally during development tests.
- Initial user profiles (`role: Admin / Evaluator / Adjudicator`) must be pre-populated under the `/users` collection manually.
