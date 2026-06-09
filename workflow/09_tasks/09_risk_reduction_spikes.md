# 09 Risk Reduction Spikes

## 1. Scope Basis
This document captures risk-reduction spike tasks designed to investigate and verify framework compatibilities and configurations before starting primary feature development.

## 2. Spike Tasks

### SPK-001: Firestore Rules-Unit-Testing & Emulator Setup Spike
- **Objective**: Verify that the local Firebase emulator can spin up and correctly load `@firebase/rules-unit-testing` using Vitest in the local environment.
- **Why Needed**: The core security layer (write isolation, append-only logs, and Round 1 blind-spot lock) relies entirely on Firestore Security Rules. Ensuring the testing loop works before feature development prevents regression blockages.
- **Verification Plan**:
  - Run `firebase emulators:start` in a background terminal.
  - Run a basic rules assertions spec file to confirm that a simulated anonymous write is rejected (`assertFails`) and a matching credentialed write succeeds (`assertSucceeds`).
- **Success Signal**: Vitest console prints pass logs for basic emulator assertions.

### SPK-002: Playwright Headless Browser Sandbox Setup Spike
- **Objective**: Ensure Playwright can load the React client on the local development port and interact with form fields during headless validation testing.
- **Why Needed**: Verifies that E2E tests are viable in the developer environment.
- **Success Signal**: Playwright runs a basic page title assertion test successfully.
