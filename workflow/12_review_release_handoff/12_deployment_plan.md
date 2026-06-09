# 12 Deployment Plan

## 1. Deployment Scope
- **Component**: React Frontend Application assets build (`dist/`) and `firestore.rules`.
- **Release Version**: v0.1.0-MVP

## 2. Target Environment
- **Target**: Firebase Hosting (production distribution domain).
- **Database**: Cloud Firestore.
- **Authentication**: Firebase Authentication.

## 3. Prerequisites
- **Node.js**: Version 18 or above installed.
- **Firebase CLI**: Global installation (`npm install -g firebase-tools`) and authenticated account login (`firebase login`).
- **Permissions**: Firebase project owner or Editor permissions to deploy.

## 4. Environment Variables Required
No client-side build secret keys are required. Firebase public connection tokens are hardcoded inside [src/firebase.js](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/src/firebase.js) matching standard sandbox configs.

## 5. Build and Validation Commands
- **Lint check**: `npm run lint`
- **Build compilation**: `npm run build`
- **Rules validation**: `npm run test:rules`
- **Unit validation**: `npm run test:unit`
- **E2E verification**: `npm run test:e2e`

## 6. Migration Steps
None. This is a Greenfield project database deployment.

## 7. Deployment Steps
1. **Validate codebase**: Run linting and all unit, rules, and integration tests to ensure no local regression.
2. **Compile production build**: Run `npm run build` to generate compiled static bundle in `/dist` directory.
3. **Select active project**: Run `firebase use <project-id>` matching your production Firebase console project name.
4. **Deploy database rules**: Run `firebase deploy --only firestore:rules`.
5. **Deploy application assets**: Run `firebase deploy --only hosting`.
6. **Verify release console**: Check the printed hosting distribution URL to confirm the live release.

## 8. Post-Deployment Smoke Tests
1. **Routing Guard**: Access the live URL `/workspace`. Confirm immediate redirection to `/login`.
2. **Authentication**: Sign in using a pre-seeded account profile. Confirm redirection back to Dashboard.
3. **Admin Panel Ingestion**: Upload a mock dataset conversation file. Verify the PII checks modal triggers.
4. **Data Reset**: Input "DELETE ALL DATASET" inside the confirmation dialog and confirm. Ensure table updates to empty.

## 9. Rollback Procedure
1. **Hosting Reversion**:
   - Navigate to the Firebase Console -> Hosting -> Release History.
   - Click the "Rollback" option next to the previously deployed release candidate version.
   - Alternatively, deploy the previous git tag bundle using standard CLI command: `firebase deploy --only hosting` (or run a previous successful build step).
2. **Rules Reversion**:
   - Revert rules using Git version controls: `git checkout HEAD~1 firestore.rules`.
   - Redeploy rules using command: `firebase deploy --only firestore:rules`.

## 10. Recovery Procedure
- If the live production Firestore database becomes corrupted during operations, perform a restoration cycle:
  - Utilize Firebase automated backups (if active) to restore collection state.
  - Or execute the admin panel "Cascade Delete" reset and re-upload the original de-identified dialogue JSON files.

## 11. Deployment Owner
- Internal research development lead / Administrator.

## 12. Approval Required Before Execution
- Human developer authorization is required before triggering any production Firebase deployment CLI actions.
