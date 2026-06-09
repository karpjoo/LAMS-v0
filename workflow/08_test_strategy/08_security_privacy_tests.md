# 08 Security and Privacy Tests

## 1. Status
- Draft

## 2. Scope
본 문서는 LAMS-v0 시스템의 보안(Security), 개인정보보호(Privacy) 및 규정 준수(Compliance) 요구사항을 완벽히 충족하는지 검증하기 위한 상세 테스트 설계서입니다. Firestore Security Rules에 강제된 데이터 격리 규칙과 감사 로그(Audit Logs)의 불변성(INV-003)을 독립적으로 테스트하는 시나리오를 구성합니다.

## 3. Security / Privacy Test Inventory

| Test ID | Requirement/Risk ID | Role/Data Boundary | Scenario | Expected Result | Method | Automation Level | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|
| **ST-SEC-01** | SEC-001 | 익명 사용자 접근 거부 | 로그인 토큰 없이 REST client로 `/conversations` GET 요청 | `permission-denied` 에러 코드 반환 및 HTTP 403 상당의 예외 발생 | Integration (Rules unit test) | Automated | Unit test console assert output | Auth Guard 검증 |
| **ST-SEC-02** | SEC-002 | 타인 라벨 쓰기 차단 | `test-eval-1` 로그인 상태에서 `calls/call-001/evaluators/test-eval-2` 문서 쓰기 시도 | Firestore Rules에 의해 즉각 거절 (Permission Denied) | Integration (Rules unit test) | Automated | Rules unit test run | write-isolation 정책 |
| **ST-SEC-03** | BR-007 | 1차 평가 Blind spot | `calls/call-001` status가 `"Round 1 Active"`. `test-eval-1`이 `calls/call-001/evaluators/test-eval-2` 문서 읽기 시도 | Firestore Rules에 의해 `permission-denied` 에러 발생 | Integration (Rules unit test) | Automated | Rules assert run | 평가자 간 독립성 가드 |
| **ST-SEC-04** | INV-003, BR-004 | 감사 로그 불변성 | `test-admin` 로그인 상태에서 `audit_logs/{log_id}` 문서 수정(update) 또는 삭제(delete) 시도 | Firestore Rules에 의해 `update` 및 `delete` 트랜잭션 전면 차단 | Integration (Rules unit test) | Automated | Rules check result | Append-only 보증 |
| **ST-SEC-05** | BR-010 | Adjudicator 결정 독점 | `test-eval-1` 로그인 상태에서 `calls/call-001/gold_standard` 문서 쓰기 시도 | is_adjudicator 필드가 false이므로 Rules에 의해 즉각 거절 | Integration (Rules unit test) | Automated | Rules assert run | 3차 최종 결정 권한 제한 |

## 4. Access Control and Permission Tests
- **로그인 역할 검증 세부 시나리오**:
  - `role_evaluator`가 관리자 기능(데이터셋 업로드, 전체 삭제)을 수행하는 API를 모의 전송하여 Firestore Security Rules 단에서 Admin이 아님을 감지하고 차단하는 케이스 자동화 테스트 포함.

## 5. Data Exposure / Privacy Tests
- **PII warning regex validation**:
  - `010-XXXX-XXXX`, `010 XXXXXXXX`, `010-XXX-XXXX` 등 국내 휴대전화번호의 다양한 표현 형식이 PII 스캐너의 Javascript 정규식 매칭을 통해 올바르게 감지되어 경고 모달을 띄우는지 Unit 테스트 코드로 검증.

## 6. Audit / Logging Tests
- **감사 로그 누락 방지 검증**:
  - 데이터셋 업로드(FR-001), 삭제(FR-002), 라벨 저장(FR-004) 시 트랜잭션 배치 쓰기(`writeBatch`)를 통해 비즈니스 데이터와 `audit_logs` 감사 데이터가 단일 원자적 트랜잭션으로 커밋되는지 여부 검증 (둘 중 하나라도 실패 시 전체 롤백되어 누락 로그가 남지 않도록 제어).

## 7. Security / Privacy Gaps
- **SG-001 (Firestore Rules testing dependencies)**: Local Auth 및 Firestore Emulator 간 Custom Claims 설정 동기화가 로컬 스크립트 작성 시점에서 간헐적 딜레이를 유발할 수 있어, 규칙 검증 라이브러리의 비동기 타임아웃 처리가 세밀히 요구됨. (08c 테스트 명령어 및 하네스 설계 시 환경 변수로 통제 예정)
