# 02 Risk & Privacy Screening

## 1. Source Inputs
- [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
- [USER_DIRECTIVES.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/00_intake/USER_DIRECTIVES.md)
- [260528-revised-research-overview.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md)

## 2. Screening Summary
본 웹 플랫폼은 민감할 수 있는 실제 상담 데이터를 수집·가공하며, 외부 LLM과 외부 통계 연산과의 연동(JSON 업로드)을 처리합니다. 이에 데이터 노출 맵을 설계하고, 외부 PII 노출 방지 대책 및 Firebase configuration key의 보안적 위험을 스크리닝하여 요구사항의 필수 제약으로 환류하고자 합니다.

## 3. Data Category Register
| ID | Data Category | Source | Subject | Access | Storage | Transfer | Retention/Deletion Concern | Privacy Risk | Security Risk | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| DATA-001 | 상담 대화 텍스트 데이터 (실제/합성) | 외부 데이터셋 파일 (Import) | 고객 및 상담원 | Admin, Evaluator | Firestore | 없음 (웹 내부에서 외부 API 전송 없음) | 연구 종료 시 일괄 삭제 | 비식별화 미비 시 대화 내용 속 개인정보 노출 | 악의적 DB 권한 획득 시 전체 탈취 가능 | Candidate |
| DATA-002 | 평가자 라벨링 피드백 데이터 | 웹 UI 평가 입력 (User) | 평가 대상 대화 | Admin, Evaluator | Firestore | 없음 | 연구 종료 시 삭제 | 평가자의 식별 정보(이메일 등) 노출 | 데이터 변조 및 위조 | Candidate |
| DATA-003 | 외부 LLM 판정 결과 데이터 | 외부 JSON 파일 (Import) | 평가 대상 대화 | Admin, Evaluator | Firestore | 없음 | 연구 종료 시 삭제 | 없음 (LLM 판정 텍스트만 보관) | 데이터 유실/변조 | Candidate |
| DATA-004 | 외부 사전 연산 통계 데이터 | 외부 JSON 파일 (Import) | 연구 평가 데이터 전체 | Admin, Evaluator | Firestore | 없음 | 연구 종료 시 삭제 | 없음 (익명화된 수치 통계) | 데이터 변조 | Candidate |
| DATA-005 | 사용자 인증 정보 | 회원 등록 및 가입 | 연구자, 평가자 | Firebase Auth | Firebase Auth | Google Auth Server | 영구 유지 (탈퇴 시 삭제) | 이메일 유출 | 패스워드 크래킹 및 무단 세션 로그인 | Candidate |

## 4. External Transfer / LLM/API Exposure Register
| ID | Service | Purpose | Data Sent | Data Received | Sensitivity | Retention Concern | Consent/Redaction Need | Risk Level | Decision Needed |
|---|---|---|---|---|---|---|---|---|---|
| EXT-001 | Firebase Auth & Firestore | 사용자 인증 및 영구 저장소 | DATA-001 ~ DATA-005 | 데이터 저장 상태 피드백 | High (대화 본문 포함) | 연구 목적 기간 보관 | 사전 비식별화 의무화 | Medium | Firebase Security Rules 기획 설정 승인 |

*참고: LLM API(ChatGPT, Claude, Gemini) 호출은 시스템 오프라인으로 실행되므로 본 웹 어플리케이션의 External Transfer로 등록하지 않음.*

## 5. Initial Security Risk Register
| ID | Category | Affected Stakeholders/Data/Roles | Impact | Likelihood | Severity | Mitigation Direction | Later-Stage Owner | Decision Needed | Status |
|---|---|---|---|---|---|---|---|---|---|
| RISK-001 | Unauthorized Access | STK-001, DATA-001, DATA-002 | 로그인하지 않은 미인증 사용자가 Firestore REST API 등을 통해 상담 대화 텍스트 전체를 무단 탈취 또는 위변조함. | Medium | High | Firebase Security Rules를 적용하여 `request.auth != null` 상태인 사용자만 읽기/쓰기가 가능하도록 제약. | Stage 5 Architecture, Stage 6 Data | Firestore Security Rules 승인 | Candidate |
| RISK-002 | Privilege Escalation | ROLE-002, DATA-001 | Evaluator 권한을 가진 계정이 Admin 전용 데이터셋 업로드/삭제 API 및 화면을 강제 호출함. | Low | Medium | Firestore DB 규칙 상에서 Admin 권한 유저 여부(`request.auth.token.admin == true` 또는 Admin 컬렉션 조회)를 확인하는 서버사이드 검증 적용. | Stage 6 Data Design | 권한 검증 구조 승인 | Candidate |
| RISK-003 | Data Corruption | DATA-003, DATA-004 | 비정상적이거나 악의적인 JSON 데이터 파일 임포트로 인해 데이터베이스 스키마가 오염되거나 붕괴됨. | Medium | Medium | 클라이언트 파서 단에서 스키마 구조(Key 유무) 및 유효성을 업로드 시점에 검사하는 유효성 체크 로직 구현. | Stage 3 Requirements | JSON 검증 파서 탑재 승인 | Candidate |

## 6. Initial Privacy Risk Register
| ID | Category | Affected Stakeholders/Data/Roles | Impact | Likelihood | Severity | Mitigation Direction | Later-Stage Owner | Decision Needed | Status |
|---|---|---|---|---|---|---|---|---|---|
| RISK-004 | PII Exposure | STK-004, DATA-001 | 시스템 외부의 사전 비식별화 처리에 오류가 발생하여 개인정보(PII)가 포함된 대화 데이터가 업로드됨. | Low | High | 수동 사전 비식별화 프로세스를 철저히 검수하고, 필요 시 웹 업로드 단에서 정규표현식 기반(전화번호 등) PII 사전 검사 경고 기능 구현. | Stage 3 Requirements | 업로드 전 프론트엔드 검사 경고 도입 여부 | Candidate |

## 7. Admin Power and Abuse Risk Notes
- **Admin 권한의 영향성**: Admin은 시스템 전체의 대화 셋 및 라벨 데이터를 삭제(Delete)할 수 있는 막강한 권한이 있습니다. 이 권한이 남용되거나 잘못 호출될 시 전체 연구 데이터가 영구 유실될 수 있습니다.
- **방지 방안**: 웹 UI 상에서 '전체 삭제' 버튼 클릭 시, 2차 비밀번호 요구 혹은 영문 텍스트 확인 입력("DELETE ALL DATASET")을 거치는 안전장치를 도입해야 합니다 (RISK-001, RISK-002 연계).

## 8. Audit / Accountability Needs
| ID | Auditable Action | Actor | Affected Object/Data | Reason | Candidate Log Fields | Retention Concern | Log Access Rules | Later-Stage Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| AUD-001 | 데이터셋 및 LLM 결과 업로드 | ROLE-001 (Admin) | DATA-001, DATA-003 | 데이터 변경 이력 역추적 | Timestamp, Admin ID, Upload Size, Upload Type | 영구 보관 | Admin만 조회 가능 | Stage 6 Data Design | Candidate |
| AUD-002 | 평가자 라벨 작성 및 수정 | ROLE-002 (Evaluator) | DATA-002 | 라벨 생성/수정 히스토리 관리 | Timestamp, User ID, Call ID, Operation Type (Create/Update) | 영구 보관 | Admin만 조회 가능 | Stage 6 Data Design | Candidate |

## 9. Compliance or Policy Concerns
- **IRB (생명윤리위원회) 연구 윤리 지침**: 상담원 및 실제 수집된 대화 데이터를 연구에 활용하므로, 연구 참여자의 개인정보 보안 및 동의 원칙에 준하는 기술적 보호 조치(접근 제어, 로깅)가 준수되어야 합니다.

## 10. Decision Candidates
- 외부 LLM API 통신을 전면 배제함으로써, 웹 UI를 통한 외부 데이터 Exfiltration 위험 요소를 근본적으로 제거함.
- 다중 평가자 간 라벨 충돌 방지를 위해, 동일 대화(`call_id`)에 대해 평가자(`user_id`) 별로 각각 개별적인 라벨 문서가 Firestore에 서브컬렉션 혹은 복합키 구조로 생성되도록 유도함.

## 11. Working Assumptions
- **A-305**: 외부 비식별화 검수가 사전에 완벽히 이루어지므로, 본 시스템에서는 별도의 대화 텍스트 디코딩/복호화 기능이 불필요하다고 가정함.

## 12. Open Questions
- **Q-104**: 로그 데이터(AUD-001, AUD-002)를 Firestore 내 별도 로그 컬렉션에 저장하는 것으로 충분한가요? (로깅 수준의 경량성 유지에 부합)

## 13. Requirements Implications for Stage 3
- Stage 3 요구사항 명세 시, 비인가된 Firestore REST API 공격을 방어하기 위한 로그인 인증 인터셉터 설계 규칙을 정의해야 함 (RISK-001).
- 데이터 업로드 파서의 예외 처리 로직(잘못된 JSON 파일 거부)을 요구사항 기능 정의에 의무적으로 수록해야 함 (RISK-003).