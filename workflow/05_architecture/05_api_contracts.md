# 05 API Contracts

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md) (DC-001 ~ DC-008)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-001 ~ FR-007, SEC-001, SEC-002)
- [05_module_boundaries.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_module_boundaries.md) (MOD-001 ~ MOD-005)

## 3. API Design Principles
- **Direct Database Interface**: As per ADR-001, there is no HTTP REST or gRPC middleware. "APIs" are modeled directly as **Firestore Document Queries & Write Transactions** from the React frontend client.
- **Role Validation**: All access routes are gated by Firestore Security Rules checking user roles derived from user record lookups.
- **Atomic Batch Mutations**: Operations that modify multiple entities (e.g. creating a label and upgrading conversation status) must be bundled into a single atomic write transaction.

---

## 4. API Inventory

| API ID | Operation | Requester Role | Purpose | Related Requirement | Related Module |
|---|---|---|---|---|---|
| API-001 | Fetch Bounded Conversations | ROLE-001, ROLE-002 | Fetches conversations list filtered/paginated | FR-003, FR-007 | MOD-001, MOD-002 |
| API-002 | Fetch Conversation Details | ROLE-001, ROLE-002 | Retrieves single conversation document with nested turns | FR-003 | MOD-002, MOD-003 |
| API-003 | Save Evaluator Label | ROLE-002 (Evaluator) | Writes or updates a Label document for the active round | FR-004 | MOD-002 |
| API-004 | Save Adjudicator Label | Adjudicator | Commits Gold Standard Label and locks conversation state | User Request | MOD-003 |
| API-005 | Ingest Dataset | ROLE-001 (Admin) | Performs batch create of conversations and model results | FR-001, FR-005 | MOD-001 |
| API-006 | Clear All Datasets | ROLE-001 (Admin) | Deletes all conversations, labels, and audit logs | FR-002 | MOD-001 |

---

## 5. API Contract Details

### API-001: Fetch Bounded Conversations
#### Purpose
Load list of conversations for evaluation workspace or admin dashboard metrics.
#### Method / Interaction Type
Firestore Collection Query (GET)
#### Path / Operation Name
`/conversations`
#### Owning Module
MOD-002 (Evaluation Module)
#### Requester Role
ROLE-001 (Admin), ROLE-002 (Evaluator)
#### Authorization Rule
Authenticated session required (`request.auth != null`). No role restrictions on basic listing, but query filters restrict rows depending on active assignments.
#### Request Summary
- **Filters**:
  - `status`: String (e.g., `"Round 1 Active"`, `"Round 2 Active"`, `"Round 3 Active"`, `"Consensus Reached"`).
- **Sorting**: `call_id` ascending.
- **Pagination**: Limit to 50 items per page.
#### Response Summary
- Array of conversation documents containing:
  - `call_id`: String (Key)
  - `status`: String
  - `created_at`: Timestamp
  - `label_completion_count`: Integer
#### Validation Rules
- Invalid or missing parameters default to returning first 50 conversations.
#### Error Cases
- **Unauthenticated (Permission Denied)**: Handled by Firestore Security Rules, triggers error screen.
#### Idempotency / Retry Notes
- Idempotent read. No retry limit.

### API-002: Fetch Conversation Details
#### Purpose
Load full bubble-chat dialog script along with LLM prediction metrics.
#### Method / Interaction Type
Firestore Document Read (GET)
#### Path / Operation Name
`/conversations/{call_id}`
#### Owning Module
MOD-002 (Evaluation Module)
#### Requester Role
ROLE-001 (Admin), ROLE-002 (Evaluator)
#### Authorization Rule
Authenticated session.
#### Request Summary
- Document ID matching `call_id`.
#### Response Summary
- Conversation document fields:
  - `call_id`: String
  - `status`: String
  - `turns`: Array of map objects:
    - `sequence_no`: Integer
    - `speaker`: String (`"customer"` / `"agent"`)
    - `text`: String (pre-masked)
  - `llm_results`: Map of model names to evaluation map (toxicity, category, risk, reasoning).
#### Validation Rules
- If document does not exist, throw 404 Entity Not Found error in client routing.
#### Error Cases
- **Not Found**: Client shows "Conversation not found" message.
#### Test Implications
- Verify turns array renders in exact sequence_no order.

