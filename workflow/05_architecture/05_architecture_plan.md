# 05 Architecture Plan

## 1. Status
- **Status**: Draft (Decision Candidates Proposed)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md) (G-001 ~ G-004)
- [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md) (ROLE-001, ROLE-002)
- [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md) (RISK-001 ~ RISK-003)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-001 ~ FR-007, SEC-001 ~ SEC-004, NFR-001 ~ NFR-003, OPS-001)
- [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- [04_ubiquitous_language.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_ubiquitous_language.md)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md) (DC-001 ~ DC-008, ENT-001 ~ ENT-004, VO-001 ~ VO-004)
- [04_bounded_contexts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_bounded_contexts.md) (BC-001 ~ BC-003)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md) (BR-001 ~ BR-010, INV-001 ~ INV-005, ST-001 ~ ST-007)
- [04_domain_events.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_events.md)
- [04_domain_risk_notes.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_risk_notes.md)
- [04_domain_traceability_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_traceability_matrix.md)

## 3. Architecture Drivers

### 3.1 Business Goal Drivers
- **Support Toxicity Research (G-001, G-002)**: Enable systematic dataset ingestion and manual labeling rounds to generate high-fidelity gold standard datasets for call center toxicity model evaluations.
- **Model vs Human Comparison (G-003, G-004)**: Dashboard tracking and offline ingestion of LLM predictions for detailed comparative analysis.

### 3.2 Functional Drivers
- **Dataset Import/Deletion (FR-001, FR-002)**: Idempotent bulk registration and a guarded 2-step deletion sequence.
- **Shared Evaluation Workspace (FR-003, FR-004)**: Bubble-chat style UI prefilled with the user's previous labels, supporting multiple evaluation rounds.
- **Expert Adjudication (User Request, BR-007 ~ BR-010)**: Non-linear escalation across Round 1 (independent), Round 2 (opinion sharing), and Round 3 (Adjudicator exclusive final decision).

### 3.3 Non-Functional Drivers
- **Stability & Stability First (NFR-001)**: Relies on atomic database writes (Firestore Batches/Transactions) to prevent partial data states.
- **Premium Aesthetics (NFR-002)**: Hand-coded Glassmorphism visual cues, custom CSS gradients, Google fonts (Outfit/Inter), and cross-device responsive layouts without relying on TailwindCSS.
- **Robustness (NFR-003)**: Application runtime resiliency using React Error Boundaries and fail-safe JSON parsers.

### 3.4 Security / Privacy Drivers
- **Direct Auth Guard (SEC-001)**: Strictly rejects non-authenticated traffic via Firestore Security Rules.
- **Evaluator Write Isolation (SEC-002, BR-002)**: Evaluators can only create or update their own Label documents.
- **PII Warning Interlock (SEC-003, BR-001)**: Client-side scanner that warns admins if phone numbers or names are found in raw uploads before they hit the database.
- **Adjudicator Exclusivity (BR-010, INV-005)**: Only the Adjudicator can commit Gold Standard Labels, locking final verdicts from downstream modification.

### 3.5 Domain Drivers
- **Aggregates & Invariants**:
  - `Conversation` Aggregate (ENT-001) protects consistency of Turns, LLM results, and the Gold Standard Label.
  - `Label` Aggregate (ENT-002) enforces `INV-001` (one label per user/round/conversation) and `INV-002` (conditional category/risk mapping when toxicity is Present).
  - `Audit Log` Aggregate (ENT-004) enforces `INV-003` (Append-only write-once behavior).
- **Domain Events**: Handled client-side to coordinate audit log generation and status checks without external message brokers.

### 3.6 Operational Drivers
- **Append-only Auditing (OPS-001, BR-004)**: Ensures every dataset alteration (upload, delete), evaluation save, and adjudication decision is logged in a secure, immutable log collection.

---

## 4. System Context

The system utilizes a client-first, serverless architecture using React (Single Page Application) directly communicating with Firebase Services.

```text
                  +----------------------------------------------+
                  |               Client Browser                 |
                  |                                              |
                  |  +-------------+  +------------+  +-------+  |
                  |  | React App   |  | CSS/Visual |  | PII   |  |
                  |  | (Dashboard, |  | Styles     |  | Scan  |  |
                  |  |  Workspace) |  | (Outfit)   |  | Regex |  |
                  |  +------+------+  +------------+  +---+---+  |
                  +---------|-----------------------------|------+
                            |                             |
                            | Firestore SDK               | Client-side Import
                            v                             v
               +------------+------------+          [ Local Files ]
               |     Firebase Services   |          - Conversation JSON
               |                         |          - LLM Results JSON
               |  +-------------------+  |
               |  | Firestore Security|  |
               |  | Rules (Auth Guard)|  |
               |  +---------+---------+  |
               |            |            |
               |  +---------v---------+  |
               |  | Firestore DB      |  |
               |  | - conversations   |  |
               |  | - labels          |  |
               |  | - audit_logs      |  |
               |  +-------------------+  |
               |  +-------------------+  |
               |  | Firebase Auth     |  |
               |  +-------------------+  |
               +-------------------------+
```

