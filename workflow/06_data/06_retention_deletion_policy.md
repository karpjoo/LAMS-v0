# 06 Retention & Deletion Policy

## 1. Purpose
본 문서는 LAMS-v0 시스템의 데이터 수명주기 관리 및 데이터 파기 지침을 수립합니다. 특정 데이터 범주별 보존 기간, 파기 유발 트리거, Cascade 연쇄 삭제 처리 방침 및 감사 로그 영구성 조건을 확정하여 연구 데이터 보호 및 안전한 일괄 삭제 요건을 달성합니다.

## 2. Inputs Used
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-002, SEC-004, OPS-001)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md) (BR-003, BR-004, INV-003)

## 3. Retention & Deletion Policy Summary
NoSQL 데이터스토어인 Firestore의 특성에 부합하도록 Cascade 제거 시 하위 서브컬렉션을 원자적으로 정리하기 위한 물리적 순서 가이드를 포함합니다. 감사 로그(`Audit Log`)를 제외한 대화 데이터셋 및 종속 평가는 관리자 일괄 삭제 시 물리적으로 복구가 불가능한 Hard-Delete(영구 삭제)를 적용하여 연구 종료 시 데이터가 서버에 잔존하지 않도록 보증합니다.

---

## 4. Retention / Deletion Rules Detail

### RET-001 — Conversation & Dependent Dataset Purge (대화 데이터셋 및 종속 데이터 일괄 삭제)
- Data category: Research Data
- Data objects: DATA-OBJ-001 (Conversation), DATA-OBJ-002 (Turn), DATA-OBJ-004 (LLM Decision), DATA-OBJ-005 (Gold Standard Label), DATA-OBJ-008 (Dashboard Statistics)
- Retention trigger or period: 연구 수행 중 상시 보존
- Deletion trigger: Admin의 수동 일괄 데이터셋 삭제 명령 (`confirmText == "DELETE ALL DATASET"`)
- Soft delete / hard delete / archive: Hard Delete (영구 물리 삭제, 복구 불가능)
- User-requested deletion behavior: 해당 없음
- Admin purge behavior: 
  1. Admin 콘솔에서 2단계 텍스트 인터락 해제 승인.
  2. 시스템이 Firestore 배치 삭제 API를 작동하여 conversations 내의 모든 문서와 그 하위 서브컬렉션(labels, llm_results, gold_standard)을 연쇄 Hard-Delete 처리.
- Audit/backups consideration: 백업 복구본을 별도로 보관하지 않음. 일괄 삭제 액션 실행 이력 자체는 감사 로그에 영구 기록함.
- Cascade/orphan handling: 
  - Firestore의 특성상 상위 Conversation 문서를 지워도 하위 서브컬렉션 문서가 암묵적으로 남을 수 있으므로(Orphan Document), 삭제 트랜잭션 시 하위 labels 및 gold_standard, llm_results 컬렉션 내 문서를 선제적으로 일괄 Get-and-Delete 한 뒤 최종 conversations 문서를 삭제해야 함.
- Related requirement / risk: FR-002, SEC-004, RISK-001
- Open questions: 없음.

---

### RET-002 — Evaluator Labels Retention (평가 라벨 수명 제어)
- Data category: Human Evaluation Feedback
- Data objects: DATA-OBJ-003 (Label)
- Retention trigger or period: 대화 데이터셋의 수명과 100% 동기화됨.
- Deletion trigger: 
  - 일반 평가자는 본인이 작성한 평가 라벨을 개별 삭제(Delete)할 수 없으며 오직 수정(Update)만 허용함.
  - 대화 데이터셋 일괄 삭제 시(RET-001 트리거)에만 연쇄 삭제됨.
- Soft delete / hard delete / archive: Hard Delete
- User-requested deletion behavior: 없음 (평가자의 수동 탈퇴 시에도 수집된 평가는 보존됨)
- Admin purge behavior: RET-001 프로세스에 의해 일괄 Cascade 삭제.
- Audit/backups consideration: 없음
- Cascade/orphan handling: parent call_id의 수명주기 경계에 결합.
- Related requirement / risk: FR-004, BR-002
- Open questions: 없음.

---

### RET-003 — Permanent Audit Trail Retention (감사 로그 영구 보존)
- Data category: Operational Audit Logs
- Data objects: DATA-OBJ-006 (Audit Log)
- Retention trigger or period: **영구 보존 (Permanent)**
- Deletion trigger: **없음 (삭제 조작 원천 불가능)**
- Soft delete / hard delete / archive: 삭제 및 아카이빙 없음.
- User-requested deletion behavior: 없음
- Admin purge behavior: 
  - *매우 중요*: 관리자의 "DELETE ALL DATASET" 명령(RET-001)이 실행될 때도, 이 감사 로그 컬렉션만큼은 삭제 대상에서 물리적으로 완벽히 제외되어야 함.
- Audit/backups consideration: 쓰기 액션 발생 시 실시간 Append 적재됨.
- Cascade/orphan handling: 다른 어떤 도큐먼트와도 Cascade 연동을 맺지 않고 독자 수명주기 유지.
- Related requirement / risk: OPS-001, BR-004, INV-003
- Open questions: 없음.
