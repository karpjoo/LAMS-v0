# 06 Physical Schema

## 1. Purpose
본 문서는 LAMS-v0 시스템의 논리적 데이터를 실제 저장소인 Firebase Firestore의 물리적 설계(Physical Schema)로 변환하고 구체화합니다. 컬렉션 구조, 도큐먼트 스키마, 필드 데이터 타입, 복합 서브컬렉션 구성 방식 및 트랜잭션 바운더리를 공식 명시합니다.

## 2. Inputs Used
- [06_logical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_logical_schema.md)
- [06_query_patterns.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_query_patterns.md)
- [05_architecture_decisions.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_decisions.md) (ADR-001, ADR-003, ADR-004)

## 3. Storage Technology Decision Status
- **선정 기술**: Firebase Firestore (NoSQL Document Store)
- **결정 상태**: Approved (ADR-001, ADR-005 사용 승인)
- **매핑 방식**: 논리적 레코드는 Firestore Collection 하위의 Document 형태로 각각 매핑되며, 일대다 종속 관계를 지닌 레코드는 서브컬렉션(Subcollection) 혹은 맵 배열(Array of Map)을 사용하여 계층화합니다.

---

## 4. Physical Schema Overview
```
/users/{uid}                              (Root Collection - User profile)
/audit_logs/{log_id}                      (Root Collection - System audit log)
/dashboard/statistics                     (Root Collection - Single Doc precalculated stats)
/conversations/{call_id}                  (Root Collection - Conversation data)
      |
      +---/labels/{user_id_round_no}      (Subcollection - Evaluator feedback)
      |
      +---/llm_results/verdict            (Subcollection - Direct imported LLM output)
      |
      +---/gold_standard/verdict          (Subcollection - Final consensus verdict)
```

---

## 5. Physical Tables / Collections / Stores

### PHY-001 — users Collection
- Storage technology: Firebase Firestore
- Logical schema mapping: DSCH-007 (User Profile)
- Purpose: 사용자 인증 계정의 이메일 정보 및 역할 조회 관리
- Source of truth: Firestore database
- Partition / tenant / namespace strategy: 글로벌 단일 네임스페이스
- Primary key / document ID / object key: Auth UID (String)
- Foreign keys / references: 없음
- Denormalized fields: 없음
- Constraints: uid는 Auth의 고유 텍스트와 매치
- Transaction or consistency boundary: 개별 사용자 회원가입 시 수동 provision
- Security enforcement notes: 관리자만 편집 가능. 본인의 프로필은 읽기 상시 허용.
- Migration notes: 계정 생성 시 Firestore에 profile 도큐먼트가 함께 생성되어야 함.
- Risks: 없음.

#### Document Schema Details (`/users/{uid}`)
```json
{
  "uid": "String (Document ID)",
  "email": "String (User Email)",
  "role": "String ('Admin' | 'Evaluator')",
  "is_adjudicator": "Boolean (true | false)",
  "created_at": "Timestamp"
}
```

---

### PHY-002 — conversations Collection
- Storage technology: Firebase Firestore
- Logical schema mapping: DSCH-001 (Conversation Record), DSCH-002 (Turns)
- Purpose: 콜센터 상담 본문 턴 데이터셋 및 Adjudication 단계 관리
- Source of truth: Firestore database (Ingested)
- Partition / tenant / namespace strategy: 글로벌
- Primary key / document ID / object key: `call_id` (String, e.g. `"call_0001"`)
- Foreign keys / references: 없음
- Denormalized fields: `label_completion_count` (Integer)
- Constraints: `turns` 데이터는 sequence_no 정렬 배열 필수
- Transaction or consistency boundary: Admin 일괄 데이터셋 등록 시 Batch Write 적용
- Security enforcement notes: Admin 외 쓰기 불가. 모든 인증 유저 읽기 허용.
- Migration notes: `call_id` 중복 시 덮어쓰기 금지 가드 필요.
- Risks: 턴 텍스트의 크기로 인해 Document 1MB 제한 체크 요망 (보통 50KB 이하이므로 극히 안전).

#### Document Schema Details (`/conversations/{call_id}`)
```json
{
  "call_id": "String (Document ID)",
  "status": "String ('Round 1 Active' | 'Round 2 Active' | 'Round 3 Active' | 'Consensus Reached')",
  "created_at": "Timestamp",
  "label_completion_count": "Number (0 ~ 6)",
  "turns": [
    {
      "sequence_no": "Number",
      "speaker": "String ('customer' | 'agent')",
      "text": "String (PII masked)"
    }
  ]
}
```

---

### PHY-003 — labels Subcollection
- Storage technology: Firebase Firestore
- Logical schema mapping: DSCH-003 (Label Record)
- Purpose: 평가자별 1차, 2차 라벨 피드백 정보 보관
- Source of truth: Firestore database (Evaluator Input)
- Partition / tenant / namespace strategy: Conversation 하위 종속 서브컬렉션
- Primary key / document ID / object key: `user_id_round_no` (String, e.g. `"uid123_1"`, `"uid123_2"`)
- Foreign keys / references: `call_id` (parent path), `user_id`
- Denormalized fields: 없음
- Constraints: `INV-001` (차수별 평가자 유일성), `INV-002` (Present/Absent 필드 정합성)
- Transaction or consistency boundary: 라벨 저장 시, 부모 Conversation의 `label_completion_count` 증가 및 상태 판정 트랜잭션 묶음 수행.
- Security enforcement notes: 본인 UID 라벨 문서만 수정 허용. Round 1 상태 시 타인 라벨 읽기 차단.
- Migration notes: 없음.
- Risks: 없음.

