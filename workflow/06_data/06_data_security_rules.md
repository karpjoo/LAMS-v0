# 06 Data Security Rules

## 1. Purpose
본 문서는 LAMS-v0 시스템의 데이터베이스(Firestore) 접근 통제 및 보안 규칙 설계서입니다. 프론트엔드 UI의 차단을 넘어 실제 데이터 저장소 레이어에서 미인가 읽기/쓰기 및 악성 위변조 시도를 원천 봉쇄할 수 있는 보안 규칙들의 동작과 조건을 상세 정의합니다.

## 2. Inputs Used
- [05_authn_authz_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_authn_authz_model.md)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md) (BR-002, BR-004, BR-007, BR-010, INV-003, INV-005)

## 3. Data Security Rules Overview
LAMS-v0는 서버리스 직접 연동 구조(`ADR-001`)를 취하므로, 아래 기술된 보안 규칙들은 **Firestore Security Rules** 설정 파일에 직접 적용되어 클라우드 데이터베이스 서버가 모든 트랜잭션 요청 시점마다 자체 평가 및 통제하도록 강제합니다.

---

## 4. Security Rules Detail

### DSR-001 — Conversation Access Control (대화 데이터셋 접근 통제)
- Data object: DATA-OBJ-001 (Conversation)
- Actor / role / system: Evaluator (ROLE-002), Adjudicator (ADJUD-01), Admin (ROLE-001)
- Operation: create / read / update / delete
- Condition:
  - **Read**: 로그인 세션 존재 필수 (`request.auth != null`)
  - **Create / Update / Delete**: 오직 Admin만 수행 가능 (`get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin'`)
- Enforcement layer: Database Layer (Firestore Security Rules)
- Related requirement: SEC-001, FR-001, FR-002
- Related architecture authz rule: Protected Resource Inventory (Conversations read/write)
- Sensitive fields affected: `turns`
- Audit required: Yes (Create 및 Delete 동작에 한해 감사 로그 저장 의무)
- Failure behavior: 거부 (Permission Denied 에러 발생, 클라이언트 에러 바운더리로 격리)
- Test implication: Evaluator 계정으로 로그인 후 대화 도큐먼트 직접 Write 시도 시 100% 거부됨을 테스트.
- Open questions: 없음.

---

### DSR-002 — Evaluator Label Isolation & Lock (평가 라벨 격리 및 잠금)
- Data object: DATA-OBJ-003 (Label)
- Actor / role / system: Evaluator (ROLE-002)
- Operation: create / read / update / delete
- Condition:
  - **Read (Round 1 Blind Spot)**:
    - 로그인한 본인 계정의 Uid로 작성된 라벨 문서만 언제나 읽을 수 있음 (`resource.data.user_id == request.auth.uid`).
    - 부모 대화 상태가 2차 불일치 검토인 경우 (`get(/databases/$(database)/documents/conversations/$(callId)).data.status in ['Round 2 Active', 'Round 3 Active', 'Consensus Reached']`)에 한하여 타인의 1차/2차 라벨에 대한 읽기(Read)를 허용함 (BR-007, BR-008 준수).
  - **Create / Update**:
    - 로그인 UID가 문서 ID와 매칭되고 데이터 user_id 필드와 매칭될 것 (`request.auth.uid == userId` && DocumentID가 `request.auth.uid + "_" + round_no` 패턴일 것).
    - 부모 대화의 상태가 최종 확정 잠금 상태가 아닐 것 (`get(/databases/$(database)/documents/conversations/$(callId)).data.status != 'Consensus Reached'`).
  - **Delete**: 
    - 전체 권한 거부 (임의 삭제 불가).
- Enforcement layer: Database Layer (Firestore Security Rules)
- Related requirement: SEC-002, BR-002, BR-007, BR-008, INV-001, INV-005
- Related architecture authz rule: Write Isolation Policy (DSP-002)
- Sensitive fields affected: `evidence_phrases`
- Audit required: Yes (Create 및 Update 시 Audit Log Batch 트랜잭션 동시 적재 필수)
- Failure behavior: 즉각 거부 (Permission Denied)
- Test implication: 
  - `status`가 `"Round 1 Active"`일 때 다른 평가자 UID로 생성된 labels 하위 문서 GET 요청 시 룰 차단 검증.
  - `status`가 `"Consensus Reached"`인 대화 하위로 labels 신규 기입 시 룰 차단 검증.
