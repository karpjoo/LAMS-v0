# context_packet.md

## 1. Current Project State
- **Current stage**: 13 Workflow Retrospective & Skill Improvement (Complete - Pending Review)
- **Completed stages**: 00 Project Intake, 01 Service Goal Definition, 02 Stakeholder & Risk Framing, 03 Requirements & Acceptance Criteria, 04 Domain Modeling / DDD, 05 Architecture & Technical Contracts, 06 Data Design, 07 MVP Scope & Release Slicing, 08 Test Strategy & Validation Harness, 09 Task Breakdown, 10 Implementation Prompt Writing, 11 TDD Implementation Loop, 12 Review, Release, and Handoff, 13 Workflow Retrospective & Skill Improvement
- **Next recommended action**: Execute approved skill improvement tasks (SIB-001: Create root README.md).

## 2. Approved Decisions
- **DC-VAL-001**: Firestore Security Rules 검증을 위해 Vitest 및 `@firebase/rules-unit-testing`을 조합한 로컬 테스트 러너 구성.
- **DC-VAL-002**: UI E2E 테스트 도구로 Playwright 채택.
- **DC-TSK-001**: Decomposed tasks mapping structure (TSK-R0-001 ~ TSK-R1-013) for R0 and R1 releases.
- **DC-PRM-001**: Grouping of 17 individual tasks into 7 sequential implementation prompts.
- *(Note: All release, deployment, operations, handoff, and retrospective decisions are Candidates pending human approval).*

## 3. Working Assumptions
- **A-13-001**: Centralizing setup instructions in a root README will prevent developer environment setup misalignment.
- **A-101**: 동시 사용자 수(~10명) 수준에서는 정교한 데이터베이스 락 메커니즘을 배제하고 단일 Document 갱신으로 무결성 대응.
- **A-201**: Firebase Client SDK를 프론트 단에서 직접 호출하는 Serverless 아키텍처 구현.
- **A-VAL-001**: 로컬 개발 환경에서 Local Firebase Emulator가 정상 기동되고, CLI를 통한 rules 및 E2E 테스트 수행이 가능할 것으로 가정함.

## 4. Open Questions
- *None.*

## 5. Rejected / Superseded Options
- **Node.js Intermediate APIs (Option B)**: 비용 및 관리 소요 방지를 위해 제외.
- **Message Broker Events (Kafka/RabbitMQ)**: 내부 이벤트 전이로 대체하여 제외.
- **Separate subcollection for Turns**: call_id aggregation 유지 및 쿼리 비용 세이브를 위해 turns를 parent 도큐먼트 내 array로 포함.
- **17 Separate Prompts**: Writing 17 separate prompts rejected in favor of 7 cohesive, sequential prompts to reduce session bootstrapping overhead.

## 6. Constraints That Must Not Be Violated
- **Workflow**: Do not revise reusable skills without explicit human approval.
- **Scope**: Direct React + Classic Firebase Serverless. Vanilla CSS styling only (Tailwind CSS 사용 금지).
- **Security**: 미인가 사용자의 접근을 Firestore Security Rules 단에서 전면 차단 (`request.auth != null`).
- **Privacy**: 1차 평가 도중엔 타인의 라벨 정보를 read 요청 시 Firestore Rules 에 의해 `permission-denied` 반환.

## 7. Key Context for Next Action
- **Retrospective Complete**: Stage 13 is complete. The retrospective identified setup instructions as the key gap. SIB-001 will create a root `README.md`.

## 8. Required Inputs for Next Action
- [/workflow/13_retrospective/result.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/13_retrospective/result.md)
- [/workflow/13_retrospective/13_skill_improvement_backlog.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/13_retrospective/13_skill_improvement_backlog.md)

## 9. Do Not Do
- Do not treat unapproved improvement suggestions as approved workflow changes.
- Do not modify reusable skills without explicit human approval.