# 08 Manual Test Plan

## 1. Status
- Draft

## 2. Manual Test Scope
본 문서는 테스트 자동화가 비효율적이거나 불가능하여 인간 개발자 또는 QA 담당자가 웹 브라우저 상에서 직접 시각적 및 기능적 유효성을 수동 검수해야 하는 테스트 시나리오를 정의합니다.

특히 **Vanilla CSS 비주얼 프리미엄 디자인(NFR-002)** 및 **2단계 안전 삭제 인터락(SEC-004)** 의 유저 인터랙션 검증에 우선순위를 둡니다.

## 3. Manual Test Case Inventory

| Manual Test ID | Requirement ID | Role | Preconditions | Steps | Expected Result | Evidence to Capture | Pass/Fail Criteria | Notes |
|---|---|---|---|---|---|---|---|---|
| **MAN-001** | NFR-002 | All | 로컬 서버 실행 상태 | 1. Chrome 브라우저에서 메인 평가/대시보드 페이지 로드.<br>2. 개발자 도구(F12) 디바이스 툴바 활성화.<br>3. 뷰포트를 모바일(375px), 태블릿(768px), 데스크톱(1440px)으로 조절하며 레이아웃 관찰. | 화면 깨짐, 글씨 겹침, 스크롤 유실이 발생하지 않으며 Glassmorphism 반투명 효과가 미려하게 렌더링되어야 함. | 각 뷰포트 크기별 스크린샷 덤프 | Pass: 미려한 비주얼 정렬 및 반응형 동작 확인.<br>Fail: 레이아웃 붕괴 또는 텍스트 잘림. | UX 비주얼 우수성 승인 항목 |
| **MAN-002** | SEC-004, FR-002 | ROLE-001 (Admin) | 관리자 로그인, DB에 데이터 적재됨 | 1. 관리자 메뉴의 [전체 삭제] 클릭.<br>2. 문구 입력창에 "DELETE" 또는 오타를 입력하며 [확인] 버튼 상태 확인.<br>3. "DELETE ALL DATASET"을 정확히 입력 후 버튼 상태 확인. | 2단계: 오타 입력 시 [확인] 버튼 비활성화(Disabled) 상태 유지.<br>3단계: 문구 일치 시 버튼 즉각 활성화. | 버튼 disabled 전/후 스크린샷 | Pass: 인터락 작동 및 승인 버튼 가드 성공.<br>Fail: 오타 입력 시에도 삭제가 활성화되거나 삭제 실패. | 오작동 방지 검수 |
| **MAN-003** | FR-007 | ROLE-002 / ROLE-001 | 대화셋 적재 및 평가가 일부 진행된 상태 | 1. 대시보드 메뉴로 이동.<br>2. 상단 나의 진척률 게이지 바 렌더링 확인.<br>3. 하단 Fleiss' Kappa 비교 분석 차트 및 표 렌더링 확인. | 진척률 바가 차오른 그래픽으로 시각화되어 보이고, Kappa 표가 Vanilla CSS 스타일로 정돈되어 나타남. | 대시보드 화면 캡처 | Pass: 시각 차트 및 게이지 바가 정상 렌더링됨.<br>Fail: 데이터가 있음에도 공란이거나 로딩 중 멈춤. | |
| **MAN-004** | SEC-003 | ROLE-001 (Admin) | 관리자 로그인 상태, PII 포함 파일 준비 | 1. `dataset_pii_dirty.json` 업로드 시도.<br>2. 경고 팝업이 노출될 때 [취소] 클릭.<br>3. 다시 시도하여 경고 팝업 노출 시 [진행 확인] 클릭. | [취소] 시 DB 반영 안 됨. [진행 확인] 시에만 업로드 진행 및 데이터 저장 완료. | 경고 팝업 화면 캡처 및 DB 건수 확인 | Pass: 경고 가드 분기 작동 및 취소 시 롤백 보증.<br>Fail: 취소 시에도 데이터가 적재되거나 경고 팝업 미노출. | |

## 4. Critical User Journeys
- **Evaluator 평가 여정 수동 샌드박스**:
  1. 로그인 -> 대화 목록 확인 -> 1번째 대화 클릭 -> Turns 말풍선 검토 -> 우측 폼 입력 제출 -> 목록으로 자동 복귀 및 진척도 게이지 바 갱신 수동 관찰.

## 5. Admin / Operator Journeys
- **관리자 데이터셋 라이프사이클 여정**:
  1. 로그인 -> 데이터셋 JSON 업로드 -> 대시보드 확인 -> LLM 결과 업로드 -> 통계 데이터 업로드 -> 데이터셋 전체 삭제 문구 인터락 가드 작동 수동 확인.

## 6. Error, Empty, and Edge States
- **Empty State**: DB에 대화 데이터가 아무것도 없는 최초 기동 상태에서 목록 화면에 "등록된 대화셋이 없습니다. 관리자에게 문의하세요"라는 세련된 안내 문구가 가독성 있게 노출되는지 검수.
- **Error Boundary**: JSON 파싱 오류 파일을 강제로 주입했을 때 화이트 스크린 크래시 없이 "파일 구조가 올바르지 않습니다"라는 경고 메시지가 화면 레이아웃을 해치지 않고 렌더링되는지 확인.

## 7. Security / Privacy Manual Checks
- **직접 URL 치트 시도**: 로그인되지 않은 일반 사크릿 탭 브라우저에서 `/admin` 및 `/evaluate` URL로 직접 진입하여 0.5초 이내에 강제 redirect 처리가 일어나는지 반응 시간 체감 검수.

## 8. Cross-Browser / Device / Environment Checks
- 데스크톱 Chrome, Safari, Edge 브라우저에서의 Vanilla CSS 스타일링 호환성 교차 확인.

## 9. Manual Tests Deferred or Not Applicable
- 모바일 플랫폼 전용 앱(Native App) 검증: LAMS-v0는 반응형 웹 브라우저 기반이므로 Native API 검증 등은 **Not Applicable** 처리함.
