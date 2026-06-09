# 00 Project Intake

## 1. Intake Summary

본 프로젝트(LAMS-v0: LLM-based Abuse Monitoring System 또는 유사 명칭)는 콜센터 상담대화에서 상담원에게 부정적 정서 부담을 유발할 수 있는 '언어적 위험 단서(Linguistic Risk Cue)'를 탐지하기 위한 연구 도구 및 웹 플랫폼 개발을 목표로 합니다. 
핵심 연구 목적은 서로 다른 프롬프트 설계 방식(Task-Only Baseline, Lexico-Semantic, Semantic-Pragmatic)과 다양한 LLM 모델(ChatGPT, Gemini, Claude)이 실제 상담 데이터 및 합성 상담 데이터셋에 대해 보여주는 탐지 성능, 오류 양상, 그리고 전문가 합의 라벨과의 일치도를 비교 평가하는 것입니다.

본 시스템은 다음 핵심 기능을 수행합니다:
- 실제 및 합성 상담대화 데이터셋 등록 및 관리
- 웹 UI를 통한 상담대화 열람 및 다중 평가자(상담원, 언어학 전문가)의 탐지 결과(유해 발화 여부, 7가지 유형 분류, 위험 수준 1~3, 판단 근거 구절) 기록
- 다중 평가자 간 합의 라벨 구축 및 LLM 평가 결과와 비교 분석
- 현재 작업 상황을 보여주는 Dashboard 서비스

## 2. Source Inputs Reviewed

- [USER_DIRECTIVES.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/00_intake/USER_DIRECTIVES.md): 프로젝트 개요, 프로필(Greenfield, Research), 기술 스택(React, Firebase) 및 Preferences가 정의되어 있음.
- [260528-revised-research-overview.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md): 상세한 연구 배경, 7가지 유해 발화 유형 분류 체계, 3단계 언어적 위험 수준(Linguistic Risk Level), 3종 프롬프트 설계, 데이터셋 구성 계획(실제 대화 390건, 합성 대화 980건), 전문가 평가 절차 및 통계적 성능 지표 분석 설계가 수록되어 있음.

## 3. Project Type Classification

| Dimension | Candidate Classification | Evidence | Confidence | Approval Status |
|---|---|---|---|---|
| Development Context Type | Greenfield | 리포지토리 루트에 `docs`, `skills`, `workflow` 폴더만 존재하며, 기존 소스 코드나 배포 설정 파일이 없음. | High | Candidate |
| Project Profile | Research Tool / Lightweight Prototype | `USER_DIRECTIVES.md`에 `intent: research`로 명시되어 있고, MVP 스코프를 작게 유지하며 불필요한 엔터프라이즈 아키텍처를 피하도록 지시됨. | High | Candidate |

## 4. Project Profile Candidates

- **AI / Data Product (연구/평가 도구)**: 실제/합성 상담 데이터를 수집·가공하고, 여러 프롬프트와 LLM 모델의 성능을 전문가 합의 라벨(Gold Standard) 기준으로 정량적/정성적으로 평가·비교하는 성격을 지님.
- **Web SaaS / Internal Tool (내부 웹 애플리케이션)**: 연구자 및 전문가(언어학자, 상담원)가 로그인하여 데이터를 등록하고 웹 화면에서 편리하게 라벨링 및 모니터링을 수행할 수 있는 도구.

## 5. Existing Context Inventory

### 5.1 Documents
- [260528-revised-research-overview.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md): 유해 발화 유형 정의(인격모독, 폭언/욕설, 무리한 요구, 성희롱, 위협/협박, 유사 내용 반복, 기타), 위험 수준(Level 1~3), 3종 프롬프트 비교 구조 등 설계 데이터 전체 수록.

### 5.2 Codebase
- 없음 (Greenfield 상태)

### 5.3 Tests
- 없음 (Greenfield 상태)

### 5.4 Data / Dataset
- 현재 파일 시스템 상에 직접적인 상담 데이터셋 파일(JSON/CSV 등)은 존재하지 않음.
- [260528-revised-research-overview.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md)에 의하면 다음 데이터셋이 추후 사용 예정:
  - 실제 상담 평가셋: 부정 130건, 보통 130건, 긍정 130건 (총 390건)
  - 합성 상담 데이터셋: 유해 발화 490건(7개 유형 x 70건), 정상 대조 발화 490건 (총 980건)

### 5.5 Infrastructure / Deployment
- 배포 및 인프라 구성 없음. `USER_DIRECTIVES.md`에 기술 스택으로 Firebase가 고정되어 있음.

### 5.6 External Services / APIs / LLMs
- LLM 모델: ChatGPT (OpenAI), Gemini (Google), Claude (Anthropic)
- Firebase Services: Authentication, Cloud Firestore (Database), Firebase Hosting (Deployment)

## 6. Explicitly Approved Decisions

- **LLM 분석 파이프라인 통합 범위**: LLM 분석 파이프라인은 시스템 내부가 아닌 외부 시스템을 통해 오프라인으로 수행하고, 생성된 판정 결과 JSON 파일을 웹 시스템에 업로드하여 비교 분석하는 방식(옵션 B)을 채택함.
- **비식별화 처리 주체**: 비식별화 작업은 웹 시스템 기능 범위에서 제외되며, 시스템 외부의 별도 작업으로 사전에 완료하여 데이터를 등록함.
- **AI / Data Product 분석 범위**: Kappa 합의도 통계 계산 등의 정밀 데이터 분석 연산은 웹 시스템 외부의 별도 시스템으로 처리하며, 본 웹 시스템은 그 최종 결과의 업로드/저장 및 Dashboard 표시에 집중함.

