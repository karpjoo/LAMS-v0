# 04 Domain Traceability Matrix

## 1. Status
- **Status**: Draft
- **Source artifacts**:
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
  - [04_ubiquitous_language.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_ubiquitous_language.md)
  - [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
  - [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
  - [04_domain_events.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_events.md)
  - [04_bounded_contexts.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_bounded_contexts.md)
- **Last updated**: 2026-06-09

## 2. Requirement to Domain Links
| Requirement ID | Acceptance Criteria IDs | Domain Terms | Concepts | Rules / Invariants | Events | Bounded Contexts | Gaps |
|---|---|---|---|---|---|---|---|
| **FR-001** (대화 등록) | AC-FR-001-01, AC-FR-001-02 | TERM-003, TERM-004 | DC-001, DC-002 | BR-001, BR-006 | EVT-001 | BC-001 (Project Mgmt) | TG-001 |
| **FR-002** (대화 삭제) | AC-FR-002-01 | TERM-003 | DC-001 | BR-003, BR-004 | EVT-002, EVT-006 | BC-001, BC-003 (Audit) | None |
| **FR-003** (상담 열람) | AC-FR-003-01 | TERM-003, TERM-004 | DC-001, DC-002 | None | None | BC-001, BC-002 (Eval) | None |
| **FR-004** (평가 기록) | AC-FR-004-01, AC-FR-004-02 | TERM-005 ~ 009, TERM-014 | DC-003 | BR-002, BR-004, INV-001, INV-002 | EVT-003, EVT-006 | BC-002, BC-003 | None |
| **FR-005** (LLM 업로드) | AC-FR-005-01 | TERM-010 | DC-004 | BR-005 | EVT-004 | BC-001 | TG-001 |
| **FR-007** (대시보드) | AC-FR-007-01 | TERM-013 | DC-003, VO-004 | None | None | BC-001 | None |
| **SEC-001** (인증 접근) | AC-SEC-001 | TERM-001, TERM-002 | None | None | None | BC-001, BC-002 | None |
| **SEC-002** (평가 격리) | AC-FR-004-01 | TERM-002 | DC-003 | BR-002 | None | BC-002 | None |
| **SEC-003** (PII 경고) | AC-SEC-003 | TERM-015, TERM-017 | None | DSP-001, BR-001 | None | BC-001 | None |
| **SEC-004** (삭제 인터락) | AC-FR-002-01 | TERM-016 | None | DSP-003, BR-003 | None | BC-001 | None |
| **OPS-001** (감사 로깅) | AC-FR-002-01, AC-FR-004-01 | TERM-012 | DC-006 | BR-004, INV-003 | EVT-006 | BC-003 | None |
| **User Request** (합의 모델) | - | TERM-018 ~ 022 | DC-007, DC-008, VO-004 | BR-007 ~ 010, INV-004, INV-005 | EVT-007 ~ 010 | BC-002 (Eval) | None |

## 3. Domain to Future Stage Links
| Domain Item ID | Type | Architecture Implication | Data Design Implication | Test Implication | Notes |
|---|---|---|---|---|---|
| **DC-001** (Conversation) | Concept | Greenfield React 클라이언트에서 Firestore 직접 호출 구조로 렌더링 | `/calls` 최상위 Firestore 컬렉션 구조 매핑 권장 | JSON 파일 업로드 통합 검증 및 대화 말풍선 정렬 검사 | call_id를 기본 키로 관리 |
| **DC-003** (Label) | Concept | 본인 도큐먼트만 쓰기 권한이 부여되는 격리된 Firebase SDK 핸들러 필요 | `/calls/{callId}/labels/{userId}` 서브컬렉션 구성 권장 | 타인 계정 세션으로 타인 라벨 접근 차단 E2E 테스트 | user_id와 call_id 결합 키 |
| **DC-006** (Audit Log) | Concept | 보안 침해나 수정을 원천 거부하는 추가 전용 격리 감사 메커니즘 구축 | `/audit_logs` 컬렉션 구성 권장 (No Update / No Delete) | 감사 로그 위변조 및 임의 삭제 트랜잭션 방어 테스트 | Append-only 보증 법칙 |
| **DC-007** (Gold Standard Label) | Concept | 1~3차 합의 결과를 최종 영구 고정하는 기준 정답 API 핸들러 필요 | `/calls/{callId}/gold_standard` 도큐먼트 매핑 권장 | 최종 합의 확정 후 타 평가자의 수정 공격 방어 테스트 | 1:1 대화 매핑 |
| **VO-002** (Toxicity Form) | Concept | UI 폼 유효성 바인딩 및 밸리데이션 검사 헬퍼 클래스 도입 | `Label` 엔티티 하위 필드 데이터 맵으로 직렬화 적재 | Absent 시 하위 필드들 자동 null 전환 검증 유닛 테스트 | 정합성 검사 필수 |
| **DSP-001** (PII Scan Policy) | Policy | 데이터 업로드 파서 실행 도중 브라우저에서 스캔 모듈 통과 의무화 | 프론트엔드 파일 스트림 파싱 시 regex 분석 적용 | 010 패턴 텍스트 업로드 시 UI 경고 모달 강제 팝업 검증 | 업로드 차단은 아님 |
| **DSP-004** (Consensus Policy) | Policy | 라벨 제출 시 동기 또는 백엔드 배치(Function)로 합의 조건을 비교 평가하는 모듈 구현 | 평가자 3인의 1, 2차 라벨 필드 일치 연산 적용 | 3인 라벨 일치 시 자동으로 Gold Standard 생성 여부 유닛 테스트 | 합의 제어 핵심 정책 |
| **BC-003** (Audit Context) | Bounded Context | 타 도메인 이벤트 수신 시 독립적 로깅 트랜잭션을 트리거하는 감사 모듈 격리 | 보안 정책 강화를 위해 Firestore Rules 감사 규칙 분리 | 중요 조작(업로드/삭제/라벨저장) 완료와 감사 기록 동기 E2E 테스트 | 격리된 보안 경계 |

## 4. Traceability Gaps
| Gap ID | Gap Type | Affected Requirement / Domain Item | Description | Impact | Follow-up Needed |
|---|---|---|---|---|---|
| **TG-001** | data gap | FR-001, FR-005 | 외부에서 생성되어 업로드될 JSON(대화, LLM)들의 세부 필드 명세가 미확정 상태임 | 대화 파일 및 LLM 업로드 파서의 구체적인 유효성 검사 필드 매핑 세부 설계 지연 | Stage 6 (Data Design) 진입 시 JSON 스키마 필드 규격을 최종 검수하여 스키마 유효성 가드 적용 필요 |
