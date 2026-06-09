# 01 Service Goal

## 1. Status
- **Status**: Draft
- **Source artifacts used**:
  - [USER_DIRECTIVES.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/00_intake/USER_DIRECTIVES.md)
  - [00_project_intake.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/00_intake/00_project_intake.md)
  - [260528-revised-research-overview.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md)
- **Source approval state**: Stage 0 ready for review
- **Approval state**: Pending Human Approval
- **Supersedes**: None

## 2. Problem Definition
- **Problem statement**: 콜센터 상담원은 폭언, 성희롱 등 정서적 피해 위험에 노출되어 있으나, 기존의 정서적 감정 노동 측정 방식은 지나치게 주관적이고 상황 의존적입니다. 이에 따라 고객 발화 텍스트 자체의 '언어적 위험 단서'를 LLM 및 전문가들이 객관적으로 탐지하고, 여러 탐지 기법(프롬프트 설계 차이, 모델별 차이)의 효과를 전문가 라벨과 비교 검증해야 합니다. 그러나 이 데이터들을 효율적으로 수집, 라벨링하고 결과를 체계적으로 비교 분석할 수 있는 웹 기반 통합 도구가 부재합니다.
- **Who experiences the problem**: 콜센터 상담 및 LLM 프롬프트 비교 평가를 연구하는 학술 연구자, 평가를 진행하는 언어학 전문가 및 실제 현장 상담원.
- **Current pain or opportunity**: 상담 데이터와 LLM 판정 데이터, 다중 평가자(상담원, 언어학자)의 라벨 데이터가 분절되어 있어 비교 분석과 합의 라벨 도출에 수동 공수가 많이 들고, 평가 상황을 종합적으로 모니터링하기 어렵습니다.
- **Why now**: 다양한 LLM(ChatGPT, Gemini, Claude)과 프롬프트 분석 기법(Task-Only, Lexico-Semantic, Semantic-Pragmatic)의 발화 탐지 신뢰성을 검증하는 연구 계획이 수립되어, 다수 평가자의 참여 및 평가 결과 축적을 위한 UI 시스템이 즉시 요구되는 시점입니다.
- **What remains difficult without the service**: 대량의 실제/합성 상담 데이터에 대한 평가자의 라벨링 진행 상황 관리 및 통계 결과 취합이 극도로 수동화되며 데이터 유실 및 일관성 저해 위험이 높습니다.

## 3. Target Users
- **Primary users**:
  - **연구원 / 관리자 (Researchers / Admins)**: 대화 데이터셋 및 오프라인에서 생성된 LLM 판정 결과(JSON)를 일괄 업로드하여 등록하고, 전체 평가자의 라벨링 진행 상황 및 비교 결과 통계를 대시보드로 모니터링 및 관리.
  - **언어학 전문가 (Linguist Experts)**: 7가지 유해 발화 유형 분류 체계, 위험 수준(Level 1~3), 구체적인 텍스트 판단 근거(Evidence Phrases)를 체계적으로 검토하여 웹 UI 상에서 라벨을 기록.
  - **상담원 (Counselors)**: 실제 대화 맥락에서 지각한 정서적 부담 수준 및 유해 원인 유형을 웹 UI 상에 입력.
- **Secondary users**:
  - **공동 연구진 및 분석가**: 대시보드를 통해 축적된 데이터를 조회하고 시각화된 대시보드를 기반으로 인사이트 분석을 진행.
- **Excluded users or non-targets**:
  - **일반 콜센터 고객**: 본 연구 시스템의 직접적인 사용자나 평가 대상이 아니며 시스템 접근이 허용되지 않음.
- **User uncertainties**:
  - 상담원과 언어학 전문가가 별개의 독립된 전용 UI를 사용할지, 아니면 하나의 공통 평가 UI에서 역할 필터(Role-based UI)를 다르게 제공할지에 대한 요구사항이 불명확합니다 (추후 상세화 예정).

