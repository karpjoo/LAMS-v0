# 03 Acceptance Criteria

## 1. Document Status
- **Status**: Draft
- **Source artifacts used**:
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
- **Approval state**: Pending Human Approval
- **Supersedes**: None

## 2. Acceptance Criteria Summary
본 문서는 Stage 3 요구사항에 정의된 기능 및 보안 명세를 검증 가능한 시나리오 기반의 인수 조건(Acceptance Criteria)으로 정의합니다. 각 인수 조건은 Given-When-Then 형식의 테스트 시나리오로 세분화되어, Stage 8 테스트 전략 및 구현 검증의 기준으로 사용됩니다.

## 3. Criteria by Requirement

### AC-FR-001-01: 올바른 형식의 JSON 대화 데이터셋 업로드 성공
- **Status**: Draft
- **Linked Requirement ID**: FR-001
- **Scenario / Behavior**: 관리자가 유효한 대화 데이터가 포함된 JSON 파일을 업로드하면 정상적으로 Firestore에 등록되어야 함.
- **Given**: ROLE-001 (Admin) 권한으로 로그인된 상태이며, 대화 데이터셋 업로드 화면에 진입해 있는 상황.
- **When**: 사전에 합의된 데이터셋 JSON 스키마를 만족하는 파일(예: 10건의 상담 대화 포함)을 선택하여 [업로드]를 클릭할 때.
- **Then**: 업로드가 성공했다는 알림 메시지가 화면에 노출되고, 대화 목록 화면에 새로 추가된 10건의 대화 건수가 정상 반영되어야 함.
- **Data Condition**: JSON 스키마 유효성 충족, `call_id` 누락이 없어야 함.
- **Role / Permission Condition**: ROLE-001 (Admin) 권한 필수.
- **Expected Evidence**: Firestore 대화 컬렉션의 문서 개수가 10건 증가하였음을 보여주는 DB 레코드 확인.
- **Validation Type**: Integration

### AC-FR-001-02: 손상되거나 잘못된 형식의 JSON 업로드 거부
- **Status**: Draft
- **Linked Requirement ID**: FR-001
- **Scenario / Behavior**: 손상된 JSON이나 필수 키 값이 빠진 파일을 업로드하면 에러와 함께 등록이 거부되어야 함.
- **Given**: ROLE-001 (Admin) 권한으로 로그인된 상태.
- **When**: 문법 오류(Syntax Error)가 있거나 `call_id` 키가 없는 JSON 파일을 업로드 시도할 때.
- **Then**: "업로드 실패: 잘못된 형식의 파일입니다" 에러 팝업이 발생하고, Firestore 대화 컬렉션에는 어떠한 데이터 변경도 유입되지 않아야 함.
- **Negative Case**: 예외 포맷 차단 시나리오.
- **Validation Type**: Unit

### AC-FR-002-01: 대화 데이터셋 전체 삭제 시 인터락 해제 및 영구 삭제 수행
- **Status**: Draft
- **Linked Requirement ID**: FR-002
- **Scenario / Behavior**: 대화 데이터셋 삭제 시 팝업 문구 입력 검증을 거쳐 전체 삭제를 안전하게 완수해야 함.
- **Given**: ROLE-001 (Admin) 권한으로 로그인되어 있으며 Firestore에 데이터셋이 등록된 상태.
- **When**: 
  - 1차: [전체 삭제]를 누르고 확인 창에 "DELETE ALL DATASET"을 오입력하거나 비웠을 때 -> [확인] 버튼이 비활성화됨.
  - 2차: 확인 창에 "DELETE ALL DATASET"을 정확히 입력하고 [확인]을 누를 때.
- **Then**: [확인]이 통과되면 데이터베이스의 대화 컬렉션 및 모든 평가자 라벨링 피드백 정보가 영구 삭제되고 목록이 초기화됨.
- **Role / Permission Condition**: ROLE-001 (Admin) 권한.
- **Expected Evidence**: 삭제 후 Firestore 대화 컬렉션 도큐먼트 개수가 0건이 됨을 확인.
- **Validation Type**: E2E

