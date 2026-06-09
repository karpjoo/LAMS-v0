# 07 MVP Scope

## 1. Stage Status
- **Status**: Draft (Needs Review)
- **Source artifacts**:
  - [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md)
  - [03_requirements.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_requirements.md)
  - [03_acceptance_criteria.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md)
  - [04_domain_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_domain_model.md)
  - [04_business_rules_invariants.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/04_domain/04_business_rules_invariants.md)
  - [05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md)
  - [06_conceptual_data_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_conceptual_data_model.md)
- **Approval required**: Human Developer (Admin)

## 2. MVP Definition Summary
- **MVP purpose**: 콜센터 상담 유해 발화 탐지 연구의 다중 평가(Human & LLM) 프로세스를 통제하고, 의견이 일치하지 않는 발화에 대해 3단계 합의 이관(Adjudication)을 통해 최종 Gold Standard 정답 데이터셋을 안전하게 적재하는 웹 시스템의 기능 검증.
- **Primary user value**:
  - 평가자는 웹 브라우저 상에서 직관적으로 상담 대화 턴을 확인하고 멱등성이 유지된 본인만의 라벨 정보를 저장/수정할 수 있음.
  - 관리자는 오프라인 데이터(대화셋, LLM 판정 결과, Kappa 지표)를 손쉽게 임포트하고 전체 평가 상황 및 통계 차트를 일괄 조회함.
- **Minimum success outcome**:
  - 10명 내외의 평가자가 1차 독립 평가를 수행하고, 의견 불일치 시 2차 공유 또는 3차 Adjudicator 수동 판정으로 넘어가 최종 Gold Standard 데이터가 데이터베이스에 위변조 불가능하게 정착함.
- **What the MVP proves**: React-Firebase Direct SDK Serverless 환경에서 Firestore Security Rules 기반의 blind-spot 접근 차단과 Append-only 감사 로그가 실제 인프라에서 보안 요건을 안정적으로 보충함을 입증.
- **What the MVP intentionally does not prove**: 실시간 API를 활용한 모델 추론 지연 극복 속도, 대규모 멀티테넌시 분산 처리, 웹 내부의 수리적 통계 공식 성능 등.

## 3. Scope Classification Method
- **Categories**:
  - **Must**: MVP의 비즈니스 가치, 데이터 무결성 및 인프라 보안에 직결되는 필수 항목.
  - **Should**: 중요하지만 MVP 단계에서 수동 우회나 지연 처리가 가능한 비필수 항목.
  - **Could**: 있으면 가치가 향상되나 핵심 파이프라인 작동에는 영향이 없는 권장 사양.
  - **Later**: 차기 릴리즈 회차로 이월된 정식 계획 요건.
  - **Won't**: 현재 LAMS-v0 연구 사양 상 전면 제외된 요건.
- **Decision criteria**: 핵심 연구 파이프라인의 완성, 데이터 손실 방지, 데이터 접근 격리 강제성 여부.
- **Constraints considered**: Pure Client-side Serverless 스택 고정, Vanilla CSS 스타일링 준수, 외부 사전 연동 전제.

