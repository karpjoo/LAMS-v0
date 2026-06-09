# 05 Module Boundaries

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [04_bounded_contexts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_bounded_contexts.md) (BC-001 ~ BC-003)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md) (DC-001 ~ DC-008, ENT-001 ~ ENT-004)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-001 ~ FR-007, SEC-001 ~ SEC-004, OPS-001)
- [05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md) (Option A candidate)

## 3. Boundary Principles
- **Domain Decoupling**: React UI components must not execute raw database mutations directly; all queries and writes route through dedicated repository services.
- **Strict Role Boundaries**: Enforce distinct code paths and access constraints between Evaluator screens and Adjudicator screens to prevent accidental data leakages.
- **Transactional Atomicity**: State changes and corresponding audit logs must be executed atomically inside single transaction or batch writes.
- **Forbidden Circularity**: Shared domain objects and types must reside in a leaf package. Business logic modules must not introduce circular imports.

## 4. Runtime / Container View

In our direct client-to-database serverless architecture, there are two main physical containers:
1. **React Web Application (User Browser)**: Contains all UI, routing, and client-side domain policies. It communicates with Firebase Auth and Firestore.
2. **Firebase Cloud Platform**: Managed database and identity provider.
   - *Firebase Authentication*: Secures user identity sessions.
   - *Cloud Firestore*: Hosts collections (`conversations`, `labels`, `audit_logs`). Enforces data boundaries using custom Firestore Security Rules.

---

## 5. Module / Component Inventory

| Module ID | Name | Responsibility | Owned Domain Concepts | Public Interface | Dependencies | Forbidden Dependencies |
|---|---|---|---|---|---|---|
| MOD-001 | Project Management Module | Manages dataset imports/deletion, LLM predictions loading, dashboard stats. | Conversation, LLM Decision, Dashboard Stats | `importDataset()`, `deleteDataset()`, `importLLMResults()`, `getDashboardProgress()` | MOD-004 (Audit), MOD-005 (Auth) | MOD-002, MOD-003 |
| MOD-002 | Evaluation Module | Provides conversation views and records Evaluator judgments. | Label, Evaluation Round, Toxicity Form | `getConversationsList()`, `getConversationDetail()`, `saveLabel()`, `getEvaluatorProgress()` | MOD-004 (Audit), MOD-005 (Auth) | MOD-001, MOD-003 |
| MOD-003 | Adjudication Module | Resolves disagreements by submitting final Gold Standard Labels. | Gold Standard Label, Adjudication Policy | `getAdjudicationDetail()`, `saveGoldStandardLabel()` | MOD-004 (Audit), MOD-005 (Auth) | MOD-001, MOD-002 |
| MOD-004 | Audit Module | Records immutable system actions. | Audit Log | `createAuditRecord()` | MOD-005 (Auth) | MOD-001, MOD-002, MOD-003 |
| MOD-005 | Auth & Session Module | Enforces user identities and role validations. | User Identity, Roles | `signIn()`, `signOut()`, `getCurrentUser()`, `checkRole()` | None | All other modules |

---

## 6. Module Details

### MOD-001: Project Management Module
#### Responsibility
Coordinates admin operations: dataset ingestion, LLM results ingestion, deletion sequences, and admin progress dashboards.
#### Inputs
- Conversation JSON, LLM Result JSON.
- `skip_round2` system configuration flag.
#### Outputs
- Firestore writes for bulk documents.
- Summary numbers (upload counts, total progress counts) for the Dashboard.
#### Public Interface
- `importDataset(jsonFile)`: Ingests, scans for PII warnings, and writes conversations in batches.
- `deleteDataset(confirmText)`: Checks for "DELETE ALL DATASET" and drops all conversations, labels, and gold standards.
- `importLLMResults(jsonFile)`: Maps model output rows to existing conversations.
- `getDashboardProgress()`: Returns total conversations, progress percentage, and lists of pending/completed counts.
#### Internal Responsibilities
- Parse raw JSON files and run basic validation schemas.
- Trigger PII regex scanner warning if phone numbers match.
#### Related Requirements
FR-001 (Import Dataset), FR-002 (Delete Dataset), FR-005 (Import LLM Results), FR-007 (Dashboard Display), SEC-003 (PII Scan), SEC-004 (Deletion Interlock).
#### Related Domain Concepts
Conversation (DC-001), LLM Decision (DC-004), Bounded Context BC-001.
#### Security / Privacy Notes
- File deletion requires the two-step manual input guard.
- High-level bulk actions must trigger MOD-004 audit logs.
#### Testability Notes
- Mock file imports to test parser resilience.
- Verify bulk write batches roll back fully if a single document fails validation.
#### Data Design Implications
- Relies on bulk batch queries to avoid single-write API throttles.