### AC-FR-003-01: 상담 대화 목록 조회 및 턴(Turn) 렌더링 검증
- **Status**: Draft
- **Linked Requirement ID**: FR-003
- **Scenario / Behavior**: 평가자가 대화 목록에서 특정 항목을 클릭하면 대화 턴 말풍선이 순서대로 화면에 로드됨.
- **Given**: ROLE-002 (Evaluator) 권한으로 로그인되어 있으며 10건의 대화가 저장된 상태.
- **When**: 대화 목록의 1번째 대화(`call_id: call-001`)를 마우스로 클릭할 때.
- **Then**: 대화 상세 화면이 열리며, 고객 발화와 상담원 발화가 시간/턴 순서대로 나란히 정렬된 말풍선 레이아웃으로 화면에 정확하게 로드되어야 함.
- **Validation Type**: E2E

### AC-FR-004-01: 평가자의 유해성 판정 라벨 최초 저장 및 데이터 격리
- **Status**: Draft
- **Linked Requirement ID**: FR-004
- **Scenario / Behavior**: 평가자가 특정 대화에 대해 유해 여부, 유형, 위험도, 근거를 입력하여 저장 시 본인 UID 명세와 함께 단독 저장됨.
- **Given**: ROLE-002 (Evaluator, uid: `evaluator-123`) 권한으로 로그인되어 `call-001` 대화의 상세 평가 창을 보고 있는 상황.
- **When**: 유해여부: "Present", 유형: "폭언/욕설 (2)", 위험수준: "Level 2", 근거구절: ["고압적 어투", "반말"]을 기입하고 [평가 완료]를 누를 때.
- **Then**: Firestore의 `calls/call-001/evaluators/evaluator-123` 도큐먼트에 해당 판정 결과 데이터가 정확하게 생성되어 저장되어야 함.
- **Data Condition**: 필수 속성(Present, category_id: 2, risk_level: 2) 누락이 없어야 함.
- **Security / Privacy Condition**: 타 사용자의 경로(`calls/call-001/evaluators/evaluator-456`)에는 쓰기 권한이 부여되지 않아야 함.
- **Expected Evidence**: Firestore 도큐먼트 내 `user_id == 'evaluator-123'` 필드 확인.
- **Validation Type**: Integration

### AC-FR-004-02: 기존에 평가 완료된 대화 진입 시 데이터 자동 채우기(Prefilled)
- **Status**: Draft
- **Linked Requirement ID**: FR-004
- **Scenario / Behavior**: 이미 본인이 평가를 완료한 대화 화면에 재접속하면 기존 입력 데이터가 활성화되어 보여야 함.
- **Given**: ROLE-002 (uid: `evaluator-123`) 권한 로그인 상태이며, 이미 이전 세션에서 `call-001` 대화를 평가 완료하여 Firestore 데이터가 존재하는 상황.
- **When**: 목록에서 `call-001` 대화를 클릭하여 상세 화면에 진입할 때.
- **Then**: 우측 평가 폼 컴포넌트의 유해여부(Present), 유형(2), 위험수준(Level 2), 근거구절 필드에 기존 저장되어 있던 값이 자동으로 프리필(Prefill)되어 로딩되어야 함.
- **Validation Type**: E2E

### AC-FR-005-01: 오프라인 LLM 판정 결과 일괄 업로드 및 매핑
- **Status**: Draft
- **Linked Requirement ID**: FR-005
- **Scenario / Behavior**: LLM 결과 JSON 업로드 시 기존에 저장된 `call_id`에 정상적으로 데이터가 일치 적재됨.
- **Given**: ROLE-001 (Admin) 로그인 상태이며, 기존에 `call-001` 대화 데이터셋이 로드되어 있는 상황.
- **When**: `call-001`에 대한 OpenAI, Gemini, Claude의 프롬프트별 탐지 결과가 기록된 JSON 파일을 관리자 UI에서 업로드할 때.
- **Then**: 업로드 성공 알림 노출 후, `calls/call-001/llm_results` 컬렉션에 해당 판정 데이터(detection, risk_level, evidence 등)가 모델별 키 명세 구조로 매핑 적재되어야 함.
- **Validation Type**: Integration

