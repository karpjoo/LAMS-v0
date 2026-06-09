# 06 Conceptual Data Model

## 1. Purpose
본 문서는 LAMS-v0 시스템의 도메인 개념, 비즈니스 규칙 및 보안 요구사항을 기술적으로 구현하기 위한 첫 단계로, 시스템이 다루는 모든 데이터의 논리적 분류와 소유권, 민감도 및 수명주기 경계를 규정하는 개념적 데이터 모델을 정의합니다.

## 2. Inputs Used
- [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
- [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md)
- [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md)
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
- [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
- [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- [05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md)
- [05_api_contracts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_api_contracts.md)

## 3. Data Scope
LAMS-v0 시스템의 데이터 범위는 다음과 같습니다.
- **적재 필수 (Persistent)**: 상담 대화 목록 및 본문, 평가자별 라벨 피드백, Adjudicator 확정 합의 라벨(Gold Standard), 시스템 감사 로그(Audit Log), 사용자 관리 프로필, 대시보드 통계 지표.
- **비적재 / 임시 (Non-persistent / Session)**: 클라이언트 앱 내의 개인정보 실시간 Warning 감지 스캔 상태, 로그인 인증 토큰 세션, 파일 업로드 임시 버퍼.
- **연산식 및 아키텍처 범위 외 (Out-of-scope)**: 실시간 LLM 추론 연산 결과(외부 임포트만 지원), 실시간 Kappa 통계 수학 연산(외부 임포트만 지원), 실시간 음성 스트리밍 리소스.

---

## 4. Conceptual Data Objects

### DATA-OBJ-001 — Conversation (상담 대화)
- Domain term: Conversation (상담 대화)
- Description: 분석 및 평가 대상이 되는 콜센터 상담 대화 레코드의 기본 단위.
- Related requirement IDs: FR-001, FR-002, FR-003, FR-007
- Related acceptance criteria IDs: AC-FR-001-01, AC-FR-001-02, AC-FR-002-01, AC-FR-003-01
- Related domain concept / aggregate: DC-001, AGG-001 (Root)
- Related bounded context: Project Management & Evaluation Bounded Context
- Owner: Admin (ROLE-001)
- Source of truth: Persistent database (Firestore)
- Lifecycle: Admin에 의해 JSON 업로드로 일괄 생성 -> 진행도에 따라 status 전이 (`Round 1 Active` -> `Round 2 Active`/`Round 3 Active` -> `Consensus Reached`) -> Admin 데이터셋 초기화(Clear) 시 영구 삭제.
- Sensitivity classification: Confidential (비식별화 필수 텍스트)
- Access summary: Admin은 생성/삭제 권한 독점. Evaluator/Adjudicator는 조회(Read)만 허용.
- Retention/deletion notes: 데이터셋 영구 삭제 요청 시 하위 컬렉션 문서와 함께 Cascade Hard-Delete 적용.
- Open questions: 없음.

---

### DATA-OBJ-002 — Turn (대화 턴)
- Domain term: Turn (대화 턴)
- Description: 상담 대화(Conversation)를 구성하는 화자(Speaker)와 텍스트 발화 내용의 개별 요소.
- Related requirement IDs: FR-003
- Related acceptance criteria IDs: AC-FR-003-01
- Related domain concept / aggregate: DC-002, VO-001 (Value Object)
- Related bounded context: Project Management & Evaluation Bounded Context
- Owner: Admin (ROLE-001)
- Source of truth: Persistent database (Firestore - Conversation에 내장)
- Lifecycle: Conversation과 수명주기 일치 (동시 생성 및 소멸).
- Sensitivity classification: Confidential (비식별화 필수 텍스트)
- Access summary: Conversation 조회 권한을 가진 모든 인증 유저가 열람 가능. 단독 수정 불가.
- Retention/deletion notes: 부모 Conversation 삭제 시 동시 제거.
- Open questions: 없음.

---

### DATA-OBJ-003 — Label (평가 라벨)
- Domain term: Label (평가 라벨)
- Description: 특정 상담 대화에 대해 개별 평가자가 특정 차수(Round)에 기록하여 제출한 유해성 판단 피드백 데이터.
- Related requirement IDs: FR-004, SEC-002
- Related acceptance criteria IDs: AC-FR-004-01, AC-FR-004-02
- Related domain concept / aggregate: DC-003, ENT-002, AGG-002 (Root)
- Related bounded context: Project Management & Evaluation Bounded Context
- Owner: Evaluator (ROLE-002) - 개별 평가자 자신의 도큐먼트에 한정
- Source of truth: Persistent database (Firestore)
- Lifecycle: Evaluator가 평가 저장 시 생성 -> 동일 차수 활성 상태 중 수정(Update) 가능 -> 최종 Adjudicator 완료 또는 데이터셋 삭제 시 소멸.
- Sensitivity classification: Confidential
- Access summary: Evaluator는 본인 Label만 Write 가능.
  - Round 1 진행 중: 본인 외 타인의 Label 읽기 불가.
  - Round 2 진행 중: 1차 평가 정보 공유를 위해 1차 작성된 타 평가자의 라벨에 한해 전체 읽기 허용.
  - Admin/Adjudicator: 2, 3차 합의 진행 및 모니터링을 위해 항상 읽기 허용 (수정 불가능).
- Retention/deletion notes: 데이터셋 일괄 삭제 시 Cascade Hard-Delete 적용.
- Open questions: 없음.

---

### DATA-OBJ-004 — LLM Decision (LLM 판정 결과)
- Domain term: LLM Decision (LLM 판정 결과)
- Description: 외부에서 수행된 LLM 추론 모델별 유해성 탐지 결과 데이터셋.
- Related requirement IDs: FR-005, INT-001
- Related acceptance criteria IDs: AC-FR-005-01
- Related domain concept / aggregate: DC-004, VO-003 (Value Object)
- Related bounded context: Project Management & Evaluation Bounded Context
- Owner: Admin (ROLE-001)
- Source of truth: External Source File (웹 업로드를 통해 Firestore에 적재)
- Lifecycle: Admin에 의해 일괄 업로드로 생성 -> 대화 삭제 시 소멸 (수정 불가).
- Sensitivity classification: Confidential
- Access summary: Admin은 생성/삭제 권한 독점. Evaluator/Adjudicator는 상세 화면 렌더링용으로 조회만 가능.
- Retention/deletion notes: 부모 Conversation 삭제 시 동시 제거.
- Open questions: 없음.

---

### DATA-OBJ-005 — Gold Standard Label (합의 정답 라벨)
- Domain term: Gold Standard Label (합의 정답 라벨)
- Description: 전문가 합의 프로세스 결과 최종 확정된 대화별 절대 정답 피드백 레코드.
- Related requirement IDs: User Request
- Related acceptance criteria IDs: 없음.
- Related domain concept / aggregate: DC-007, ENT-003, AGG-001
- Related bounded context: Adjudication Bounded Context
- Owner: Adjudicator (ADJUD-01) - 3차 최종 기입 권한 한정
- Source of truth: Persistent database (Firestore)
- Lifecycle: 1차/2차 전원 일치 시 자동 생성되거나, 의견 불일치 시 3차 Adjudicator 최종 저장에 의해 수동 생성됨. 대화 삭제 시 소멸.
- Sensitivity classification: Confidential
- Access summary: Adjudicator는 최종 기입(Create/Update) 권한 독점. Admin/Evaluator는 조회(Read)만 가능.
- Retention/deletion notes: 부모 Conversation 삭제 시 Cascade Hard-Delete 적용.
- Open questions: 없음.

---

### DATA-OBJ-006 — Audit Log (감사 로그)
- Domain term: Audit Log (감사 로그)
- Description: 데이터 업로드, 삭제, 라벨 보존 및 최종 결정 등 시스템 보안에 민감한 핵심 액션을 영구 기록하는 추적 레코드.
- Related requirement IDs: OPS-001
- Related acceptance criteria IDs: 없음.
- Related domain concept / aggregate: DC-006, ENT-004, AGG-003 (Root)
- Related bounded context: Audit & Security Bounded Context
- Owner: System / Admin (ROLE-001)
- Source of truth: Persistent database (Firestore)
- Lifecycle: 주요 데이터 변경 감지 시 Batched Write로 생성됨. 임의 수정 및 부분 삭제가 완전히 차단되는 Append-only 수명주기.
- Sensitivity classification: Internal (시스템 관리용 정보)
- Access summary: 모든 인증 세션에서 Create(쓰기 전용)가 트리거되지만, Read(조회)는 오직 Admin(ROLE-001) 권한만 허용함. Edit 및 Delete 권한은 전체 차단.
- Retention/deletion notes: 영구 보존. 데이터셋 초기화 삭제 액션의 영향에서도 완전 배제되어 보존되어야 함.
- Open questions: 데이터셋 삭제(Clear All Datasets) 시에도 감사 로그를 완전 보존해야 하는가?
  - *답변*: BR-004 및 INV-003 정책에 따라 데이터셋이 통째로 삭제되는 이력 역시 감사 로그 자체에 "Clear All Datasets" 로그 레코드로 기록되어 영구 보존되어야 함.

---

### DATA-OBJ-007 — User Profile (사용자 프로필)
- Domain term: User Profile (사용자 프로필)
- Description: 시스템에 가입되어 역할을 배정받은 평가자 및 관리자의 계정 메타데이터 정보.
- Related requirement IDs: SEC-001, SEC-002
- Related acceptance criteria IDs: AC-SEC-001
- Related domain concept / aggregate: Actor, Roles (ACT-001 ~ ACT-003)
- Related bounded context: Identity Bounded Context
- Owner: Admin (ROLE-001)
- Source of truth: Firebase Auth (계정 세션) + Firestore User Document (역할 매핑)
- Lifecycle: Admin에 의해 가입 생성 -> 역할 할당 -> 삭제 가능.
- Sensitivity classification: Confidential (이메일 및 역할 포함)
- Access summary: Admin은 생성 및 역할 편집 권한 독점. 모든 로그인된 사용자는 본인의 역할 조회를 위해 읽기(Read)만 허용.
- Retention/deletion notes: 수동 관리 삭제 전까지 유지.
- Open questions: 없음.

---

### DATA-OBJ-008 — Dashboard Statistics (대시보드 통계)
- Domain term: Dashboard Statistics (대시보드 통계)
- Description: 외부에서 오프라인 계산 완료된 Kappa 점수, 모델 비교 오차 수치 등의 시각화용 통계 정보.
- Related requirement IDs: FR-006, FR-007
- Related acceptance criteria IDs: AC-FR-006-01, AC-FR-007-01
- Related domain concept / aggregate: 없음.
- Related bounded context: Analytics Dashboard Bounded Context
- Owner: Admin (ROLE-001)
- Source of truth: Persistent database (Firestore)
- Lifecycle: Admin 업로드 시 생성 및 갱신(Overwrite) -> 데이터셋 초기화 시 삭제.
- Sensitivity classification: Confidential
- Access summary: Admin은 임포트 갱신 권한 독점. 모든 사용자는 대시보드 탭 로딩 시 조회 가능.
- Retention/deletion notes: 데이터셋 초기화 시 함께 삭제.
- Open questions: 없음.

---

## 5. Data Ownership and Boundaries
데이터 접근 통제 및 트랜잭션 바운더리를 보호하기 위해 데이터 소유권을 세 가지 범주로 제한합니다.
1. **Admin 소유 데이터**: `Conversation`, `LLM Decision`, `User Profile`, `Dashboard Statistics`
   - Admin 만이 해당 데이터셋의 벌크 생성 및 일괄 삭제를 트랜잭션 단위로 트리거할 수 있습니다.
2. **Evaluator 소유 데이터**: `Label`
   - 개별 평가자는 자신이 생성한 `Label` 도큐먼트에 대해서만 독점적 쓰기/수정 권한을 소유합니다.
3. **Adjudicator 소유 데이터**: `Gold Standard Label`
   - 최종 합의 정답 기입 권한은 지정된 1인의 Adjudicator에게만 귀속됩니다. 일반 Evaluator는 타인 의견 조회만 가능하며 Gold Standard 쓰기가 차단됩니다.

---

## 6. Source-of-Truth Classification
- **Primary Source of Truth (자체 생성 원천 데이터)**:
  - `Label`: 평가자가 직접 입력하는 라벨 피드백.
  - `Gold Standard Label`: Adjudicator가 합의 단계에서 도출한 최종 정답.
  - `Audit Log`: 시스템 변경 추적 레코드.
- **Imported Source of Truth (외부 임포트 데이터)**:
  - `Conversation`: 외부에서 수집/생성 후 비식별화 처리를 완료하고 들어온 텍스트 원본.
  - `LLM Decision`: 외부 inference 파이프라인 산출물.
  - `Dashboard Statistics`: 외부 사전 연산 통계 JSON 파일.

---

## 7. Derived / Cached / Temporary Data
- **Derived Data (유도 데이터)**:
  - Conversation의 `label_completion_count`: 각 대화의 하위에 평가자가 등록한 라벨 개수 카운트 (목록 조회 필터링 및 대시보드 진행도 차트용).
  - Conversation의 `status`: 라벨 개수와 일치 조건 충족 여부에 따라 도출되는 비즈니스 상태값.
- **Temporary Data (임시 데이터)**:
  - client-side PII Warning Trigger: 업로드 JSON 내의 휴대전화 번호 패턴 감지 모달 플래그.

---

## 8. Sensitive / Personal / Regulated Data Classification
- **Personal Data (개인정보)**:
  - `User Profile`의 `email`. Firebase Auth 계정 식별 목적.
- **Confidential Data (기밀 연구자료)**:
  - `Conversation`의 턴 대화 텍스트 (`Turn.text`).
  - 외부 연구 결과 유출 방지를 위한 `Label` 및 `Gold Standard Label`.
- **보안 조치**:
  - `Turn.text`는 사전 비식별화 처리를 마스킹 전제로 유입함.
  - Firestore Security Rules를 통해 미인가 게스트 세션의 모든 컬렉션 읽기 권한을 근본 차단함.

---

## 9. Lifecycle and State Notes
1. **대화 데이터셋 수명**: Admin JSON 업로드로 대량 생성 -> Adjudication 단계에 따라 상태값 유동적 변경 -> Admin 일괄 삭제 시 영구 Hard-Delete.
2. **평가 데이터 수명**: Evaluator가 대화 목록에서 활성 라운드 열람 후 폼 저장 시 생성 -> 수정 시 prefill 로드되어 업데이트 -> 대화셋 삭제 시 연쇄 삭제.
3. **감사 로그 수명**: 이벤트 발생 시 동시 생성(Batch) -> 데이터셋 삭제 이력도 신규 로그로 보관되며, 이전 로그들은 DB에서 절대 삭제할 수 없음 (수정/삭제 Rules 차단).

---

## 10. Conceptual Model Diagram or Textual Map
```
[User Profile] --(Role Lookup)--> Enforces Firestore Security Rules
                                          |
                                          v
[Conversation] <===(1 : N Embedding)===> [Turn]
      |
      +---(1 : N Subcollection)---> [Label] (Evaluator Owned)
      |
      +---(1 : 1 Subcollection)---> [LLM Decision] (Model Verdict Map)
      |
      +---(1 : 1 Subcollection)---> [Gold Standard Label] (Adjudicator Owned)
                                          |
                                          v
[Audit Log] <===(Append-only Batch)======+ (Triggers on Mutations)

[Dashboard Statistics] <---(Uploaded Stats Charts)
```

---

## 11. Decision Candidates
- **DATA-DEC-001**: 대화 턴 데이터(`Turn`)를 하위 컬렉션으로 분리하지 않고 `Conversation` 도큐먼트 내에 순차 배열(Array of Map) 형태로 직접 임베딩하여 로딩 부하를 줄일 것을 제안함.
  - *근거*: Firestore Document 1MB 한계 내에서, 평균 턴수 20~30회의 상담 대화 텍스트는 50KB 미만으로 단일 도큐먼트 임베딩이 읽기 성능과 비용 면에서 극히 효율적임.

---

## 12. Working Assumptions
- **DATA-ASM-001**: 1차 평가 중 타인의 라벨 정보를 노출하지 않는 것은 Firestore Security Rules의 Document ID 필드 권한 제어를 통해 완벽히 보장된다고 가정함.

---

## 13. Open Questions
- 없음.