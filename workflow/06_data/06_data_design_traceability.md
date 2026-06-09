# 06 Data Design Traceability

## 1. Traceability Scope
본 문서는 LAMS-v0 시스템의 데이터 설계 단계에서 도출된 개념적 데이터 오브젝트, 물리적 컬렉션 스키마, 쿼리 패턴, 보안 규칙 및 마이그레이션 계획이 이전 단계(요구사항, 인수 조건, 도메인 규칙 및 아키텍처 API)들과 누락 없이 상호 추적(Traceability)되는지 검증하고 연계성을 정의합니다.

---

## 2. Requirement to Data Object Links
| Requirement ID | Requirement Name | Related Conceptual Data Object | Supporting Physical Collection / Document |
|---|---|---|---|
| **FR-001** | 대화 데이터셋 파일 일괄 등록 | DATA-OBJ-001 (Conversation)<br>DATA-OBJ-002 (Turn) | `/conversations/{call_id}` (PHY-002) |
| **FR-002** | 대화 데이터셋 일괄 삭제 | DATA-OBJ-001, DATA-OBJ-003 (Label)<br>DATA-OBJ-005 (Gold Standard)<br>DATA-OBJ-008 (Stats) | conversations, labels, gold_standard, dashboard (Cascade Delete) |
| **FR-003** | 대화 목록 조회 및 세부 대화 열람 | DATA-OBJ-001, DATA-OBJ-002 | `/conversations` 및 turns 배열 (PHY-002) |
| **FR-004** | 평가자 유해성 판정 기록 | DATA-OBJ-003 (Label) | `/conversations/{call_id}/labels` (PHY-003) |
| **FR-005** | 외부 LLM 판정 결과 업로드 | DATA-OBJ-004 (LLM Decision) | `/conversations/{call_id}/llm_results` (PHY-004) |
| **FR-006** | 외부 통계 지표 일괄 업로드 | DATA-OBJ-008 (Dashboard Stats) | `/dashboard/statistics` (PHY-007) |
| **FR-007** | 대시보드 표시 | DATA-OBJ-001, DATA-OBJ-008 | conversations 및 dashboard 통계 문서 |
| **SEC-001** | 로그인 세션 및 접근 차단 | DATA-OBJ-007 (User Profile) | `/users/{uid}` (PHY-001) |
| **SEC-002** | 평가자 라벨 데이터 쓰기 격리 | DATA-OBJ-003 | labels 서브컬렉션 |
| **SEC-003** | 비식별화 사전 검증 경고 | client-side temporary state | 없음 (비저장성 데이터) |
| **SEC-004** | 삭제 오작동 방지 인터락 | client-side temporary confirmText | 없음 (비저장성 데이터) |
| **OPS-001** | 감사 로깅 | DATA-OBJ-006 (Audit Log) | `/audit_logs/{log_id}` (PHY-006) |
| **INT-001** | 외부 JSON 임포트 규격 연동 | DATA-OBJ-004, DATA-OBJ-008 | llm_results 및 dashboard statistics 문서 |

---

## 3. Acceptance Criteria to Query Pattern Links
| Acceptance Criteria ID | Acceptance Criteria Summary | Supporting Query Pattern ID | Query Operation Details |
|---|---|---|---|
| **AC-FR-001-01** | JSON 대화 데이터셋 업로드 성공 | `QP-001`<br>`QP-002` | 업로드 후 대화 목록 필터 조회 및 상세 렌더링 검증 지원 |
| **AC-FR-001-02** | 잘못된 JSON 업로드 거부 | 없음 | 파서 단 에러 차단으로 쿼리 불필요 |
| **AC-FR-002-01** | 대화 데이터셋 전체 삭제 | `QP-001` | 삭제 트랜잭션 성공 후 목록 조회 시 0건 반환 확인 |
| **AC-FR-003-01** | 대화 목록 조회 및 턴 렌더링 | `QP-001`<br>`QP-002` | status별 목록 로드 및 call_id별 상세 turns 로드 |
| **AC-FR-004-01** | 평가자 유해성 판정 최초 저장 | `QP-003` | 로그인 유저 UID labels 서브컬렉션 문서 쓰기 및 조회 |
| **AC-FR-004-02** | 기존 평가 대화 자동 프리필 | `QP-003` | `{user_id}_{round_no}` 문서 ID 직접 GET 및 폼 주입 |
| **AC-FR-005-01** | LLM 판정 결과 일괄 업로드 | `QP-002` | 상세 화면 로드 시 llm_results/verdict 동시 로드 검증 |
| **AC-FR-006-01** | 외부 사전 계산 통계 업로드 | `QP-008` | 대시보드 statistics 단일 도큐먼트 로드 |
| **AC-FR-007-01** | 진척률 및 Kappa 테이블 표시 | `QP-001`<br>`QP-008` | 전체 대화 진행률 집계 쿼리 및 통계 문서 로드 |
| **AC-SEC-001** | 미인증 게스트 접근 차단 | `QP-007` | 세션 유효성 판정 및 사용자 권한 프로필 조회 |
| **AC-SEC-003** | PII 감지 경고 모달 노출 | 없음 | 클라이언트 텍스트 파싱 수준 검증 |

---

