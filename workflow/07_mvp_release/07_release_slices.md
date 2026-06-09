# 07 Release Slices

## 1. Release Strategy Summary
- **Release strategy**: LAMS-v0 시스템의 릴리즈 전략은 **선행 의존성 해소 중심의 점진적 수직 슬라이싱(Incremental Vertical Slicing)**입니다. 인프라 기반(R0)을 먼저 구축한 뒤, 학술 평가 연구용 핵심 기능(R1 MVP)을 집중 구현 및 실배포하고, 부가적인 관리 편의성 요건(R2 Post-MVP)은 차기 버전으로 이월하여 가볍고 견고하게 릴리즈합니다.
- **Release slicing principle**: 
  - 각 슬라이스는 완전히 독립적으로 컴파일되고 시각적 검증이 가능해야 함 (coherent & value-oriented).
  - 각 슬라이스 완료 시 Stage 8 테스트 하네스를 통해 기능 및 보안 무결성을 개별 검증할 수 있어야 함.
  - 클라이언트-DB 직결 아키텍처 특성 상 보안 규칙(Security Rules)이 각 단계에 맞추어 완전하게 동반 설계/릴리즈되어야 함.
- **Smallest coherent vertical slice**: **Release R0 (인증 및 Scaffolding)**가 가장 작은 수직 슬라이스 단위이며, 이를 기반으로 **R1 (MVP)** 내의 `대화 데이터셋 업로드(FR-001) -> 목록/상세 턴 열람(FR-003) -> 1차/2차 평가자 유해성 판정 기록(FR-004) -> 3차 Adjudicator 최종 결정 수립(Gold Standard Label)`의 코어 라벨링 수명주기를 단일 수직 축으로 검증합니다.
- **Validation dependency**: Stage 8 테스트 전략 및 에뮬레이터 검증 시, R1 릴리즈의 Firestore Security Rules와 Client-side Batched Write atomic 무결성이 완비되어야만 전체 검증이 가능합니다.

## 2. Release Slice Overview
| Release ID | Release Name | Goal | Scope Summary | Primary Users | Validation Focus | Status |
|---|---|---|---|---|---|---|
| **R0** | Foundation / Setup | 프로젝트 골격 및 보안 경계 수립 | Firebase SDK 연동, 세션 라우팅 가드, Vanilla CSS 테마 및 레이아웃 뼈대 구축 | All | 익명 사용자 차단, 기본 라우팅 검증, 모바일/데스크톱 그리드 렌더링 | Draft |
| **R1** | MVP Release | 3단계 전문가 합의 유해성 판정 및 비교 분석 코어 완료 | 대화 JSON 업로드/삭제, 1~3차 평가 폼 저장/Prefill/Adjudicate, LLM/통계 업로드, Dashboard 진행률 노출, 감사 로그 적재, Blind-spot rules 배포 | Admin, Evaluator, Adjudicator | Batched Write 무결성, 1차 평가 blind-spot lock rules 검증, PII Warning 동작, 삭제 텍스트 확인 작동 | Draft |
| **R2** | Post-MVP | 관리 편의성 및 세부 모니터링 고도화 | 1/2차 불일치 대화 필터 조회, 평가자별 개별 상세 진척도 테이블 대시보드 렌더링 | Admin, Adjudicator | 필터 검색 정확성, 사용자별 개별 데이터 쿼리 성능 | Draft |

---

## 3. Release Slice Details

### Release R0 / Foundation
- **Purpose**: React + Firebase Web SDK 연동 및 Vanilla CSS 기반 레이아웃 프레임 완성.
- **Included scope items**:
  - `SCOPE-009` (NFR-002: 프리미엄 비주얼 CSS 및 Outfit 폰트 Scaffold)
  - `SCOPE-011` (SEC-001: 로그인 세션 및 익명 차단 가드)
- **Linked requirements**: SEC-001, NFR-002
- **Acceptance criteria included**: [AC-SEC-001](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L113)
- **Architecture dependencies**: Direct Web SDK bindings, Firebase Auth session management.
- **Data dependencies**: Firestore `/users` profile schema.
- **Security/privacy dependencies**: Firestore Rules `allow read, write: if request.auth != null;` 최초 적용.
- **Validation implications**: 게스트 진입 시 즉시 로그인 리다이렉트 여부 수동/E2E 테스트.
- **Exit criteria**: 로그인 성공 시 대시보드 홈 렌더링 완료, 모바일/데스크톱 화면 리사이징 시 CSS Grid/Flexbox 뼈대 깨짐 없음.
- **Not included**: 데이터셋 업로드 및 모든 상세 평가 관련 DB 로직.

