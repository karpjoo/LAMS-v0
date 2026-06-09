# 06 Migration Plan

## 1. Purpose
본 문서는 LAMS-v0 시스템의 신규 구축(Greenfield) 시 데이터베이스 초기 기동을 위해 필요한 기초 유저 권한 정보 적재(Seed Data) 및 연구 진행 중 관리자에 의해 반복적으로 실행될 대화 데이터셋/LLM 결과/대시보드 통계 지표 파일들의 물리적 업로드 임포트 절차(Migration & Bulk Import Ingestion)를 수립합니다.

## 2. Inputs Used
- [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md) (FR-001, FR-005, FR-006, INT-001)
- [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md) (BR-001, BR-005, BR-006)

## 3. Migration and Seed Overview
LAMS-v0는 외부 데이터의 정제 및 Kappa 등 지표 연산을 완전히 오프라인으로 분리 수행하는 아키텍처이므로, 실시간 마이그레이션이 아닌 **파일 파싱 기반 벌크 데이터 인프라스트럭처 적재** 성격을 띱니다.

---

## 4. Migration Items Detail

### MIG-001 — Conversation Dataset Bulk Ingestion (대화 데이터셋 일괄 업로드)
- Trigger: Admin이 웹 관리자 화면에서 데이터셋 JSON 파일을 선택하고 [업로드] 클릭
- Source: 관리자 업로드 로컬 JSON 파일
- Target: `/conversations` 컬렉션
- Data affected: `conversations` 하위 모든 문서 및 내장 `turns` 배열
- Environment: Local, Dev, Production
- Ordering:
  1. 클라이언트 파서가 JSON 문법 검증.
  2. 턴 발화 속 휴대전화 등 PII 원본 존재 정규식 매칭 스캔 (`SEC-003`).
  3. PII 패턴 발견 시 Admin에게 경고 창 노출 후 [진행 승인] 수동 확인 획득 (`AC-SEC-003`).
  4. Firestore에 이미 존재하는 `call_id`가 있는지 체크 (`BR-006`).
  5. 500개 단위의 Firestore Batch Write 트랜잭션을 묶음으로 생성하여 일괄 적재 실행.
- Validation check:
  - JSON 내 각 원소의 필수 키 (`call_id`, `turns` 배열) 누락 여부 검사.
  - `turns` 내부 원소 필수 키 (`sequence_no`, `speaker`, `text`) 구조 검증.
- Rollback / recovery concept: 
  - 업로드 실행 중 특정 Batch 단계에서 Firestore 쓰기 거부 에러 발생 시, 해당 Batch 트랜잭션을 중단하고 UI에 에러 라인 정보를 명시적으로 표시함 (All-or-Nothing 무결성 복원).
- Manual approval point: PII Warning 발견 시 Admin의 경고 수용 및 진행 승인 클릭.
- Risks: 
  - 기존 평가가 저장되어 있는 `call_id`를 동일 파일로 중복 업로드하여 Overwrite 시 기존 라벨링이 유실될 위험.
  - *대비*: DB `getDoc`으로 사전 존재 여부를 확인하고, 동일 call_id 존재 시 업로드를 스킵하거나 UI 경고창을 띄워 Admin의 덮어쓰기 여부를 재확인함 (`BR-006` 준수).
- Open questions: 없음.

---

### MIG-002 — LLM Decision Bulk Ingestion (LLM 판정 결과 일괄 업로드)
- Trigger: Admin이 웹 관리자 화면에서 LLM 판정 결과 JSON 파일을 선택하고 [업로드] 클릭
- Source: 로컬 LLM Verdict JSON 파일
- Target: `/conversations/{call_id}/llm_results/verdict` 도큐먼트
- Data affected: `llm_results` 서브컬렉션 문서
- Environment: Local, Dev, Production
- Ordering:
  1. JSON 파일 포맷 파싱 및 스키마 검증.
  2. 파일 내 포함된 모든 `call_id`에 대해 Firestore `/conversations/{call_id}` 부모 도큐먼트 존재 여부 조회 선행 (`BR-005`).
  3. 존재하지 않는 미등록 `call_id`가 1건이라도 포함된 경우 업로드를 전면 중단하고 에러 로그 리스트 노출.
  4. 매칭 검증 완료된 대화에 대해 Firestore Batch Write로 하위 llm_results 생성 갱신.
- Validation check:
  - `call_id`와 `model_verdicts` 구조 검증.
  - `model_verdicts` 내 `gpt4`, `gemini15`, `claude3` 모델 필드 포맷 검증.
- Rollback / recovery concept: 
  - 미등록 call_id 발견 시 DB 쓰기 트랜잭션 전면 롤백 처리 (No database writes).
- Manual approval point: 없음.
- Risks: 없음.
- Open questions: 없음.

---

### MIG-003 — Dashboard Statistics Ingestion (대시보드 외부 통계 업로드)
- Trigger: Admin이 웹 화면에서 통계 JSON 파일을 선택하고 [업로드] 클릭
- Source: 로컬 통계 JSON 파일
- Target: `/dashboard/statistics` 도큐먼트 (단일)
- Data affected: `dashboard` 컬렉션의 statistics 도큐먼트 내용 일체
- Environment: Local, Dev, Production
- Ordering:
  1. JSON 문법 파싱 및 schema 검증.
  2. Firestore `/dashboard/statistics` 도큐먼트를 신규 데이터로 통째로 Overwrite(덮어쓰기).
- Validation check:
  - `kappa_statistics` 맵 내 통계 데이터 키 구조 검증.
- Rollback / recovery concept: 단일 문서 쓰기 실패 시 에러 알림.
- Manual approval point: 없음.
- Risks: 없음.
- Open questions: 없음.

---

### MIG-004 — Initial Users Provisioning (초기 사용자 프로필 적재)
- Trigger: 시스템 최초 기동 직후 인프라 권한 설정 시점
- Source: 시스템 사전 정의 Admin/Evaluator 계정 목록
- Target: `/users` 컬렉션
- Data affected: 유저 역할 문서
- Environment: Local Emulator, Dev, Production Cloud
- Ordering:
  1. Firebase Authentication 콘솔 혹은 Admin SDK 스크립트를 사용하여 Admin 1명 및 Evaluator 3명, Adjudicator 1명의 계정을 생성함.
  2. 각 Auth UID를 Firestore `/users/{uid}` 문서 ID로 하여 프로필 문서를 생성 및 역할 기입 (`role = 'Admin'` / `'Evaluator'`).
- Validation check:
  - User ID 고유 무결성.
  - 지정된 Adjudicator 사용자의 `is_adjudicator` 필드가 `true`인지 확인 (`BR-010`).
- Rollback / recovery concept: 계정 정보 재기입 스크립트 재실행.
- Manual approval point: Admin의 계정별 이메일 및 임시 비밀번호 사전 서명 승인.
- Risks: 없음.
- Open questions: 없음.