# 08 Acceptance Tests

## 1. Status
- Draft

## 2. Acceptance Test ID Convention
- **AT-XXX**: LAMS-v0 시스템의 인수 테스트 고유 식별자.
- 각 테스트는 대응하는 요구사항(Requirement ID) 및 인수 조건(Acceptance Criteria ID)과 연결되어 추적됩니다.

## 3. Acceptance Test Inventory

| Test ID | Requirement ID | Acceptance Criteria ID | Release Slice | Actor/System | Preconditions | Scenario | Expected Result | Validation Method | Automation Level | Test Data | Pass/Fail Criteria | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **AT-001** | FR-001 | AC-FR-001-01 | R1 (MVP) | ROLE-001 (Admin) | 관리자 로그인 상태, 업로드 화면 진입 | 유효한 대화 JSON 파일을 업로드 버튼을 눌러 제출 | 파일 파싱 완료 메시지 및 업로드 건수 표시. 대화 목록에 10건 정상 노출. | E2E (UI Test) | Automated | `dataset_clean.json` (10건) | Pass: DB에 10개 문서 적재 및 UI 목록 노출.<br>Fail: DB 적재 누락 또는 화면 갱신 실패. | |
| **AT-002** | FR-001 | AC-FR-001-02 | R1 (MVP) | ROLE-001 (Admin) | 관리자 로그인 상태 | 손상되거나 필수 키(`call_id` 등)가 없는 JSON 업로드 시도 | "업로드 실패: 잘못된 형식의 파일입니다" 에러 팝업 노출, DB 변경 전무 (All-or-Nothing) | Unit / E2E | Automated | `dataset_duplicate_ids.json` (손상됨) | Pass: 에러 토스트 노출 및 DB 영향 없음.<br>Fail: 일부 데이터 불완전 적재 또는 웹 크래시. | |
| **AT-003** | FR-002 | AC-FR-002-01 | R1 (MVP) | ROLE-001 (Admin) | 관리자 로그인, DB에 데이터셋 존재 | 전체 삭제 모달 팝업에서 "DELETE ALL DATASET"을 입력 후 [확인] 클릭 | DB의 conversations, labels, llm_results 컬렉션 영구 삭제 및 화면 초기화 | E2E (UI Test) | Automated | N/A | Pass: DB 문서 개수 0건 갱신 확인.<br>Fail: 2차 안전장치 우회 삭제 또는 문서 잔존. | 감사 로그 적재 여부 포함 검증 |
| **AT-004** | FR-003 | AC-FR-003-01 | R1 (MVP) | ROLE-002 (Evaluator) | 로그인 상태, DB에 대화셋 적재됨 | 대화 목록에서 특정 `call_id` 클릭 | 상세 대화 화면으로 이동하고 턴(Turn) 번호순으로 정렬된 말풍선 레이아웃 표시 | E2E (UI Test) | Automated | `call-001` (Turn sequence_no 포함) | Pass: sequence_no 순서대로 말풍선 노출.<br>Fail: 정렬 오류 혹은 말풍선 깨짐. | |
| **AT-005** | FR-004 | AC-FR-004-01 | R1 (MVP) | ROLE-002 (Evaluator) | 로그인 상태, 대화 상세 화면 진입 | 유해성 "Present", 유형 "2", 위험도 "2", 근거구절 작성 후 [평가 완료] 제출 | `calls/{id}/evaluators/{uid}` 서브컬렉션에 데이터 저장 후 대화 목록으로 전환 | E2E (UI Test) & Rules | Automated | `evaluator-123` 세션 | Pass: 지정 서브컬렉션 문서 정상 생성 및 write-isolation 룰 통과.<br>Fail: 필수 필드 누락 적재 또는 권한 차단. | |
| **AT-006** | FR-004 | AC-FR-004-02 | R1 (MVP) | ROLE-002 (Evaluator) | 로그인 상태, 이미 평가 완료한 대화 존재 | 목록에서 평가 완료 대화 재클릭 | 우측 평가 입력 폼에 기존 기입 결과(Present, 유형, 근거)가 자동으로 프리필(Prefill)됨 | E2E (UI Test) | Automated | `call-001` 기입 라벨 | Pass: 프리필 완료 상태 렌더링 확인.<br>Fail: 빈 입력 폼 노출 또는 오류. | |
| **AT-007** | FR-005 | AC-FR-005-01 | R1 (MVP) | ROLE-001 (Admin) | 관리자 로그인 상태, 대화셋 존재 | 모델별 LLM 결과 JSON 파일을 임포트 시도 | `calls/{id}/llm_results` 컬렉션에 OpenAI, Gemini, Claude 탐지 결과 갱신 적재 | Integration | Automated | `llm_predictions.json` | Pass: call_id 매핑 성공 및 DB 필드 매치.<br>Fail: 미등록 call_id 무시 실패 또는 오류. | |
| **AT-008** | FR-006 | AC-FR-006-01 | R1 (MVP) | ROLE-001 (Admin) | 관리자 로그인 상태 | 통계 지표 JSON 파일 업로드 | `dashboard/statistics` 도큐먼트에 Kappa 및 F1 스펙 테이블 테이블 갱신 저장 | Integration | Automated | `dashboard_stats.json` | Pass: dashboard 도큐먼트 업데이트 완료.<br>Fail: 스키마 거절 에러 미처리. | |
| **AT-009** | FR-007 | AC-FR-007-01 | R1 (MVP) | ROLE-002 / ROLE-001 | 로그인 상태 | 대시보드 탭 로딩 | 상단에 "나의 진척률: 30%" 형태 게이지 바 및 하단에 Kappa 수치 표/차트 렌더링 | E2E / Manual | Hybrid | N/A | Pass: 수치 매칭 및 Vanilla CSS 그래프 표 렌더링.<br>Fail: 게이지 계산 수식 오류 또는 차트 렌더링 실패. | |
| **AT-010** | SEC-001 | AC-SEC-001 | R1 (MVP) | Guest (익명 사용자) | 로그인되지 않은 브라우저 상태 | URL 창에 직접 `http://localhost:3000/evaluate` 또는 `/admin` 진입 시도 | 페이지 로딩이 차단되고 로그인 화면으로 즉시 강제 리다이렉트됨 | E2E (UI Test) | Automated | N/A | Pass: 접근 불가 및 로그인 화면 포커싱.<br>Fail: 미인증 상태로 1초 이상 페이지 노출. | |
| **AT-011** | SEC-003 | AC-SEC-003 | R1 (MVP) | ROLE-001 (Admin) | 관리자 로그인 상태 | PII 정보(휴대전화번호)가 포함된 대화 JSON 파일 업로드 시도 | 업로드 실행 즉시 위험 경고 팝업이 노출되며, [진행 확인]을 클릭해야 최종 저장 완료됨 | E2E (UI Test) | Automated | `dataset_pii_dirty.json` | Pass: 경고 모달 노출 및 동의 후 DB 저장 완료.<br>Fail: 경고 없이 다이렉트 저장되거나 업로드 전면 먹통. | |

