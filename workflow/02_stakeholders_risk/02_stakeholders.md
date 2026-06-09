# 02 Stakeholders

## 1. Source Inputs
- [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
- [USER_DIRECTIVES.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/00_intake/USER_DIRECTIVES.md)
- [260528-revised-research-overview.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md)

## 2. Stakeholder Overview
본 플랫폼은 콜센터 상담대화의 유해성 판단 연구에 활용되는 평가 시스템으로, 주 사용자는 소수의 연구진, 언어학자 및 실제 상담원입니다. 외부 일반 고객은 접근이 불가능하며, 내부 연구 목적에 최적화된 협업 환경을 지향합니다.

## 3. Stakeholder Register
| ID | Category | Goal/Interest | Main Actions | Data Access/Exposure | Risk Relevance | Source | Status |
|---|---|---|---|---|---|---|---|
| STK-001 | Researchers / Admins | 전체 연구 진행률 모니터링, 데이터셋 및 외부 판정 파일 통합 관리 | 데이터셋 등록/삭제, LLM 판정 결과 업로드, Dashboard 모니터링 | 모든 데이터 읽기/쓰기 권한 | 관리자 계정 탈취 및 악의적 데이터 유출/삭제 | 01_service_goal.md | Candidate |
| STK-002 | Linguist Experts | 유해 발화 탐지 기준(7유형, 위험도)에 맞춘 정교한 언어 분석 라벨 입력 | 상담대화 열람, 유해 발화 여부 및 위험도/유형/evidence 입력 | 대화 데이터 읽기, 본인 평가 라벨 쓰기 | 잘못된 유형 라벨 기입에 따른 학습/연구 왜곡 | 01_service_goal.md | Candidate |
| STK-003 | Counselors | 현장 경험에 기반한 주관적 정서 부담 평가 입력 | 상담대화 열람, 본인 지각 유해 여부/위험도/유형/evidence 입력 | 대화 데이터 읽기, 본인 평가 라벨 쓰기 | 평가 데이터 불일치 및 미완료 | 01_service_goal.md | Candidate |
| STK-004 | Data Subjects (Customers) | 대화 속 개인정보(PII)의 안전한 보호 | 없음 (웹 UI 직접 접근 없음) | 대화 본문 내 PII 미완전 처리 시 노출 | 외부 비식별화 누락 시 심각한 프라이버시 침해 | 01_service_goal.md | Candidate |

## 4. User Role Candidates
| ID | Name | Actor Type | Purpose | Likely Permissions | Forbidden Actions | Sensitive Operations | Data Access Level | Authn/Authz Need | Audit Need | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| ROLE-001 | Admin | Human (연구원) | 연구 자원(데이터셋, 외부 LLM 판정, 통계)의 통합 로드 및 대시보드 관리 | 데이터셋 업로드/삭제, LLM 판정 결과 업로드, 전체 진행 현황 조회 | 없음 | 데이터셋 전체 삭제, 업로드 | Full Access | Firebase Auth 로그인, 이메일 인증 | 업로드 및 삭제 동작 로그 기록 | Candidate |
| ROLE-002 | Evaluator | Human (전문가/상담원) | 상담 대화의 유해성 라벨 검토 및 기록 (평가 화면 공유) | 대화 조회, 본인 유해성 판정 기록(유형, 위험도, 근거 구절) | 타인의 평가 데이터 수정, 전체 데이터셋 관리/삭제 | 본인 평가 데이터 저장 및 수정 | Restricted (대화 데이터 조회, 본인 라벨 작성) | Firebase Auth 로그인 | 평가 데이터 저장/수정 로그 기록 | Candidate |

## 5. Administrator / Privileged Actor Candidates
- **관리자 (ROLE-001)**: 본 시스템의 연구 진행을 주도하는 소수 연구진으로 한정하며, Firebase Console 접근 권한 및 웹 내 전체 데이터 관리 권한(Import/Delete)을 보유합니다.

## 6. External System Stakeholders
- **Firebase Platform (STK-005)**: 시스템 호스팅, 데이터베이스(Firestore) 및 사용자 인증(Auth)을 처리하는 백엔드 서버리스 플랫폼입니다. 데이터 보안 및 트래픽 안정성의 핵심 요소입니다.

## 7. Affected Non-User Stakeholders
- **대화 내 고객 (데이터 주체)**: 시스템을 사용하지 않으나 본인의 목소리 및 상담 발화 텍스트가 데이터셋 형태로 기입되므로 비식별화 보안 유지가 절대적으로 요구됩니다.

## 8. Decision Candidates
- 일반 상담원과 언어학 전문가는 별도의 화면을 분리하지 않고 **ROLE-002 (Evaluator)** 계정으로 동일한 평가 화면을 공유하여 평가 작업을 진행하도록 최종 결정함.
- 사용자 인증 처리는 Firebase Authentication을 활용해 이메일/패스워드 방식으로 한정하고, 가입은 연구 관리자(ROLE-001)의 계정 발급 형식으로 제한함.

## 9. Working Assumptions
- **A-104**: 평가를 수행하는 총인원은 10명 내외이므로, 동시성 충돌이나 정교한 Lock 메커니즘 없이 단순 Firestore Document 업데이트 방식으로 처리해도 데이터 무결성에 큰 지장이 없을 것으로 가정함.

## 10. Open Questions
- **Q-103**: 관리자가 데이터셋을 추가 업로드할 때, 기존 평가가 완료된 상담 대화와 라벨 데이터를 유지한 채 데이터만 병합(Upsert)해야 하는가, 아니면 덮어쓰기(Overwrite) 형태로 관리해야 하는가?

## 11. Requirements Implications for Stage 3
- Stage 3 요구사항 설계 시, 공유 평가 화면에서 로그인한 사용자의 ID 정보를 평가 라벨 테이블에 함께 저장하여 다중 평가자의 라벨을 한 대화 안에서 동시 적재할 수 있도록 데이터 구조 제약을 마련해야 함 (STK-002, STK-003, ROLE-002 매핑).
- 데이터셋 일괄 업로드 및 삭제 기능은 Admin 권한(ROLE-001)을 가진 세션에서만 실행 가능하도록 라우팅 차단 제약 마련 필요.