## 4. MVP Must-Have Scope
| Scope Item ID | Requirement IDs | Capability | User / Actor | Acceptance Criteria Links | Rationale | Dependency Notes |
|---|---|---|---|---|---|---|
| **SCOPE-001** | FR-001 | 대화 데이터셋 파일 일괄 등록 | Admin | [AC-FR-001-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L15), [AC-FR-001-02](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L27) | 연구용 기본 데이터 입력 및 파싱 기능 필수 | 외부 비식별화 선행, PII 스캔 연동 |
| **SCOPE-002** | FR-002 | 대화 데이터셋 일괄 삭제 | Admin | [AC-FR-002-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L37) | 잘못 적재된 연구 데이터 초기화에 필수 | UI 텍스트 확인 인터락 필요 |
| **SCOPE-003** | FR-003 | 대화 목록 조회 및 세부 턴 열람 | Evaluator, Admin | [AC-FR-003-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L50) | 평가자가 대화를 육안 확인하기 위해 필수 | 순차 정렬 sequence_no 준수 |
| **SCOPE-004** | FR-004 | 평가자 유해성 판정 기록 | Evaluator | [AC-FR-004-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L59), [AC-FR-004-02](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L71) | 유해성 유형 및 위험도 기록 수명주기 핵심 | Uid 기반 저장 및 prefilled 연동 |
| **SCOPE-005** | FR-005 | 외부 LLM 판정 결과 일괄 업로드 | Admin | [AC-FR-005-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L80) | 인간-LLM 비교 분석을 위한 데이터 적재 필수 | call_id 매핑 검사 |
| **SCOPE-006** | FR-006 | 외부 통계 지표 일괄 업로드 | Admin | [AC-FR-006-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L89) | 대시보드 통계 시각화 기본 적재를 위해 필수 | Kappa 및 F1 수치 대응 |
| **SCOPE-007** | FR-007 | 작업 상황 및 통계 대시보드 표시 | Admin, Evaluator | [AC-FR-007-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L98) | 연구 모니터링 및 시각적 통계 조회를 위해 필수 | Vanilla CSS 렌더링 |
| **SCOPE-008** | NFR-001 | 데이터 무결성 및 적재 안정성 | Admin, Evaluator | - | 업로드 및 삭제 오류 시 partial 상태 방지 | Batched Write 트랜잭션 적용 |
| **SCOPE-009** | NFR-002 | 프리미엄 비주얼 CSS 및 반응형 | All | - | 프리미엄 글래스모피즘 비주얼 구현 핵심 | Vanilla CSS, Outfit/Inter 폰트 |
| **SCOPE-010** | NFR-003 | 예외적 에러 복원 파싱 | All | - | JSON parsing 오류 시 크래시 방지 | React Error Boundary 및 try-catch |
| **SCOPE-011** | SEC-001 | 로그인 세션 및 접근 차단 | All | [AC-SEC-001](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L113) | 미인가 게스트 접근 전면 차단 | Firebase Auth 연동 |
| **SCOPE-012** | SEC-003 | 업로드 데이터 비식별화 사전 경고 | Admin | [AC-SEC-003](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L119) | 휴대전화번호 등 PII 노출 방지 스캔 | 정규식 패턴 사전 스캔 경고 |
| **SCOPE-013** | SEC-004 | 데이터 삭제 오작동 방지 인터락 | Admin | [AC-FR-002-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L37) | 의도치 않은 전체 데이터셋 소실 차단 | 텍스트 입력 확인 강제 |
| **SCOPE-014** | OPS-001 | 중요 액션 감사 로깅 | Admin, Evaluator | [AC-FR-002-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L37) | 중요 액션의 무정정 무삭제 감사 추적 | Append-only audit_logs 적재 |

## 5. MVP Supporting / Enabling Scope
| Scope Item ID | Requirement IDs | Enabling Capability | Why Needed for MVP | Architecture/Data Dependency | User-visible? |
|---|---|---|---|---|---|
| **SCOPE-SUP-001** | User Request | 3단계 Adjudication 상태 전이 제어 | 의견 불일치 시 2차 공유, 3차 수동 결정을 제어하기 위해 필수 | domain/Conversation Aggregate logic | 예 (목록 상태 표시) |
| **SCOPE-SUP-002** | SEC-002 | 역할 권한 격리 (Role-based claims) | Admin, Evaluator, Adjudicator 간의 Firestore read/write 격리를 위해 필수 | auth/Firestore Security Rules | 아니오 (보안 인프라) |
| **SCOPE-SUP-003** | User Request | Round 1 blind-spot lock 규칙 | 1차 평가 중에는 타 평가자의 의견을 열람할 수 없도록 강제하기 위해 필수 | Firestore Security Rules (`Round 1 Active` read 거부) | 아니오 (보안 규칙) |

## 6. Should-Have Candidates
*현재 해당 사항 없음. MVP 범위를 간결하고 투명하게 유지하기 위해 Should-Have 성격의 주변 기능은 과감히 배제하거나 차기 회차로 연기함.*

## 7. Could-Have Candidates
| Scope Item ID | Requirement IDs | Capability | Value | Deferral Rationale | Reconsideration Trigger |
|---|---|---|---|---|---|
| **SCOPE-CLD-001** | Q-101 | 1/2차 평가 불일치 대화 필터 조회 | 불일치가 일어나 3차 Adjudicator로 이관될 대상만 골라서 볼 수 있게 목록 필터 제공 | 목록 필터 없이도 status 쿼리로 단순 구분 및 목록 노출이 가능하므로 Defer 함 | Adjudicator 작업 편의성 강화 요구가 들어올 때 |

