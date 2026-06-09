# 12 Operations Runbook

## 1. System Overview
LAMS-v0 is a serverless React application connected to Firebase services (Authentication, Firestore Database, Hosting). It allows researchers and evaluators to register datasets, review dialogue turns, perform 3-stage consensus reviews, and view Kappa statistics dashboards.

## 2. Runtime Dependencies
- **Client Web Browser**: Chrome, Safari, Firefox, Edge (modern versions supporting ESM modules and CSS Grid/Flexbox).
- **Backend Infrastructure**: Firebase Cloud Console (Auth accounts, Firestore instance, Hosting nodes).

## 3. Configuration Overview
- Connections are managed inside [src/firebase.js](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/src/firebase.js) using public Firebase configuration variables.
- User management is handled by creating/updating document records under `/users` with matching fields:
  - `role`: 'Admin' or 'Evaluator'
  - `is_adjudicator`: boolean (triggers Round 3 permission checks)

## 4. Monitoring and Logging
- Administrative actions (uploading datasets, clearing data, consensus solving, gold standard records writing) are logged automatically into the `/audit_logs` collection.
- Audit logs contain `email`, `action`, `targetId`, and `timestamp` fields.
- Access to audit logs is restricted to `Admin` users via database rules.

## 5. Common Failure Modes
- **Auth Rejection**: Users cannot access the workspace.
  - *Cause*: Account profile is missing under `/users/{uid}` collection, or has an invalid format.
  - *Remedy*: Admin must verify the user's UID and write a profile document in the Firestore console.
- **Rules evaluation block (Permission Denied)**: Users get permission errors on writes.
  - *Cause*: A user tries to write labels for a conversation that has already reached `Consensus Reached` status, or tries to write labels for another user's UID.
  - *Remedy*: Enforced by design. Locked labels are read-only.
- **Index Missing (Query failure)**: Admin list sorting or queries fail.
  - *Cause*: Missing compound index configuration in Firebase.
  - *Remedy*: Deploy `firestore.indexes.json` using Firebase CLI: `firebase deploy --only firestore:indexes`.

## 6. Troubleshooting Steps
1. Open the browser's developer console (F12) to trace connection errors or permission warnings.
2. Verify network state to ensure Firebase API calls (`firestore.googleapis.com`) are not blocked by corporate firewalls.
3. Validate user role assignment matching `/users/{uid}` values.

## 7. Incident Response
- In case of a major data breach or incorrect dialogue exposure:
  - Immediately trigger a database wipe from the Admin dashboard using the "DELETE ALL DATASET" command.
  - Update Firestore Security rules via console to `allow read, write: if false;` to block all access.

## 8. Rollback and Recovery
- Rollback hosting deployments via Firebase Console -> Hosting -> Release History -> Rollback version.
- Revert rules deployments using Git revisions and CLI deploy script: `firebase deploy --only firestore:rules`.

## 9. Data Backup / Export Notes
- Enable Firestore backups in the Google Cloud Console to ensure scheduled database dumps.
- De-identified JSON source files should be kept in a secure, encrypted offline vault by the research lead.

## 10. Ownership and Escalation
- **Primary Administrator**: Academic Research Lead.
- **Developer Escalation**: Software Engineering Lead.

## 11. Maintenance Notes
- Re-run automated validations prior to any rules modifications: `npm run test:rules`.
