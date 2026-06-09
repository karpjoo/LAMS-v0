# 04 Domain Risk Notes

## 1. Status
- **Status**: Draft
- **Source artifacts**:
  - [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md)
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
- **Last updated**: 2026-06-09

## 2. Risk-Sensitive Domain Rules
| Risk Note ID | Domain Concept / Rule | Risk Type | Constraint | Linked Requirement | Handoff Note |
|---|---|---|---|---|---|
| DRN-001 | **Conversation & Turn** / PII 사전 비식별화 보증 정책 | privacy | 국내 휴대전화번호 포맷(`010-\d{4}-\d{4}`) 등 민감 개인정보(PII)는 업로드 전 원천 비식별화되어야 하며, 업로드 시 스캔 경고 모달을 띄워 관리자가 인지하게 함 | RISK-001, SEC-003 | 클라이언트 측에서 regex 스캔 수행 및 경고 활성화 UI 구현 |
| DRN-002 | **Label** / 평가자 쓰기 권한 격리 정책 | security / access control | 평가자가 타인의 라벨 문서를 조회하여 평가를 모방하거나 임의로 수정하여 라벨을 훼손하지 못하도록 로그인 세션 Uid와 문서 userId 일치성을 강제함 | RISK-002, SEC-002 | Firestore Security Rules 상에 `request.auth.uid == userId` 쓰기 검증 탑재 (1차 평가 시 타 평가자 데이터 로드 완전히 차단) |
| DRN-003 | **Audit Log** / 감사 로그 영구 불변성 법칙 | compliance / audit | 프로젝트 관리 중 불합리한 조작이나 데이터셋 무단 삭제를 은폐하기 위한 로그 삭제/수정을 전면 차단하고, 오직 추가(Create)만 허용하는 Append-only 규칙 강제 | OPS-001 | Firestore DB Rules 상에 `update`, `delete` 권한을 전체 계정(`request.auth != null` 포함)에 대해 원천 거부함 |
| DRN-004 | **Conversation** / 데이터셋 삭제 가드 인터락 | operational | 관리자가 실수로 데이터셋 전체 삭제 버튼을 눌러 현재 진행 중인 라벨 정보 및 분석 통계가 돌이킬 수 없이 소실되는 참사 방지 | RISK-001, SEC-004 | 프론트엔드 삭제 검증 창에 "DELETE ALL DATASET" 입력을 활성화 플래그 조건으로 사용함 |
| DRN-005 | **Gold Standard Label** / 3차 최종 Adjudicator 권한 격리 법칙 | security / access control | Round 3 단계의 최종 정답 라벨(`Gold Standard Label`)은 지정된 1인의 Adjudicator 이외의 사용자(일반 Evaluator 및 익명 게스트)가 무단 생성/편집/삭제할 수 없도록 강제함 | User Request, BR-010 | Firestore Security Rules 상에서 `calls/{callId}/gold_standard` 경로에 대해 지정된 Adjudicator Uid 세션인 경우에만 쓰기 허용 설정 적용 |

## 3. Privacy / Security / Audit Language to Preserve
다음 도메인 용어 및 구조는 하위 Stage 5(Architecture), Stage 6(Data Design), Stage 11(Implementation) 단계의 물리 아키텍처 및 소스 코드 작성 시 의미가 훼손되지 않도록 그대로 Preserve해야 합니다:
- **`Personally Identifiable Information (PII)`**: 업로드 검증 모듈 및 경고 모달 변수 명칭에 보존.
- **`Write Isolation / Evaluator Isolation`**: Firestore Security Rules의 계정별 도큐먼트 쓰기 격리 주석 및 규칙 매핑에 명기.
- **`Adjudicator / Final Decision Exclusivity`**: 3차 최종 합의 라벨 쓰기 권한 통제 주석에 명기하여 아키텍처 유실 방지.
- **`Append-only Audit`**: 감사 로그 저장소 트랜잭션 주석에 명기하여 설계 유실 방지.
- **`DELETE ALL DATASET`**: 삭제 승인 확인 문자열 값으로 코드 상에 하드코딩 처리하여 일관성 유지.

## 4. Open Risk Questions
- **Q-103 (재업로드에 따른 인간 라벨 유실 방어 확인)**: 동일 `call_id` 업로드 시 기존 축적된 Evaluator 라벨 및 1~3단계 도출 정답들이 덮어쓰기로 인해 무단 파괴되는 리스크를 해소하기 위해, 중복 업로드 탐지 시 기존 대화 도큐먼트의 쓰기 멱등성을 지키고 평가 데이터를 유지하는 방어 로직이 Stage 6 데이터 저장 설계서에 반드시 구체화되어야 함.
