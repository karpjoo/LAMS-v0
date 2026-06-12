# MACOW Case Study: LAMS-v0

> Case study of applying **MACOW (Manual Agentic Coding Workflow)** to a research-oriented software system.

- **Project:** LAMS-v0 — LLM & Agentic Multi-evaluator System
- **Repository:** `karpjoo/LAMS-v0`
- **Case type:** Research system / greenfield MVP
- **Development method:** Manual Agentic Coding Workflow (MACOW)
- **Primary stack:** React + Firebase Auth + Firestore + Firebase Hosting
- **Status:** Initial case study draft
- **Last updated:** 2026-06-11

---

## 1. Purpose of This Case Study

This document records how LAMS-v0 was developed using MACOW, a human-controlled, artifact-first agentic coding workflow.

The goal of this case study is not to present LAMS-v0 as a fully generalized production template. Instead, it documents one concrete pilot case showing how a structured workflow can guide an LLM-based coding agent through requirements, domain modeling, architecture, data design, testing, implementation, review, and retrospective work.

This case study is intended for:

- researchers studying agentic coding workflows;
- developers learning how to control coding agents through staged artifacts;
- students comparing one-shot code generation with structured agent-assisted development;
- future maintainers of LAMS-v0;
- future MACOW users who want an example of a research-system implementation.

---

## 2. Project Overview

LAMS-v0 is a research-support system for evaluating harmful or linguistically risky customer utterances in call-center conversations.

The system supports comparison and coordination among multiple evaluators, including human evaluators and LLM-generated labels. Its main purpose is to help researchers compare detection results, review evidence, and support consensus-building for gold-standard labels.

At the application level, LAMS-v0 supports:

- dataset upload by administrators;
- review of call-center dialogue data;
- multi-round human evaluation;
- isolation of evaluator labels during active evaluation rounds;
- adjudication when evaluator labels conflict;
- comparison of human and LLM labels;
- visualization or review of agreement statistics;
- final consensus or gold-standard label support.

At the research level, the system is linked to a study on prompt-based detection of linguistic risk cues in call-center conversations. The research design compares different prompt strategies, including task-only, lexico-semantic, and semantic-pragmatic prompt conditions.

---

## 3. Why This Project Was a Good MACOW Pilot

LAMS-v0 was well suited for testing MACOW because it was neither a trivial toy application nor a large enterprise system.

It included enough complexity to test the workflow:

- real research concepts that needed careful domain modeling;
- multiple user roles;
- sensitive-text and privacy considerations;
- role-based access control;
- multi-stage evaluation workflow;
- data upload and validation;
- testable security rules;
- UI behavior that needed manual and automated validation;
- release and handoff documentation.

At the same time, the scope remained small enough for a complete end-to-end workflow pass.

This made the project useful as a pilot for testing whether MACOW could preserve research intent while still producing an implementable software system.

---

## 4. Workflow Applied

The project followed the staged MACOW structure from initial intake through final review and retrospective.

| Stage | Purpose in LAMS-v0 |
|---|---|
| 00 Project Intake | Classified the project as a greenfield research-system MVP and identified fixed constraints. |
| 01 Service Goal Definition | Defined the system purpose around multi-evaluator research support and consensus-building. |
| 02 Stakeholder & Risk Framing | Identified administrators, evaluators, adjudicators, sensitive text risks, and privacy constraints. |
| 03 Requirements & Acceptance Criteria | Converted research and system goals into testable functional and non-functional requirements. |
| 04 Domain Modeling / DDD | Preserved core concepts such as `Dataset`, `Call`, `Turn`, `Evaluator`, and `Label`. |
| 05 Architecture & Technical Contracts | Selected a React + Firebase classic serverless architecture and defined module/security boundaries. |
| 06 Data Design | Designed Firestore collections, access patterns, and security-rule-dependent data structures. |
| 07 MVP Scope & Release Slicing | Limited the MVP to core upload, evaluation, adjudication, and statistics-support behavior. |
| 08 Test Strategy & Validation Harness | Defined unit, security-rules, and E2E validation methods. |
| 09 Task Breakdown | Converted approved requirements and design into implementation-ready task cards. |
| 10 Implementation Prompt Writing | Grouped implementation tasks into executable prompts for the coding agent. |
| 11 TDD Implementation Loop | Implemented application behavior with automated tests and validation evidence. |
| 12 Review / Release / Handoff | Completed code review, security/privacy review, release readiness, and operations documentation. |
| 13 Retrospective & Skill Improvement | Captured agent behavior, reusable lessons, and workflow improvement candidates. |

The important point is that the agent did not jump directly from a vague feature request to code. Design intent, scope, data rules, tests, and review criteria were made explicit before implementation.

---

## 5. Repository Structure Produced by the Workflow

The repository keeps both product code and workflow evidence.

Key product folders include:

```text
/src
/test
/e2e
/public
```

Key workflow folders include:

```text
/skills
/workflow
/workflow/context
/workflow/00_intake
/workflow/01_goal
/workflow/02_stakeholders_risk
/workflow/03_requirements
/workflow/04_domain
/workflow/05_architecture
/workflow/06_data
/workflow/07_mvp_release
/workflow/08_test_strategy
/workflow/09_tasks
/workflow/10_prompts
/workflow/11_implementation_results
/workflow/12_review_release_handoff
/workflow/13_retrospective
```

The most important distinction is:

```text
/skills   = reusable procedures used by the agent
/workflow = project-specific artifacts produced while developing LAMS-v0
/src      = implemented application code
/test     = automated validation assets
/e2e      = end-to-end validation assets
```

This separation made the development process more inspectable. Future readers can review not only the final source code, but also the reasoning path that led to the code.

---

## 6. Research-to-System Translation

One of the main benefits of using MACOW in this project was that the research concept was translated into software concepts gradually rather than being flattened into generic CRUD screens.

The research plan centered on detecting **linguistic risk cues** in customer utterances from call-center conversations. The system therefore needed to preserve several research-specific distinctions:

- the analysis target is customer utterance evidence, not the emotional state of the counselor;
- harmfulness labels must be grounded in text evidence;
- different evaluation sources may disagree;
- expert or adjudicator consensus may be needed;
- gold-standard labels must be traceable to evaluator judgments and evidence.

These ideas influenced requirements, domain modeling, data design, UI flows, and validation strategy.

For example, the domain model preserved concepts such as:

```text
Dataset
Call
Turn
Evaluator
Label
Consensus
Adjudication
Conflict
Evidence Excerpt
```

This helped prevent the implementation from drifting into a generic annotation app. The system stayed aligned with the research workflow.

---

## 7. Architecture Outcome

The project adopted a classic serverless architecture:

```text
React frontend
→ Firebase Auth
→ Firestore
→ Firebase Security Rules
→ Firebase Hosting
```

A deliberate architecture decision was to avoid an unnecessary custom backend for the initial research MVP. The system uses Firebase client access directly, with Firestore Security Rules serving as a central enforcement layer for role and data-access constraints.

This was appropriate for the pilot because:

- the project was a research-support system, not a high-scale commercial SaaS product;
- role-based access rules could be expressed and tested at the Firestore layer;
- Firebase Emulator-based testing supported fast local validation;
- the workflow could focus on research logic, data security, and evaluator behavior rather than backend infrastructure complexity.

The main trade-off is that future production hardening may require additional work, such as CI/CD automation, stricter environment separation, audit logging, and more robust multi-user concurrency testing.

---

## 8. Validation Outcome

The workflow treated testing as a design concern, not only as a final review activity.

Validation covered:

- Firestore security rules;
- React component and utility behavior;
- E2E user flows;
- manual review of release readiness and documentation;
- security/privacy review;
- operations and rollback documentation.

The retrospective records that the implemented system reached a strong validation state, including 54 passing automated tests across unit, rules, and E2E coverage.

A useful lesson from this project is that Firestore Security Rules should be tested early, before the UI is fully wired. In this system, access-control correctness was a core domain and privacy concern, so rule testing was not merely an infrastructure check.

---

## 9. What Worked Well

### 9.1 Artifact-first development

The stage artifacts gave the agent a stable source of truth. This reduced reliance on long chat history and made context resets safer.

### 9.2 Clear scope control

MVP and release slicing helped prevent the research tool from expanding into a full production research platform too early.

Examples of deferred or limited scope included:

- real-time LLM inference inside the app;
- client-side dynamic Kappa calculation;
- audio playback;
- multi-tenant production operations;
- complex staging pipelines.

### 9.3 Domain continuity

The terms introduced during domain modeling were preserved in architecture, schema, rules, implementation, and UI. This reduced semantic drift between research language and software implementation.

### 9.4 Prompt grouping

The task breakdown produced many discrete tasks, but the implementation prompt stage grouped them into a smaller number of cohesive execution prompts. This reduced session overhead while keeping enough structure for controlled implementation.

### 9.5 Security/privacy integration

Security and privacy were considered before implementation. This was important because evaluator isolation, label visibility, and dataset handling were central to the research workflow.

---

## 10. What Needed Improvement

The retrospective identified only a small number of workflow gaps, but they are useful for future MACOW projects.

### 10.1 Central local setup documentation

Local Firebase Emulator setup and port configuration should be documented in the root `README.md` from the start. Otherwise, developers may need to search workflow artifacts to find operational details.

### 10.2 Traceability maintenance overhead

Traceability was useful, but maintaining multiple traceability matrices manually can become tedious. Future projects should consider generating or validating trace links automatically.

### 10.3 UI layout validation

The project included automated unit, rules, and E2E tests, but UI responsiveness checks remained mostly manual. Future research tools may benefit from screenshot or visual regression testing.

### 10.4 CI/CD automation

