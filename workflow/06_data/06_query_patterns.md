# 06 Query Patterns

## 1. Purpose
본 문서는 LAMS-v0 시스템의 화면 요구사항, API 명세 및 백그라운드 트랜잭션을 지원하기 위해 데이터베이스 레이어에서 수행되어야 할 핵심 쿼리 패턴(Query Patterns)을 설계합니다. 이 명세는 물리적 인덱스 설계 및 보안 규칙 구성의 직접적인 입력으로 사용됩니다.

## 2. Query Pattern Summary
LAMS-v0는 클라이언트 직접 연결형 Firestore 아키텍처를 따르므로, 복잡한 다중 조인(Join)을 지양하고 **도큐먼트 키 직접 조회(Get)** 및 **단일 컬렉션 조건부 필터링/정렬 쿼리(Query)** 형태로 단순화합니다.

- **목록 조회**: 대화 상태(`status`)별 필터링 및 시간순 정렬.
- **단일 조회**: `call_id` 직접 획득을 통한 대화 상세 및 하위 서브컬렉션(Labels, LLM Results, Gold Standard) 일괄/개별 조회.
- **시스템 로그**: 감사 로그 목록의 최근 시간순 정렬 조회.
- **세션 정보**: 로그인 유저 UID 기반 권한 역할 조회.

---

## 3. Query Patterns by Requirement / API / Screen / Job

### QP-001 — List Active Conversations (평가 대상 대화 목록 조회)
- Actor / system: Evaluator (ROLE-002), Adjudicator (ADJUD-01), Admin (ROLE-001)
- Use case: 사용자가 평가 홈 화면 또는 관리 메뉴에 접속하여 진행 상태별 상담 대화 목록을 모니터링 및 선택
- Related requirement IDs: FR-003, FR-007
- Related acceptance criteria IDs: AC-FR-003-01
- Related API / module / screen / job: API-001 / MOD-002 (Evaluation Module) / 평가 대화 목록 화면
- Data objects accessed: DATA-OBJ-001 (Conversation)
- Filters: 
  - `status` == `[Selected Status]` (예: `"Round 1 Active"`, `"Round 2 Active"`, `"Round 3 Active"`, `"Consensus Reached"`)
- Sort order: `created_at` ascending
- Pagination: 50 items per page (Limit 50)
- Authorization condition: `request.auth != null` (인증 완료된 모든 사용자 계정 허용)
- Expected frequency / scale: 하루 평균 50~100회 미만 (사용자 10명 기준)
- Freshness requirement: 실시간 동기화 (Firestore `onSnapshot` 또는 필요시 단회성 `getDocs`)
- Required indexes: `status` ASC, `created_at` ASC 복합 인덱스 필요
- Caching / denormalization notes: 목록 화면에 평가 완료 진행 횟수를 노출하기 위해 `label_completion_count` 필드를 Conversation 도큐먼트에 반정형화(Denormalize) 처리하여 별도 집계 쿼리 없이 목록 로드 시 한 번에 렌더링하도록 지원.
- Risks: 없음.

---

### QP-002 — Get Conversation Details (대화 상세 및 대화 턴 열람)
- Actor / system: Evaluator, Adjudicator, Admin
- Use case: 대화 상세 평가 화면 진입 시, 고객과 상담원의 대화 말풍선 스크립트 및 외부 LLM 판정 정보를 함께 렌더링
- Related requirement IDs: FR-003, FR-005
- Related acceptance criteria IDs: AC-FR-003-01, AC-FR-005-01
- Related API / module / screen / job: API-002 / MOD-002 / 평가자 상세 작업 화면
- Data objects accessed: DATA-OBJ-001 (Conversation), DATA-OBJ-002 (Turn), DATA-OBJ-004 (LLM Decision)
- Filters: `call_id` == `[Target Call ID]` (Firestore Document ID 직접 지정)
- Sort order: 없음 (`turns`는 배열 내장 상태이므로 sequence_no 오름차순으로 클라이언트 단에서 즉시 정렬 렌더링)
- Pagination: 없음 (단일 문서)
- Authorization condition: `request.auth != null`
- Expected frequency / scale: 하루 평균 300~500회 미만
- Freshness requirement: 단회성 조회 (ReadOnly `getDoc`)
- Required indexes: 기본 키(DocID) 조회이므로 추가 인덱스 불요
- Caching / denormalization notes: 외부 LLM 결과 데이터는 `/conversations/{call_id}/llm_results/verdict` 경로에 1:1로 사전 매핑되어 있으므로, 대화 상세 조회 후 즉시 서브컬렉션 문서를 로드함.
- Risks: 대화 턴 개수가 매우 많아 도큐먼트 용량이 커질 위험 (A-101 기준 1MB 한계 대비 극히 미미하므로 안전).

---