- Open questions: 없음.

---

### DSR-003 — Gold Standard Exclusive Write (골드 스탠다드 결정권 통제)
- Data object: DATA-OBJ-005 (Gold Standard Label)
- Actor / role / system: Adjudicator (ADJUD-01)
- Operation: create / read / update / delete
- Condition:
  - **Read**: 로그인 세션 존재 시 전체 허용 (`request.auth != null`).
  - **Create / Update**: 로그인 사용자 프로필 내의 `is_adjudicator` 필드가 `true`인 경우에만 허용.
  - **Delete**: 전체 권한 거부 (임의 삭제 불가, 데이터셋 일괄 초기화 시에만 Cascade 삭제).
- Enforcement layer: Database Layer (Firestore Security Rules)
- Related requirement: User Request, BR-010, INV-005
- Related architecture authz rule: Adjudicator write boundary
- Sensitive fields affected: `evidence_phrases`
- Audit required: Yes (최종 합의 정답 기입 로그 영구 보관)
- Failure behavior: 즉각 거부
- Test implication: 일반 Evaluator 계정으로 `/conversations/{call_id}/gold_standard/verdict` 경로에 강제 쓰기 트랜잭션 전송 시 룰에 의한 거부 동작 검증.
- Open questions: 없음.

---

### DSR-004 — Audit Log Append-Only (감사 로그 위변조 차단)
- Data object: DATA-OBJ-006 (Audit Log)
- Actor / role / system: System / Admin (ROLE-001)
- Operation: create / read / update / delete
- Condition:
  - **Read**: 오직 Admin 계정만 전체 조회 허용 (`get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin'`).
  - **Create**: 로그인 세션 존재 시 전체 허용 (`request.auth != null`).
  - **Update / Delete**: **무조건 거부 (false)** (INV-003 준수).
- Enforcement layer: Database Layer (Firestore Security Rules)
- Related requirement: OPS-001, BR-004, INV-003
- Related architecture authz rule: Append-only transaction audit logging
- Sensitive fields affected: `details`
- Audit required: No (로깅 동작에 대한 재로깅 무한 루프 방지)
- Failure behavior: 거부
- Test implication: Admin 계정 세션으로도 `/audit_logs` 컬렉션 내 기존 도큐먼트 삭제(deleteDoc)나 필드 수정(updateDoc) 시도 시 즉시 에러 반환 검증.
- Open questions: 없음.

---

### DSR-005 — User Profile Access Control (사용자 역할 보안)
- Data object: DATA-OBJ-007 (User Profile)
- Actor / role / system: Admin, Authenticated Session
- Operation: create / read / update / delete
- Condition:
  - **Read**: 로그인 세션 전체 허용 (`request.auth != null`).
  - **Create / Update / Delete**: 오직 Admin 계정만 허용 (`get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin'`).
- Enforcement layer: Database Layer (Firestore Security Rules)
- Related requirement: SEC-001, SEC-002
- Related architecture authz rule: Identity database protection
- Sensitive fields affected: `email`
- Audit required: Yes (사용자 권한 변경 내역 로깅)
- Failure behavior: 거부
- Test implication: 일반 Evaluator 계정으로 로그인 후 타인의 역할 필드를 변경하거나 본인 문서에 쓰기 시도 시 룰 거부 검증.
- Open questions: 없음.

---

### DSR-006 — Dashboard Statistics Control (통계 리소스 잠금)
- Data object: DATA-OBJ-008 (Dashboard Statistics)
- Actor / role / system: Authenticated User, Admin
- Operation: create / read / update / delete
- Condition:
  - **Read**: 로그인 세션 존재 시 전체 허용 (`request.auth != null`).
  - **Create / Update / Delete**: 오직 Admin만 허용 (`get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin'`).
- Enforcement layer: Database Layer (Firestore Security Rules)
- Related requirement: FR-006, FR-007
- Related architecture authz rule: Statistics resource guard
- Sensitive fields affected: 없음
- Audit required: Yes
- Failure behavior: 거부
- Test implication: 일반 평가자가 통계 문서 변경 시도 시 차단 검증.
- Open questions: 없음.