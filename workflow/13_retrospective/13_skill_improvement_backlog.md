# 13 Skill Improvement Backlog

## 1. Backlog Summary
The retrospective identified two key workflow/template improvement opportunities (SIBs). Both are classified as P2 (improving reliability, onboarding, and reviewability).

## 2. Priority Definitions
- **P0**: Blocks safe workflow use (0 items).
- **P1**: Causes repeated rework or serious ambiguity (0 items).
- **P2**: Improves reliability, onboarding, or reviewability (2 items).
- **P3**: Nice-to-have refinement (0 items).

## 3. Backlog Items
| ID | Priority | Affected Skill / Template | Problem | Recommended Change | Validation Method | Approval Required |
|---|---|---|---|---|---|---|
| **SIB-001** | P2 | Root workspace / setup instructions | Local emulator startup instructions not centralized in project root. | Create central root [README.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/README.md) specifying node versions, emulator ports, and testing commands. | Run a clean clone setup using only README guidelines. | Yes |
| **SIB-002** | P2 | Traceability workflow | Manual mapping of requirements to test evidence in markdown tables is tedious and drift-prone. | Propose a lightweight script/linter to verify that all requirement IDs (`FR-xxx`, `SEC-xxx`) are present in test spec comments. | Execute verification script and confirm it highlights missing trace references. | Yes |

## 4. Detailed Backlog Items

### SIB-001: Central Developer Setup Documentation
- **Priority**: P2
- **Affected skill/template**: Root workspace / Project onboarding
- **Related stage**: Stage 08 (Test Strategy) & Stage 12 (Release/Handoff)
- **Problem observed**: Emulator setup details and port mapping were scattered across multiple folders.
- **Evidence source**: [12_deployment_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/12_review_release_handoff/12_deployment_plan.md) and [08_validation_commands.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_validation_commands.md)
- **Root cause hypothesis**: Greenfield template did not enforce a root `README.md` generation task during Project Intake (Stage 0).
- **Recommended change**: Generate a root [README.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/README.md) containing:
  - Prerequisites (Node.js, Java runtime for emulator).
  - Installation and emulator run commands (`npm install`, `npx firebase setup:emulators`, `npm run dev:emu`).
  - Validation commands (`npm run test:rules`, `npm run test:unit`, `npm run test:e2e`).
- **Expected benefit**: Faster onboarding for downstream developers and clear setup validation.
- **Risk of change**: Minimal.
- **Effort**: Low (writing markdown).
- **Owner**: Human/Agent
- **Validation method**: Clone codebase to a clean terminal sandbox and run steps from the README.
- **Approval required**: Yes

### SIB-002: Automated Traceability Verification Tooling
- **Priority**: P2
- **Affected skill/template**: General workflow guidelines / Traceability matrices
- **Related stage**: Stage 03, 05, 06, 09, 12
- **Problem observed**: Traceability matrices maintained across multiple markdown tables manually are drift-prone during rapid development loops.
- **Evidence source**: [TRACEABILITY_MATRIX.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/TRACEABILITY_MATRIX.md) and [12_code_review.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/12_review_release_handoff/12_code_review.md)
- **Root cause hypothesis**: Absence of tooling to enforce tag validation between requirements text (`03_requirements.md`) and spec files (`rules.spec.js`, `consensus.spec.js`).
- **Recommended change**: Propose a trace validation script that parses code comments and requirement markdowns, asserting that every requirement has at least one mapped verification in code/tests.
- **Expected benefit**: Eradicates human errors and ensures continuous traceability verification.
- **Risk of change**: Low (no runtime impact).
- **Effort**: Medium (writing custom AST parser or regex script).
- **Owner**: Agent
- **Validation method**: Run the tool on the current repository and ensure it matches the manual [TRACEABILITY_MATRIX.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/TRACEABILITY_MATRIX.md) results.
- **Approval required**: Yes

## 5. Skill Lifecycle Recommendations
| Skill | Recommendation | Reason | Evidence | Approval Required |
|---|---|---|---|---|
| **Root Workspace Setup** | Revise | Needs to mandate root `README.md` creation with emulator ports. | SIB-001 | Yes |
| **Requirements (Stage 03)** | Keep | Document consolidation practice (NFRs, Privacy into main file) worked exceptionally well. | [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) | No |
| **Task Breakdown (Stage 09)** | Keep | Task prompt grouping approach successfully bypassed session bootstrap limits. | [10_implementation_prompts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/10_prompts/10_implementation_prompts.md) | No |
