# 05 Integration Contracts

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (INT-001, SEC-001)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md) (EXT-001, EXT-003)
- [05_module_boundaries.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_module_boundaries.md) (MOD-005)

## 3. Integration Inventory

| Integration ID | External System | Direction | Purpose | Data Exchanged | Risk Level |
|---|---|---|---|---|---|
| INT-001 | Firebase Authentication SDK | Bidirectional | Verifies active user identities and matches roles | ID token credentials, user profiles | Low |
| INT-002 | Offline Dataset Ingestion | Inbound (JSON Files) | Ingests dialog transcripts and LLM offline evaluation outputs | Parsed JSON files matching schemas | Medium |

---

## 4. Integration Details

### INT-001: Firebase Authentication SDK
#### Purpose
Establish secure authentication sessions and maps user credentials to roles.
#### Direction of Data Flow
Client Browser <-> Firebase Identity Services
#### Data Exchanged
- Outbound: User email and password.
- Inbound: Firebase ID Token, user profile record metadata (uid, email, displayName).
#### Authentication / Authorization
Uses standard Firebase Web Client SDK authentication handlers.
#### Failure Handling
- **Invalid Credentials**: Returns standard Firebase error codes (e.g., `auth/invalid-credential`, `auth/user-not-found`). Frontend intercepts and renders user-friendly warning screens.
#### Retry / Idempotency
Client-side re-trigger on user input. No automated infinite retries to prevent account lockout.
#### Rate Limits / Quotas
Regulated by standard Firebase Auth security limits.
#### Privacy / Security Concerns
- Transmission uses HTTPS.
- Plaintext password input is captured only in memory and never stored in cleartext client-side.
#### Logging / Audit Expectations
- Account provisioning and login tracking should be logged locally (subject to PII constraints).
#### Fallback / Degradation Behavior
- If Firebase Auth is down, the web application blocks access to all views and redirects to the login screen with an "Authentication Unavailable" alert.
#### Related Requirements
SEC-001 (Authentication Boundary).
#### Test Implications
- Mock Firebase auth objects during unit testing.

### INT-002: Offline Dataset Ingestion
#### Purpose
Ingests pre-calculated dataset files (conversations, LLM results) via local file upload.
#### Direction of Data Flow
Local File (Browser upload) -> React Application -> Firestore Database
#### Data Exchanged
- Parsed JSON structured elements (Conversation transcripts, model metrics, classification indices).
#### Authentication / Authorization
Admin role check (`ROLE-001`) required.
#### Failure Handling
- Schema mismatch or malformed JSON triggers parser validation failures. The import action aborts immediately, and the UI displays a list of schema issues (All-or-Nothing validation).
#### Retry / Idempotency
Admins can correct the JSON file and upload again.
- **Idempotency (BR-006)**: If the conversation `call_id` already exists, existing human labels must be preserved to prevent data loss.
#### Rate Limits / Quotas
Large files will be chunked into separate batch write loops (maximum 500 documents per batch as per Firestore restrictions) to avoid write limit failures.
#### Privacy / Security Concerns
- Client-side regex checking scanner scans conversation turns for cell numbers (`010-\d{4}-\d{4}`) or credit cards and triggers a confirmation alert before committing to DB.
#### Logging / Audit Expectations
- Successful uploads must trigger a MOD-004 `AuditLogCreated` entry listing the total count and filename.
#### Fallback / Degradation Behavior
- On validation failures, clear file reference buffer and notify user.
#### Related Requirements
FR-001, FR-005, SEC-003, INT-001.
#### Test Implications
- Maintain dummy valid and invalid JSON file templates to run upload schema tests.

---

## 5. Integration Risks
- **Schema Drift**: If the format of the LLM JSON results shifts, client parsing scripts will crash.
  - *Mitigation*: The client parser will explicitly check JSON fields against a required schema template before sending queries to Firestore.
- **Accidental Override**: Bulk uploading duplicate dataset files could overwrite existing evaluator inputs.
  - *Mitigation*: Firestore write commands must use merge policies (`set(doc, { ... }, { merge: true })`) or skip rules that explicitly prevent overwriting existing `/labels` subcollections.

---

## 6. Open Questions
- **Q-201 (JSON Schema Spec)**: Exact keys of the Conversation and LLM result uploads will be defined in Stage 6 (Data Design). The parser boundaries will be designed generically to adapt.

---

## 7. Human Approval Required
- Approval of the local file ingestion scheme over live backend API endpoints.
- Review of the idempotency override policies.