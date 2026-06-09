# 05 Security and Privacy Architecture

## 1. Status
- **Status**: Draft (Proposed Candidates)
- **Last Updated**: 2026-06-09

## 2. Approved Inputs Used
- [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md) (RISK-001 ~ RISK-003)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (SEC-003, BR-001)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md) (DSP-001, EXT-003)
- [05_authn_authz_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_authn_authz_model.md)

## 3. Security / Privacy Drivers
- **PII Obfuscation Rule (BR-001)**: All text transcripts must be pre-masked before hitting the database. The system acts as a secondary verification scanner.
- **Evaluator Independence (BR-007)**: Strict protection of evaluator blind spots in Round 1.
- **Audit Immutability (BR-004)**: Write-once constraints on logs to prevent tampering.

## 4. Trust Boundaries
- **Client Sandbox (Browser)**: The user interface where JSON file parsers run. Highly vulnerable to user script manipulations.
- **Firebase Infrastructure Boundary**: The secure backend cloud hosting Auth, Firestore, and DB triggers. Firestore Security Rules protect this boundary.
- **External Offline Space**: The unmanaged user environment where raw, unmasked chat files reside.

---

## 5. Personal / Sensitive Data Flow Summary

```text
  [ Local Unmasked Files ] --(1) Upload--> [ Browser JSON Parser ] --(2) Scan for PII Warnings --> [ React UI ]
                                                   |                                                     |
                                            (3) Bulk Write                                        (4) Alert Modal
                                                   v                                                     v
                                        [ Firebase Firestore ]                                    [ Admin Review ]
```

1. **Inbound JSON Upload**: Admin uploads chat files.
2. **Client-Side Scanner**: Before executing database writes, the client scans text properties using regex patterns:
   - Domestic phone format: `/(010|02|031|051)-\d{3,4}-\d{4}/g`
   - Resident registration regex: `/\d{6}-[1-4]\d{6}/g`
3. **Alert Modal**: If matches are found, a warning dialog prompts the Admin: *"Potential personal information detected. Confirm masking prior to saving."*

---

## 6. External Data Transfer Points
- None. LAMS-v0 does not initiate outbound API calls or transfers. All processing is internal.

---

## 7. Access Control Architecture Notes
- Direct Firestore read restrictions (as defined in `05_authn_authz_model.md` Section 7) ensure that standard users cannot retrieve other evaluators' labels unless the parent conversation round state is transitioned to Round 2.

---

## 8. Audit Logging Architecture
- The Audit log collection (`/audit_logs`) serves as our secure ledger. Log writes must happen within client batched transactions to guarantee synchronization. Security rules explicitly reject `update` and `delete` calls.

---

## 9. Secrets and Configuration Security
- Firebase configurations (apiKey, authDomain, projectId) are exposed in the client index bundle.
- Since these are public identifiers, database protection relies entirely on **Firestore Security Rules** rather than secret tokens.

---

## 10. Logging Redaction and Data Minimization
- The console loggers in the React app must strip user emails, names, or passwords.
- Only technical trace IDs and standard operation status integers are printed.

---

## 11. Abuse, Rate Limiting, and Misuse Concerns
- Since the platform hosts a closed circle of ~10 researchers (A-101), extensive brute force mitigations are omitted. Firebase Auth incorporates automatic brute-force triggers out of the box.

---

## 12. Security / Privacy Risks
- **Admin Bypassing Warning Scanner**: An Admin could ignore PII scanner alarms and import unmasked datasets.
  - *Mitigation*: The PII warning scans and decisions are logged in the audit ledger, creating accountability records.

---

## 13. Open Questions
- None.

---

## 14. Human Approval Required
- Approval of regex scanning templates for PII warning markers.
- Approval of client-side secrets containment.