Manual deployment checks were acceptable for this research MVP, but future versions may require automated CI checks, preview deployments, and rollback verification.

---

## 11. Agent Behavior Observed

The coding agent performed best when constraints were explicit and artifact-backed.

Observed strengths:

- followed fixed technology constraints;
- preserved domain terminology;
- avoided unnecessary backend expansion;
- implemented tests and evidence records;
- grouped related implementation tasks effectively;
- maintained a disciplined connection between requirements, tasks, tests, and code.

The most important human decisions were still made by the developer, including:

- confirming the React + Firebase serverless architecture;
- limiting the MVP scope;
- excluding unnecessary production features;
- approving the research-system framing;
- accepting manual deployment controls for the pilot version.

This supports one of MACOW's core assumptions: the agent is useful as a structured development assistant, but the human developer must remain the owner of goals, scope, risk, architecture, and release judgment.

---

## 12. Case Study Limitations

This case study should be interpreted carefully.

It does not prove that MACOW will work equally well for every project type. LAMS-v0 was a greenfield research-system MVP with a relatively clear owner and bounded scope.

Known limitations:

- validation was performed primarily in local and emulator-based environments;
- complex concurrent multi-user security behavior may require more testing;
- the system is not yet a generalized production SaaS reference architecture;
- CI/CD automation is limited;
- retrospective conclusions are based on one project;
- agent failure patterns may appear in larger or more ambiguous projects.

Therefore, this case study should be treated as an initial pilot, not as final evidence that the workflow is complete.

---

## 13. Reusable Lessons for Future MACOW Projects

### RL-001: Keep project-specific evidence separate from reusable skills

The `/skills` folder should remain reusable. The `/workflow` folder should contain project-specific artifacts and evidence.

### RL-002: Use the research model as domain input

For research systems, the research design should be treated as a source of domain concepts, invariants, roles, evidence rules, and validation criteria.

### RL-003: Do not overbuild infrastructure for a research MVP

A lightweight architecture can be appropriate when the workflow explicitly records trade-offs and limitations.

### RL-004: Test access-control rules early

When privacy or evaluator isolation is central to the system, security-rule tests should be part of the main validation strategy, not a final add-on.

### RL-005: Group implementation prompts by coherent change scope

Too many micro-prompts can create overhead. A good implementation prompt should be small enough to inspect but large enough to preserve local task context.

### RL-006: Retrospective should update the workflow, not only the project

The end of a MACOW project should produce reusable lessons, skill improvement candidates, and agent failure-pattern notes.

---

## 14. Suggested Follow-up Work

Recommended next steps for LAMS-v0:

1. Add this file as `/docs/MACOW_CASE_STUDY.md`.
2. Link it from the root `README.md`.
3. Add a short “Development Workflow” section to the root `README.md`.
4. Expand root developer setup instructions for Firebase Emulator ports and validation commands.
5. Consider adding CI checks for unit, rules, and E2E tests.
6. Consider adding screenshot or visual regression tests for UI layout stability.
7. Use `/workflow/13_retrospective` as the source for updating reusable MACOW skills.

Suggested root README link:

```markdown
## Development Workflow

This project was developed using MACOW (Manual Agentic Coding Workflow), a structured human-in-the-loop agentic coding workflow based on staged artifacts, explicit review gates, traceability, and retrospective skill improvement.

See: [MACOW Case Study](docs/MACOW_CASE_STUDY.md)
```

---

## 15. Related Repository Files

Useful files for reviewing this case:

- [`README.md`](../README.md)
- [`docs/research/260528-revised-research-overview.md`](./research/260528-revised-research-overview.md)
- [`workflow/13_retrospective/13_workflow_retrospective.md`](../workflow/13_retrospective/13_workflow_retrospective.md)
- [`workflow/13_retrospective/13_agent_failure_patterns.md`](../workflow/13_retrospective/13_agent_failure_patterns.md)
- [`workflow/13_retrospective/13_reusable_lessons.md`](../workflow/13_retrospective/13_reusable_lessons.md)
- [`workflow/13_retrospective/13_skill_improvement_backlog.md`](../workflow/13_retrospective/13_skill_improvement_backlog.md)
- [`workflow/12_review_release_handoff/12_release_readiness.md`](../workflow/12_review_release_handoff/12_release_readiness.md)
- [`workflow/12_review_release_handoff/12_security_privacy_review.md`](../workflow/12_review_release_handoff/12_security_privacy_review.md)
- [`skills`](../skills)
- [`workflow`](../workflow)

---

## 16. Summary

LAMS-v0 demonstrates that MACOW can be used to develop a research-oriented software system through a controlled, inspectable, artifact-first process.

The strongest result of this pilot is not only that the application was implemented. It is that the project preserved a traceable path from research purpose to requirements, domain model, architecture, data design, implementation prompts, tests, review evidence, and retrospective lessons.

This makes LAMS-v0 a useful first public case study for MACOW as a manual, human-led agentic coding workflow.
