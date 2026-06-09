# 08 Test Strategy

## 1. Status
- Draft

## 2. Purpose
본 문서는 LAMS-v0 프로젝트의 테스트 및 검증 전략을 수립합니다. 신규 개발 중 요구사항(Requirements), 인수 조건(Acceptance Criteria), 시스템 아키텍처 및 데이터 보안 규칙이 최종 작업 명세서(Task Cards)로 쪼개지기 전, 각 요건을 어떻게 테스트하고 무결성을 증명할 것인지에 대한 계획을 기술합니다.

특히 Pure Client-side Serverless 환경에서 발생할 수 있는 데이터 오염 및 보안 무효화를 방지하기 위해, Firestore Security Rules에 대한 에뮬레이터 기반 자동화 검증과 3단계 Adjudication 상태 전이에 대한 검증을 우선적으로 설계합니다.

## 3. Inputs Used
- [/workflow/context/context_packet.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/context_packet.md)
- [/workflow/context/ASSUMPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/ASSUMPTIONS.md)
- [/workflow/context/OPEN_QUESTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/OPEN_QUESTIONS.md)
- [/workflow/context/TRACEABILITY_MATRIX.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/TRACEABILITY_MATRIX.md)
- [/workflow/03_requirements/03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
- [/workflow/03_requirements/03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- [/workflow/04_domain/04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- [/workflow/05_architecture/05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md)
- [/workflow/06_data/06_data_security_rules.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_data_security_rules.md)
- [/workflow/07_mvp_release/07_mvp_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_mvp_scope.md)

## 4. Validation Scope

### In Scope for MVP
- **대화 데이터셋 관리 (FR-001, FR-002, SEC-003, SEC-004)**: JSON 파일 파싱 및 Firestore 적재, PII 스캔 경고 얼럿 노출, 2단계 텍스트 입력 확인 삭제 인터락.
- **평가 인터페이스 및 본인 라벨 저장 (FR-003, FR-004)**: 대화 턴 순차 렌더링, 본인 작성 라벨 저장/수정, 재진입 시 기존 값 프리필(Prefill).
- **외부 LLM/통계 임포트 (FR-005, FR-006)**: 외부 오프라인 JSON 판정 결과 매핑 업로드, 외부 Kappa 통계 지표 적재.
- **연구 진행 현황 대시보드 (FR-007)**: 전체 대화 대비 개인 라벨 완료 비율(진척률), 적재된 외부 통계 비교 차트/테이블 시각화.
- **보안 및 규정 준수 (SEC-001, SEC-002, DSR-001 ~ DSR-006)**: 로그인 세션 강제화, Firestore Rules 기반 Evaluator 라벨 격리(본인 이외 쓰기 제한), 1차 평가 중 타인 라벨 비공개(Blind spot), 감사 로그 컬렉션의 수정/삭제 불가 가드(Append-only).
- **3단계 합의 이관(Adjudication) 비즈니스 로직**: 1차 평가 일치 시 자동 Gold Standard 확정, 불일치 시 2차 의견 공유 전이, 3차 Adjudicator 최종 정답 기록 및 수정 잠금(INV-004, INV-005).

### Deferred to Later Release
- **Q-101 (Disagreement Filter)**: 1, 2차 평가 불일치 대화만 모아보는 Adjudicator 전용 필터링 조회 화면 (R2 Post-MVP 이월).
- **Q-105 (Evaluator Detail Stats)**: 개별 평가자별 상세 진척 현황 대시보드 표 (R2 Post-MVP 이월).

### Explicitly Out of Scope
- 실시간 LLM 추론 연동 API 검증.
- 웹 내부 실시간 Kappa 통계 수학적 계산기 모듈 검증.
- 업로드 대화 원본의 웹 내부 자동 마스킹 가공 로직 검증.
- 콜센터 음성 녹취 오디오 재생 UI 작동 검증.

### Blocked by Open Question
- 없음 (통계/LLM 임포트 세부 필드 규격은 JSON 스키마를 08c 단계에서 Mock 데이터셋으로 임시 가정한 후 09 Task Breakdown 이전 최종 확정).

## 5. Test Levels

### Unit Tests
- **적용 대상**: JSON 파일 파서 모듈, PII 감지용 국내 휴대전화번호 정규식 헬퍼 함수, 3단계 Adjudication 상태 전이 논리 엔진.
- **검증 내용**: 개별 순수 함수 동작의 올바름, 잘못된 스키마 유입 시 Exception 처리.

### Integration Tests
- **적용 대상**: Firestore Security Rules (로컬 에뮬레이터 환경).
- **검증 내용**: 로그인 상태에 따른 차단, Uid 격리 규칙, `Consensus Reached` 도큐먼트의 하위 라벨 수정 불가 규칙, `audit_logs` 컬렉션의 `update/delete` 원천 거부(false) 검증.

### Contract Tests
- **적용 대상**: 외부 JSON 데이터 스키마 파서 계약.
- **검증 내용**: 업로드용 대화셋 JSON, LLM 결과 JSON, 통계 결과 JSON 파일의 필수 헤더 및 데이터 자료형 규격 일치 검증.

### End-to-End Tests
- **적용 대상**: 핵심 유저 시나리오 전체 (인증 리다이렉션, 라벨 기록 폼 인터랙션, 삭제 인터락 입력).
- **검증 내용**: 브라우저 렌더링 상태에서 사용자 동작(입력, 클릭)과 Firestore DB 실시간 연동 결합 검증.

### Security and Privacy Tests
- **적용 대상**: PII warning scan 및 Round 1 Blind spot 차단.
- **검증 내용**: 1차 평가 활성화 상태에서 타인 라벨 데이터 REST API 직접 조회 시 `permission-denied` 반환 여부.

### Performance Tests
- 본 LAMS-v0는 소규모 연구용이므로, 성능 테스트 수준은 로컬 개발 서버 구동 시 Lighthouse UI/반응 지연 속도 1초 미만 육안 확인으로 대체.

### Accessibility Tests
- a11y 표준을 따르는 semantic HTML 마크업(대화 말풍선, 리스트, 모달 레이블링) 여부 확인.

### Manual Validation
- **적용 대상**: Vanilla CSS 디자인 완성도 (Glassmorphism 투명도 효과, 다크/라이트 모드 가독성, Outfit 폰트 렌더링), 반응형 뷰포트 변경 시 그리드 깨짐 검수.

### Exploratory Validation
- 네트워크 단절 및 에러 바운더리 화이트 스크린 크래시 방지.

## 6. Requirement-to-Validation Strategy

| Requirement ID | Acceptance Criteria ID | Validation Method | Automation Level | Priority | Risk Notes |
|---|---|---|---|---|---|
| **FR-001** | AC-FR-001-01, AC-FR-001-02 | Unit (Parser) & E2E (UI Import) | Automated | High | JSON parsing 오류 시 애플리케이션 크래시 방지 필요 |
| **FR-002** | AC-FR-002-01 | E2E & Manual (Delete check) | Automated | High | 데이터 소실 위험이 크므로 2단계 인터락 가드 검증 필수 |
| **FR-003** | AC-FR-003-01 | E2E (Workspace turns) | Automated | High | 대화 말풍선 순서 정렬 sequence_no 보장 여부 |
| **FR-004** | AC-FR-004-01, AC-FR-004-02 | E2E & Integration (Rules write) | Automated | Critical | 타인 라벨 수정 오염 방지 및 기존 기입값 Prefill 신뢰성 |
| **FR-005** | AC-FR-005-01 | Integration (LLM Import matching) | Automated | Medium | call_id 매핑 누락 또는 불일치 시 트랜잭션 rollback |
| **FR-006** | AC-FR-006-01 | Integration (Stats Import schema) | Automated | Medium | dashboard/statistics 컬렉션의 schema 형태 일치성 |
| **FR-007** | AC-FR-007-01 | E2E & Manual (Dashboard styling) | Hybrid | Medium | 진척률 분모/분자(완료/전체) 집계 Firestore 쿼리 정합성 |
| **SEC-001** | AC-SEC-001 | E2E & Integration (Auth Rules) | Automated | Critical | 비인가 사용자의 세션 탈취 및 라우트 직접 진입 완전 봉쇄 |
| **SEC-002** | AC-FR-004-01 | Integration (Firestore rules user_id) | Automated | Critical | Firestore Security Rules 차원에서의 강제 격리 검증 |
| **SEC-003** | AC-SEC-003 | E2E (PII pattern matched warning) | Automated | High | 국내 휴대전화번호 포맷 PII 오인 경고 팝업 작동성 |
| **SEC-004** | AC-FR-002-01 | E2E (Confirm text check disabled) | Automated | High | "DELETE ALL DATASET" 오타 시 동작 차단 프론트 인터락 |
| **OPS-001** | AC-FR-002-01, AC-FR-004-01 | Integration (Audit write-only Rules) | Automated | High | audit_logs에 강제 update/delete 시도 시 rules에 의해 에러 거부 |

## 7. Risk-Based Test Priorities

1. **최우선 순위 (P0 - Critical)**:
   - **Firestore Security Rules 권한 통제**: 미인증 로그인 접근 차단 및 `user_id` 격리 규칙.
   - **Round 1 Blind-Spot Block**: 1차 평가 완료 전 타인의 라벨 도큐먼트에 대한 `read` 거절 규칙.
   - **Audit Logs Append-only Guard**: 임의의 로그 위변조 및 수정 차단 규칙 (`allow update, delete: if false`).

2. **우선 순위 (P1 - High)**:
   - **삭제 2단계 인터락**: 관리자 오작동에 의한 영구 데이터 파괴 방지.
   - **대화 셋 멱등성 병합**: 덮어쓰기 유실을 막고 기존 유저 라벨 데이터를 보존하는 `BR-006` 로직.
   - **PII 탐지 경고**: 업로드 텍스트 내 개인정보(전화번호) 감지용 UI 가드.

3. **보통 순위 (P2 - Medium)**:
   - **Dashboard 차트 시각화 및 Prefill**: 프리필 입력 폼 편의성 및 외부 통계 화면 렌더링.
   - **Vanilla CSS 반응형 테마 검수**: 해상도 축소/확대 시 화면 왜곡 수동 검증.

## 8. Test Data and Fixture Strategy

- **사용자 역할별 인증 Mock (Personas)**:
  - `role_admin`: `uid: "test-admin"`, `role: "Admin"`
  - `role_evaluator_1`: `uid: "test-eval-1"`, `role: "Evaluator"`
  - `role_evaluator_2`: `uid: "test-eval-2"`, `role: "Evaluator"`
  - `role_evaluator_3`: `uid: "test-eval-3"`, `role: "Evaluator"`
  - `role_adjudicator`: `uid: "test-adjudicator"`, `role: "Evaluator"`, `is_adjudicator: true`
- **Mock 데이터셋 구성**:
  - `dataset_clean.json`: 5건의 비식별화 준수된 일반 대화.
  - `dataset_pii_dirty.json`: 국내 휴대전화번호(`010-9999-8888`)가 노출된 1건의 대화턴을 포함.
  - `dataset_duplicate_ids.json`: `call_id`가 중복되거나 필수 `turns` 필드가 누락된 손상 데이터.
  - `llm_predictions.json`: 3개 모델(OpenAI, Gemini, Claude)에 매핑될 F1/Toxicity 판정 결과 JSON.
  - `dashboard_stats.json`: Fleiss' Kappa 수치가 들어있는 대시보드 시각화용 통계 JSON.

## 9. Environment and Dependency Strategy

- **Local Emulator Environment**:
  - Firebase Local Emulator를 로컬에서 실행 (`firebase emulators:start`).
  - `Firestore Emulator`를 기동하여 보안 규칙 검증 스크립트 실행.
  - `Auth Emulator`를 활용해 가상 유저 세션 모의 발급.
- **CI Environment (Prerequisites)**:
  - GitHub Actions 등 CI 파이프라인에서 Firebase Tools 및 rules unit 테스트 러너 동작 가능해야 함.
  - v0 구현은 우선적으로 로컬 에뮬레이터를 이용한 CLI 실행 결과를 확보하는 것을 목표로 설정.

## 10. Validation Commands Summary
- 세부 테스트 프레임워크 스크립트 명령어는 08c에서 확정 및 placeholder 화.
- 기본 구상:
  - Rules unit test: `npm run test:rules` (Vitest/Jest + `@firebase/rules-unit-testing` 실행 계획)
  - UI E2E test: `npm run test:e2e` (Playwright 실행 계획)
  - Application Unit test: `npm run test:unit`

## 11. CI Applicability
- **Rules Unit Tests**: 100% CI 탑재 가능.
- **E2E UI Tests**: Headless 모드로 CI 탑재 가능.
- **Manual CSS Check**: CI 불가. 배포 전 로컬 또는 스테이징 단계에서 인간 개발자 수동 육안 승인 필요.

## 12. Non-Automated Validation Rationale
- **Vanilla CSS 디자인 테마 완성도 (NFR-002)**: CSS 스타일링 및 Glassmorphism 반투명 시각화는 자동화 단언(Assertion) 작성이 비효율적이고 무의미하므로, 브라우저 Inspector 반응형 변경 모드를 활용해 인간 개발자가 직접 검수 승인하는 방식을 채택합니다.

## 13. Validation Gaps
- **VG-001 (Import Schema Details)**: 외부 LLM JSON 데이터와 통계 데이터의 정밀 자료형 스펙이 부재하여 파서 예외 처리에 대한 한계 범위 존재. (08c 및 08d 단계에서 임시 구조체 스키마를 가정한 후 검증 설계 보강 예정)

## 14. Decision Candidates
- **DC-VAL-001 (Rules testing framework)**: Firestore 보안 규칙 검증을 위해 `Vitest`와 `@firebase/rules-unit-testing` 패키지를 조합한 로컬 테스트 러너 구성 제안.

## 15. Working Assumptions
- **A-VAL-001**: 로컬 개발 환경에서 Local Firebase Emulator가 정상 동작 가능하여 CLI를 통한 rules 테스트 실행이 보장된다고 가정함.
- **A-VAL-002**: UI E2E 검증을 위해 가상 로그인 인증 토큰 발급 및 rules 테스트 격리 환경이 Firebase Emulator 단에서 로드 가능함.

## 16. Open Questions
- **Q-VAL-001**: E2E 테스트 자동화 도구로 Playwright 대신 가볍고 브라우저 콘솔 검수가 용이한 DevTools MCP 직접 연동 스크립트를 우선적으로 고려해야 합니까? (08c에서 상세 검증 도구 확정 시 결정 예정)

## 17. Approval Required
- 본 08_test_strategy.md 파일 초안의 내용과 검증 범위 구성에 대해 인간 개발자의 승인을 요청합니다.
- 승인 완료 시 본 파일의 Status를 `Approved`로 변경합니다.

---

### Next sub-skill: 08b_acceptance_test_design
Use these as primary inputs:
- [/workflow/03_requirements/03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
- [/workflow/03_requirements/03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- [/workflow/07_mvp_release/07_mvp_scope.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/07_mvp_release/07_mvp_scope.md)
- [/workflow/08_test_strategy/08_test_strategy.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/08_test_strategy/08_test_strategy.md)

Preserve:
- validation scope boundaries;
- requirement-to-validation method mapping;
- validation gaps;
- assumptions about automation level;
- open questions affecting acceptance tests.