### MOD-002: Evaluation Module
#### Responsibility
Enables standard evaluators to view assignable conversations and submit/modify their own labels for Round 1 and Round 2.
#### Inputs
- Selected `call_id`.
- Toxicity Evaluation Form (toxicity, category_id, risk_level, evidence_phrases).
#### Outputs
- Label documents written to Firestore.
#### Public Interface
- `getConversationsList(userId)`: Fetches list of active conversations, showing if the user has already completed their label.
- `getConversationDetail(callId)`: Fetches dialog turns for a conversation.
- `saveLabel(callId, toxicityForm)`: Saves/updates the user's label for the current active round.
- `getEvaluatorProgress(userId)`: Returns completed count and pending count for the logged-in evaluator.
#### Internal Responsibilities
- Enforce that a user cannot submit multiple labels for the same conversation/round (`INV-001`).
- Enforce the conditional requirement policy: category and risk are mandatory only if toxicity is Present (`INV-002`).
- Check if consensus is met (`INV-004`) when a label is saved, updating the Conversation status.
#### Related Requirements
FR-003 (List/View Conversations), FR-004 (Record Label Feedback).
#### Related Domain Concepts
Label (DC-003), Bounded Context BC-002.
#### Security / Privacy Notes
- During Round 1, standard queries must filter out other evaluators' labels to enforce blind evaluations (BR-007).
#### Testability Notes
- Verify that saving a label with toxicity=Absent correctly nullifies category and risk level fields.
- Test that saving the 3rd matching label on a conversation triggers the Consensus Reached transition.
#### Data Design Implications
- Requires query structures that allow filtering out other users' draft inputs.

### MOD-003: Adjudication Module
#### Responsibility
Provides the interface and write controllers for designated Adjudicators to view disagreed conversations and save the final Gold Standard Label (Round 3).
#### Inputs
- Selected `call_id` pending adjudication.
- Adjudication toxicity selection form.
#### Outputs
- Gold Standard Label document written to Firestore.
#### Public Interface
- `getAdjudicationDetail(callId)`: Fetches chat turns plus all Round 1/2 labels submitted by all evaluators.
- `saveGoldStandardLabel(callId, goldToxicityForm)`: Commits the final adjudication verdict, locking the conversation.
#### Internal Responsibilities
- Ensure only designated Adjudicators can execute the write command.
- Set conversation state to Consensus Reached and lock the document from downstream changes (`INV-005`).
#### Related Requirements
User Request, BR-010 (Round 3 Adjudication), INV-005 (Adjudicator Finality).
#### Related Domain Concepts
Gold Standard Label (DC-007), Bounded Context BC-002.
#### Security / Privacy Notes
- Restrict read/write execution to authorized Adjudicator sessions.
#### Testability Notes
- Verify that saving the Gold Standard Label blocks standard evaluators from modifying their Round 1/2 labels on that conversation.
#### Data Design Implications
- Writes must target a dedicated `gold_standard` entity/field.