## 4. Core Value Proposition
- **Value delivered**: 실제/합성 콜센터 상담 데이터, 다중 인간 평가자(상담원, 전문가) 라벨, 그리고 다양한 LLM 판정 데이터의 관리를 단일 웹 인터페이스(LAMS-v0)로 통합.
- **User benefit**:
  - 평가자는 복잡한 데이터 포맷 고민 없이 웹 상에서 손쉽게 상담 내용을 읽고 마우스 클릭과 간단한 텍스트 입력만으로 라벨을 작성 및 수정.
  - 관리자는 오프라인에서 실행된 LLM 판정 파일 및 통계 지표를 손쉽게 임포트하고, 단일 대시보드 화면을 통해 전체 작업 상황을 즉시 확인.
- **Business / research / operational / organizational benefit**: 수집된 연구 데이터의 무결성과 일관성을 확보하고, 연구 분석을 위한 수동 취합 리소스를 90% 이상 절감하여 학술 연구를 신속히 수행할 수 있게 함.
- **Value not pursued**:
  - 실시간 LLM API 호출 및 프롬프트 튜닝 기능 제공 (외부 오프라인 시스템에서 수행되므로 구현 범위에서 제외).
  - 대량 트래픽 수용을 위한 엔터프라이즈 멀티테넌시 및 실시간 대화 모니터링 기능 배제.

## 5. Desired Outcomes
- **User outcomes**: 평가자가 시각적으로 편안하고 직관적인 UI에서 상담 턴(Turn)을 확인하며 피로도 없이 신속하게 평가 완료.
- **Project outcomes**:
  - 실제 상담 390건, 합성 상담 980건에 대한 데이터와 평가자 라벨이 유실 없이 Firebase 클라우드 데이터베이스에 정형화되어 누적.
  - 오프라인 LLM 판정 데이터와 매핑되어, 인간-인간 및 인간-LLM 간의 비교 분석을 위한 기초 골격 완성.
- **Organizational or research outcomes**: LLM 기반의 콜센터 언어 위험 탐지 프레임워크 연구의 실증 데이터를 안전하고 신속하게 획득.
- **Outcome risks**:
  - 외부에서 사전에 수행해야 하는 비식별화 처리에 오류가 있을 시, 개인정보가 노출된 원시 데이터가 Firebase 서버에 유출될 우려가 있음.
  - 업로드된 JSON 데이터와 웹 UI 상의 평가 데이터 간 스키마 불일치로 인한 예외 에러 발생 위험.

## 6. Success Criteria
- **Qualitative success criteria**:
  - 연구자, 전문가, 상담원이 별도의 교육 없이 5분 이내에 시스템 UI에 적응하여 라벨 입력을 오류 없이 완료할 수 있어야 함.
  - 가시성 높고 정돈된 Vanilla CSS 기반의 대시보드를 통해 작업 현황이 일괄 파악될 수 있어야 함.
- **Quantitative success criteria, if available**:
  - 엄격한 처리 지연 시간 제한(예: 10초, 1초) 보다는 데이터 적재 및 UI 기능의 안정성(Stability)을 최우선으로 확보해야 함.
- **High-level validation approach**:
  - 관리자 및 평가자 전용 테스트 계정으로 로그인하여 모의 데이터셋 파일(상담 대화 및 LLM 판정)을 임포트하고 라벨을 기록한 후, Firestore에 정상 반영되는지와 대시보드에 진행률 통계가 업데이트되는지 검증.
- **Unresolved success criteria questions**:
  - 데이터셋 일괄 업로드 성능 및 Firestore 트랜잭션 한계 처리를 위한 세부 정량 수치가 정의되어 있지 않습니다.

## 7. Non-Goals
- **Explicitly out of scope**:
  - 시스템 내에서 OpenAI, Gemini, Claude 등 외부 LLM API를 연동하여 웹 UI에서 직접 판정을 실행하는 기능.
  - 웹 UI 내부에서 Cohen's Kappa, Fleiss' Kappa, Krippendorff's Alpha 등의 일치도 통계 지표를 직접 실시간 수식 연산하는 기능 (외부에서 계산된 결과를 임포트하여 보여주기만 함).
  - 실제 상담 대화 텍스트의 비식별화(개인정보 마스킹 등)를 자동으로 처리해주는 웹 UI 기능.
- **Deferred goals**:
  - 향후 대규모 상담원 감정 케어 및 보호 자동화 시스템과의 실시간 API 연계.
- **Rejected or superseded goal directions**:
  - 실시간 LLM 추론 트리거 및 프롬프트 실시간 조작 인터페이스 (웹 스택 보안 및 리소스 한계로 기각).
