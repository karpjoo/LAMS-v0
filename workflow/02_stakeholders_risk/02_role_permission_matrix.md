# 02 Role Permission Matrix

## 1. Role Candidates
- **ROLE-001 (Admin)**: 연구 프로젝트를 관리하는 최고 관리자 역할.
- **ROLE-002 (Evaluator)**: 상담 대화를 평가하는 평가자 역할 (언어학자 및 실제 상담원 공통).

## 2. Permission Directions
| Feature / Action | ROLE-001 (Admin) | ROLE-002 (Evaluator) | Guest / Unauthenticated |
|---|---|---|---|
| 상담 대화 조회 (`call_id` 단위) | Allowed | Allowed | Denied |
| 평가 라벨 입력 및 임시 저장 | Allowed (자체 평가) | Allowed | Denied |
| 타 평가자 라벨 데이터 조회 | Allowed | Denied (단, 합의 라벨 확정 화면 제외) | Denied |
| 타 평가자 라벨 데이터 수정 | Denied | Denied | Denied |
| 대화 데이터셋 일괄 업로드 (Import) | Allowed | Denied | Denied |
| 대화 데이터셋 일괄 삭제 (Delete) | Allowed | Denied | Denied |
| 외부 LLM 결과 업로드 | Allowed | Denied | Denied |
| 외부 Kappa 통계 결과 업로드 | Allowed | Denied | Denied |
| Dashboard 모니터링 및 진척률 확인 | Allowed | Allowed | Denied |

## 3. Forbidden Actions
- **ROLE-002 (Evaluator) 금지 조작**: 
  - 타인의 평가 라벨 데이터 수정 불가.
  - 상담 대화 데이터셋 및 외부 LLM 판정 원본 파일 업로드/삭제 불가.
- **ROLE-001 (Admin) 금지 조작**:
  - 개별 평가자(ROLE-002)가 남긴 라벨 데이터 내용 자체를 강제 변조/임의 수정 불가 (평가 무결성 유지 목적).

## 4. Sensitive Operations
- **대화 데이터셋 및 LLM 결과 데이터셋 일괄 삭제 (ROLE-001)**: 전체 데이터가 유실될 위험이 있는 민감 작업이므로 웹 UI에서 2단계 안전 장치(예: 비밀번호 확인 또는 영문구절 입력 검사) 통과 필수.
- **외부 LLM 결과 업로드 (ROLE-001)**: DB 데이터 오염을 방지하기 위해 파일 스키마 유효성 검사 필수.

## 5. Decision Candidates
- 로그인한 유저는 본인이 작성한 평가 라벨 데이터만 수정할 수 있도록 Firestore Security Rules 상에 `request.auth.uid == resource.data.user_id` 제약 조건을 적용함.

## 6. Open Questions
- **Q-105**: 관리자(Admin)가 평가자의 라벨링 진행 상황을 모니터링할 때, 어떤 평가자가 어떤 대화(`call_id`)에 라벨링을 안 했는지 개별 세부 진척 현황(상담원별 완료 건수 등)을 조회할 수 있게 해야 하나요?