### Release R1 / MVP
- **Purpose**: LAMS-v0 3단계 합의 도메인 완성 및 연구 통계/비교 파일 매핑 완료.
- **Included scope items**:
  - `SCOPE-001` (FR-001: 대화 데이터셋 업로드)
  - `SCOPE-002` (FR-002: 대화 데이터셋 전체 삭제)
  - `SCOPE-003` (FR-003: 대화 목록 및 bubble 턴 조회)
  - `SCOPE-004` (FR-004: 평가 라벨 기록/수정 및 prefill)
  - `SCOPE-005` (FR-005: 외부 LLM 결과 업로드)
  - `SCOPE-006` (FR-006: 외부 Kappa 통계 업로드)
  - `SCOPE-007` (FR-007: 대시보드 진행바 및 외부 Kappa 렌더링)
  - `SCOPE-008` (NFR-001: Firestore Batch 쓰기 무결성)
  - `SCOPE-010` (NFR-003: React Error Boundary & fail-safe JSON parser)
  - `SCOPE-012` (SEC-003: PII 사전 정규식 검사 및 모달 경고)
  - `SCOPE-013` (SEC-004: "DELETE ALL DATASET" 텍스트 입력 확인 인터락)
  - `SCOPE-014` (OPS-001: Append-only 감사 로그 적재)
  - `SCOPE-SUP-001` (Adjudication 상태 전이)
  - `SCOPE-SUP-002` (역할 권한 분기 및 Rules 격리)
  - `SCOPE-SUP-003` (Round 1 blind-spot lock Rules 강제)