### QP-003 — Fetch Own Labels (본인 기존 평가 조회)
- Actor / system: Evaluator (ROLE-002)
- Use case: 평가 화면 재진입 시 자신이 해당 차수에 작성했거나 이전 차수에 저장한 평가 내용을 자동으로 불러와 UI 폼에 입력(Prefill)
- Related requirement IDs: FR-004, SEC-002
- Related acceptance criteria IDs: AC-FR-004-02
- Related API / module / screen / job: API-003 / MOD-002 / 상세 작업 화면
- Data objects accessed: DATA-OBJ-003 (Label)
- Filters: 
  - Document Path: `/conversations/{call_id}/labels/{user_id_round_no}` (Doc ID 직접 지정)
  - `user_id` == `request.auth.uid`
  - `round_no` == `[Active Round]`
- Sort order: 없음
- Pagination: 없음
- Authorization condition: `request.auth.uid == user_id` (Firestore Security Rules로 본인 소유 가드 통제)
- Expected frequency / scale: 작업 상세 진입 시마다 호출 (하루 약 300~500회)
- Freshness requirement: 단회성 혹은 실시간 감지
- Required indexes: 기본 키(DocID) 조회이므로 추가 인덱스 불요
- Caching / denormalization notes: 없음.
- Risks: 없음.

---

### QP-004 — Fetch All Previous Labels for Mismatch Review (불일치 라운드 타인 의견 조회)
- Actor / system: Evaluator (Round 2 시), Adjudicator (Round 3 시)
- Use case: 2차 평가자 혹은 3차 Adjudicator가 불일치 대화 조정 시 앞선 차수에 타인들이 제출한 유해성 선택 정보, 유형, 근거 구절들을 일람 비교
- Related requirement IDs: User Request, BR-008, BR-010
- Related acceptance criteria IDs: 없음.
- Related API / module / screen / job: MOD-002, MOD-003 (Adjudication Module) / 합의 조정 및 2차 평가 화면
- Data objects accessed: DATA-OBJ-003 (Label)
- Filters: 
  - Collection Path: `/conversations/{call_id}/labels` (하위 Labels 컬렉션 전체 쿼리)
- Sort order: `submitted_at` ascending
- Pagination: 없음 (대화당 최대 6~9개 수준)
- Authorization condition: `request.auth != null` 이며, Parent Conversation의 `status`가 `"Round 2 Active"`이거나 `"Round 3 Active"`인 조건 하에서만 타인 Label 읽기 허용.
- Expected frequency / scale: 하루 약 100~200회
- Freshness requirement: 단회성 혹은 실시간 감지
- Required indexes: subcollection query용 `submitted_at` ASC 인덱스 (필요시)
- Caching / denormalization notes: 없음.
- Risks: 1차 평가 단계(`status == "Round 1 Active"`)에서 이 쿼리를 호출하는 것을 Security Rules 단에서 반드시 에러 차단하여 blind 원칙 준수 보장.

---

### QP-005 — Fetch Gold Standard Label (합의 완료 정답 조회)
- Actor / system: Evaluator, Adjudicator, Admin
- Use case: 합의 완료 대화의 확정 정답 정보 렌더링 및 연구 분석 데이터셋 추출용
- Related requirement IDs: User Request, FR-007
- Related acceptance criteria IDs: 없음.
- Related API / module / screen / job: API-004 / MOD-003 / 대시보드 및 결과 목록 화면
- Data objects accessed: DATA-OBJ-005 (Gold Standard Label)
- Filters: Document Path: `/conversations/{call_id}/gold_standard/verdict` (1:1 고유 경로)
- Sort order: 없음
- Pagination: 없음
- Authorization condition: `request.auth != null`
- Expected frequency / scale: 하루 약 50~100회
- Freshness requirement: 단회성
- Required indexes: DocID 직접 접근이므로 인덱스 불요
- Caching / denormalization notes: 없음.
- Risks: 없음.

---

### QP-006 — Fetch Audit Trails (감사 로그 전체 열람)
- Actor / system: Admin (ROLE-001)
- Use case: 관리자 계정으로 보안 관리 탭에 진입하여 시스템 내의 데이터 변경 이력 감사 로그를 최신 순서대로 모니터링
- Related requirement IDs: OPS-001, BR-004, INV-003
- Related acceptance criteria IDs: 없음.
- Related API / module / screen / job: MOD-001 (Project Management Module) / 관리자 감사 패널
- Data objects accessed: DATA-OBJ-006 (Audit Log)
- Filters: 없음 (전체 `/audit_logs` 컬렉션 대상)
- Sort order: `timestamp` descending
- Pagination: Page limit 50
- Authorization condition: Admin 역할 소유자만 조회 가능 (`request.auth.token.role == 'Admin'` 혹은 user profile lookup)
- Expected frequency / scale: 주 1~2회 미만 간헐적 조회
- Freshness requirement: 단회성
- Required indexes: `timestamp` DESC 인덱스 필요
- Caching / denormalization notes: 없음.
- Risks: 쿼리 시 미인가 Evaluator 세션에서 호출할 시 Firestore Rules에 의해 즉각 차단되는지 보안 검증 필요.

