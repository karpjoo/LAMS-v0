# 07a Scope Inventory

| Requirement ID | Acceptance Criteria IDs | User / Actor | Value | Constraint / Dependency | Security / Privacy Note | Source Artifact | Notes |
|---|---|---|---|---|---|---|---|
| **FR-001** | AC-FR-001-01, AC-FR-001-02 | Admin (ROLE-001) | 대화 데이터셋 일괄 등록 | 외부 비식별화 준수, 스키마 검증 필수 | PII 탐지 스캔 경고(SEC-003) 필수 연동 | 03_requirements.md | JSON 파일 파싱 수행 |
| **FR-002** | AC-FR-002-01 | Admin (ROLE-001) | 잘못 기입된 대화/라벨 일괄 삭제 | 2단계 팝업 텍스트 인터락 통과 필수 | audit_logs 영구 보존(삭제 제외) 보장 | 03_requirements.md | "DELETE ALL DATASET" 검증 |
| **FR-003** | AC-FR-003-01 | Evaluator (ROLE-002), Admin | 대화 목록 조회 및 세부 턴 열람 | bubble chat style 렌더링, scroll 최적화 | 비인가 접근(SEC-001) 및 Round1 독립(BR-007) 가드 | 03_requirements.md | 정렬 순서 `sequence_no` 준수 |
| **FR-004** | AC-FR-004-01, AC-FR-004-02 | Evaluator (ROLE-002) | 유해성 평가 라벨 기록 (Save/Prefill) | Present 시 카테고리/위험수준 필수 입력 | 본인 Uid 영역만 쓰기 권한 격리(SEC-002) | 03_requirements.md | Absent 시 하위 필드 null 처리 |
| **FR-005** | AC-FR-005-01 | Admin (ROLE-001) | 외부 LLM 판정 결과 일괄 업로드 | 기존 `call_id` 매핑 검증, batch 트랜잭션 | 외부 오프라인 처리 전제, PII 경고 스캔 | 03_requirements.md | 모델3개 x 프롬프트3개 키 매핑 |
| **FR-006** | AC-FR-006-01 | Admin (ROLE-001) | 외부 사전 연산 통계 일괄 업로드 | 대시보드 시각화용 단순 필드 적재 | 웹 내 연산 배제, 단순 Key 매핑 | 03_requirements.md | Fleiss' Kappa 및 F1 수치 데이터 |
| **FR-007** | AC-FR-007-01 | Admin, Evaluator | 진행률 및 비교 통계 Dashboard 조회 | Vanilla CSS 차트 및 게이지 바 | 진행률 집계 시 Firestore doc count 최적화 | 03_requirements.md | 전체 대화 건수 대비 라벨 수 집계 |
| **NFR-001** | - | Admin, Evaluator | 데이터 무결성 및 적재 안정성 | Firestore Batched Write 트랜잭션 사용 | 부분 삭제/등록에 따른 비정합성 차단 | 03_requirements.md | All-or-Nothing 쓰기 처리 |
| **NFR-002** | - | All Users | 프리미엄 비주얼 CSS 및 반응형 | Tailwind CSS 배제, Vanilla CSS 100% | Outfit/Inter 폰트, Glassmorphism 효과 | 03_requirements.md | CSS Grid/Flexbox 활용 |
| **NFR-003** | - | All Users | 예외 에러 복원 파싱 | React Error Boundary 및 JSON try-catch | 화이트 스크린 크래시 방어 | 03_requirements.md | 예외 사용자 피드백 안내 |
| **SEC-001** | AC-SEC-001 | All Users | 로그인 세션 및 비인가 차단 | Firebase Auth 연동, Firestore Rules 강제 | 비인가 세션 시 로그인 페이지 리다이렉트 | 03_requirements.md | rules: `request.auth != null` |
| **SEC-002** | AC-FR-004-01 | Evaluator (ROLE-002) | 평가자 라벨 데이터 쓰기 격리 | Firestore Security Rules 강제 | `allow write: if request.auth.uid == userId` | 03_requirements.md | 타 평가자 라벨 데이터 위변조 방지 |
| **SEC-003** | AC-SEC-003 | Admin (ROLE-001) | PII 사전 검증 경고 | 휴대전화번호 정규식 탐지 필터 | 업로드 하드 차단 없이 팝업 경고만 실행 | 03_requirements.md | `010-\d{4}-\d{4}` 정규식 매칭 |
| **SEC-004** | AC-FR-002-01 | Admin (ROLE-001) | 데이터 삭제 방지용 인터락 | 프론트엔드 버튼 비활성화 가드 | "DELETE ALL DATASET" 미입력 시 삭제 차단 | 03_requirements.md | FR-002와 대응 |
| **OPS-001** | AC-FR-002-01 | Admin, Evaluator | 중요 액션 감사 로깅 | Append-only 무수정 무삭제 rules 설정 | `allow update, delete: if false` | 03_requirements.md | 등록, 삭제, 라벨 저장 시점 로깅 |
| **INT-001** | AC-FR-005-01 | Admin (ROLE-001) | 외부 JSON 규격 연동 | JSON 키 스키마 일치 여부 확인 | 미등록 `call_id` 예외 처리 | 03_requirements.md | FR-005, FR-006 파일 포맷 대응 |