- **Linked requirements**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, NFR-001, NFR-003, SEC-002, SEC-003, SEC-004, OPS-001, INT-001
- **Acceptance criteria included**: [AC-FR-001-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L15) ~ [AC-FR-007-01](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L98), [AC-SEC-003](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/03_requirements/03_acceptance_criteria.md#L119)
- **Architecture dependencies**: Pure Client-side Serverless.
- **Data dependencies**: `/conversations`, `/conversations/{call_id}/labels`, `/conversations/{call_id}/llm_results`, `/gold_standards`, `/audit_logs`, `/dashboard/statistics`.
- **Security/privacy dependencies**: 
  - `audit_logs` 컬렉션 update/delete 방지 규칙.
  - Round 1 Active 시 labels GET/LIST 차단 규칙.
  - 본인 UID 외의 영역 write 금지 규칙.
- **Validation implications**: Firestore Local Emulator를 이용한 Security Rules 보안 시나리오 자동 테스트 및 client-side batched write 데이터 무결성 검증.
- **Exit criteria**: 
  - Admin이 JSON 파일 업로드 시 비식별화 경고 팝업 정상 작동.
  - "DELETE ALL DATASET" 정확히 입력 시에만 삭제 활성화 및 Firestore의 대화/라벨 일괄 삭제 완료.
  - 평가자 로그인 시 본인의 prefilled 평가 데이터 정상 로딩.
  - 1차 평가 완료 시 불일치 상태 감지 및 Adjudicator 3차 단계 정상 전이.
  - 3차 결정 저장 시 `Gold Standard Label` 1:1 바인딩 잠금 완료.
- **Not included**: 불일치 대화 필터링 및 개별 사용자 진척 상세 표.

### Release R2 / Post-MVP
- **Purpose**: 관리 통계 시각화 고도화 및 관리자용 분석 편의 도구 릴리즈.
- **Included scope items**:
  - `SCOPE-CLD-001` (불일치 대화 필터 조회)
  - `SCOPE-LTR-001` (개별 평가자 세부 진척도 관리자 표)
- **Linked requirements**: Q-101, Q-105
- **Acceptance criteria included**: N/A (상세 기획 완료 시 반영)
- **Architecture dependencies**: React UI 필터 컴포넌트 추가 및 쿼리 파라미터 제어.
- **Data dependencies**: `/users` 컬렉션의 진척 필드 및 `/conversations` status 쿼리 연계.
- **Security/privacy dependencies**: Admin 역할 권한에서만 사용자 개별 진척 조회 허용.
- **Validation implications**: 대시보드 내 진척 데이터와 목록 필터링 상태 일치 검증.
- **Exit criteria**: 
  - 관리자 로그인 시 평가자별 완료/미완료 건수가 표로 정상 출력됨.
  - 불일치 필터 토글 시 status 2차/3차 활성 상태인 대화만 목록에 필터링 렌더링됨.

---

## 4. Dependency-Driven Ordering
| Dependency | Source | Affected Release | Why It Affects Order | Alternative |
|---|---|---|---|---|
| **Auth Session & Scaffolding** | DEP-001, DEP-003 | **R0** -> **R1** | 로그인 인증이 선행 구현되어야 데이터베이스 쓰기/조회 시 Security Rules 차단 에러가 나지 않고 UI 컴포넌트를 테스트할 수 있음 | Rules를 `allow read, write: if true;`로 임시 개발 배포 (보안 사고 리스크로 인해 강력 기각) |
| **Ingest Dataset** | DEP-002 | **R1** (Import) -> **R1** (Labeling) | 대화 데이터가 적재되어야 평가 목록 및 상세 턴을 로딩하여 라벨을 입력하는 workflow를 구동할 수 있음 | Mock seed 데이터를 Firestore에 수동 강제 삽입하여 라벨링 화면 먼저 개발 (Seed Fixture 사용으로 일부 동시 개발 가능하나, 최종 통합을 위해 Import가 우선 확보되어야 함) |
| **Audit Logs Immobility** | DEP-006 | **R1** (All actions) | 등록/삭제/라벨 저장을 수행할 때 atomic batch write로 감사 기록을 같이 쓰기 때문에 audit log structure가 R1 완성 시점에 배포되어야 함 | 로깅 로직을 제거하고 개발한 뒤 나중에 끼워넣음 (데이터 누락 위험 및 코드 수정 공수 급증으로 배제) |

---

## 5. Deferred Requirement Impact
| Requirement ID | Deferred To | Impact | Risk | Mitigation |
|---|---|---|---|---|
| **Q-105 (상세 평가자 진척도 표)** | **R2** (Post-MVP) | MVP 단계(R1)에서 관리자는 평가자 전체 합산 진척률(%)만 파악할 수 있고, 누가 미완료 상태인지는 Firestore DB를 직접 열지 않는 이상 알 수 없음 | 일부 평가자가 기한 내 입력을 지연 시, 관리자가 독려 대상을 식별하기 위해 수동으로 DB 목록을 체크해야 하는 오퍼레이션 지연 위험 | 10명 내외의 소규모 평가자이므로 카카오톡/메신저 등 외부 채널 소통으로 직접 완주 여부를 체크하여 오퍼레이션 우회 |
| **Q-101 (의견 불일치 대화 필터)** | **R2** (Post-MVP) | 3차 최종 Adjudicator가 목록에서 합의 대상을 찾을 때, status 필터 쿼리를 단순 문자열 검색 또는 전체 리스트 내 수동 스크롤 조작을 해야 함 | Adjudicator가 평가 목록이 수백 건으로 늘어날 경우 작업 대상을 고르는 데 시간이 수 초 지연됨 | R1에서는 status ASC, created_at ASC 복합 인덱스(`IDX-001`)를 쿼리하여 불일치 상태(Round 3 Active 등)가 위쪽으로 오도록 정렬하여 수동 탐색을 최소화 |

---

## 6. Release Risks
| Risk ID | Release | Risk | Severity | Likelihood | Mitigation | Approval Needed |
|---|---|---|---|---|---|---|
| **RSK-REL-001** | R1 | **Firestore 복합 인덱스 누락 리스크**: status와 created_at 복합 쿼리 수행 시 index가 없으면 cloud query가 runtime에서 reject됨 | High | Medium | `06_indexes.md`에 정의된 `IDX-001` index 구성을 Firebase CLI 배포 구성 파일(`firestore.indexes.json`)에 선제 작성하여 MVP 배포 시 동시 배포함 | Yes (Admin) |
| **RSK-REL-002** | R1 | **Turn Embedding 크기 1MB 제한 초과 리스크**: 매우 긴 상담 대화인 경우, 단일 conversation doc 크기가 1MB를 초과하여 update 실패 | Medium | Low | 대화셋 Import 파서(FR-001)에서 각 turn의 글자수 합을 계산하여 500KB 초과 시 업로드를 경고 모달로 차단하거나 turn을 컴팩트화 처리 | Yes (Admin) |

---

## 7. Stage 8 Validation Handoff
- **Validation Priorities**:
  - `VAL-001`: **Firestore Security Rules Unit Tests**: Firebase Emulator를 기동하여 Evaluator A 계정으로 로그인 후 Evaluator B의 라벨 GET 요청 시 거부되는지(Round 1 blind check) 자동화 검증.
  - `VAL-002`: **Batched Write Transaction Test**: 라벨 저장/삭제 수행 시 에뮬레이터에서 conversations 컬렉션의 카운트 필드가 누락 없이 원자적으로 보증되는지 검증.
  - `VAL-003`: **Audit Log Immobility Test**: 로컬 테스트 계정에서 `audit_logs` 컬렉션의 특정 문서 UPDATE 및 DELETE를 강제 시도하여 Firestore Rules 레벨에서 block 리포트가 발생하는지 검증.

## 8. Human Approval Required
- **릴리즈 순서 승인**: R0(인증/스캐폴딩) -> R1(MVP 코어) -> R2(Post-MVP 고도화) 순서 확인 및 승인.
- **R2 이월 리스크 승인**: 개별 평가자 진척 상세 뷰와 불일치 필터 조회의 MVP(R1) 제외 및 수동 운영(메신저/정렬순서) 우회 방안 승인.
- **Stage 8 handoff 요건 승인**: Emulator 기반 Security rules unit test와 batch write 무결성 테스트 의무화 승인.
