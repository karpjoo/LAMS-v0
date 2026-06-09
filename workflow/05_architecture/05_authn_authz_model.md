# 05 Authentication and Authorization Model

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md) (ROLE-001, ROLE-002)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (SEC-001, SEC-002)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md) (ACT-001 ~ ACT-003, ENT-002, ENT-003, DSP-002)
- [05_module_boundaries.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_module_boundaries.md) (MOD-005)

## 3. Identity Model
- **Identity Provider**: Firebase Authentication (Email/Password credentials).
- **Identity Storage**: User accounts are created and managed by the Admin. Each user has a unique `uid` and assigned `role` attribute.
- **Role Map Fetching**: A root `/users/{uid}` document maps user profiles to their specific role string.

---

## 4. Role Inventory

| Role ID | Role Name | Description | Allowed Capabilities | Forbidden Capabilities |
|---|---|---|---|---|
| ROLE-001 | Admin | Full dashboard management and raw dataset imports/deletion. | Upload files, purge data, check audit trails, edit system configs. | Perform standard evaluator round label entries. |
| ROLE-002 | Evaluator | Standard user reviewing dialog transcripts and saving labels. | Load assigned lists, read conversation dialog turns, save and edit own labels. | Import/delete datasets, view audit collections, view other evaluators' labels during Round 1. |
| ADJUD-01 | Adjudicator | Expert role resolving consensus disagreements in Round 3. | View merged Round 1/2 evaluator opinions, write the Gold Standard Label. | Ingest datasets, purge collections. |

---

## 5. Protected Resource Inventory

| Resource | Operation | Allowed Roles | Authorization Rule | Audit Required |
|---|---|---|---|---|
| `/conversations/*` | Create | ROLE-001 (Admin) | `request.auth.token.role == 'Admin'` | Yes |
| `/conversations/*` | Read | ROLE-001, ROLE-002, Adjudicator | `request.auth != null` | No |
| `/conversations/*` | Delete | ROLE-001 (Admin) | `request.auth.token.role == 'Admin'` | Yes |
| `/conversations/{id}/labels/{uid_r}` | Create / Update | ROLE-002 | `request.auth.uid == uid` AND conversation status is not locked. | Yes |
| `/conversations/{id}/labels/{uid_r}` | Read | ROLE-002 | During Round 1: only if `request.auth.uid == uid`. During Round 2: read access allowed to check teammate labels. | No |
| `/conversations/{id}/gold_standard` | Create / Update | Adjudicator | `request.auth.token.role == 'Adjudicator'` | Yes |
| `/conversations/{id}/gold_standard` | Read | ROLE-001, ROLE-002, Adjudicator | `request.auth != null` | No |
| `/audit_logs/*` | Create | ROLE-001, ROLE-002, Adjudicator | `request.auth != null` | Yes (Self-auditing) |
| `/audit_logs/*` | Read | ROLE-001 (Admin) | `request.auth.token.role == 'Admin'` | No |
| `/audit_logs/*` | Update / Delete | None | Strictly forbidden to all users (INV-003). | Yes (Write attempted failure) |

---

## 6. Authorization Decision Points
Authorization decisions are evaluated locally in the client prior to page routing to render correct UI layouts. However, the true authoritative decision point resides within **Firestore Security Rules** where the database evaluates token attributes.

---

## 7. Authorization Enforcement Points
- **Client Route Guards**: Redirects unauthenticated sessions to `/login`. Hide admin sections for non-admin tokens.
- **Firestore Security Rules**: The hard firewall that blocks unauthorized reads/writes directly in database layers:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read: if request.auth != null;
        allow write: if false; // Provisioned offline or by custom admin flows
      }
      match /conversations/{callId} {
        allow read: if request.auth != null;
        allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
        
        match /labels/{labelId} {
          allow read: if request.auth != null && 
            (resource.data.round_no == 2 || resource.data.user_id == request.auth.uid);
          allow create, update: if request.auth != null && 
            labelId.startsWith(request.auth.uid) && 
            get(/databases/$(database)/documents/conversations/$(callId)).data.status != 'Consensus Reached';
        }
        
        match /gold_standard/{docId} {
          allow read: if request.auth != null;
          allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Adjudicator';
        }
      }
      match /audit_logs/{logId} {
        allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
        allow create: if request.auth != null;
        allow update, delete: if false;
      }
    }
  }
  ```

---

## 8. Admin Capability Boundaries
Admins can provision user records and clear datasets but **cannot** edit standard evaluator opinions or modify the final Gold Standard labels once written. This protects the research outputs from administrator bias or accidental data changes.

---

## 9. Audit Logging Requirements
All writes to conversations, evaluator labels, gold standards, and deletions must execute an write transaction that appends a document to `/audit_logs`. The log document shape will be detailed in Stage 6 (Data Design).

---

## 10. Security Risks
- **Admin Accounts Compromise**: An admin credential hijack could lead to dataset wiping.
  - *Mitigation*: The deletion interlock enforces manual entry checks, and audit trails record delete actions.
- **Evaluator Access Overreach**: Evaluators reading others' Round 1 opinions.
  - *Mitigation*: Hard-enforced in security rules checking `round_no == 2` before permitting reads.

---

## 11. Open Questions
- None.

---

## 12. Human Approval Required
- Approval of user-to-role mappings (`/users/{uid}` lookup).
- Approval of Firestore Security Rules layout.