### API-003: Save Evaluator Label
#### Purpose
Create or overwrite the logged-in evaluator's label document for the current round.
#### Method / Interaction Type
Firestore Document Write (PUT/UPSERT)
#### Path / Operation Name
`/conversations/{call_id}/labels/{user_id_round_no}`
#### Owning Module
MOD-002 (Evaluation Module)
#### Requester Role
ROLE-002 (Evaluator)
#### Authorization Rule
- Authenticated user writing to their own record (`request.auth.uid == user_id`).
- Write is blocked if the parent conversation status is `"Consensus Reached"` (INV-005).
#### Request Summary
- Document fields:
  - `call_id`: String
  - `user_id`: String (matches auth uid)
  - `round_no`: Integer (1 or 2)
  - `toxicity`: String (`"Present"` / `"Absent"`)
  - `category_id`: Integer or null
  - `risk_level`: Integer or null
  - `evidence_phrases`: Array of strings
  - `submitted_at`: Timestamp
#### Response Summary
- Success confirmation.
#### Validation Rules
- **INV-002**: If `toxicity` is `"Present"`, then `category_id` (1-7), `risk_level` (1-3), and `evidence_phrases` (non-empty) are mandatory.
- If `toxicity` is `"Absent"`, then `category_id` and `risk_level` must be `null` and `evidence_phrases` must be empty.
#### Error Cases
- **Validation Failed**: Write rejected client-side before commit, or rejected database-side by Firestore rules.
- **Post-Consensus Write Blocked**: Security rules reject write if conversation status is already locked.
#### Idempotency / Retry Notes
- Upsert is idempotent.

### API-004: Save Adjudicator Label
#### Purpose
Designated Adjudicator commits the final consensus verdict (Round 3), creating the Gold Standard document and locking the conversation.
#### Method / Interaction Type
Firestore Atomic Batch Write (POST)
#### Path / Operation Name
- Create document: `/conversations/{call_id}/gold_standard/verdict`
- Update document: `/conversations/{call_id}` (set `status` to `"Consensus Reached"`)
- Create document: `/audit_logs/{log_id}` (log final label)
#### Owning Module
MOD-003 (Adjudication Module)
#### Requester Role
Adjudicator
#### Authorization Rule
- Authenticated user checks user profile to ensure their record matches designated Adjudicator status.
- Rejected for normal Evaluators.
#### Request Summary
- Gold Standard fields:
  - `call_id`: String
  - `adjudicator_id`: String (matches auth uid)
  - `toxicity`: String
  - `category_id`: Integer or null
  - `risk_level`: Integer or null
  - `evidence_phrases`: Array of strings
  - `finalized_at`: Timestamp
#### Response Summary
- Success confirmation.
#### Validation Rules
- Standard toxicity mapping schema check (`INV-002`).
#### Error Cases
- **Non-Adjudicator Session**: Write rejected by database rules.
#### Test Implications
- Ensure all 3 updates (GoldStandard document, Conversation status, Audit log) are executed in a single atomic Firestore Batch.

### API-005: Ingest Dataset
#### Purpose
Load a batch of conversation records.
#### Method / Interaction Type
Firestore Bulk Write (POST)
#### Path / Operation Name
`/conversations/{call_id}`
#### Owning Module
MOD-001 (Project Management Module)
#### Requester Role
ROLE-001 (Admin)
#### Authorization Rule
- Admin privilege check.
#### Request Summary
- Array of conversation entities to create.
#### Response Summary
- Number of successfully written entities.
#### Validation Rules
- Schema conformant check.
- **BR-006**: If a `call_id` already exists, skip or merge preserving existing human labels (do not blindly overwrite).
#### Error Cases
- **JSON Syntax Error**: Caught client-side.
- **Duplicate call_id**: Triggers merge logic rather than overwriting.

### API-006: Clear All Datasets
#### Purpose
Purge all datasets, user labels, and gold standards during workspace resets.
#### Method / Interaction Type
Firestore Batch Deletes (DELETE)
#### Path / Operation Name
Delete all items in `/conversations`, `/labels`
#### Owning Module
MOD-001 (Project Management Module)
#### Requester Role
ROLE-001 (Admin)
#### Authorization Rule
- Admin privilege check.
#### Request Summary
- Confirm text validation (`confirmText == "DELETE ALL DATASET"`).
#### Response Summary
- Purge status.
#### Validation Rules
- Fails immediately if confirmText does not match.

---

## 6. API-Level Error Policy
- **Validation Rejections (Client-Side)**: Client throws localized alerts and leaves forms open for user corrections.
- **Permission Rejections (DB-Side)**: Database-driven errors trigger a React Error Boundary screen, logging the event as a security alert.
- **Retry Mechanism**: In case of transient internet dropouts, write queries will queue locally using Firestore Offline persistence.

---

## 7. API-Level Security / Privacy Notes
- Evaluators cannot query labels belonging to other users during Round 1.
- All writes to `/audit_logs` must be transactionally paired with the originating mutate API call.

---

## 8. Open Questions
- None.

---

## 9. Human Approval Required
- Approval of the Firestore direct Collection/Document schemas as our technical API interface contract.
- Approval of the transition logic validating schema structures inside database rules.