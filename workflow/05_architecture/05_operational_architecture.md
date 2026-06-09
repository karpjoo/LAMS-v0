# 05 Operational Architecture

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (NFR-001, NFR-003, OPS-001)
- [05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md) (Pure client serverless)

## 3. Runtime / Deployment Assumptions
- **Hosting Service**: Firebase Hosting (Classic).
- **Client Bundle**: React SPA compiled to static assets (HTML/JS/CSS).
- **Deployment Environment**: Single production target environment. Multi-environment pipeline (staging/dev) is skipped for this research scope (A-101).

---

## 4. Environment and Configuration Policy
- System configurations (Firebase Web configurations) are loaded from a standard `.env` file at build time.
- Variables:
  - `REACT_APP_FIREBASE_API_KEY`
  - `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - `REACT_APP_FIREBASE_PROJECT_ID`
  - `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - `REACT_APP_FIREBASE_APP_ID`

---

## 5. Secret Handling Direction
No server-side API keys or database connection strings exist in client environments. The React app only contains public Firebase credentials. Access security is strictly maintained by Firestore Security Rules checking auth states.

---

## 6. Logging and Observability
- **Client Error Boundaries**: React Error Boundary catches rendering crashes, logs context variables in memory, and presents a clean error-recovery dashboard to users (NFR-003).
- **Audit Ledger**: User actions are tracked permanently inside Firestore `/audit_logs`.

---

## 7. Metrics and Alerting Candidates
Given the research team's small footprint (~10 users), third-party error alerting tools (like Sentry) are not requested for v0. Runtime exceptions will show up in developer console logs.

---

## 8. Background Jobs and Scheduled Work
No background queues, cron scripts, or server schedulers exist. All event-driven transitions occur synchronously within React application flows during document writes.

---

## 9. Failure, Retry, and Recovery Strategy
- **Offline Writes Queue**: Firestore SDK offline persistence caches mutations locally if network cuts out. Sync fires automatically when connectivity returns.
- **Import Rollbacks**: Bulk uploads route through Firestore transaction batches. If a parsing or database error occurs, the bulk import rolls back, leaving no half-written states (NFR-001).

---

## 10. Scaling and Performance Assumptions
- **Capacity**: Maximum of 1,000 conversations and 10,000 label documents.
- **Throughput**: Low. Firebase free tier limits will not be reached. No caching proxy or CDN required beyond Firebase Hosting.

---

## 11. Operational Risks
- **Local Import Errors**: Uploading extremely large JSON files (>10MB) can cause browser tab crashes.
  - *Mitigation*: The UI parser will chunk inputs and write in increments of 500 documents per batch, showing a progress percentage.

---

## 12. Open Questions
- None.

---

## 13. Human Approval Required
- Approval of Firebase Hosting classic deployment.
- Approval of build-time environment variable compilation.
