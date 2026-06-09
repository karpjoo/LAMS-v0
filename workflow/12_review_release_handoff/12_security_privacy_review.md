# 12 Security and Privacy Review

## 1. Review Scope
- **Release Target**: Release R1 (MVP Release)
- **Review Scope**: Evaluation of database-level authentication, role-based authorization, data access rules (specifically the blind-spot constraints), sensitive data handling, encryption/de-identification policies, API secrets management, logging practices, and audit trails.

## 2. Inputs Reviewed
- [firestore.rules](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/firestore.rules)
- [rules.spec.js](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/test/rules.spec.js)
- [12_code_review.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/12_review_release_handoff/12_code_review.md)
- [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)

## 3. Approved Security / Privacy Constraints
- **SEC-001 (Auth Guard)**: Access control mapping requires authentication (`request.auth != null`).
- **SEC-002 (Rules isolation)**: Access rules prevent users from reading other reviewers' records while the conversation is in `Round 1 Active` (blind-spot constraint).
- **SEC-003 (PII Warning Scan)**: Import process must perform pre-persistence regex matching to prevent accidental ingestion of phone numbers or names.
- **SEC-004 (Cascade deletions audit & protection)**: Destructive actions on datasets must be verified with exact text input and logged in immutable logs.
- **OPS-001 (Append-only Audit Log)**: Updates and deletions on the `/audit_logs` collection must be blocked at the database rule level.

## 4. Authentication Review
- Authentication utilizes Firebase Auth Service, configured for Google OAuth or email/password access.
- React frontend uses `AuthGuard` context component to restrict workspace/dashboard/admin views, forcing immediate redirect to `/login` for unauthenticated sessions.

## 5. Authorization Review
- Authorization is checked at the database level using roles fetched from the `/users/{uid}` collection.
- Roles defined:
  - `Admin`: Full permissions (create, delete conversations, clear datasets, read audit logs, write dashboard statistics).
  - `Evaluator`: Standard reader of datasets and author of user-owned label records.
  - `Adjudicator`: Designated reviewer allowed to write final consensus verdicts in `Round 3 Active`.

## 6. Data Access Review
- **Blind-spot Read Isolation**: Firestore rules restrict read permissions on `/labels` documents unless the caller is Admin, the owner of the label (`labelId == request.auth.uid`), OR the parent conversation status is one of `['Round 2 Active', 'Round 3 Active', 'Consensus Reached']`. This ensures evaluations are blinded during Round 1.
- **Locked Labels**: Label creation and modifications are disabled once the parent conversation status reaches `Consensus Reached`.
- **Append-only Logs**: `/audit_logs` has rules mapping `allow update, delete: if false;` which blocks updates even by Admins.

## 7. Personal / Sensitive Data Handling
- **Anonymization Strategy**: Conversations are de-identified offline before upload. No plain text names or private identifiers are stored in production database.
- **Ingestion Scanner**: Client uploader scans values against standard regex mappings for phone numbers. If flagged, a PII warning modal triggers, forcing the Admin to cancel or acknowledge before sending updates.

## 8. Secrets and Environment Variables
- Application does not store backend database credentials, private API keys, or service account details inside client-side environment configurations.
- Firebase Client configuration values (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) are public by design.

## 9. Logging and Error Exposure
- Error handling in [ErrorBoundary.jsx](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/src/components/ErrorBoundary.jsx) captures crashes and shows a sanitized error card without exposing stack dumps.
- Firestore operations are logged into `/audit_logs` with structural metadata (user email, action, call ID, timestamp).

## 10. External API / LLM / Third-Party Transfer
- LLM predictions and calculations are handled offline by research staff (Option B).
- No direct third-party HTTP requests, webhook triggers, or analytics services are active within the client code boundary.

## 11. Retention, Deletion, and Audit Concerns
- Wiping datasets executes a cascade deletion transaction removing conversations, child labels, and predictions.
- The logs are kept permanently intact in the `/audit_logs` collection.

## 12. Security Blockers
- **None**.

## 13. Privacy Blockers
- **None**.

## 14. Warnings
- **None**.

## 15. Recommendations
- **SEC-REC-001 (Audit Trail Archiving)**: Since Firebase allows database resets under emulator conditions, ensure that production Firebase project rules are deployed using Firebase CLI scripts during CI/CD to prevent rule bypasses.

## 16. Assumptions
- **A-VAL-002**: Evaluator and Adjudicator profile configurations are set up by Admin within the `/users` collection before they begin work.

## 17. Open Questions
- **None**.

## 18. Conditional Artifact N/A Notes
- **12_compliance_review.md**: Not applicable. LAMS-v0 is a closed, internal-only academic research system. Pre-deidentification is conducted offline, and no HIPAA, GDPR, or financial compliance requirements apply.

## 19. Review Conclusion
Firestore Security Rules and frontend AuthGuards are correctly configured and pass all security unit tests. Sensitive data exposure is prevented through offline de-identification and regex checks. The release candidate has no unresolved security or privacy blockers.

## 20. Handoff to 12c Release / Deployment Readiness

### Security / Privacy Blockers Affecting Release
- None.

### Environment or Secret Handling Issues
- None.

### Deployment Constraints
- Security rules deployment must accompany code deployment to prevent security boundaries from opening up.

### Rollback / Recovery Security Concerns
- Cascade resets must only be executable by authenticated Admin users.

### Open Questions Affecting Release Approval
- None.

---

## Human Review Needed

### Security Blockers
- *None.*

### Privacy Blockers
- *None.*

### Risk Acceptance Candidates
- **SEC-REC-001**: Rules are validated locally; must be safely deployed to production Firebase instances via official CLI rules.

### Open Questions
- *None.*

### Recommended Next Sub-SKILL
- Run `/skills/12_review_release_handoff/12c_release_deployment_readiness/SKILL.md`.