### AC-FR-006-01: 외부 사전 계산 통계 지표 일괄 업로드
- **Status**: Draft
- **Linked Requirement ID**: FR-006
- **Scenario / Behavior**: Kappa 통계 연산 결과 JSON 업로드 시 대시보드 컬렉션에 저장됨.
- **Given**: ROLE-001 (Admin) 로그인 상태.
- **When**: 각 모델/프롬프트 조건별 Fleiss' Kappa 및 F1 수치 데이터가 적힌 통계 JSON 파일을 업로드할 때.
- **Then**: Firestore의 `dashboard/statistics` 도큐먼트에 해당 연산 결과 테이블이 정상 갱신되어 저장되어야 함.
- **Validation Type**: Integration

### AC-FR-007-01: 진척률 차트 및 비교 테이블 대시보드 렌더링
- **Status**: Draft
- **Linked Requirement ID**: FR-007
- **Scenario / Behavior**: 대시보드 접근 시 진행률 바 및 렌더링된 통계 데이터를 육안 확인 가능해야 함.
- **Given**: 인증 완료 상태이며, 데이터베이스에 등록된 전체 대화 건수가 100건이고 본인이 라벨 완료한 건수가 30건이며, 통계 데이터(`dashboard/statistics`)가 적재되어 있는 상황.
- **When**: [Dashboard] 탭 메뉴를 클릭해 로드할 때.
- **Then**: 
  - 화면 상단에 "나의 진척률: 30% (30/100건)" 형태의 진행률 게이지 바가 렌더링됨.
  - 화면 하단에 외부 업로드 통계 데이터 기반의 모델별 Kappa 점수 차트(그래프 또는 깔끔한 Vanilla CSS 표)가 노출됨.
- **Validation Type**: Manual / Review

---

## 4. Cross-Cutting Acceptance Criteria

### AC-SEC-001: 미인증 게스트의 경로 접근 전면 차단
- **Given**: 로그인하지 않은 익명의 게스트 상태.
- **When**: 브라우저 URL 입력창에 직접 `http://localhost:3000/evaluate` 또는 `http://localhost:3000/admin` 경로를 입력하고 진입을 시도할 때.
- **Then**: 화면이 로드되지 않고 메인 로그인 화면(`/login` 등)으로 즉시 강제 리다이렉트되어야 함.
- **Validation Type**: E2E

### AC-SEC-003: 대화 업로드 시 PII 감지 경고 모달 노출
- **Given**: ROLE-001 (Admin) 로그인 상태이며 대화 업로드 메뉴 진입 상태.
- **When**: 업로드하려는 JSON 파일 내 대화 텍스트 중 국내 휴대전화번호 포맷(`010-1234-5678`)이 포함된 파일을 선택하고 업로드 버튼을 클릭할 때.
- **Then**: 업로드가 강제 차단되지는 않으나, 화면에 "개인정보 유출 위험이 감지되었습니다. 파일 내 비식별화 처리를 한 번 더 확인하십시오." 문구가 들어간 모달창 경고 팝업이 노출되며, 관리자가 경고 팝업 내 [진행 확인]을 클릭해야만 최종 적재가 실행됨.
- **Validation Type**: E2E

---

## 5. Manual Review Criteria
- **Vanilla CSS 디자인 테마 완성도 (NFR-002 검증)**: 수동 평가 완료 후, 브라우저 개발자 도구의 해상도 조절 모드로 모바일, 태블릿, 데스크톱 레이아웃 뷰를 변경하여 화면 깨짐, 글씨 겹침, 스크롤 유실이 없는 프리미엄 글래스모피즘 CSS 스타일링이 온전히 렌더링되는지 개발자 검수(Manual Review) 수행 필수.
- **데이터 삭제 모달 텍스트 활성화 (SEC-004 검증)**: 전체 삭제 클릭 후 팝업에 "DELETE ALL DATASET" 타이핑 완료 시점에만 [확인] 버튼이 활성화(Disabled 해제)되는 프론트엔드 유효성 유저 인터랙션을 수동 확인.

## 6. Criteria Needing Clarification
- Q-101(Adjudication 프로세스 지원 여부)이 미확정 상태이므로, 다수결 일치/불일치 대화에 대한 필터링 조회 및 Adjudication 전용 판정 폼 제출에 관한 인수 조건은 정의되지 않았으며, 추후 확정 시 추가 예정.