---

### QP-007 — User Profile Role Check (로그인 유저 권한 조회)
- Actor / system: Client App (React UI Guard), Firestore Security Rules (내부 lookup)
- Use case: 로그인 성공 직후 해당 계정이 Admin인지, Evaluator인지, Adjudicator 권한을 갖는 인원인지 확인하여 Route Guard 실행 및 인가 상태 유지
- Related requirement IDs: SEC-001, SEC-002, BR-002, BR-010
- Related acceptance criteria IDs: AC-SEC-001
- Related API / module / screen / job: MOD-005 (Auth Module) / Route Guard 및 초기화 세션
- Data objects accessed: DATA-OBJ-007 (User Profile)
- Filters: Document Path: `/users/{uid}` (현재 Auth UID와 매치)
- Sort order: 없음
- Pagination: 없음
- Authorization condition: `request.auth.uid == uid` (자신의 프로필은 상시 조회 가능)
- Expected frequency / scale: 세션 로그인 시 1회 및 룰 체크 시 내부 trigger
- Freshness requirement: 단회성 또는 실시간 감지
- Required indexes: DocID 직접 접근이므로 인덱스 불요
- Caching / denormalization notes: 사용자 역할 정보는 React App context에 안전하게 캐싱되어 중복 호출을 차단함.
- Risks: 없음.

---

### QP-008 — Fetch Dashboard Precalculated Stats (대시보드 통계 지표 조회)
- Actor / system: Admin, Evaluator, Adjudicator
- Use case: 대시보드 홈 탭 진입 시 사전 계산된 Fleiss' Kappa 통계 테이블 및 차트 그래프 데이터 렌더링
- Related requirement IDs: FR-006, FR-007
- Related acceptance criteria IDs: AC-FR-006-01, AC-FR-007-01
- Related API / module / screen / job: MOD-001 / 대시보드 화면
- Data objects accessed: DATA-OBJ-008 (Dashboard Statistics)
- Filters: Document Path: `/dashboard/statistics` (단일 문서)
- Sort order: 없음
- Pagination: 없음
- Authorization condition: `request.auth != null`
- Expected frequency / scale: 대시보드 접속 시마다 호출 (하루 약 50~100회)
- Freshness requirement: 단회성
- Required indexes: 단일 DocID 접근이므로 인덱스 불요
- Caching / denormalization notes: 없음.
- Risks: 없음.

---

## 4. Filtering, Sorting, Pagination, and Search Needs
- **Filtering**: 모든 대화 목록 조회 시 `status` 필드를 일차적으로 필터링합니다.
- **Sorting**: 정렬 조건은 대화 목록의 `created_at` 오름차순 및 감사 로그의 `timestamp` 내림차순으로 국한됩니다.
- **Pagination**: 대화 목록 및 감사 로그는 Firestore `startAfter` 커서를 이용한 50개 단위 오프셋 페이징 처리를 수행하여 네트워크 대역폭 리스크를 상쇄합니다.

## 5. Authorization-Aware Query Notes
- **Round 1 Blind Spot Enforcement**:
  - `QP-004` (타인 라벨 쿼리)는 대화 상세 화면에서 부모 대화 상태가 `"Round 2 Active"` 혹은 `"Round 3 Active"`인 경우에만 쿼리 결과 조회를 허용하며, `"Round 1 Active"`인 경우에는 Firestore Security Rules가 이를 감지하여 접근 에러(Permission Denied)를 뱉어 내야 합니다.

## 6. Scale / Frequency Assumptions
- 동시 접속 인원은 연구진 10명 내외(`A-101`)로 쓰기 빈도가 매우 낮고 대화셋 용량도 작기 때문에, Firestore의 쿼리 초당 비용 한계 및 부하 리스크는 실상 0%에 수렴한다고 가정합니다.

## 7. Performance Risks
- `status` 필터를 이용한 쿼리 조회 시, Firestore의 복합 인덱스가 사전에 생성되어 있지 않으면 쿼리가 완전히 거부되고 웹 화면이 블록될 위험이 존재합니다.
  - *대응*: 물리 데이터 설계(`06c`) 및 인덱스 설정(`06_indexes.md`)에 필요한 복합 정렬 인덱스를 공식 정의하여 배포 시 사전에 인프라 설정을 수립하도록 강제합니다.

## 8. Index Implications
- `status`와 `created_at`을 활용한 복합 쿼리(`QP-001`)를 지원하기 위해 단 하나의 복합 인덱스 배정이 필수로 지목됩니다.

## 9. Caching or Denormalization Candidates
- **Conversation.label_completion_count**: 라운드 완료 여부 판단 및 진척 통계 시 UI 단에서 매번 하위 Labels 컬렉션 전체를 Get 하여 length를 계산할 경우 읽기(Read) 비용이 불필요하게 3배(3명)로 증가하므로, Conversation에 completion count 필드를 유도 누적하여 보관합니다.

## 10. Open Questions
- 없음.