## 7. Decision Candidates Needing Approval

- **Greenfield 신규 개발 및 Research Tool 프로필 설정**: 불필요한 아키텍처 요소를 배제하고 MVP 단위로 경량화하여 연구 목적에 맞게 단순 설계.
- **기술 스택 고정**: React (Frontend) + Firebase Client SDK (Auth, Firestore, Hosting) 구조 채택. 백엔드 서버 없이 Firestore Rules와 Client SDK 위주로 구성.

## 8. Working Assumptions

- **평가자 구성**: 시스템을 사용하는 평가는 소수의 연구자 및 언어학 전문가 그룹(약 5~10명 내외)으로 제한되므로, 대규모 동시성 제어나 복잡한 권한 관리 대신 직관적인 Role-based Access Control (Admin, Researcher, Evaluator)을 제공함.
- **데이터셋 등록**: 관리자(Admin)가 JSON/CSV 포맷의 데이터셋을 업로드하여 일괄 등록하며, 시스템에서 직접 데이터를 대량 파싱 및 저장할 수 있는 기능을 제공함.
- **LLM 평가 수행 방식**: LLM 판정은 별도의 외부 시스템에서 실행되며, 생성된 LLM 판정 결과(JSON)를 LAMS-v0 시스템에 업로드하여 적재하고 분석하는 방식을 사용함.

## 9. Open Questions

- **데이터 스키마 구체화**: 상담 대화 데이터셋과 평가자 라벨(category_id, risk_level, evidence_phrases)의 정확한 저장소 필드 명세.

## 10. Fixed Constraints

### 10.1 Technology Constraints
- Frontend: React (Vite 기반 SPA 권장)
- Backend & Database: Firebase (Authentication, Cloud Firestore, Hosting)
- Styling: Vanilla CSS (Harmonious & rich design, glassmorphism, responsive)

### 10.2 Scope Constraints
- "Keep MVP scope small", "Avoid unnecessary enterprise architecture"
- 연구 목적에 초점을 맞춘 핵심 흐름(데이터 등록 -> 평가 입력 -> 결과 비교/통계 모니터링)에 집중.

### 10.3 Security / Privacy Constraints
- 실제 콜센터 상담원의 보호와 민감 데이터 노출 방지를 위해 비식별화 필수.
- Firebase Security Rules를 사용하여 로그인된 적격 평가자만 데이터에 접근할 수 있도록 보안 설정 적용.

### 10.4 Operational Constraints
- 서버 리스 아키텍처 (Firebase Serverless) 활용.

### 10.5 Schedule / Resource Constraints
- 연구 기간 내에 평가와 모니터링이 원활하게 진행될 수 있도록 신속한 MVP 구축 필요.

## 11. Forbidden Change Areas

- 없음 (Greenfield 프로젝트이므로 리포지토리 전반에 걸쳐 신규 생성 및 설계 진행 가능).

## 12. Early Risk Signals

- **데이터 프라이버시 위험**: 실제 콜센터 대화 데이터의 비식별화 누출 위험.
- **LLM API 토큰 및 키 관리**: 외부 API 통신 시 인증 키가 클라이언트 프론트엔드에 노출되지 않도록 처리 필요 (옵션 A를 택할 경우 Firebase Function이나 프록시 필요, 옵션 B를 택할 경우 서버리스 구조를 유지하면서 노출 위험 제거).
- **데이터 분석/통계 복잡성**: Cohen's Kappa, Fleiss' Kappa, Krippendorff's Alpha 등 다중 평가자 간의 신뢰도 지표 계산을 웹 UI 단에서 직접 연산할지, 사전에 가공된 통계치를 노출할지에 따른 리소스 부담.

## 13. Specialization Hooks to Consider

- **Web SaaS Specialization Hook**: React + Firebase Auth & Firestore 연동, Security Rules 검증.
- **AI / Data Product Specialization Hook**: Kappa 등의 정밀 통계 연산 및 평가는 외부 시스템에서 별도로 수행되므로 본 플랫폼에서는 해당 Hook을 직접 구현하지 않으며, Dashboard 시각화 및 라벨 저장에 필요한 최소 수준으로 단순화함.

## 14. N/A Records

- **Artifact**: `/workflow/00_intake/00_existing_context_review.md`
  - **N/A Reason**: 현재 어떠한 기존 소스 코드, 데이터베이스 스키마 또는 빌드 설정 등 검토할 기존 시스템 리소스가 제공되지 않은 Greenfield 상태임.
  - **Revisit If**: 유저가 통합해야 할 기존 레거시 시스템, 마이그레이션 대상 데이터베이스, 혹은 반드시 보존해야 하는 특정 코드 모듈을 리포지토리에 추가하는 경우.

## 15. Recommended Next Step

- **Stage 1 Service Goal Definition (서비스 목표 정의)**
  - 본 프로젝트의 MVP 기능 정의 및 요구사항의 출발점이 되는 핵심 서비스 목표 수립 단계를 제안합니다.