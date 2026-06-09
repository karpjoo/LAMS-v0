# 08 Validation Commands

## 1. Status
- Draft

## 2. Command ID Convention
- **CMD-XXX**: 테스트 실행 및 정적 분석, 개발 에뮬레이터 구동을 위한 명령어 식별자.
- 구체적인 CLI 커맨드가 구현 전 단계인 경우 `Needs Confirmation` 및 Placeholder 형태로 식별합니다.

## 3. Command Inventory

| Command ID | Command / Placeholder | Purpose | When to Run | Prerequisites | Expected Success Signal | Failure Evidence | CI Suitable | Related Test IDs | Status |
|---|---|---|---|---|---|---|---|---|---|
| **CMD-001** | `npm run test:unit` | 어플리케이션 단위 테스트 실행 | 코드 변경 시 수동 실행 및 PR 빌드 시 자동화 | `package.json` 내 test runner 설정 완료 | `All tests passed` 또는 `0 failed` 터미널 출력 및 exit code `0` | `Failed tests` 명세 및 non-zero exit code | Yes | AT-002, AT-011 | Needs Confirmation (Vitest/Jest 셋업 필요) |
| **CMD-002** | `npm run test:rules` | Firestore Security Rules 단위 테스트 실행 (Vitest/Jest) | 보안 규칙 변경 시 및 CI 검증 시 | 로컬 Firebase Emulator 설치 및 `@firebase/rules-unit-testing` 의존성 설치 | `Rules assertions passed` 및 exit code `0` | `permission-denied` 예외 Assertion 실패 또는 exit code `1` | Yes | AT-005, AT-010, AT-012, AT-013, AT-014, AT-015 | Needs Confirmation (Vitest rules unit test 라이브러리 셋업 필요) |
| **CMD-003** | `npm run test:e2e` | UI E2E 전체 시나리오 실행 (Playwright/Cypress) | 주요 UI 및 흐름 변경 시, 배배포 전 최종 QA 단계 | 로컬 개발 서버 및 에뮬레이터 구동 상태 | `Playwright tests passed` 및 exit code `0` | 스크린샷 덤프, assertion error 목록 및 exit code `1` | Yes (Headless) | AT-001, AT-003, AT-004, AT-006, AT-009, AT-011 | Needs Confirmation (Playwright 의존성 설치 필요) |
| **CMD-004** | `npm run lint` / `npm run typecheck` | 정적 소스 코드 린트 및 타입 검사 | 커밋 전 수동 실행 및 CI 정적 검증 단계 | ESLint, TypeScript 설정 파일 존재 | `ESLint clean`, `TypeScript check complete` (no errors) | Lint error 리스트 노출 및 exit code `1` | Yes | N/A | Confirmed (기본 툴 빌드 체인 포함 예정) |
| **CMD-005** | `firebase emulators:start` | 로컬 개발용 Firebase 에뮬레이터 기동 | 로컬 통합 테스트 및 E2E 테스트 실행 직전 | `firebase.json` 및 emulator suite 설치 완료 | `All emulators ready` 로그 노출 및 포트 활성화 | 포트 충돌(Address already in use) 또는 자바 런타임 오류 | No (테스트 러너가 자체 스폰하는 방식으로 CI 우회) | AT-005, AT-010, AT-012, AT-013, AT-014, AT-015 | Confirmed |

## 4. Local Developer Validation
- 로컬 개발자는 코드 수정 시 `CMD-004 (lint/typecheck)`를 수동 구동하여 정적 정합성을 우선 검증합니다.
- `CMD-005 (emulator start)`를 백그라운드 태스크로 띄워 둔 뒤, `CMD-002 (rules unit test)`를 구동하여 보안 규칙을 실시간 피드백 루프로 검증합니다.

## 5. CI Validation
- PR 생성 및 Master 브랜치 머지 트리거 시 GitHub Actions 등의 CI 서버가 다음 커맨드를 순차적으로 동작시킵니다:
  1. `npm ci` (의존성 클린 설치)
  2. `npm run lint` & `npm run typecheck`
  3. `npm run test:unit`
  4. `npm run test:rules` (CI 환경 내에서 에뮬레이터를 백그라운드로 자동 스폰하여 실행)

## 6. Environment-Specific Validation
- 로컬 환경과 CI 환경 간 포트 충돌을 방지하기 위해, `firebase.json` 에뮬레이터 포트 설정을 고정하고 개발 환경 구성을 `.env.test`와 `.env.development`로 분리하여 바인딩합니다.

## 7. Manual Command Setup Needed
- Firebase CLI 도구 전역 설치: `npm install -g firebase-tools`
- 로컬 에뮬레이터 구성 요소(Firestore, Auth)의 설치 및 Java SDK 11 버전 이상의 존재 여부 사전 수동 설치 필요.

## 8. Unknown or Deferred Commands
- **CMD-003 (test:e2e)**: Playwright를 사용할지 Cypress를 사용할지에 대한 최종 빌드 스택 결정이 미완료 상태이므로, 구체적인 CLI 인자(`--project=chromium` 등)는 Stage 9/10에서 확정 갱신합니다.

---

### Next sub-skill: 08d_manual_specialized_validation
Use these as primary inputs:
- [/workflow/08_test_strategy/08_test_strategy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_test_strategy.md)
- [/workflow/08_test_strategy/08_acceptance_tests.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md)
- [/workflow/08_test_strategy/08_validation_commands.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_validation_commands.md)

Preserve:
- command IDs;
- placeholders requiring confirmation;
- manual-only validation needs;
- fixture and environment assumptions;
- gaps that require manual or specialized validation.