### MOD-004: Audit Module
#### Responsibility
Ensures every critical mutation generates a corresponding, unalterable log record.
#### Inputs
- User context, Action type (upload, delete, label_save, gold_standard_save), Details.
#### Outputs
- Audit log document written to Firestore.
#### Public Interface
- `createAuditRecord(userContext, actionType, details)`: Appends an audit document.
#### Internal Responsibilities
- Format log entries with timestamp, email, uid, and target ID.
- Cooperate with caller transactions to write log records atomically.
#### Related Requirements
OPS-001 (Audit Logs), BR-004 (Append-only Audit).
#### Related Domain Concepts
Audit Log (DC-006, ENT-004), Bounded Context BC-003.
#### Security / Privacy Notes
- Firestore rules must lock this collection to `allow create` only (`INV-003`).
#### Testability Notes
- Verify that attempting to edit or delete any document in this collection via client SDK throws a permission denied error.
#### Data Design Implications
- Keep fields flat and searchable.

### MOD-005: Auth & Session Module
#### Responsibility
Coordinates authentication sessions and role validation.
#### Inputs
- Email and Password credentials.
#### Outputs
- Valid user session state, email, and permission role (Admin/Evaluator/Adjudicator).
#### Public Interface
- `signIn(email, password)`: Authenticates via Firebase.
- `signOut()`: Terminates the session.
- `getCurrentUser()`: Returns authenticated user profiles.
- `checkRole(requiredRole)`: Validates active user permissions.
#### Internal Responsibilities
- Cache active session state locally in memory.
#### Related Requirements
SEC-001 (Auth Boundary), SEC-002 (Write Isolation).
#### Related Domain Concepts
Actors and Roles (ACT-001 ~ ACT-003).
#### Security / Privacy Notes
- Interacts directly with Firebase Auth SDK.
#### Testability Notes
- Verify redirect flags fire when a non-authenticated session attempts to call other services.
#### Data Design Implications
- User profiles can be loaded from a `/users` document mapped to the Firebase Auth UID.

---

## 7. Dependency Rules
- **Layer Direction**: UI Views -> Service/Repository Modules (MOD-001 ~ MOD-003) -> Audit/Auth Modules (MOD-004, MOD-005).
- **Audit Coupling**: All entity mutation methods (in MOD-001, MOD-002, MOD-003) must invoke MOD-004 `createAuditRecord` in the same write transaction.
- **Forbidden Imports**: MOD-001 (Project Management) and MOD-002 (Evaluation) are strictly separated. No component in MOD-002 may call or import MOD-001 code.

---

## 8. Boundary Risks
- **Client-Side Bypass**: A malicious client could bypass MOD-002 UI logic and write labels directly to Firestore.
  - *Mitigation*: The validation rules (like checking that toxicity=Absent requires category=null) must be duplicated inside **Firestore Security Rules** so the database rejects invalid schema shapes even if the client app is bypassed.
- **Role Hijacking**: An evaluator attempts to call MOD-003 methods.
  - *Mitigation*: Firestore rules check user profile metadata before allowing writes to `gold_standard` collections.

---

## 9. Open Questions
- **Q-105 (Admin Progress Detail)**: MOD-001 will expose `getDashboardProgress()` query bindings. We will design the model to return detailed arrays of incomplete call IDs, permitting the Admin dashboard to display exact work gaps if desired.

---

## 10. Handoff to 05c Technical Contracts

### Modules Requiring Public Contracts
- **MOD-001**: Bulk upload and parsing boundaries.
- **MOD-002**: Evaluator reads and label write actions.
- **MOD-003**: Adjudication read (merging previous rounds) and gold standard write.
- **MOD-004**: Audit log write.

### Internal Interfaces That Should Remain Private
- PII Warning scanner parser helper regex logic.
- Local user profile memory caching in MOD-005.

### APIs Likely Needed
- Direct query references to `/conversations`, `/labels`, `/audit_logs`.

### External Integrations Likely Needed
- Firebase Authentication SDK binding.

### Events / Async Workflows Likely Needed
- Client-side event dispatching upon evaluation completion to check consensus and update round states.

### Open Questions Affecting Contracts
- None.

---

## 11. Human Approval Required
- Approval of the 5 module components (MOD-001 ~ MOD-005) and their responsibilities.
- Approval of the client-side module decoupling rules.