## 4. Domain Concept / Aggregate to Data Object Links
| Domain Concept ID | Concept / Aggregate Name | Supporting Conceptual Object | Supporting Physical Collection / Path |
|---|---|---|---|
| **DC-001** | Conversation (상담 대화) | DATA-OBJ-001 | `/conversations/{call_id}` |
| **DC-002** | Turn (대화 턴) | DATA-OBJ-002 | turns array inside conversations |
| **DC-003** | Label (평가 라벨) | DATA-OBJ-003 | `/conversations/{call_id}/labels/{userId_roundNo}` |
| **DC-004** | LLM Decision (LLM 판정) | DATA-OBJ-004 | `/conversations/{call_id}/llm_results/verdict` |
| **DC-006** | Audit Log (감사 로그) | DATA-OBJ-006 | `/audit_logs/{log_id}` |
| **DC-007** | Gold Standard Label (합의 정답) | DATA-OBJ-005 | `/conversations/{call_id}/gold_standard/verdict` |
| **AGG-001** | Conversation Aggregate Root | DATA-OBJ-001<br>DATA-OBJ-005 | conversations 컬렉션 및 nested subcollections |
| **AGG-002** | Label Aggregate Root | DATA-OBJ-003 | labels 서브컬렉션 |
| **AGG-003** | Audit Log Aggregate Root | DATA-OBJ-006 | audit_logs 컬렉션 |

---

## 5. Architecture Module / API to Data Object Links
| API ID | Operation Name | Related Module | Directly Accessed Data Object | Transaction / Consistency Enforcement |
|---|---|---|---|---|
| **API-001** | Fetch Bounded Conversations | MOD-002 | DATA-OBJ-001 | Read Query |
| **API-002** | Fetch Conversation Details | MOD-002 | DATA-OBJ-001, DATA-OBJ-002, DATA-OBJ-004 | Document read lookup |
| **API-003** | Save Evaluator Label | MOD-002 | DATA-OBJ-003, DATA-OBJ-001 | **Batched Write**: Save label + Update completion count + status state checking + Audit log create |
| **API-004** | Save Adjudicator Label | MOD-003 | DATA-OBJ-005, DATA-OBJ-001 | **Batched Write**: Create gold_standard + Lock status to 'Consensus Reached' + Audit log create |
| **API-005** | Ingest Dataset | MOD-001 | DATA-OBJ-001, DATA-OBJ-002 | Bulk Batch writes (500 items per batch) |
| **API-006** | Clear All Datasets | MOD-001 | DATA-OBJ-001, DATA-OBJ-003, DATA-OBJ-005, DATA-OBJ-008 | Bulk Delete batches + Create purge audit log document |

---

## 6. Data Object to Security Rule Links
| Conceptual Data Object | Physical Storage Path | Supporting Security Rule ID | Key Database Rule Condition Enforced |
|---|---|---|---|
| **DATA-OBJ-001** (Conversation) | `/conversations/{callId}` | `DSR-001` | Read: authenticated / Write: Admin only |
| **DATA-OBJ-003** (Label) | `/conversations/{callId}/labels/{labelId}` | `DSR-002` | Write: `request.auth.uid == userId` & status not Consensus Reached<br>Read: Round 1 blind check (`round_no == 2` or `user_id == uid`) |
| **DATA-OBJ-005** (Gold Standard) | `/conversations/{callId}/gold_standard/{docId}` | `DSR-003` | Write: `is_adjudicator == true` only / Read: authenticated |
| **DATA-OBJ-006** (Audit Log) | `/audit_logs/{logId}` | `DSR-004` | Write: authenticated (`create` only)<br>Read: Admin only / Update, Delete: forbidden (`false`) |
| **DATA-OBJ-007** (User Profile) | `/users/{userId}` | `DSR-005` | Read: authenticated<br>Write: Admin only (Create/Update/Delete) |
| **DATA-OBJ-008** (Dashboard Stats) | `/dashboard/statistics` | `DSR-006` | Read: authenticated / Write: Admin only |

---

## 7. Data Object to Migration Item Links
| Conceptual Data Object | Migration/Seed Item ID | Migration / Ingestion Method | Validation / Conflict Safeguard |
|---|---|---|---|
| **DATA-OBJ-001** (Conversation) | `MIG-001` | Admin bulk upload JSON | JSON Schema validation + PII warning trigger + call_id duplicate overwrite protection |
| **DATA-OBJ-004** (LLM Decision) | `MIG-002` | Admin upload LLM JSON | Pre-lookup parent call_id in database. Reject if unregistered call_id is found |
| **DATA-OBJ-008** (Dashboard Stats) | `MIG-003` | Admin upload stats JSON | Overwrite dashboard single statistics document |
| **DATA-OBJ-007** (User Profile) | `MIG-004` | Initial User Provisioning | Seed profiles matching Authentication accounts on emulator initialization |

---

## 8. Traceability Gaps
- **분석 결과**: LAMS-v0의 모든 요구사항(FR, SEC, OPS), 인수 기준(AC), 비즈니스 규칙(BR/INV), 모듈 및 API 계약은 Stage 6 데이터 설계 요소들과 빈틈없이 매칭되었으며, 식별된 미추적(Gap) 요소는 존재하지 않습니다.

---

## 9. Traceability Updates Needed in /workflow/context/TRACEABILITY_MATRIX.md
- **수정 명세**: Stage 6 산출물이 최종 승인되는 시점에, 통합 [TRACEABILITY_MATRIX.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/TRACEABILITY_MATRIX.md) 문서의 데이터 탭 영역을 본 명세서의 내용과 일치하도록 갱신 및 동기화해야 합니다.
