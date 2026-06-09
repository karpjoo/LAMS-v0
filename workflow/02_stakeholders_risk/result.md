# Result: 02 Stakeholder & Risk Framing

## 1. Task Summary
- **수행 작업**: Stage 2 Stakeholder & Risk Framing(이해관계자 및 위험성 구상) 단계를 완료하였습니다.
- **수행 목표**: 사용자 역할(Admin, Evaluator) 및 권한 제약, 민감 상담 데이터의 노출 범위 차단 방안, 관리자 파워에 대한 제약 조건, 로깅 및 PII 프라이버시 위험성을 분석하여 다음 Stage 3 요구사항 설계에 제약조건으로 입력되도록 정리하였습니다.

## 2. Inputs Used
- [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md) (서비스 목표 및 타겟 사용자 그룹)
- [USER_DIRECTIVES.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/00_intake/USER_DIRECTIVES.md) (Greenfield, Firebase 기술 제약)
- [260528-revised-research-overview.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md) (연구 프레임 및 평가자 구성)

## 3. Outputs Created or Updated
- **생성된 산출물**:
  - [02_stakeholders.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_stakeholders.md)
  - [02_risk_privacy_screening.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_risk_privacy_screening.md)
  - [02_role_permission_matrix.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_role_permission_matrix.md)
  - [02_data_exposure_map.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_data_exposure_map.md)
  - [02_admin_power_review.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/02_admin_power_review.md)
  - [result.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/02_stakeholders_risk/result.md)
  - [context_packet.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/context_packet.md) (Stage 3 Handoff 업데이트)
  - [ASSUMPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/ASSUMPTIONS.md) (A-104 ~ A-305 가정 추가)
  - [OPEN_QUESTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/OPEN_QUESTIONS.md) (Q-103 ~ Q-105 질문 추가)
  - [artifact_manifest.yml](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/artifact_manifest.yml) (갱신)

## 4. Key Findings
- **화면 및 역할 공유의 보안성**: 일반 상담원과 언어학 전문가가 화면을 공유(ROLE-002)하므로, Firestore 보안 규칙을 작성할 때 개별 문서 접근 권한에서 본인의 식별자(`user_id`)가 확인된 평가 기록만 수정 가능하도록 강제해야 데이터 위변조가 방지됩니다.
- **오프라인 경계에 따른 위험 축소**: 외부 API 및 LLM 호출이 본 웹 시스템의 외부에서 오프라인으로 일어나므로, 데이터 외부 유출 경로가 원천 차단되어 위험 등급이 현저히 축소되었습니다.

## 5. Decision Candidates
- 일반 상담원과 언어학 전문가를 단일 계정 역할군인 **ROLE-002 (Evaluator)**로 지정하고 평가 화면을 공용하여 라벨을 저장하도록 유도.
- Firebase Client SDK 연동 시, 미인증 접근을 방어하기 위해 Firestore Security Rules의 Read/Write 권한에 `request.auth != null` 검증 의무 적용.

## 6. Working Assumptions
- **A-104**: 평가 인원이 10명 내외의 소규모이므로 단순 Firestore Document 업데이트 방식으로 처리해도 데이터 무결성에 큰 지장이 없을 것으로 가정함.
- **A-305**: 외부 비식별화 검수가 사전에 완벽히 이루어지므로, 본 시스템에서는 별도의 대화 텍스트 디코딩/복호화 기능이 불필요하다고 가정함.

## 7. Open Questions
- **Q-103**: 관리자가 데이터셋을 추가 업로드할 때, 기존 평가가 완료된 상담 대화와 라벨 데이터를 유지한 채 데이터만 병합(Upsert)해야 하는가, 아니면 덮어쓰기(Overwrite) 형태로 관리해야 하는가?
- **Q-104**: 로그 데이터(AUD-001, AUD-002)를 Firestore 내 별도 로그 컬렉션에 저장하는 것으로 충분한가요?
- **Q-105**: 관리자(Admin)가 평가자의 라벨링 진행 상황을 모니터링할 때, 어떤 평가자가 어떤 대화(`call_id`)에 라벨링을 안 했는지 개별 세부 진척 현황(상담원별 완료 건수 등)을 조회할 수 있게 해야 하나요?

## 8. Risks and Constraints
- **RISK-001**: 로그인하지 않은 미인증 사용자가 REST API를 통해 전체 상담 데이터셋을 무단 조회하거나 변조할 위험. (Firestore Security Rules로 완화 필요)
- **RISK-004**: 사전 비식별화 처리의 불완전성으로 인한 실제 개인정보 노출 위험. (사전 작업 검수 철저 의무)

## 9. Rejected or Superseded Options
- 없음.

