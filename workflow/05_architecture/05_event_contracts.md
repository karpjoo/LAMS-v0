# 05 Event Contracts

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [04_domain_events.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_events.md)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md) (INV-004, ST-002 ~ ST-007)
- [05_module_boundaries.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_module_boundaries.md) (MOD-004)

## 3. Event / Async Design Principles
- **No Physical Message Brokers**: In accordance with approved constraints (A-201, Do Not Do #4), LAMS-v0 does not use external messaging systems (like Kafka, RabbitMQ, or Pub/Sub). All events are implemented as **Client-Side Application Events** or **Atomic Database Write Bundles**.
- **Transactional Audit Triggers**: Every mutation event requires writing an audit record within the same Firestore Batch write, ensuring atomicity.
- **Client-Driven State Transitions**: The React UI evaluates consensus conditions and initiates state transition updates directly in the database.

---

## 4. Event Inventory

| Event ID | Event Name | Producer | Consumer | Trigger | Related Domain Event |
|---|---|---|---|---|---|
| EVT-001 | Dataset Ingestion Completed | MOD-001 | MOD-004 (Audit) | Bulk dataset upload completes successfully | `DatasetImported` |
| EVT-002 | Dataset Purged | MOD-001 | MOD-004 (Audit) | Admin dataset deletion sequence executes | `DatasetDeleted` |
| EVT-003 | Evaluator Label Saved | MOD-002 | MOD-004 (Audit), MOD-002 | Evaluator saves toxicity evaluation form | `LabelSaved` |
| EVT-004 | Consensus Reached | MOD-002 | MOD-004 (Audit), MOD-001 | Three evaluators' responses match perfectly | `GoldStandardLabelEstablished` |
| EVT-005 | Adjudication Completed | MOD-003 | MOD-004 (Audit), MOD-001 | Adjudicator submits final Round 3 label | `GoldStandardLabelEstablished` |

---

## 5. Event Details

### EVT-001: Dataset Ingestion Completed
#### Producer
MOD-001 (Project Management Module)
#### Consumer
MOD-004 (Audit Module)
#### Trigger
Bulk import transaction succeeds.
#### Payload Summary
- `filename`: String (name of source JSON file)
- `import_count`: Integer (count of conversations created)
- `timestamp`: Timestamp
- `operator_email`: String
#### Delivery Expectations
Atomic with dataset writes.
#### Ordering Requirements
N/A
#### Idempotency Requirements
Ensure duplicate events do not create multiple duplicate audit log entries.
#### Retry / Dead-Letter Handling
If the Firestore write fails, the entire batch rolls back, preventing partial logs.
#### Observability Expectations
Audited in `/audit_logs`.
#### Related Requirements
FR-001, OPS-001.
#### Related Domain Concepts
Conversation (DC-001).
#### Test Implications
- Check that the exact import count is accurately recorded in the audit log.

### EVT-002: Dataset Purged
#### Producer
MOD-001 (Project Management Module)
#### Consumer
MOD-004 (Audit Module)
#### Trigger
Admin types confirmation text and triggers purge command.
#### Payload Summary
- `timestamp`: Timestamp
- `operator_email`: String
- `records_deleted`: Integer
#### Delivery Expectations
Atomic block write.
#### Related Requirements
FR-002, OPS-001.

### EVT-003: Evaluator Label Saved
#### Producer
MOD-002 (Evaluation Module)
#### Consumer
MOD-004 (Audit Module), MOD-002 (Consensus Check)
#### Trigger
An evaluator saves a Toxicity Evaluation form.
#### Payload Summary
- `call_id`: String
- `user_id`: String
- `round_no`: Integer
- `toxicity`: String
- `timestamp`: Timestamp
#### Delivery Expectations
Atomic write.
#### Internal Processing
Upon receipt, MOD-002 triggers local checks to scan all submitted labels for the conversation's active round. If 3 labels exist:
  - If their toxicity and categories match 100%: Fire **EVT-004 (Consensus Reached)**.
  - If they mismatch and `skip_round2 == false`: Update conversation to Round 2.
  - If they mismatch and `skip_round2 == true`: Update conversation to Round 3.
#### Related Requirements
FR-004, OPS-001.
#### Related Domain Concepts
Label (DC-003), Invariant `INV-001`, `INV-002`.

### EVT-004: Consensus Reached
#### Producer
MOD-002 (Evaluation Module)
#### Consumer
MOD-004 (Audit), MOD-001 (Dashboard)
#### Trigger
3 evaluators' toxicity choices and categories match perfectly in Round 1 or 2 (`INV-004`).
#### Payload Summary
- `call_id`: String
- `consensus_round`: Integer
- `resolved_toxicity`: String
- `resolved_category_id`: Integer
- `timestamp`: Timestamp
#### Delivery Expectations
Executed within the transaction completing the final matching label.
#### Related Requirements
User Request, INV-004.
#### Related Domain Concepts
Gold Standard Label (DC-007).

### EVT-005: Adjudication Completed
#### Producer
MOD-003 (Adjudication Module)
#### Consumer
MOD-004 (Audit), MOD-001 (Dashboard)
#### Trigger
Adjudicator submits final Round 3 label.
#### Payload Summary
- `call_id`: String
- `adjudicator_id`: String
- `resolved_toxicity`: String
- `timestamp`: Timestamp
#### Related Requirements
User Request, BR-010, INV-005.

---

## 6. Async Failure Handling
Since events are synchronous client-side transactions, transient connection drops are managed directly by Firestore SDK's local database operations queue. The app will show offline status indicators to notify users that sync is pending.

---

## 7. Open Questions
- None.

---

## 8. Human Approval Required
- Approval of client-side transactional coordination for database events (no Pub/Sub middleware).