- **Scope creep risks**:
  - 연구 분석을 고도화하기 위한 피평가자(상담원)의 추가 개인 성향 설문 관리 기능 탑재 요구 (MVP 단계에서는 지양).

## 8. Initial Scope Boundary
- **What Stage 1 includes**: LAMS-v0 서비스 존재 이유, 핵심 가치, 타겟 사용자, 성공 지표, 논골(Non-goals) 정의 및 승인 요청.
- **What Stage 1 does not decide**: 상세 사용자 유즈케이스 명세, 프론트엔드 UI 컴포넌트 아키텍처, Firestore 데이터 모델 스키마, 구체적인 Firebase 호스팅 및 인증 규칙 설계.
- **What is deferred to later stages**:
  - 사용자 및 역할 정의 -> Stage 2 (Stakeholder & Risk Framing)
  - 구체적 요구사항 및 시나리오 -> Stage 3 (Requirements & Acceptance Criteria)
  - 도메인 및 데이터베이스 설계 -> Stage 4 (Domain Modeling) & Stage 6 (Data Design)
- **Approved constraints inherited from Stage 0**:
  - React (Frontend) + Firebase Client SDK (Auth, Firestore, Hosting) serverless 스택 고정.
  - 웹 시스템 외부의 별도 오프라인 프로세스를 통한 LLM 판정 실행 및 통계 연산 수행 (LAMS-v0는 결과 Import 및 대시보드 시각화 제공).
  - 웹 시스템 외부에서 사전 비식별화된 데이터만 입력받음.
  - 일반 상담원 계정과 언어학 전문가 계정은 동일한 평가 화면을 공유하여 사용함.
  - 시스템 동작 시 엄격한 성능 수치 한계보다 기능 동작 및 저장의 안정성(Stability)을 최우선으로 보장함.

## 9. Initial Assumptions
| ID | Assumption | Why Needed | Risk If Wrong | How To Confirm | Status |
|---|---|---|---|---|---|
| A-101 | 연구를 수행하는 사용자 그룹은 10명 내외의 소수 인원이다. | 대규모 사용자 관리 인프라(멀티테넌시, 복잡한 세션 캐싱)를 배제하여 MVP 스코프를 유지하기 위함. | 동시 접속자가 수백 명 이상일 경우 DB 읽기/쓰기 할당량 한계로 시스템이 다운될 수 있음. | 인간 개발자에게 예상 동시 접속자 수 및 평가자 수 풀을 질의하여 확인. | Proposed |
| A-102 | 데이터셋은 JSON/CSV 구조로 통일되어 수동 파일 업로드 방식으로 등록된다. | API 통신이나 커스텀 DB 연동보다 간편한 임포트 기능 구현을 위함. | 데이터 소스 포맷이 일관되지 않을 경우 파싱 에러 및 업로드 실패율이 급증함. | 분석할 데이터셋의 원본 JSON/CSV 포맷 구조 예시를 인간 개발자에게 제공받아 확인. | Proposed |
| A-103 | 통계 대시보드(Dashboard)는 실시간 스트리밍이 아닌 정적/배치식 데이터 로딩으로 충분하다. | 소형 시스템에서 복잡한 웹소켓 및 실시간 연산 모듈을 배제하기 위함. | 사용자가 실시간 동기화 상태 화면을 지속적으로 모니터링해야 할 경우 사용자 경험이 나빠짐. | 대시보드 갱신 주기에 대해 확인하여 승인 유도. | Proposed |

## 10. Open Questions
| ID | Question | Why It Matters | Blocking? | Next Step | Affected Stages |
|---|---|---|---|---|---|
| Q-101 | 전문가 합의 라벨(Gold Standard)을 구성하는 다수결(Adjudication) 프로세스를 웹 UI에서 직접 지원해야 하는가, 아니면 단순히 합의된 결과 라벨을 관리자가 직접 등록하는 수준인가요? | 합의 라벨 산출 기능을 웹 UI 기능으로 내장할지 여부에 영향을 줍니다. | No | 미확정 상태이므로 인간 개발자의 지시를 대기하며 기획 단계에서 유연하게 대처. | Stage 3, Stage 4 |
| Q-102 | 업로드할 오프라인 LLM 판정 결과(JSON) 및 사전 계산된 통계 지표의 포맷 예시나 스키마가 존재하나요? | 데이터베이스 저장소 필드 매핑 및 파일 파서(Parser) 구현을 위해 필수적입니다. | No | Stage 6 데이터 설계 단계 전까지 포맷 사양을 확인받아 구체화. | Stage 6 |

