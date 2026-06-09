# 13 Reusable Lessons

## 1. Reusable Workflow Rules
- **RL-001 (Artifact Consolidation Rule)**: For lightweight prototype or closed research scopes, secondary matrices (such as compliant/IRB and risk screening) should be merged into a single core screening document to reduce template fragmentation and context overhead.

## 2. Reusable Prompt / SKILL Design Rules
- **RL-002 (Prompt Cohesion Rule)**: Avoid creating separate prompt files for each micro-task in the implementation track. Grouping related sub-tasks (e.g. 17 tasks into 7 prompts) significantly improves context continuity and prevents session state loss during resets.

## 3. Reusable Artifact Contract Lessons
- **RL-003 (Result Checklist Enforcement)**: Generating a `result.md` at the end of each stage forces the agent to review open questions, decisions, and assumptions, preventing issues from leaking silently into downstream stages.

## 4. Reusable Context Management Lessons
- **RL-004 (Context Packet Navigation)**: A centralized `context_packet.md` works effectively as an index layer. Always reference relative markdown links for full details instead of copying large blocks of history.

## 5. Reusable Approval Gate Lessons
- **RL-005 (Mandatory Design Checks)**: Human developer check-ins before writing code (especially after architecture and test strategy design) prevent architectural misalignment.

## 6. Reusable Testing / Validation Lessons
- **RL-006 (Offline Emulator Priority)**: Write and run Firestore Security Rules unit tests (`rules.spec.js`) using rules-unit-testing packages *before* wiring frontend views. This ensures backend constraints are structurally sound.

## 7. Reusable DDD / Domain Lessons
- **RL-007 (Ubiquitous Glossary Sync)**: Ensure variable names, React component states, and database fields match the initial DDD glossary exactly to avoid translational bugs.

## 8. Reusable Security / Privacy Lessons
- **RL-008 (Append-only Audit Pattern)**: Enforce security rules that block `update` and `delete` on critical tables (like `audit_logs`) at the database level rather than trying to block them in client-side code alone.

## 9. Project-Specific Lessons Not Yet Generalized
- **RL-009 (Static Metrics Offloading)**: Complex statistical comparisons (like Cohen's Kappa or Adjudicated Gold Standards) can be calculated offline and uploaded to static configurations, keeping client-side React code highly responsive and lightweight.

## 10. Tool-Specific Lessons
- **RL-010 (Emulator Sandboxing)**: Local firebase emulator setups depend on the presence of a local Java Runtime Environment (JRE). Setup scripts should explicitly check for JRE availability before attempting execution.
