# 09 Security & Privacy Tasks

## 1. Scope Basis
This document coordinates all security, access control, privacy scanning, and audit logging tasks for the LAMS-v0 project.

## 2. Task ID Convention
Tasks trace back to [09_task_inventory.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_inventory.md).

## 3. Access Control & Authorization Tasks

### TSK-R0-003: Routing & AuthGuard
- **Summary**: Direct routing paths and prevent unauthenticated sessions from accessing private endpoints.
- **Access Rule**: Guest sessions navigation redirects automatically to `/login`.

### TSK-R1-002: Firestore Security Rules Invariants
- **Summary**: Implement server-side collection rules to enforce write isolation, audit trails preservation, and blind-spot blocks.
- **Rules Definitions**:
  - `allow read, write: if request.auth != null;` (Blocks anonymous REST calls).
  - `allow write: if request.auth.uid == userId;` on `calls/{id}/evaluators/{userId}` subcollection (Ensures write isolation).
  - `allow update, delete: if false;` on `audit_logs` collection (Guarantees append-only audit trail).
  - Read access to `calls/{id}/evaluators/{otherUserId}` returns `permission-denied` if call status is `'Round 1 Active'` (Round 1 blind-spot block).
- **Verification Command**: `npm run test:rules` (AT-005, AT-012, AT-013, AT-014, AT-015 rules spec test cases).

---

## 4. Privacy & PII Protection Tasks

### TSK-R1-003: Client-side PII Regex Scanner
- **Summary**: Implement a client-side scan on dataset uploads to warn admins before committing phone number sequences to the database.
- **Scan Match Pattern**: Domestic mobile phone sequences matching `010-\d{4}-\d{4}` (with or without hyphen sequences).
- **Verification Command**: `npm run test:unit` (AT-011 test data input checks).

---

## 5. Audit Logging Tasks

### TSK-R1-005: Append-only Action Auditor
- **Summary**: Write a transaction auditor helper class that atomically logs critical administrative and labeling actions to `/audit_logs`.
- **Logged Events**:
  - `Upload Dataset` (Admin, call count metadata)
  - `Delete Dataset` (Admin, complete initialization metadata)
  - `Save Label` (Evaluator, target call_id link)
- **Security Check**: Modify/Delete permissions on these log records are completely blocked in Firestore rules.