## 10. Traceability Updates
- 이해관계자(STK-###), 역할(ROLE-###), 데이터 카테고리(DATA-###), 위험성(RISK-###)의 매핑 관계를 신규 생성 파일들의 추적성 섹션에 명시하여 Stage 3 요구사항 및 Stage 6 데이터 설계 시의 제약 조건과 직결되도록 완료하였습니다.

## 11. N/A Records
### N/A: 02_external_transfer_register.md
- **Reason not applicable**: 시스템 내에서 타사 외부 서비스(OpenAI, Anthropic 등)와 직접 통신하거나 데이터를 Exfiltration하는 모듈이 존재하지 않고, 오직 본인의 Firebase 클라우드 영역만 통신하므로 별도 등록 대장이 불필요합니다.
- **Evidence or input used**: [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)의 옵션 B 채택 및 Web SaaS 기술 제약사항.
- **Revisit if**: 실시간 LLM 추론 API를 웹 내에 탑재하여 직접 API 호출을 전송하게 되는 아키텍처 변경 시.
- **Impact on later stages**: 후속 Requirements(Stage 3) 및 Architecture(Stage 5) 단에서 외부 API 통신 및 보안키 노출 방어를 위한 백엔드 프록시 설계를 생략할 수 있습니다.

### N/A: 02_audit_accountability_needs.md
- **Reason not applicable**: 소형 연구용 프로토타입 성격에 부합하도록, 별도의 외부 독립된 감사 로깅이나 법의학적 추적 대장을 생성하지 않고 Firestore 내의 간소화된 로그 컬렉션 적재(`AUD-001`, `AUD-002`) 설계로 통합합니다.
- **Evidence or input used**: "Keep MVP scope small", "Avoid unnecessary enterprise architecture"
- **Revisit if**: 연구 신뢰성에 법적 소송이나 외부 공식 감사인의 까다로운 시스템 기록 추적 의무 규정이 추가될 시.
- **Impact on later stages**: 로깅 요구사항이 극도로 경량화되어 구현 복잡도가 크게 줄어듭니다.

### N/A: 02_compliance_risk_notes.md
- **Reason not applicable**: 본 플랫폼은 상용 서비스가 아닌 폐쇄적인 연구용 프로토타입이므로 별도의 외부 정보보호 인증(ISMS-P 등)이나 복잡한 법적 컴플라이언스 위험 문서를 독립 작성할 필요가 없습니다. (IRB 지침은 02_risk_privacy_screening.md의 간이 9번 섹션으로 충분히 커버됨)
- **Evidence or input used**: "intent: research", "lightweight prototype"
- **Revisit if**: 상용화 제품으로 전환되거나 대규모 다년 연구 과제로 확대되어 공식 보안 심사를 거쳐야 할 시.
- **Impact on later stages**: 컴플라이언스 및 표준 보안 준수를 위한 추가 문서화 부담이 생략됩니다.

### N/A: 02_abuse_misuse_cases.md
- **Reason not applicable**: 비인가 외부 사용자의 접근이 전면 차단되는 폐쇄형 인증 시스템이며, 단순 데이터 적재를 수행하므로 프롬프트 인젝션이나 결제 어뷰징 등 복잡한 abuse 시나리오 분석 파일을 분리할 실익이 적어 marked N/A 처리합니다.
- **Evidence or input used**: "intent: research" 및 "Option B (Offline execution)"
- **Revisit if**: 실시간 프롬프트 조작 인터페이스가 생기거나, 일반 대중에게 웹페이지가 공개되는 형태로 전환될 시.
- **Impact on later stages**: UI 상에서의 프롬프트 탈취 방어 로직이나 비정상 요청 차단 시스템 설계 부담이 해소됩니다.

## 12. Human Approval Required
### Decisions to Approve
- 일반 상담원과 언어학 전문가 계정이 평가 화면을 공용하도록 설계하는 방향 승인.
- 외부 API 통신 배제 및 Firebase 클라이언트 SDK 통신 수준으로 데이터 경계를 제한하는 안 승인.
- Firestore Security Rules를 통한 읽기/쓰기 차단 설정 의무화 승인.

### Assumptions to Confirm
- **A-104**: 소인수(10명 내외) 사용으로 인해 Firestore Lock 제어 메커니즘을 배제하는 가정 확인.
- **A-305**: 외부 비식별화 선작업이 신뢰성 있게 처리되어 등록된다는 조건 확인.

### Open Questions to Resolve
- 업로드 데이터셋의 병합(Upsert) vs 덮어쓰기(Overwrite) 제어 방식 결정 (Q-103).
- 관리자 진척률 대시보드 조회 시 개별 평가자의 미완료 건수 상세 트래킹 제공 범위 설정 (Q-105).

### Risks to Review
- Firebase Configuration Key 노출에 대처하기 위해 Firestore Security Rules의 철저한 기획 수립 요구 (R-102).

### Recommended Next Step
- **Stage 3 - Requirements & Acceptance Criteria**로 이동하여 이 권한과 데이터 경계를 바탕으로 상세 기능 명세를 수립할 것을 제안합니다.