#### Document Schema Details (`/conversations/{call_id}/labels/{user_id_round_no}`)
```json
{
  "call_id": "String (Parent Doc ID)",
  "user_id": "String (Evaluator UID)",
  "round_no": "Number (1 | 2)",
  "toxicity": "String ('Present' | 'Absent')",
  "category_id": "Number | null",
  "risk_level": "Number | null",
  "evidence_phrases": "Array of String",
  "submitted_at": "Timestamp"
}
```

---

### PHY-004 — llm_results Document
- Storage technology: Firebase Firestore
- Logical schema mapping: DSCH-004 (LLM Decision Record)
- Purpose: 외부 3개 모델 판정 결과 매핑 데이터 보관
- Source of truth: External Uploaded file
- Partition / tenant / namespace strategy: conversations 하위 종속 서브컬렉션 내 단일 문서 (`verdict`로 고정)
- Primary key / document ID / object key: `"verdict"`
- Foreign keys / references: `call_id` (parent path)
- Denormalized fields: 없음
- Constraints: 3개 모델명 맵 구조 충족
- Transaction or consistency boundary: Admin LLM 파일 업로드 시 일괄 매핑 batch write 적용
- Security enforcement notes: Admin만 수정 가능. 읽기는 세션 전체 허용.
- Migration notes: 없음.
- Risks: 없음.

#### Document Schema Details (`/conversations/{call_id}/llm_results/verdict`)
```json
{
  "call_id": "String (Parent Doc ID)",
  "model_verdicts": {
    "gpt4": {
      "toxicity": "String ('Present' | 'Absent')",
      "category_id": "Number | null",
      "risk_level": "Number | null",
      "evidence_phrases": "Array of String",
      "reasoning": "String"
    },
    "gemini15": {
      "toxicity": "String ('Present' | 'Absent')",
      "category_id": "Number | null",
      "risk_level": "Number | null",
      "evidence_phrases": "Array of String",
      "reasoning": "String"
    },
    "claude3": {
      "toxicity": "String ('Present' | 'Absent')",
      "category_id": "Number | null",
      "risk_level": "Number | null",
      "evidence_phrases": "Array of String",
      "reasoning": "String"
    }
  }
}
```

---

### PHY-005 — gold_standard Document
- Storage technology: Firebase Firestore
- Logical schema mapping: DSCH-005 (Gold Standard Label Record)
- Purpose: 3단계 합의를 통해 확정된 정답 정보 단일 레코드 저장
- Source of truth: Firestore (Calculated or Adjudicator submitted)
- Partition / tenant / namespace strategy: conversations 하위 서브컬렉션 내 단일 문서 (`verdict`로 고정)
- Primary key / document ID / object key: `"verdict"`
- Foreign keys / references: `call_id` (parent path), `adjudicator_id` (optional)
- Denormalized fields: 없음
- Constraints: `INV-005` (최종성 락으로 생성 이후 변경 불가 적용)
- Transaction or consistency boundary: 3차 Adjudicator 결정 제출 시, Conversation.status를 `Consensus Reached`로 변경하는 작업과 Audit Log 작성을 단일 batch write로 수행.
- Security enforcement notes: Adjudicator만 쓰기 가능. 모든 인증 세션 읽기 허용.
- Migration notes: 없음.
- Risks: 없음.

#### Document Schema Details (`/conversations/{call_id}/gold_standard/verdict`)
```json
{
  "call_id": "String (Parent Doc ID)",
  "toxicity": "String ('Present' | 'Absent')",
  "category_id": "Number | null",
  "risk_level": "Number | null",
  "evidence_phrases": "Array of String",
  "finalized_at": "Timestamp",
  "determined_by": "String ('consensus_r1' | 'consensus_r2' | 'adjudicator')",
  "adjudicator_id": "String | null"
}
```

---

### PHY-006 — audit_logs Collection
- Storage technology: Firebase Firestore
- Logical schema mapping: DSCH-006 (Audit Log Record)
- Purpose: 시스템 내 주요 행동 이력 보존
- Source of truth: Firestore database
- Partition / tenant / namespace strategy: 글로벌 단일
- Primary key / document ID / object key: `log_id` (String, Auto-generated)
- Foreign keys / references: `actor_id`
- Denormalized fields: 없음
- Constraints: `INV-003` (Append-only. Rules 차단)
- Transaction or consistency boundary: 부모 엔티티 변이 시 batch write 트랜잭션 내에 Append 쓰기 실행
- Security enforcement notes: Read는 Admin만 허용. Create는 인증 유저 전체 허용. Update/Delete 전체 불가.
- Migration notes: 없음.
- Risks: 데이터셋 삭제 시 이 로그만 예외적으로 안전하게 살려 두어야 함.

