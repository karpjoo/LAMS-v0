# 03 Requirements

## 1. Document Status
- **Status**: Draft
- **Source artifacts used**:
  - [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
  - [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md)
  - [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md)
  - [02_role_permission_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_role_permission_matrix.md)
  - [02_data_exposure_map.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_data_exposure_map.md)
  - [02_admin_power_review.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_admin_power_review.md)
- **Source approval state**: Stage 1 & 2 ready for review
- **Approval state**: Pending Human Approval
- **Supersedes**: None

## 2. Source Context Summary
- **서비스 목표**: 콜센터 유해 발화 위험 탐지 연구를 지원하기 위한 대화 데이터 관리, 다중 평가자(상담원, 언어학 전문가)의 공용 평가 UI 라벨 기록, 외부 LLM 판정 결과 및 Kappa 통계 업로드, Dashboard 모니터링을 제공하는 Greenfield React/Firebase 웹 시스템 개발.
- **주요 제약**:
  - 실시간 LLM API 추론 연동 배제 (오프라인 JSON 업로드로 대체).
  - 실시간 Kappa 수식 연산 배제 (외부 연산된 통계 파일 업로드로 대체).
  - 웹 내부의 개인정보 자동 마스킹 배제 (외부 사전 비식별화 준수).
  - 상담원과 전문가는 동일한 평가 화면을 공유하여 라벨을 입력함.
  - 엄격한 속도 한계 지연보다 기능의 안정성과 데이터 무결성을 최우선 시 함.

## 3. Requirement Classification Summary
- **Functional Requirements (FR)**: FR-001 ~ FR-007 (데이터셋 관리, 평가 기록, 대시보드 화면 등)
- **Non-Functional Requirements (NFR)**: NFR-001 ~ NFR-003 (안정성, UI 반응성, CSS 스타일링 등)
- **Security / Privacy / Data Requirements (SEC / DATA)**: SEC-001 ~ SEC-004, DATA-001 (접근 권한 격리, 비식별화 경고, 삭제 제약 등)
- **Operational / Integration Requirements (OPS / INT)**: OPS-001 ~ OPS-002 (로깅 및 외부 파일 임포트 호환성)

## 4. Functional Requirements

### FR-001: 대화 데이터셋 파일 일괄 등록 (Import Dataset)
- **Status**: Draft
- **Source Goal / Stakeholder / Risk**: G-001, STK-001
- **Actor / Role**: ROLE-001 (Admin)
- **User Need / Goal**: 연구 대상이 되는 다량의 상담 대화 데이터를 Firestore에 안정적으로 업로드하여 적재하고자 함.
- **Description**: 관리자가 웹 인터페이스 상에서 실제/합성 상담 대화 정보가 담긴 JSON 파일을 선택하고 업로드하면, 시스템이 파싱하여 Firestore의 대화 컬렉션에 적재함.
- **Trigger / Preconditions**: ROLE-001 계정으로 인증 완료, 업로드할 JSON 파일 준비.
- **Main Scenario**:
  1. 관리자가 데이터셋 업로드 메뉴 진입.
  2. 로컬 JSON 파일을 선택하고 [업로드] 실행.
  3. 시스템이 JSON 파일 구조 검증 후 Firestore에 적재.
  4. 적재 완료 알림 및 업로드 건수 표시.
- **Alternative / Failure Scenarios**:
  - *업로드 파일 손상/스키마 위반*: 시스템이 파싱 오류를 감지하고 업로드를 거부하며 에러 메시지를 표시함. DB에는 아무런 데이터도 적재되지 않음 (All-or-Nothing 트랜잭션).
- **Edge Cases**:
  - 대화 데이터 본문이 비어있거나 `call_id`가 중복된 경우, 중복 건은 무시하거나 에러 로그로 리포트.
- **Out-of-Scope Clarifications**: 업로드 중 자동 번역이나 형태소 분석 등 텍스트 변환 연산은 배제함.
- **Acceptance Criteria IDs**: AC-FR-001-01, AC-FR-001-02
- **Related NFRs**: NFR-001, NFR-003
- **Security / Privacy / Data Conditions**: 사전 비식별화가 완료된 파일만 업로드해야 함.
- **Validation Method**: Admin 계정 모의 파일 업로드 테스트 및 Firestore 적재 여부 검증.
- **Traceability Links**: G-001 -> FR-001

### FR-002: 대화 데이터셋 일괄 삭제 (Delete Dataset)
- **Status**: Draft
- **Source Goal / Stakeholder / Risk**: G-001, STK-001, RISK-001
- **Actor / Role**: ROLE-001 (Admin)
- **User Need / Goal**: 잘못 입력된 데이터셋이나 이전 연구 회차 데이터를 웹 상에서 편리하게 일괄 초기화하고자 함.
- **Description**: 관리자가 등록된 대화 데이터를 일괄적으로 삭제하는 명령을 내릴 수 있으며, 돌이킬 수 없는 삭제에 대처하기 위해 2단계 안전 장치를 통과해야 함.
- **Trigger / Preconditions**: ROLE-001 계정으로 인증 완료, 데이터셋이 등록되어 있는 상태.
- **Main Scenario**:
  1. 관리자가 데이터셋 관리 메뉴에서 [전체 데이터 삭제] 버튼 클릭.
  2. 시스템이 2단계 안전 장치로 "DELETE ALL DATASET" 텍스트 입력을 요구하는 확인 팝업 노출.
  3. 관리자가 정확한 텍스트 입력 후 승인 클릭.
  4. Firestore 내 대화 데이터 및 관련 평가자 라벨 전체 삭제 완료.
- **Alternative / Failure Scenarios**:
  - *문구 불일치*: 팝업 모달에서 일치하지 않는 텍스트 입력 시 [삭제] 버튼이 비활성화 상태를 유지하며 동작하지 않음.
- **Edge Cases**: 삭제 처리 중 네트워크 연결이 끊길 경우 부분 삭제가 일어날 수 있으므로, Firestore 배치 삭제 처리를 통해 무결성 보호.
- **Out-of-Scope Clarifications**: 삭제된 문서에 대한 아카이빙이나 휴지통 복구 기능은 부재함 (영구 삭제).
- **Acceptance Criteria IDs**: AC-FR-002-01
- **Related NFRs**: NFR-001
- **Security / Privacy / Data Conditions**: 실수로 인한 복구 불가능한 데이터 소실을 방어해야 함.
- **Validation Method**: 삭제 테스트 수행 및 팝업 동작 모의 인터락 검증.
- **Traceability Links**: G-001 -> FR-002

### FR-003: 상담 대화 목록 조회 및 세부 대화 열람 (List/View Conversations)
- **Status**: Draft
- **Source Goal / Stakeholder / Risk**: G-002, STK-002, STK-003
- **Actor / Role**: ROLE-002 (Evaluator), ROLE-001 (Admin)
- **User Need / Goal**: 평가 대상 대화 목록을 확인하고, 개별 대화 본문을 한눈에 열람하여 유해 발화 여부를 검토하고자 함.
- **Description**: 로그인된 평가자(혹은 관리자)가 대화 목록에서 특정 `call_id`를 선택하면, 해당 대화 내의 고객과 상담원 간의 턴(Turn)별 대화 말풍선이 순서대로 화면에 노출됨.
- **Trigger / Preconditions**: 인증 완료 상태.
- **Main Scenario**:
  1. 평가자가 평가 홈 화면에 진입하여 등록된 대화 목록 조회 (진행 여부 표시).
  2. 특정 대화 항목 클릭.
  3. 해당 대화의 본문(고객 발화와 상담원 발화가 시간 순으로 정렬됨)이 대화창 형태로 화면에 로드됨.
- **Alternative / Failure Scenarios**:
  - *대화 본문 로드 실패*: 데이터 손상 등으로 대화 내용이 없을 시 에러 화면을 노출하고 목록으로 회귀.
- **Edge Cases**: 대화의 턴 수가 매우 길어 화면 스크롤이 길어지는 경우, 스크롤 유연성 확보.
- **Out-of-Scope Clarifications**: 음성 상담 데이터의 오디오 스트리밍이나 재생 기능은 배제함 (오직 텍스트만 지원).
- **Acceptance Criteria IDs**: AC-FR-003-01
- **Related NFRs**: NFR-002
- **Security / Privacy / Data Conditions**: 미인가 사용자의 조회를 Firestore Rules에서 원천 차단.
- **Validation Method**: Evaluator 계정 로그인 후 대화 말풍선 레이아웃 및 텍스트 렌더링 검증.
- **Traceability Links**: G-002 -> FR-003

### FR-004: 평가자 유해성 판정 기록 (Record Label Feedback)
- **Status**: Draft
- **Source Goal / Stakeholder / Risk**: G-002, STK-002, STK-003, RISK-002
- **Actor / Role**: ROLE-002 (Evaluator)
- **User Need / Goal**: 대화를 읽고, 정해진 유해성 판정 기준에 따라 판정 결과를 즉시 기록 및 저장하고자 함.
- **Description**: 공유된 평가 UI에서 평가자가 유해 발화 여부(Present/Absent), 7가지 유형 중 주된 유형(category_id), 위험 수준(risk_level: 1~3), 해당 판단의 텍스트 근거 구절(evidence_phrases)을 지정하여 저장함.
- **Trigger / Preconditions**: 특정 대화 열람 완료.
- **Main Scenario**:
  1. 평가자가 대화 본문 우측의 평가 폼 입력창 작성.
  2. 유해 여부(Present/Absent) 선택.
  3. Present 선택 시: 7가지 유형(1~7) 중 하나 라디오 버튼 선택, 위험 수준(1~3) 라디오 버튼 선택, 근거 구절 입력(최대 3개).
  4. [평가 제출/저장] 버튼 클릭.
  5. 데이터가 Firestore의 유저별 평가 라벨 서브컬렉션에 저장되고 목록으로 자동 이동 혹은 다음 대화 로드.
- **Alternative / Failure Scenarios**:
  - *필수값 누락*: Present 상태에서 유형이나 위험도 미선택 시 저장 버튼이 비활성화되거나 경고 얼럿 노출.
- **Edge Cases**: 이미 평가한 대화를 재진입할 경우, 기존에 저장했던 본인의 평가 결과 값이 폼에 그대로 미리 채워져(Prefilled) 있어야 함 (수정 가능 구조).
- **Out-of-Scope Clarifications**: 타 평가자가 기입한 라벨 데이터의 열람 및 수정 기능은 제공하지 않음 (본인 데이터만 조회/수정 가능).
- **Acceptance Criteria IDs**: AC-FR-004-01, AC-FR-004-02
- **Related NFRs**: NFR-001
- **Security / Privacy / Data Conditions**: 데이터 저장 시 Firestore Document ID 및 필드에 로그인한 유저의 고유 `uid`를 강제로 바인딩하여 저장.
- **Validation Method**: 평가 데이터 기입 후 Firestore 내 서브컬렉션 필드 데이터 적재 무결성 확인.
- **Traceability Links**: G-002 -> FR-004

### FR-005: 외부 LLM 판정 결과 일괄 업로드 (Import LLM Results)
- **Status**: Draft
- **Source Goal / Stakeholder / Risk**: G-003, STK-001, RISK-003
- **Actor / Role**: ROLE-001 (Admin)
- **User Need / Goal**: 외부 독립 시스템에서 완료된 3개 모델 x 3개 프롬프트의 판정 결과(JSON)를 웹 시스템에 일괄 등록하고자 함.
- **Description**: 관리자가 외부 LLM 결과 JSON 파일을 임포트하면, 시스템이 파싱하여 해당 `call_id`에 매핑된 LLM 판정 데이터를 Firestore에 등록 및 갱신함.
- **Trigger / Preconditions**: ROLE-001 계정 인증 상태, 사전에 설계된 LLM JSON 파일 포맷 준비.
- **Main Scenario**:
  1. 관리자가 LLM 결과 업로드 메뉴 선택.
  2. JSON 파일 선택 후 업로드 버튼 클릭.
  3. 시스템이 JSON 포맷 스키마 검증 후 데이터베이스 적재.
- **Alternative / Failure Scenarios**:
  - *존재하지 않는 `call_id` 포함 시*: 목록 내 일부가 등록되지 않은 대화 ID일 경우, 에러 리스트를 표시하고 예외 처리 진행 (기존 데이터셋에 등록된 `call_id`인 경우에만 정상 매핑 적재).
- **Edge Cases**: 파일 크기가 크거나 매핑할 데이터가 많은 경우 안정적으로 배치 쓰기 적용.
- **Out-of-Scope Clarifications**: 실시간 LLM 추론 트리거는 제외.
- **Acceptance Criteria IDs**: AC-FR-005-01
- **Related NFRs**: NFR-001, NFR-003
- **Security / Privacy / Data Conditions**: 비식별화 준수 검사 적용.
- **Validation Method**: 모의 LLM 판정 결과 JSON 파일 업로드 테스트 및 Firestore 적재 검증.
- **Traceability Links**: G-003 -> FR-005

### FR-006: 외부 통계 지표 일괄 업로드 (Import Pre-calculated Stats)
- **Status**: Draft
- **Source Goal / Stakeholder / Risk**: G-003, STK-001
- **Actor / Role**: ROLE-001 (Admin)
- **User Need / Goal**: 외부 별도 시스템에서 산출된 Kappa 등의 통계 연산 결과 데이터를 대시보드 시각화용으로 등록하고자 함.
- **Description**: 관리자가 외부 통계 결과 JSON 파일을 업로드하면 시스템이 대시보드 통계 컬렉션에 적재하여, 화면에 그래프/표를 그릴 준비를 완료함.
- **Trigger / Preconditions**: ROLE-001 계정 인증 상태.
- **Main Scenario**:
  1. 관리자가 통계 지표 업로드 메뉴 선택.
  2. 통계 결과 JSON 파일 로드 및 업로드 실행.
  3. 시스템이 대시보드용 데이터 컬렉션에 갱신 적재.
- **Acceptance Criteria IDs**: AC-FR-006-01
- **Validation Method**: 통계 데이터 업로드 및 Firestore 적재 검증.
- **Traceability Links**: G-003 -> FR-006

### FR-007: 작업 상황 및 평가 통계 대시보드 표시 (Dashboard Display)
- **Status**: Draft
- **Source Goal / Stakeholder / Risk**: G-004, STK-001
- **Actor / Role**: ROLE-001 (Admin), ROLE-002 (Evaluator)
- **User Need / Goal**: 전체 평가 대상 대화 대비 인간 평가자의 작업 완료 비율(진척률)과 업로드된 외부 비교 분석 통계 차트를 일괄 조회하고자 함.
- **Description**: 로그인된 사용자가 Dashboard 화면에 진입하면, 전체 대화 건수 중 평가가 완료된 비율(진척도 게이지 바 등)과 외부에서 업로드된 통계 차트 데이터를 시각화하여 렌더링함.
- **Trigger / Preconditions**: 인증 완료 상태, 업로드된 통계 및 라벨 데이터 존재.
- **Main Scenario**:
  1. 사용자가 Dashboard 메뉴 클릭.
  2. 시스템이 Firestore의 대화 컬렉션 전체 크기 대비 완료된 라벨링 건수를 집계하여 진척률(%)을 상단에 렌더링.
  3. Firestore에 적재된 외부 통계 테이블을 기반으로 비교 분석 그래프 및 오차 양상 표 렌더링.
- **Out-of-Scope Clarifications**: 실시간 Kappa 공식 수학 연산은 웹에서 처리하지 않으며, 이미 계산되어 적재된 통계 데이터셋의 단순 시각화 렌더링으로 국한함.
- **Acceptance Criteria IDs**: AC-FR-007-01
- **Related NFRs**: NFR-002
- **Validation Method**: 대시보드 페이지 렌더링 시 진척률 수치 및 그래프 컴포넌트의 가시성 확인.
- **Traceability Links**: G-004 -> FR-007

---

## 5. Non-Functional Requirements

### NFR-001: 데이터 무결성 및 적재 안정성 (Data Integrity & Stability)
- **Status**: Draft
- **Description**: 데이터셋 일괄 업로드(Import)나 일괄 삭제(Delete) 작업 시, 네트워크 순단이나 비정상 종료 시 부분 오류가 남지 않도록 Firestore Batch 작업 혹은 트랜잭션을 적용하여 데이터 정합성을 100% 보장해야 함.

### NFR-002: 프리미엄 비주얼 CSS 및 반응형 레이아웃 (Visual Excellence & Responsiveness)
- **Status**: Draft
- **Description**: Vanilla CSS만을 사용하여 Glassmorphism 효과, 정돈된 다크/라이트 모드 테마, Harmonious 색상 팔레트 및 세련된 타이포그래피(Inter, Outfit 등 Google Web Font)를 구현하고, 모바일/태블릿/데스크톱 화면 해상도 변화에 유연하게 반응하는 CSS Grid/Flexbox 기반 그리드 설계 적용.

### NFR-003: 예외적 에러 복원 파싱 (Robust JSON Parsing)
- **Status**: Draft
- **Description**: 임포트 파일의 포맷(JSON) 파싱 에러 발생 시 브라우저 애플리케이션 자체가 화이트스크린(Crash)이 되지 않도록 React Error Boundary 및 Try-Catch 구문을 철저히 배정하여 안정적인 사용자 피드백을 전달해야 함.

---

## 6. Security / Privacy / Data Requirements

### SEC-001: 로그인 세션 및 접근 차단 (Authentication Boundary)
- **Status**: Draft
- **Description**: Firebase Authentication 세션이 유효하지 않은 익명 게스트 사용자는 `/admin`, `/evaluate`, `/dashboard` 등 모든 기능 경로 접근이 불가하며, 로그인 화면으로 강제 리다이렉트되어야 함. Firestore Security Rules에 `allow read, write: if request.auth != null;` 규칙 적용 필수.

### SEC-002: 평가자 라벨 데이터 쓰기 격리 (Evaluator Isolation Rules)
- **Status**: Draft
- **Description**: 평가자(ROLE-002)는 본인의 고유 `uid`에 매핑된 라벨 도큐먼트에만 Write(Create/Update)를 할 수 있으며, 타인의 Uid로 생성된 도큐먼트는 쓰기 및 수정 권한이 차단되어야 함. Rules 정의: `allow write: if request.auth.uid == userId;`

### SEC-003: 업로드 데이터 비식별화 사전 검증 경고 (Client-side PII Warning)
- **Status**: Draft
- **Description**: 관리자가 대화 데이터셋을 웹 UI 상에 업로드할 때, 브라우저 단에서 정규식 패턴(예: 국내 휴대전화번호 포맷 `010-\d{4}-\d{4}` 등)을 1차 스캔하여 개인정보가 포함된 것으로 의심되는 대화 턴이 감지될 시 "개인정보 유출 위험이 감지되었습니다. 비식별화 처리를 확인하십시오"라는 강력한 경고 얼럿 모달을 노출함 (업로드 자체를 하드 차단하지는 않으나 경고 강제).

### SEC-004: 데이터 삭제 오작동 방지용 인터락 (Dataset Deletion Interlock)
- **Status**: Draft
- **Description**: 전체 대화 셋 삭제 동작(FR-002)은 관리자 UI 상에서 사용자가 수동으로 정확히 "DELETE ALL DATASET" 문자열을 텍스트 필드에 직접 타이핑해 넣어야만 실행 버튼이 활성화되도록 프론트엔드 유효성 조건 배정.

---

## 7. Operational / Integration Requirements

### OPS-001: 관리자/평가자 중요 액션 감사 로깅 (Audit Logs)
- **Status**: Draft
- **Description**: 데이터셋 등록(FR-001), 데이터셋 삭제(FR-002), 평가 라벨 최초 저장/수정(FR-004) 시점에 Firestore의 `audit_logs` 컬렉션에 동작 일시, 행위자 ID(Email/Uid), 동작 유형(Upload, Delete, Label_Save) 정보가 안전하게 쓰기 로깅되어야 함. 이 로그 데이터는 삭제 권한이 차단된 Append-only 성격으로 관리됨.

### INT-001: 외부 JSON 파일 임포트 규격 연동 (JSON Schema Conformance)
- **Status**: Draft
- **Description**: 외부 LLM 판정 결과(JSON) 및 외부 Kappa 통계(JSON) 파일 포맷은 웹 시스템 내 데이터베이스 필드명과 일대일 매핑이 가능하도록 표준 키 명세를 준수하여 임포트 모듈에 연동됨.

---

## 8. Scope Boundary Candidates
- **Must Have (MVP 범위)**:
  - React + Firebase 연동 인증 및 공용 평가 UI 화면 구현.
  - 관리자 전용 데이터셋 일괄 업로드 및 2단계 삭제 기능.
  - 외부 LLM 판정 및 외부 통계 결과 JSON 업로드 기능.
  - 진척률 집계 및 통계 테이블 렌더링용 Dashboard 화면.
  - Firestore Security Rules 접근 차단 규칙 적용.
- **Won't / Non-Scope (MVP 제외)**:
  - 실시간 LLM API 호출 인터페이스 구현.
  - 웹 내부의 Kappa 등 다수결 통계 계산기 모듈 탑재.
  - 업로드 대화의 웹 내부 자동 비식별화 가공 모듈.
  - 음성 데이터 스트리밍 재생 UI.

## 9. Requirements Needing Clarification
- **Q-101**: 다수결(Adjudication) 프로세스를 지원하기 위해, 평가자 간 불일치 대화만 따로 필터링하여 관리자에게 표시해주는 기능의 탑재 범위가 미확정 상태임 (Stage 3 분석 단계에서는 보류하며, 개발자 기획에 맞추어 유연하게 추가/배제할 예정).

## 10. Requirements Not Yet Testable
- 현재 임포트할 외부 JSON 데이터셋(대화, LLM 결과, 통계 지표)의 세부 필드 규격 명세가 제공되지 않아, 파일 파서의 세부 유효성 검사 로직(AC-FR-001-02 등)에 대한 정밀 자동화 테스트 코드 작성은 불가능한 상태임 (Stage 6 Data Design 단계에서 확정 예정).