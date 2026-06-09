# 05 Architecture Decisions

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Decision Table

| Decision ID | Title | Status | Recommendation | Requires Approval | Related Requirements |
|---|---|---|---|---|---|
| ADR-001 | React + Firebase Direct SDK Serverless Stack | Proposed | Option A (Direct SDK Calls) | Yes | NFR-001, SEC-001 |
| ADR-002 | Offline LLM Ingestion Pipeline | Proposed | Ingest offline LLM result JSON via client upload | Yes | FR-005, INT-001 |
| ADR-003 | 3-Stage Adjudication Workflow Control | Proposed | Client-driven state transitions guarded by rules | Yes | User Request, BR-007 ~ BR-010 |
| ADR-004 | Client-Driven Append-Only Audit Logging | Proposed | Audit writes via batched client transactions | Yes | OPS-001, BR-004, INV-003 |
| ADR-005 | Firestore Security Rules Access Control | Proposed | Direct client database role permissions | Yes | SEC-001, SEC-002, BR-002 |

---

## 3. Decision Records

### ADR-001: React + Firebase Direct SDK Serverless Stack
#### Status
Proposed (Decision Candidate)

#### Context
LAMS-v0 is a small-scale research platform designed for approximately 10 concurrent users (A-101, A-104). We need to select the hosting and data access stack. Implementing a separate middleware backend service introduces deployment overhead.

#### Options Considered
- **Option A**: Pure client-side React app directly calling Firebase Auth and Firestore SDKs.
- **Option B**: React frontend calling a custom Node.js/Express API.

#### Recommendation
We recommend **Option A**. The system scale is small enough that direct client-to-database connections are fully sufficient, minimizing operational overhead while utilizing Firebase's fast hosting and authentication out of the box.

#### Consequences
- No backend code to write or deploy.
- All authorization logic must reside in Firestore Security Rules.
- Frontend services must cleanly modularize query/write triggers to avoid logic bleed.

#### Risks
- Exposing Firestore directly requires extremely strict rules to prevent unauthorized reads/writes.
- Mitigated by covering Firestore Rules with exhaustive emulator tests in Stage 8.

#### Related Requirements
NFR-001 (Data Integrity), SEC-001 (Authentication Boundary).

#### Related Domain Concepts
Conversation (DC-001), Label (DC-003).

#### Human Approval Needed
Yes.

---

### ADR-002: Offline LLM Ingestion Pipeline
#### Status
Proposed (Decision Candidate)

#### Context
LLM evaluations and statistical processing are run offline (Option B selected in Stage 0). The system needs to ingest this data without executing real-time inferences.

#### Options Considered
- **Option A**: Implement client-side API integrations to model inference endpoints.
- **Option B**: Admin uploads batch JSON result files containing model outputs mapped to `call_id`.

#### Recommendation
We recommend **Option B**. Since real-time inference is out of scope, the system only needs a parser to load pre-calculated model decisions and map them to matching conversation documents.

#### Consequences
- Simplifies UI. No API keys or rate limits to manage in-app.
- The upload parser must validate that target `call_id`s already exist in the database (BR-005).

#### Risks
- Stale data or incorrect file schemas could fail during parsing.
- Mitigated by implementing client-side validation logic and descriptive error boundaries (NFR-003).

#### Related Requirements
FR-005 (Import LLM Results), INT-001 (JSON Schema Conformance).

#### Related Domain Concepts
LLM Decision (DC-004).

#### Human Approval Needed
Yes.

---

### ADR-003: 3-Stage Adjudication Workflow Control
#### Status
Proposed (Decision Candidate)

#### Context
A 3-stage consensus flow is required: Round 1 (blind evaluations), Round 2 (opinion sharing on mismatch), and Round 3 (Adjudicator final decision). The system must control transitions based on user role and system configuration (e.g. `skip_round2` setting).

#### Options Considered
- **Option A**: Client-side state calculation during submission. On final submission of a round, client queries the round outcomes, evaluates consensus, and updates conversation status.
- **Option B**: Firebase Cloud Function triggers (backend Firestore hooks).

#### Recommendation
We recommend **Option A**. Given the low concurrency (A-104), client-side transaction updates are fast, reliable, and cost-effective. Writes will use Firestore Batches to update both the label and the parent conversation status atomically.

#### Consequences
- Keeps stack serverless and cheap.
- Transition rules (`ST-001` ~ `ST-007`) are evaluated inside client-side services.

#### Risks
- Concurrent labeling conflicts could theoretically cause race conditions.
- Mitigated by A-104 (only ~10 users, conflicts are rare) and using database transactions where critical.

#### Related Requirements
User Request, BR-007 ~ BR-010.

#### Related Domain Concepts
Adjudication Policy (DC-008), Evaluation Round Info (VO-004).

#### Human Approval Needed
Yes.

---

### ADR-004: Client-Driven Append-Only Audit Logging
#### Status
Proposed (Decision Candidate)

#### Context
Every database mutation (dataset upload, delete, label submission) must generate an immutable audit log record.

#### Options Considered
- **Option A**: Client writes the audit log document within the same atomic Firestore Batch/Transaction as the primary entity change.
- **Option B**: Firestore Cloud Trigger listens to collection changes and writes to audit logs.

#### Recommendation
We recommend **Option A**. In a pure client-side serverless application, using atomic batches ensures that the audit log write and the primary write succeed or fail together, maintaining integrity (NFR-001).

#### Consequences
- No cloud function triggers required.
- Firestore Security Rules must permit ONLY `create` actions on `/audit_logs` (INV-003).

#### Risks
- If a developer writes code that skips the audit log write, security is compromised.
- Mitigated by structuring a unified repository/service wrapper in the frontend that forces audit logging on all modifications.

#### Related Requirements
OPS-001 (Audit Logs), BR-004 (Append-only Audit), INV-003 (Immutable Audit).

#### Related Domain Concepts
Audit Log (DC-006, ENT-004).

#### Human Approval Needed
Yes.

---

### ADR-005: Firestore Security Rules Access Control
#### Status
Proposed (Decision Candidate)

#### Context
Direct database connection requires a secure method to prevent evaluators from reading other evaluators' active labels or altering system settings.

#### Options Considered
- **Option A**: Enforce all permissions directly via Firestore Security Rules using custom claims and document fields.
- **Option B**: Rely on frontend UI masking (unsecure).

#### Recommendation
We recommend **Option A**. Firestore Security Rules will validate that `request.auth != null`, verify user roles (via an admin-controlled user profile or claims), and restrict label writes to matching `request.auth.uid`.

#### Consequences
- High-fidelity security boundary that protects database access even if the client application code is compromised.
- Round 1 evaluator blind-spots (BR-007) are enforced at the query level by blocking access to other users' labels in rules.

#### Risks
- Rules syntax bugs can lock users out or leak data.
- Mitigated by strict unit tests against local Firebase Emulators.

#### Related Requirements
SEC-001 (Auth Boundary), SEC-002 (Evaluator Isolation), BR-002.

#### Related Domain Concepts
Write Isolation Policy (DSP-002).

#### Human Approval Needed
Yes.