## 11. Risks and Ambiguities
| ID | Description | Impacted Stages | Severity | Follow-Up |
|---|---|---|---|---|
| R-101 | 외부 비식별화 작업이 불완전하게 완료되어 실제 전화번호나 성명이 노출된 채 등록될 가능성 | Stage 2, Stage 6 | High | 시스템 업로드 전에 파일 내 특정 키워드나 패턴(전화번호, 주민번호 포맷)이 없는지 간단한 클라이언트 사전 유효성 검사 적용 검토. |
| R-102 | Firestore client-side 연동 시 Firebase Configuration Key 노출에 따른 보안 취약성 | Stage 5 | Medium | Firebase Security Rules를 정의하여, 로그인하지 않았거나 비인가된 계정은 데이터 조회/쓰기가 불가능하게 차단. |

## 12. Goal-Level Traceability
| Goal ID | Problem | Users | Value | Success Criteria | Assumptions | Questions | Status |
|---|---|---|---|---|---|---|---|
| G-001 | 유해 발화 탐지 대상 상담 대화 데이터셋의 효율적 누적 부재 | 연구원 / 관리자 | 데이터셋 및 오프라인 판정 결과 통합 수집/관리 | 오류 없는 데이터 Firestore 적재 및 대용량 파싱 안정성 | A-102 | Q-102 | Proposed |
| G-002 | 상담원/전문가의 라벨 기록을 위한 체계적인 웹 인터페이스 부재 | 언어학 전문가, 상담원 | 가이드라인 준수 하에 클릭 및 입력 위주의 라벨 기록 | 5분 이내 평가 작업 UI 적응 및 저장의 정합성/안정성 | A-101 | Q-101 | Proposed |
| G-003 | 외부 LLM 판정 데이터 및 Kappa 통계치 매핑 공수 부담 | 연구원 / 관리자 | 오프라인 LLM 결과 및 외부 연산 지표 업로드/데이터 매핑 | 수동 수집 공수 90% 이상 절감 | A-102, A-103 | Q-102 | Proposed |
| G-004 | 평가 진행 상황 및 분석 결과를 한눈에 파악하기 어려움 | 연구원 / 관리자, 공동 연구진 | 직관적인 Dashboard 형태의 진행 현황 파악 | Vanilla CSS 기반의 정돈되고 완성도 높은 현황 정보 시각화 | A-103 | Q-101 | Proposed |

## 13. Human Approval Required
### Decisions to Approve
- **핵심 목표**: LAMS-v0 웹 플랫폼의 최종 목표(대화 데이터 관리, 평가자 라벨 UI 제공, 외부 LLM/통계 업로드, Dashboard 제공) 및 비실시간/오프라인 연동 방식(옵션 B) 확정.
- **타겟 사용자 정의**: 관리자/연구원, 언어학 전문가, 상담원의 3개 그룹으로 사용자 풀 제한.
- **MVP 스코프 바운더리**: 외부 LLM 실시간 실행 제외, 비식별화 자체 자동화 기능 제외, 통계 수식 자체 계산 기능 제외.

### Assumptions to Confirm
- **A-101**: 동시 접속자 수 10명 내외의 소규모 인프라 운영 가정.
- **A-102**: JSON 파일 수동 로드를 통한 데이터셋 일괄 등록 가정.
- **A-103**: 대시보드의 배치식 데이터 로딩 및 정적 시각화 연동 가정.

### Open Questions to Resolve
- 평가자 화면의 역할별(상담원 vs 전문가) 분리 제공 여부 결정 (Q-101).
- LLM JSON 결과 포맷 사양 확인 일정 조율 (Q-102).

### Risks to Review
- 외부 비식별화의 유효성 위반 대책 (R-101) 및 Firebase 클라이언트 키 노출 대비 보안 세팅 (R-102).

### Recommended Next Stage
- **Stage 2 Stakeholder & Risk Framing**으로 이동할 것을 권장합니다.