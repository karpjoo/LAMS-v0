# 08 Test Data and Fixtures

## 1. Status
- Draft

## 2. Fixture ID Convention
- **FX-XXX**: 테스트를 수행하기 위해 요구되는 목(Mock) 데이터 및 파일 템플릿 식별자.

## 3. Fixture Inventory

| Fixture ID | Related Test IDs | Persona/Data Shape | Valid/Invalid/Edge | Privacy Sensitivity | Seed/Reset Needs | Mock/Stub Needs | Cleanup Needs | Notes |
|---|---|---|---|---|---|---|---|---|
| **FX-001** | AT-001 | `dataset_clean.json` (대화 데이터셋 파일) | Valid | None (비식별 완료) | DB 일괄 초기화 필요 | N/A | 테스트 완료 후 `CMD-003`에서 Delete Dataset 호출 | 필수 스키마 만족(call_id, turns array) |
| **FX-002** | AT-002 | `dataset_corrupted.json` (스키마 손상 파일) | Invalid (Edge case) | None | N/A | N/A | N/A | call_id가 누락되었거나 JSON 문법 에러 유발용 |
| **FX-003** | AT-011 | `dataset_pii_dirty.json` (PII 포함 파일) | Valid (PII Warning Edge) | Medium (테스트용 가짜 전화번호 포함) | N/A | N/A | N/A | 국내 휴대전화번호 `010-1234-5678` 텍스트 포함 |
| **FX-004** | AT-007 | `llm_predictions.json` (LLM 판정 결과 파일) | Valid | None | call_id 정합성 검사 | N/A | N/A | 3개 모델(OpenAI, Gemini, Claude) 판정 매핑 데이터 |
| **FX-005** | AT-008 | `dashboard_stats.json` (외부 계산 통계 파일) | Valid | None | dashboard/statistics 컬렉션 덮어쓰기 | N/A | N/A | Fleiss' Kappa 수치 포함 JSON |

## 4. Role and Permission Personas
각 역할에 맞추어 Local Auth Emulator에서 로그인할 가상 테스트 계정 명세입니다:

1. **`test-admin` (Admin)**
   - UID: `"test-admin-uid"`
   - Email: `"admin@test.com"`
   - User Profile Document: `users/test-admin-uid` -> `{ role: "Admin", is_adjudicator: false }`
2. **`test-eval-1` (Evaluator 1)**
   - UID: `"test-eval-1-uid"`
   - Email: `"eval1@test.com"`
   - User Profile Document: `users/test-eval-1-uid` -> `{ role: "Evaluator", is_adjudicator: false }`
3. **`test-eval-2` (Evaluator 2)**
   - UID: `"test-eval-2-uid"`
   - Email: `"eval2@test.com"`
   - User Profile Document: `users/test-eval-2-uid` -> `{ role: "Evaluator", is_adjudicator: false }`
4. **`test-eval-3` (Evaluator 3)**
   - UID: `"test-eval-3-uid"`
   - Email: `"eval3@test.com"`
   - User Profile Document: `users/test-eval-3-uid` -> `{ role: "Evaluator", is_adjudicator: false }`
5. **`test-adjudicator` (Adjudicator / Expert)**
   - UID: `"test-adjudicator-uid"`
   - Email: `"adjudicator@test.com"`
   - User Profile Document: `users/test-adjudicator-uid` -> `{ role: "Evaluator", is_adjudicator: true }`

## 5. External Service Mocks / Stubs
- Firebase Auth 및 Firestore는 외부 라이브 접속을 일체 배제하고, `Firebase Local Emulator`를 Stubbing 레이어로 100% 모의 활용합니다.
- 외부 API 연동(예: OpenAI/Gemini 실시간 호출)이 MVP 범위에서 아예 제외되었으므로, 해당 API의 별도 모의 Mocking 코드는 작성할 필요가 없습니다.

## 6. Data Reset and Cleanup Strategy
- Firestore Security Rules 단위 테스트 및 UI E2E 테스트 구동 전후에, Local Emulator REST API를 호출하여 데이터베이스 상태를 전면 초기화(Clear Database)합니다:
  - `curl -v -X DELETE "http://localhost:8080/emulator/v1/projects/lams-v0/databases/(default)/documents"`
- 이를 통해 각 테스트 케이스가 독립적인 빈 데이터베이스 환경에서 데이터 충돌 없이 수행됨을 보장합니다.

## 7. Fixture Gaps
- **FG-001 (Schema Key Names)**:
  - **Description**: `llm_predictions.json` 및 `dashboard_stats.json`에 주입될 상세 통계 테이블 필드 목록(예: f1_score, kappa_value 등 키 네임)이 실제 데이터 분석 포맷과 일치하지 않을 수 있음.
  - **Mitigation**: Stage 8 릴리즈 승인 전 mock JSON 구조의 상세 필드 스펙을 기획안 수준으로 확정 정의하고, Stage 9 작업 분배 시 parser validation 로직과 fixture 데이터에 동시 반영함.