## 8. Later Release Items
| Scope Item ID | Requirement IDs | Capability | Proposed Release | Deferral Rationale | Dependency Notes |
|---|---|---|---|---|---|
| **SCOPE-LTR-001** | Q-105 | 개별 평가자 세부 진척도 관리자 표 | Admin 대시보드에서 평가자별 완료 건수 및 잔여 상세 현황을 테이블로 모니터링 | MVP에서는 전체 진척 수치 aggregate 노출로 충분하다고 가정하여 Defer 함 | 대규모 다중 평가자 관리 필요성이 추가될 때 |

## 9. Won't / Non-Scope Items
| Scope Item ID | Requirement IDs | Capability / Idea | Reason Excluded | Reopen Only If |
|---|---|---|---|---|
| **SCOPE-NON-001** | G-003 | 실시간 LLM 추론 직접 처리 API | 실시간 연동 지연 및 API 비용 오버헤드를 막기 위함 (ADR-001) | 실시간 동적 대화 생성 및 즉각 LLM 분석이 과제 요건으로 추가될 때 |
| **SCOPE-NON-002** | G-003 | 실시간 Kappa 수학 계산 엔진 | 웹 클라이언트의 복잡도 및 트랜잭션 오버헤드를 막기 위함 (ADR-001) | 실시간 평가 입력 중 동적으로 통계 점수가 변동되는 동시성 대시보드가 강제 요구될 때 |
| **SCOPE-NON-003** | G-001 | 자동 비식별화 마스킹 텍스트 편집기 | 데이터 누출을 완벽 통제하기 위해 외부 선행 비식별화 처리를 전제하므로 불요 | 시스템에 원시 미가공 데이터 업로드 및 실시간 검수가 강제될 때 |
| **SCOPE-NON-004** | G-001, G-002 | 콜센터 음성 녹취 오디오 재생 UI | LAMS-v0는 텍스트 상담 대화의 유해성 판정에 초점을 맞추므로 오디오 기능 제외 | 음성 발화 톤(Tone) 및 노이즈 분석 연구가 추가될 때 |

## 10. Security / Privacy / Compliance Scope Notes
- **비식별화 준수 검사 (SEC-003)**: Admin이 대화 JSON 업로드 시, 클라이언트단 정규식 패턴 매칭을 통해 1차적으로 전화번호 노출 위험을 경고합니다.
- **Round 1 Blind-Spot Rules (BR-007)**: 1차 평가 완료 전까지 타인의 라벨 문서는 GET/LIST 요청 시 Firestore Security Rules 레벨에서 강제로 `permission-denied` 에러를 반환해야 합니다.

## 11. Operational / Deployment Scope Notes
- **Append-only Audit log (BR-004)**: `audit_logs` 컬렉션의 수정 및 삭제는 Firestore Security Rules에서 원천 거부되어 영구 보존됩니다.
- **2단계 삭제 확인 (BR-003)**: 전체 데이터셋 삭제 시 "DELETE ALL DATASET"을 정확히 입력할 때만 UI 상에서 삭제 요청 API 바인딩 버튼이 활성화됩니다.

## 12. Scope Risks
- **Firestore Security Rules 복잡성**: Blind-spot 규칙 강제 시 `resource.data` 조회가 불일치 상태에서 에러를 유발할 수 있으므로, 에뮬레이터에서 꼼꼼히 rules를 테스트해야 합니다.

## 13. Decision Candidates
- *ADR-001 (Direct SDK Serverless)* 및 *ADR-004 (Append-only Audit Logging)*의 MVP 핵심 채택.

## 14. Working Assumptions
- **A-101**: 동시 사용자가 10명 내외이므로, 클라이언트 측 batched write와 Firestore transaction으로 안전한 무결성을 달성할 수 있다고 가정합니다.
- **DATA-ASM-003**: 3인의 라벨이 적재되었는지 여부는 `label_completion_count` 필드 단일 쿼리로 최적화하여 판정합니다.

## 15. Open Questions
- **Q-105**: 개별 평가자 단위의 상세 진척도 모니터링은 차기 릴리즈(R2)로 연기함에 대한 인간 개발자의 최종 승인 필요.

## 16. Human Approval Required
- **Must-Have MVP 범위**: `SCOPE-001` ~ `SCOPE-014` 전체 승인.
- **Later/Could-Have 이월**: `SCOPE-LTR-001` (평가자 세부 진척 뷰) 및 `SCOPE-CLD-001` (목록 필터)의 이월 승인.
- **Won't 범주**: 실시간 LLM 추론, 웹 내 통계 연산 및 오디오 재생 기능의 비스코프 제외 승인.