### 4.1 Actors
- **Admin (ROLE-001)**: Directs dataset lifecycle, LLM data uploads, account provisioning, and configures the `skip_round2` setting.
- **Evaluator (ROLE-002)**: Inspects call-center chats and fills out toxicity evaluation sheets.
- **Adjudicator (Role Group)**: Resolves disagreements in Round 3 by reviewing previous rounds and submitting the Gold Standard Label.

### 4.2 External Systems
- **Firebase Auth**: Identity provider enforcing authentication sessions.
- **Local Files**: Ingested directly in-browser. No backend API servers.

### 4.3 System Boundary
- The LAMS-v0 React frontend application and its direct bindings to the Firestore database.

### 4.4 Out-of-Scope Systems
- **Real-Time LLM Inference**: All LLM predictions are run offline and uploaded.
- **Statistical Analytics Engines**: Kappa statistics calculations are performed outside LAMS-v0. LAMS-v0 only renders data uploaded or gathered.
- **Automated Masking Pipeline**: Text obfuscation must be completed prior to upload.

---

## 5. Constraints
- **React + Classic Firebase Serverless Stack**: No middle layer, serverless function bindings, or Node.js backend.
- **Vanilla CSS (No Tailwind)**: Visual rules must be defined via standard CSS declarations.
- **Direct Client-to-DB Security Rules**: Database rules must serve as the primary firewall blocking unauthorized reads/writes.
- **Append-only Auditing**: Administrative security locks that prevent logging edits or deletions.

---

## 6. Architecture Options Considered

### Option A: Pure Client-side Serverless (React + Firebase Direct SDK) [RECOMMENDED]
- **Summary**: React frontend makes direct Firebase Web SDK queries. Firebase Authentication secures sessions, and Firestore Security Rules protect data boundaries.
- **Fit with Requirements**: Excellent. Fits A-201 and eliminates middle-tier maintenance.
- **Security Implications**: High dependency on correctly written Firestore Security Rules.
- **Complexity**: Low. Rapid deployment.
- **Risks**: Logic leaking into UI. Managed by structuring a clean, modular service/repository layer in the frontend codebase.

### Option B: Node.js Backend Serverless (React + Firebase Functions + Firestore)
- **Summary**: All Firestore writes route through Firebase Cloud Functions (HTTPS API).
- **Fit with Requirements**: Over-engineered. Fails A-201's "directly calling serverless stack" model.
- **Complexity**: Medium. Requires maintaining cloud function entrypoints and increases latency.
- **Reasons to Reject**: Does not fit the "directly calls" constraint, adding unnecessary integration overhead for 10 concurrent users (A-101).

---

## 7. Recommended Architecture Direction
- **Recommended Direction**: **Option A (Pure Client-side Serverless)** is proposed as the `Decision Candidate`.
- **Module Structure**: Split the React application into a clean service boundary:
  - Repository/Service layers for Firestore interactions.
  - Domain policies (PII Scan, Adjudication State Control) isolated from React components.
- **Auth Guard**: Direct Firestore Security Rules checking `request.auth != null` and mapping user roles via Custom Claims or user profile document references.

---

## 8. Data Design Implications for Stage 6
- **Subcollections**: Conversations will own `labels` and `llm_decisions` as nested subcollections to preserve the `call_id` aggregation boundary.
- **Audit Logs**: A root collection `/audit_logs` where writes are permitted only as `create` actions.
- **Gold Standard**: A sub-document or specific property directly within `/conversations/{call_id}` to support clean 1:1 binding and locking.

---

## 9. Test Strategy Implications for Stage 8
- **Firestore Emulator Testing**: Security rules validation must be run in the Firestore Emulator to verify read/write blocks on different roles (Admin, Evaluator, Adjudicator).
- **Client Service Mocks**: Mock services in unit testing to validate the 3-stage adjudication state machine transition.

---

## 10. Risks and Trade-Offs
- **Security Rules Risk**: A bug in Firestore Security Rules can expose the database.
  - *Mitigation*: Rigorous emulator-based rules testing in Stage 8.
- **Client-Side Heavy Logic**: Business rule calculations (e.g. evaluating if 3 opinions match) happen in the client script.
  - *Mitigation*: Write clean, non-UI domain functions and cover them with local unit tests.

---

## 11. Open Questions
- **AQ-001 (Admin Progress Detail)**: Should the database structure support querying incomplete files by evaluator to allow individual 진척도 queries, or is aggregate numbers sufficient?
  - *Assumption*: We will store evaluation statuses in a queryable format to enable this.

---

## 12. Handoff to 05b System & Module Boundaries

### Architecture Direction Candidate
- Pure client-side serverless (React + Firebase SDK).

### Drivers That Shape Module Boundaries
- Role access restrictions (Evaluator isolation vs Adjudicator exclusivity).
- Dataset operations (Admin-only uploads and 2-step deletion interlock).

### Domain Boundaries to Preserve
- Separation of Project Management (Admin tools/Dashboard), Toxicity Evaluation (Labeling/Escalation), and Audit (Append-only logging).

### Constraints for Module Design
- Client-side execution only. Modular service layer to keep components decoupled from direct database SDK objects.