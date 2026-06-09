# 07b MVP Scope Classification Notes

## 1. Classification Rationale
LAMS-v0의 MVP 성공 요건은 **"학술 연구에 필요한 실제/합성 데이터셋을 업로드하고, 3인 평가자의 독립/공유 라벨 기록을 거쳐 정밀한 Gold Standard Label을 안전하게 획득하는 일련의 도메인 파이프라인 검증"**에 있습니다. 이 목적을 만족하기 위한 필수 기능들을 **Must**로 설정하고, 연구 진행상 있으면 유용하지만 수동으로 대체할 수 있는 기능은 **Should/Could/Later**로 배정하며, 명시적으로 배제된 기능들은 **Won't**으로 규정합니다.

## 2. Requirement Slicing

### Must (MVP 필수 범위)
- **FR-001 (Import Dataset)**: 대화셋 업로드가 없으면 시스템 가동이 불가하므로 Must.
- **FR-002 (Delete Dataset)**: 잘못 업로드된 데이터의 일괄 초기화 장치가 필수적이므로 Must.
- **FR-003 (List/View Conversations)**: 평가자가 대화를 보고 말풍선으로 검토해야 하므로 Must.
- **FR-004 (Record Label Feedback)**: 본 프로젝트의 핵심인 유해성 판정 기록 및 prefills 기능이므로 Must.
- **FR-005 (Import LLM Results)**: 오프라인 모델 비교 연구의 기본 데이터 매핑이므로 Must.
- **FR-006 (Import Stats)**: 외부 통계 매핑이 필수적이므로 Must.
- **FR-007 (Dashboard Display)**: 진척률 수치 및 외부 Kappa 데이터의 Vanilla CSS 렌더링이 필수적이므로 Must.
- **NFR-001 (Data Integrity)**: Firestore Batch 트랜잭션을 통한 저장 무결성이 깨지면 연구 데이터가 손상되므로 Must.
- **NFR-002 (Visual CSS & Responsive Layout)**: Vanilla CSS 기반 프리미엄 디자인(Glassmorphism) 및 반응형 레이아웃은 비주얼 품질 핵심 가치이므로 Must.
- **NFR-003 (Robust JSON Parsing)**: 파일 파싱 예외 발생 시 크래시 방지를 위해 Must.
- **SEC-001 (Authentication Boundary)**: 미인가 외부인 접근 전면 차단을 위해 필수이므로 Must.
- **SEC-002 (Evaluator Isolation Rules)**: 본인의 라벨만 관리하는 권한 격리는 보안의 핵심이므로 Must.
- **SEC-003 (PII Warning Scan)**: 개인정보 오노출 방지를 위한 1차 스캔 가드로 필수이므로 Must.
- **SEC-004 (Deletion Interlock)**: 실수로 전체 데이터를 날리는 대참사 방지를 위해 Must.
- **OPS-001 (Audit Logs)**: 연구 신뢰성 및 데이터 감사 추적을 위해 Must.
- **INT-001 (JSON Schema Conformance)**: LLM/통계 업로드 파일 규격 연동을 위해 Must.

### Supporting / Enabling Scope (시스템 지원 및 인프라 요건)
- **3단계 Adjudication 차수 전이 로직**: 1차 독립(Round 1 Active) -> 2차 의견 공유(Round 2 Active) -> 3차 Adjudicator 최종 결정(Round 3 Active) -> Consensus Reached (합의 정답 Gold Standard 자동/수동 확정) 상태 머신 제어.
- **Firestore Security Rules Blind-Spot Lock**: Round 1 진행 중 타인의 라벨 도큐먼트를 조회할 수 없도록 강제하는 규칙 구축.
- **Admin/Evaluator/Adjudicator 역할 정의**: Custom claims 또는 Firestore profile 문서 기반 역할 권한 분기.

### Should (중요하지만 MVP에서 Defer 가능한 요건)
- **없음**: 본 MVP는 소규모 연구용 초소형 시스템이므로, 핵심 목표 외의 복잡한 주변 기능은 과감히 배제하여 R1(MVP)을 극도로 가볍고 안전하게 구현합니다.

### Could (보조 유스케이스)
- **Adjudication 불일치 대화 필터링 조회**: 1/2차 평가자 간 의견이 불일치하는 대화 건만 Admin이 대화 목록에서 따로 조회할 수 있도록 필터링 옵션 제공 (`Q-101` 연계 - 기획 유연성 배정 영역).

### Later (차기 릴리즈로 이월)
- **개별 평가자 세부 진척도 대시보드 뷰 (Q-105)**: 어떤 평가자가 미완료 상태인지 개별 진행 현황을 테이블로 모니터링하는 상세 관리자 기능 (R2로 이월).

### Won't / Non-Scope (비스코프 확정)
- **실시간 LLM API 연동 추론 실행**: 비용 및 지연 이슈로 전면 배제 (오프라인 JSON 업로드로 대체).
- **실시간 Kappa 통계 수학 연산 엔진**: 데이터베이스 연산 부하 방지를 위해 배제 (외부 연산 결과 JSON 업로드로 대체).
- **자동 비식별화 마스킹 편집기**: 사전 비식별화 완료 전제로 가동하며, 실시간 텍스트 가공 편집 기능은 배제.
- **음성/오디오 상담 재생 스트리밍**: 텍스트 데이터만 관리하므로 오디오 연동 기능 배제.