## 4. Negative and Edge Case Tests
- **AT-011-NEG (PII warning canceled)**:
  - **Given**: PII 정보가 포함된 파일 선택 후 업로드 진행.
  - **When**: 위험 경고 팝업에서 [취소] 또는 팝업을 닫을 때.
  - **Then**: 데이터베이스 적재가 차단되어 Firestore에 아무 변경도 유입되지 않아야 함. (Pass: DB 갱신 차단 확인 / Fail: 취소했음에도 백그라운드 적재).
- **AT-002-NEG (Non-existing call_id for LLM predictions)**:
  - **Given**: DB에 없는 `call-999` call_id가 포함된 LLM 결과 JSON 업로드 시도.
  - **When**: 파서 동작 시.
  - **Then**: "불일치 call_id 가 감지되었습니다" 예외 리스트 노출 후 갱신이 무시되어야 함. (Pass: 예외 격리 / Fail: 미등록 도큐먼트 생성 또는 무한 루프).

## 5. Role and Permission Tests
- **AT-012 (Evaluator Admin-page block)**:
  - **Given**: `role_evaluator_1` 세션 로그인 상태.
  - **When**: URL 창에 직접 `http://localhost:3000/admin`을 치고 진입 시도.
  - **Then**: "권한이 없습니다" 경고가 뜨거나 홈 화면으로 튕김. REST SDK 단에서 `users` 컬렉션의 Admin role 검증에 의해 `update/delete` 쿼리가 Firestore Rules 레벨에서 차단되어야 함. (Pass: Rules Deny 확인 / Fail: 일반 유저가 데이터셋 삭제 실행 가능).