#### Document Schema Details (`/audit_logs/{log_id}`)
```json
{
  "log_id": "String (Document ID)",
  "timestamp": "Timestamp",
  "actor_id": "String (User UID)",
  "actor_email": "String (User Email)",
  "action_type": "String ('Ingest Dataset' | 'Clear All Datasets' | 'Save Evaluator Label' | 'Save Adjudicator Label' | 'Export Statistics')",
  "target_id": "String (Target ID)",
  "details": {
    "summary": "String",
    "meta": "Map"
  }
}
```

---

### PHY-007 — dashboard Document
- Storage technology: Firebase Firestore
- Logical schema mapping: DSCH-008 (Dashboard Statistics)
- Purpose: 시각화용 외부 precalculated Kappa 통계 보관
- Source of truth: Firestore database
- Partition / tenant / namespace strategy: 글로벌 단일 문서 (`statistics`로 고정)
- Primary key / document ID / object key: `"statistics"`
- Foreign keys / references: 없음
- Denormalized fields: 없음
- Constraints: 없음
- Transaction or consistency boundary: Admin 업로드 시 Overwrite
- Security enforcement notes: Admin만 쓰기 가능. 읽기는 세션 전체 허용.
- Migration notes: 없음.
- Risks: 없음.

#### Document Schema Details (`/dashboard/statistics`)
```json
{
  "updated_at": "Timestamp",
  "updated_by": "String (User UID)",
  "kappa_statistics": {
    "fleiss_kappa": {
      "model_agreement": "Number",
      "evaluator_agreement": "Number"
    },
    "model_accuracy": {
      "gpt4": "Number",
      "gemini15": "Number",
      "claude3": "Number"
    }
  }
}
```

---

## 6. Physical Relationships and References
- **Nest / 계층형 모델**: `/conversations/{call_id}`의 하위 서브컬렉션(`/labels`, `/llm_results`, `/gold_standard`) 구조를 적극 활용합니다. 이는 부모 ID인 `call_id`와의 결합력을 최우선시하여, Firestore Query 시 특정 대화 하위의 평가 이력만 매우 손쉽고 저렴하게 로딩할 수 있게 유도합니다.

## 7. Constraints
- **Document ID 고정**:
  - `LLM Decision` 문서 ID: `"verdict"` 고정.
  - `Gold Standard` 문서 ID: `"verdict"` 고정.
  - `Label` 문서 ID: `{userId}_{roundNo}` 형태로 고정하여 멱등성 확보 및 중복 등록 차단.

## 8. Transaction / Consistency Boundaries
NoSQL인 Firestore 특성상, 일관성 경계는 **Client-Side Batched Write**에 의존합니다.
1. **평가 제출 트랜잭션**:
   - `conversations/{call_id}/labels/{user_id_round_no}` 생성/수정 (Write)
   - `conversations/{call_id}`의 `label_completion_count` 값 증가 및 합의 알고리즘 평가에 의한 `status` 변경 (Update)
   - `audit_logs/{log_id}` 감사 로그 추가 (Create)
   - *이 세 가지 작업은 단일 Firestore Batch Write로 묶여 실행되어, 네트워크 순단 시에도 All-or-Nothing 무결성을 보장합니다 (NFR-001).*
2. **최종 결정 트랜잭션**:
   - `conversations/{call_id}/gold_standard/verdict` 생성 (Create)
   - `conversations/{call_id}`의 `status`를 `"Consensus Reached"`로 잠금 (Update)
   - `audit_logs/{log_id}` 감사 로그 추가 (Create)
   - *단일 Batch Write로 묶어 무결성 보장.*

## 9. Denormalization / Embedding Decisions
- **Turn Embedding**: Turn 데이터를 별개 컬렉션으로 파편화할 시, 대화 1건 조회에 Turns 개수(N개) 만큼 추가적인 Document Read 연산 비용이 들어가 비효율적입니다. 따라서 Conversation 본문 턴 목록은 Conversation 문서의 `turns` 필드에 Map List 형태로 Embedding하여 1회 Read로 상세 화면을 완성할 수 있도록 설계했습니다.
- **completion_count Denormalization**: 목록 조회 뷰 및 진척도 집계 시 하위 Labels 개수를 매번 세는 Count Query 비용을 절약하기 위해 상위 Conversation에 `label_completion_count`를 저장하고 업데이트마다 동기화합니다.

## 10. Storage-Specific Risks
- **Firestore 1MB Limit**: 임베딩된 turns 개수가 100건을 넘어가고 글자수가 매우 길어지는 경우 문서당 1MB 제한을 초과할 리스크가 이론적으로 존재합니다.
  - *대비*: 한글 기준 1MB는 약 50만 자로, 콜센터 상담 1회 분량(보통 1~2만 자)에 비해 극히 여유로우므로 v0 수준에서는 별도 파티셔닝 없이 설계를 유지합니다.

## 11. Decision Candidates
- 없음.

## 12. Working Assumptions
- 없음.

## 13. Open Questions
- 없음.