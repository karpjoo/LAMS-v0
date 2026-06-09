# 06 Indexes

## 1. Purpose
본 문서는 LAMS-v0 시스템의 Firestore 데이터베이스에서 사용될 인덱스(Indexes) 전략과 구체적인 물리적 인덱스 설정을 정의합니다. 시스템에서 사용되는 주요 쿼리 패턴(`QP-001` ~ `QP-008`)이 실행 시 오류 없이 고성능으로 작동하도록 복합 인덱스 요건을 충족시킵니다.

## 2. Inputs Used
- [06_query_patterns.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_query_patterns.md)
- [06_physical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_physical_schema.md)

## 3. Index Strategy Summary
Firestore는 기본적으로 모든 도큐먼트의 단일 필드에 대해 자동 인덱스를 생성합니다. 따라서 단일 키 조회 및 단일 필드 필터링은 인덱스 생성 없이 즉시 가능합니다.
단, **다중 필드 필터링 및 복합 정렬(Composite Query)**을 수행할 경우, 명시적으로 복합 인덱스(Composite Index)를 생성해주어야 쿼리가 거부되지 않습니다. 
LAMS-v0는 대화 목록 조회 시 상태 필터링 및 시간순 정렬 조건이 있으므로 복합 인덱스 1건을 선제 정의합니다.

---

## 4. Required MVP Indexes

### IDX-001 — conversations_status_created_at Composite Index
- Data object / table / collection: `/conversations` (Root Collection)
- Fields:
  1. `status` (String)
  2. `created_at` (Timestamp)
- Sort direction:
  1. `status` ASC (Ascending)
  2. `created_at` ASC (Ascending)
- Unique: No (다중 대화가 동일 상태 및 생성 시간을 지닐 수 있음)
- Partial / composite / covering / full-text / vector / geospatial: Composite Index
- Linked query patterns: `QP-001` (List Active Conversations)
- Linked constraints: 없음
- MVP required: Yes
- Reason: 대시보드 진행도 화면 및 평가 리스트 탭에서 활성 라운드(`status`)를 지정 필터링하고 생성된 순서대로 정렬하여 렌더링하는 핵심 조회 기능을 완수하기 위해 필수적임.
- Write cost / trade-off: 
  - *비용*: Firestore 복합 인덱스는 대화 업로드 및 생성 시 미세한 쓰기 오버헤드를 발생시키지만, Admin 벌크 데이터 적재 이외의 일반 평가 시에는 대화 문서의 신규 생성이 없으므로 성능 저하 리스크가 매우 낮음.
- Open questions: 없음.

---

## 5. Later-Release / Candidate Indexes
- 현재 단계에서는 MVP 요건 외에 다수 대화를 가로질러 쿼리하는 복잡한 통계 쿼리가 없으므로 추가 후보 인덱스는 유보합니다.

## 6. Uniqueness and Constraint Indexes
- **Document ID Constraint**: Firestore는 기본 키(Document ID)인 `call_id` 및 `{user_id}_{round_no}`에 대해 물리적으로 고유 무결성을 강제하므로, 별도의 Unique Index 생성이 불필요합니다.

## 7. Query Pattern to Index Mapping
| Query Pattern ID | Purpose | Filter fields | Sort fields | Supporting Index |
|---|---|---|---|---|
| QP-001 | List Active Conversations | `status` | `created_at` | `IDX-001` (status, created_at) |
| QP-002 | Get Conversation Details | `call_id` (DocID) | 없음 | Built-in DocID Index |
| QP-003 | Fetch Own Labels | `__name__` (DocID) | 없음 | Built-in DocID Index |
| QP-004 | Fetch Mismatch Labels | Parent `call_id` | `submitted_at` | Built-in Subcollection Index |
| QP-005 | Fetch Gold Standard | `__name__` (DocID) | 없음 | Built-in DocID Index |
| QP-006 | Fetch Audit Trails | 없음 | `timestamp` DESC | Built-in Single-field Index |
| QP-007 | User Profile Check | `__name__` (DocID) | 없음 | Built-in DocID Index |
| QP-008 | Fetch Dashboard Stats | `__name__` (DocID) | 없음 | Built-in DocID Index |

## 8. Write Cost and Trade-Off Notes
- **단일 필드 자동 인덱스 예외(Single-field Exclusions)**: 
  - `turns` 배열 내부 맵 필드들은 개별 필터링을 수행하지 않으므로, 쓰기 비용과 스토리지 공간 절약을 위해 Firestore 색인 정책에서 `turns` 하위 멤버들의 자동 인덱스는 제외(Exclude)하도록 설정할 것을 추천합니다.

## 9. Index Risks
- **Index Missing at Runtime**: 로컬 개발 에뮬레이터에서는 복합 인덱스가 정의되지 않아도 간혹 쿼리가 통과할 수 있지만, 실제 Production 클라우드 Firebase 환경에서는 복합 인덱스 누락 시 즉각 Permission Denied/Index Error가 리턴되는 환경 차이 리스크가 존재합니다.
  - *대비*: Stage 8 테스트 단계 및 Stage 11 구현 단계에서 Firestore `firestore.indexes.json` 구성 파일에 `IDX-001` 설정을 공식 추가하여 배포할 것입니다.

## 10. Decision Candidates
- 없음.

## 11. Working Assumptions
- 없음.

## 12. Open Questions
- 없음.