## 6. Data and Privacy Tests
- **AT-013 (Round 1 Blind-spot Rules)**:
  - **Given**: `role_evaluator_1` 및 `role_evaluator_2`가 동일 대화 `call-001`에 대해 평가를 진행 중. 대화의 `status`가 `"Round 1 Active"`인 상태.
  - **When**: `role_evaluator_1` 세션에서 Firestore SDK를 사용하여 `calls/call-001/evaluators/test-eval-2` 문서를 GET 요청할 때.
  - **Then**: Firestore Security Rules(`DSR-002`)에 의하여 `permission-denied` 에러가 즉시 반환되어야 함.
  - **Expected Evidence**: Rules unit test 단언 통과 (`assertSucceeds`/`assertFails` 함수 활용).
- **AT-014 (Audit Log Immutability)**:
  - **Given**: `role_admin` 세션 로그인 상태.
  - **When**: `audit_logs` 컬렉션 내 임의의 기입 로그 ID를 대상으로 `updateDoc` 또는 `deleteDoc`을 시도할 때.
  - **Then**: 관리자 권한을 가졌더라도 Firestore Rules(`DSR-004`)에 의해 수정 및 삭제 동작이 100% 에러 거부 처리되어야 함 (Append-only 보증).

## 7. Integration and External Dependency Tests
- **AT-015 (3-stage Adjudication transitions logic)**:
  - **Given**: `calls/call-001`의 `status`가 `"Round 1 Active"`.
  - **When**: 
    - 1차: `test-eval-1`, `test-eval-2`, `test-eval-3` 3인이 모두 Toxicity "Present", 유형 "2"로 합의 일치 제출 -> **ST-002** 발동하여 status가 자동으로 `"Consensus Reached"`로 전이되고 Gold Standard 정답 생성 확인.
    - 2차: 3인 의견 불일치 상태에서 `skip_round2`가 `false` 인 경우 -> **ST-003** 발동하여 status가 `"Round 2 Active"`로 전이.
    - 3차: `Round 3 Active` 상태에서 지정된 Adjudicator가 아닌 `test-eval-1`이 Gold Standard에 수동 쓰기를 시도할 때 -> Rules에 의해 거절됨.
    - 4차: `Consensus Reached` 확정 상태에서 `test-eval-1`이 본인의 Round 1 라벨 수정 쓰기를 재요청할 때 -> **INV-005**에 의해 거절됨.
  - **Automation Level**: Automated (Vitest/Jest Rules unit test).

## 8. Manual-Only Acceptance Tests
- **AT-009-MAN (Visual CSS Premium Aesthetics & Responsiveness)**:
  - **Given**: UI 대시보드 페이지 로드 상태.
  - **When**: 브라우저 개발자 도구를 켜서 모바일 해상도(375px), 태블릿 해상도(768px), 데스크톱 해상도(1440px)로 뷰포트를 수동 전환할 때.
  - **Then**: 
    - CSS Glassmorphism 반투명 백드롭 필터가 깨지지 않고 깔끔하게 오버레이 렌더링됨.
    - 타이포그래피 Outfit/Inter 폰트의 정렬 상태가 정교하게 유지됨.
    - 스크롤 영역이 유실되지 않고 상담 말풍선이 온전히 가독 가능함.

## 9. Coverage Gaps
- **VG-001 (Import Schema Details)**:
  - **Affected Requirement**: FR-001, FR-005, FR-006
  - **Affected Acceptance Criteria**: AC-FR-001-02, AC-FR-005-01, AC-FR-006-01
  - **Reason**: 외부 JSON 데이터의 구체적인 필드 자료형 및 스키마 명세가 미확정되어, 정밀 밸리데이션 통과/실패 시나리오 테스트 코드는 임시 mock 스펙 기반으로만 작성 가능.
  - **Impact**: 실무 데이터 주입 시 스키마 미스매치로 인한 파싱 런타임 예외가 발생할 가능성이 존재함.
  - **Suggested Next Stage Handling**: 08c에서 Mock Schema 규격을 수립하고, Task Breakdown 시점에 JSON Import Schema validation 단위 테스트 태스크를 필수로 할당함.

---

### Next sub-skill: 08c_validation_commands_harness
Use these as primary inputs:
- [/workflow/08_test_strategy/08_test_strategy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_test_strategy.md)
- [/workflow/08_test_strategy/08_acceptance_tests.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_acceptance_tests.md)

Preserve:
- AT IDs;
- automation level choices;
- manual-only classification;
- test data needs;
- coverage gaps;
- open questions affecting command or harness setup.
