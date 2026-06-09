# 07c Release Slicing Notes

## 1. Release Slicing Strategy
LAMS-v0 시스템의 릴리즈 슬라이싱은 **R0 (Foundation)**, **R1 (MVP)**, **R2 (Post-MVP)**의 3단계 수직 슬라이스로 구조화하여, 선행 의존성(인증, 데이터 로딩)이 완전히 해결된 상태에서 코어가 작동하도록 배치합니다.

### Slice Sequence:
- **R0 (Foundation)**: 인증 및 기본 UI/CSS 뼈대 구축.
- **R1 (MVP)**: 핵심 연구 파이프라인 (대화 적재 -> 3단계 평가 이관 -> Gold Standard 수립) 및 보안/로깅.
- **R2 (Post-MVP)**: 관리적 편의성 (불일치 대화 필터링, 개별 진행률 상세 통계).

---

## 2. Dependency Chain Analysis
- **인증 세션 의존성**: 모든 화면 진입과 Firestore Security Rules는 `request.auth != null`에 의존하므로 Auth 세션 및 로그인 컴포넌트가 최선행 구현되어야 합니다.
- **대화 데이터 적재 의존성**: 평가(FR-004) 및 LLM 매핑(FR-005)은 상위 대화(`/conversations/{call_id}`)의 존재를 전제로 합니다. 따라서 FR-001 (대화셋 Import)이 평가 화면(FR-003, FR-004)보다 먼저 구현/검증되어야 합니다.
- **Batched Write 무결성 의존성**: 평가 라벨 제출 시, 진행률을 쉽게 쿼리하기 위해 상위 Conversations의 `label_completion_count`를 원자적으로 업데이트하므로, client-side transaction/batch write 모듈 설계가 선행되어야 합니다.
- **보안 규칙 의존성**: Round 1 blind-spot lock 규칙(`DSR-002`)은 status 변경 로직과 맞물리므로, 1차 평가 제출 완료 시점에 status가 변하는 상태 제어 흐름과 Firestore Security Rules 연동 검증이 필수적입니다.
- **감사 로그 의존성**: 등록, 삭제, 라벨 제출 시 batch write로 `audit_logs`를 동시에 적재하므로, 감사 로그 schema 및 client log service가 초기 기동 요건으로 엮입니다.
