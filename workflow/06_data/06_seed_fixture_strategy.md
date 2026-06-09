# 06 Seed & Fixture Strategy

## 1. Purpose
본 문서는 LAMS-v0 시스템의 개발 편의성 확보, 로컬 에뮬레이터 테스트 지원 및 CI/CD 단위/통합 테스트 자동화를 위해 필요한 기초 테스트용 시드 데이터 및 모의 피처(Mocks & Fixtures) 설계서입니다.

## 2. Inputs Used
- [06_physical_schema.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_physical_schema.md)
- [06_migration_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_migration_plan.md) (MIG-004)

## 3. Seed & Fixture Strategy Summary
LAMS-v0는 로컬 환경에서 Firebase Local Emulator Suite를 가동하여 테스트를 진행할 것이므로, 테스트 데이터셋은 로컬 환경 기동 시 자동으로 적재(Seed)되거나 프론트엔드 테스트 환경에서 Mock JSON 파일로 직접 로딩하여 데이터베이스 에뮬레이터에 강제 주입(Import)할 수 있는 구조로 제공됩니다. 

---

## 4. Seed / Fixture Items Detail

### SEED-001 — Mock User Profiles (사용자 역할 시드 프로필)
- Purpose: 로컬 에뮬레이터 환경 기동 및 테스트 구동 시, 로그인 후 보안 규칙(`DSR-002`, `DSR-003`)을 테스트할 수 있도록 서로 다른 권한 계정 프로필 주입
- Environment: Local Emulator, Test Environment
- Data objects: DATA-OBJ-007 (User Profile)
- Source: 시스템 하드코딩 테스트 계정 배열
- Privacy / sensitivity concerns: 없음 (가상의 더미 이메일 계정 사용)
- Required for tests or manual validation: Yes (로컬 UI 수동 검증 및 Firestore Rules 에뮬레이터 테스트 필수)
- Refresh/reset behavior: 에뮬레이터 재부팅 시마다 자동 초기화 적재.
- Open questions: 없음.

#### Fixture Data Structure
```json
[
  {
    "uid": "admin_uid_999",
    "email": "admin@test.lams.org",
    "role": "Admin",
    "is_adjudicator": false,
    "created_at": "current_time"
  },
  {
    "uid": "evaluator_uid_001",
    "email": "eval1@test.lams.org",
    "role": "Evaluator",
    "is_adjudicator": false,
    "created_at": "current_time"
  },
  {
    "uid": "evaluator_uid_002",
    "email": "eval2@test.lams.org",
    "role": "Evaluator",
    "is_adjudicator": false,
    "created_at": "current_time"
  },
  {
    "uid": "evaluator_uid_003",
    "email": "eval3@test.lams.org",
    "role": "Evaluator",
    "is_adjudicator": false,
    "created_at": "current_time"
  },
  {
    "uid": "adjudicator_uid_777",
    "email": "expert_adj@test.lams.org",
    "role": "Evaluator",
    "is_adjudicator": true,
    "created_at": "current_time"
  }
]
```

---

### SEED-002 — Mock Conversation Dataset (모의 대화 데이터셋)
- Purpose: 대화 목록 로드(`QP-001`), 상세 대화 렌더링(`QP-002`) 및 라벨 입력 테스트용 합성 데이터 3건 주입
- Environment: Local Emulator, Test Environment
- Data objects: DATA-OBJ-001 (Conversation), DATA-OBJ-002 (Turn)
- Source: 가상 시나리오 합성 텍스트 JSON 파일
- Privacy / sensitivity concerns: 없음 (현실 데이터가 아닌 100% 가상 합성 상담 텍스트)
- Required for tests or manual validation: Yes (대시보드 진척률 UI 수동 확인 및 말풍선 렌더링 검증)
- Refresh/reset behavior: 에뮬레이터 가동 시 혹은 테스트 셋업 함수 구동 시 주입.
- Open questions: 없음.

#### Fixture Data Structure
```json
[
  {
    "call_id": "mock_call_001",
    "status": "Round 1 Active",
    "label_completion_count": 0,
    "created_at": "current_time",
    "turns": [
      { "sequence_no": 1, "speaker": "agent", "text": "안녕하세요. 무엇을 도와드릴까요?" },
      { "sequence_no": 2, "speaker": "customer", "text": "상담원님, 인터넷이 갑자기 끊겼어요." }
    ]
  },
  {
    "call_id": "mock_call_002",
    "status": "Round 2 Active",
    "label_completion_count": 3,
    "created_at": "current_time",
    "turns": [
      { "sequence_no": 1, "speaker": "agent", "text": "반갑습니다. 상담원 김철수입니다." },
      { "sequence_no": 2, "speaker": "customer", "text": "너 똑바로 일 안 하냐? 죽여버린다 진짜!" }
    ]
  }
]
```

---

### SEED-003 — Mock LLM Result Ingestion File (모의 LLM 결과 임포트 파일)
- Purpose: Admin의 외부 LLM 판정 파일 등록(`MIG-002`) 기능 유닛 테스트 검증용 JSON 모의체 제공
- Environment: Test Environment
- Data objects: DATA-OBJ-004 (LLM Decision)
- Source: 가상 모델 Verdict 생성 JSON
- Privacy / sensitivity concerns: 없음
- Required for tests or manual validation: Yes (임포터 파싱 엔진 기능 검증용)
- Refresh/reset behavior: 테스트 구동 시점에 로컬 임포트 호출로 사용.
- Open questions: 없음.

#### Fixture Data Structure
```json
{
  "call_id": "mock_call_002",
  "model_verdicts": {
    "gpt4": {
      "toxicity": "Present",
      "category_id": 1,
      "risk_level": 3,
      "evidence_phrases": ["죽여버린다 진짜"],
      "reasoning": "고객이 상담원에게 위협적인 폭언 및 살해 협박성 발언을 하였습니다."
    },
    "gemini15": {
      "toxicity": "Present",
      "category_id": 3,
      "risk_level": 3,
      "evidence_phrases": ["죽여버린다 진짜"],
      "reasoning": "상담원 신변에 해를 가하겠다는 명백한 위해 협박 정황이 보입니다."
    },
    "claude3": {
      "toxicity": "Present",
      "category_id": 1,
      "risk_level": 3,
      "evidence_phrases": ["죽여버린다 진짜"],
      "reasoning": "고객 발화 내에 직접적인 폭력 위협 발언이 노출되었습니다."
    }
  }
}
```

---

### SEED-004 — Mock Dashboard Statistics (모의 대시보드 통계 파일)
- Purpose: 대시보드 그래프 UI 화면 컴포넌트 렌더링 확인용 더미 지표 적재
- Environment: Local Emulator, Test Environment
- Data objects: DATA-OBJ-008 (Dashboard Statistics)
- Source: 가상의 사전 계산 Fleiss' Kappa 및 정확도 데이터
- Privacy / sensitivity concerns: 없음
- Required for tests or manual validation: Yes (대시보드 그래프 컴포넌트 동작 확인)
- Refresh/reset behavior: 에뮬레이터 초기화 시 자동 적재.
- Open questions: 없음.

#### Fixture Data Structure
```json
{
  "updated_at": "current_time",
  "updated_by": "admin_uid_999",
  "kappa_statistics": {
    "fleiss_kappa": {
      "model_agreement": 0.76,
      "evaluator_agreement": 0.82
    },
    "model_accuracy": {
      "gpt4": 0.89,
      "gemini15": 0.85,
      "claude3": 0.87
    }
  }
}
```
