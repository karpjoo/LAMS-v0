# 02 Data Exposure Map

## 1. Data Categories
- **DATA-001**: 상담 대화 텍스트 데이터 (실제/합성)
- **DATA-002**: 평가자 라벨링 피드백 데이터 (유해여부, 유형, 위험수준, 근거)
- **DATA-003**: 외부 LLM 판정 결과 데이터 (JSON 업로드)
- **DATA-004**: 외부 사전 연산 통계 데이터 (JSON 업로드)
- **DATA-005**: 사용자 계정 인증 정보 (이메일 등)

## 2. Data Subjects
- **상담 고객 (STK-004)**: 실제 상담 대화 속에 식별 정보(PII)가 남아있을 수 있는 주체.
- **평가 행위자 (ROLE-001, ROLE-002)**: 평가를 입력하고 관리하는 연구진, 전문가, 상담원.

## 3. Access / Exposure
| Data Category | Target Subject | ROLE-001 (Admin) | ROLE-002 (Evaluator) | Unauthenticated Guest |
|---|---|---|---|---|
| DATA-001 | 고객 | Read, Write (Import) | Read | No Access |
| DATA-002 | 평가 행위자 | Read (전체 모니터링) | Read/Write (본인 데이터만) | No Access |
| DATA-003 | 없음 | Read, Write (Import) | Read | No Access |
| DATA-004 | 없음 | Read, Write (Import) | Read | No Access |
| DATA-005 | 평가 행위자 | Read (계정관리) | Read (본인 프로필만) | No Access |

## 4. Storage / Logging
- **DATA-001 ~ DATA-004**: Google Cloud 내의 Firebase Cloud Firestore 데이터베이스에 보관되며, REST API 조회를 방지하기 위해 Firebase Security Rules의 인증 체크가 적용됩니다.
- **DATA-005**: Firebase Authentication의 암호화된 사용자 보안 정보 DB에 안전하게 보관됩니다.

## 5. Transfer / Export
- 웹 플랫폼 단에서 외부 타사 API나 서드파티 서버로 데이터를 전송(Export)하거나 중계하는 모듈은 일절 존재하지 않으며, 오직 Firebase 클라이언트 SDK 통신만 존재합니다.

## 6. Risks
- **대화 내 PII 노출 (RISK-004)**: 데이터셋 준비 과정에서 비식별화 작업자가 실수를 한 대화 텍스트가 업로드될 시, 로그인 권한이 있는 모든 평가자(ROLE-002)에게 해당 정보가 노출됩니다. 이를 예방하기 위해 오프라인 사전 검수 프로세스의 정착이 선결 조건입니다.
