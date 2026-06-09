# 07 Out of Scope

## 1. Purpose
본 문서는 LAMS-v0 시스템의 MVP(R1) 및 전체 릴리즈 계획에서 명시적으로 제외(Non-Scope)되거나 차기 회차로 연기(Deferred)된 요건들을 명세합니다. 이를 통해 개발 후반부의 범위 이탈(Scope Creep)을 사전에 차단하고, 이월에 따른 운영적 대안과 잠재 리스크 관리 방안을 수립합니다.

## 2. Explicit Non-Scope Items
| Non-Scope ID | Item | Related Requirement / Idea | Reason | Reopen Only If | Notes |
|---|---|---|---|---|---|
| **NON-SCOPE-001** | 콜센터 음성 상담 녹음본 오디오 재생 스트리밍 | G-001, G-002 | LAMS-v0는 텍스트 상담 대화의 유해성 판정에 초점을 두므로 오디오 재생은 불필요 | 음성 톤, 발화 노이즈 분석 연구가 추가될 때 | 텍스트 대화 턴(Turn) 정보만 보존 |
| **NON-SCOPE-002** | 웹 브라우저 내 텍스트 자동 비식별화 마스킹 편집 UI | G-001 | 개인정보 유출 원천 차단을 위해 사전 오프라인 비식별화 처리를 강제함 | 오프라인 가공이 불가하여 웹 내 실시간 필터 편집이 필요할 때 | PII 스캔 경고 모달(SEC-003)로만 보완 |
| **NON-SCOPE-003** | 실시간 LLM API 직접 추론 트리거 및 프롬프트 제어 | G-003, ADR-001 | API 비용 및 대기 시간, 서버리스 연동 복잡성 증가 기각 | 동적 실시간 대화 생성 및 동적 탐지 연구가 추가될 때 | 오프라인 LLM 판정 결과 일괄 업로드(FR-005)로 완벽 대체 |
| **NON-SCOPE-004** | 실시간 Kappa 일치율 수학 연산 계산 엔진 | G-003, ADR-001 | 웹 단의 복잡한 연산 및 트랜잭션 락 유발 기각 | 실시간 라벨 입력 중 동적 Kappa 수치 변화 대시보드가 강제 요구될 때 | 외부 산출 통계 지표 일괄 업로드(FR-006)로 완벽 대체 |

## 3. Deferred but Not Rejected Items
| Deferred ID | Item | Deferred To | Reason | Reconsideration Trigger | Risk If Forgotten |
|---|---|---|---|---|---|
| **DEF-001** | 개별 평가자 단위 상세 진척 모니터링 테이블 | **R2** (Post-MVP) | 소규모 평가자 풀(~10명)에서는 전체 aggregate 수치 노출로 충분하다고 가정 | 평가 참여 인원이 20명 이상으로 대폭 확대될 때 | 평가 지연 발생 시 관리자의 수동 DB 체크 공수 증가 |
| **DEF-002** | 의견 불일치 대화 필터링 목록 조회 | **R2** (Post-MVP) | MVP 단계에서는 목록의 상태 정렬 순서 조정으로 충분히 우회 가능 | 목록 내 상담 대화 건수가 200건 이상 적재될 때 | 최종 Adjudicator의 3차 검토 대상을 식별하기 위한 스크롤 피로 유발 |

## 4. Rejected Options to Record
| Rejected Option | Source | Reason Rejected | Must Not Reappear Unless |
|---|---|---|---|
| **중개 Node.js API 서버 구축 (Option B)** | [05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md#L128) | 소규모 인원 환경에서 서버 유지비용 및 통합 오버헤드를 막기 위함 | 동시 접속 사용자가 수백 명 이상으로 확대되어 클라이언트 직접 쿼리가 한계를 보일 때 |
| **turns 대화 턴의 별도 물리 컬렉션 분리** | [06_conceptual_data_model.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/06_data/06_conceptual_data_model.md#L75) | 1회 상세 화면 진입 시 turns subcollection에 대한 과도한 read 쿼리 비용 발생 방지 | 대화 턴 수가 Firestore 단일 doc 크기 제한(1MB)을 안정적으로 초과하는 거대 상담 텍스트가 유입될 때 |

## 5. Scope Creep Watchlist
| Watch Item | Why It May Reappear | How To Handle |
|---|---|---|
| **평가자 주관 설문 수집** | 연구진이 라벨 외에 평가자의 심리적 스트레스 설문을 대화 종료 시 추가하자고 제안할 우려 | 본 시스템은 텍스트 유해 발화 라벨링에 집중하고, 설문조사는 구글 폼 등 외부 툴 연동으로 해결하도록 중재 |
| **다중 연구소 계정 격리 (Multi-tenancy)** | 공동 연구 진행 시 타 대학/연구소 그룹 간 대화 데이터셋 노출 차단 요구가 발생할 우려 | 단일 연구 목적의 소형 프로젝트이므로, 계정 분리는 향후 프로젝트 범위(LAMS-v1)로 공식 상정해 이관 |

## 6. Open Questions Affecting Scope
- *해당 사항 없음.* (Q-105의 R2 이월 및 Q-101의 Could-Have 분류가 완료됨.)

## 7. Human Approval Required
- **Non-scope 항목 승인**: 오디오, 비식별화, 실시간 LLM 및 Kappa 연산의 R1/MVP 범위 완전 제외 승인.
- **이월 항목 승인**: 개별 평가자 모니터링(`DEF-001`) 및 불일치 필터(`DEF-002`)의 R2 이월 승인.
