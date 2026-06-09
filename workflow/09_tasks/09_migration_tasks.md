# 09 Migration Tasks

## 1. Scope Basis
This document details database schema, local database emulator configuration, collections provisioning, and mock data seeding for **Release R1** of LAMS-v0.

## 2. Task ID Convention
Tasks trace back to [09_task_inventory.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_inventory.md).

## 3. Database / Collection Provisioning Tasks
The following tasks from the inventory manage database structure, emulator environment setups, and mock profile seeds:

### TSK-R1-001: Firebase Local Emulator Setup & Collection Provisioning
- **Summary**: Establish local offline sandboxes for Firestore and Auth. Configure environment endpoints and startup scripts.
- **Linked Files**: `firebase.json`, `firestore.rules`, `src/firebase.js`.
- **Preconditions**: Firebase CLI is installed locally.
- **Seeding/Fixture Configuration**:
  - Configure Auth emulator with test profiles: Admin (`test-admin`), Evaluators (`test-eval-1`, `test-eval-2`, `test-eval-3`), and Adjudicator (`test-adjudicator`).
  - Configure Firestore emulator to pre-populate `/users` profile collections with corresponding roles mapping.
- **Verification Command**: `npm run emulators`
- **Expected Success Signal**: Terminal outputs active ports for local emulator components, and UI admin view connects without external network requests.

---

## 4. Migration & Seeding Scenarios

### Ingestion Migration
- File uploads (`TSK-R1-003` and `TSK-R1-004`) function as active migration utilities. Re-uploading a dataset uses a merge operation to preserve existing user labeling records (`BR-006` merge idempotency).

### Rollback Plan
- If a data ingest transaction fails during a batch write, the client-side transaction framework rollbacks all partial inserts immediately to prevent data fragmentation.
- If data corruption occurs, the Admin can perform a complete rollback/reset using `TSK-R1-004` (Delete database interlock command) and re-upload the clean dataset JSON source.
