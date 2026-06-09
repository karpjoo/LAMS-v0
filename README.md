# LAMS-v0 (LLM & Agentic Multi-evaluator System)

LAMS-v0는 콜센터 유해 발화 탐지 연구를 위해 개발된 **다중 평가자(Human, LLM) 비교 분석 및 합의 지원 도구**입니다.
React 기반의 프론트엔드와 Firebase(Auth, Firestore, Hosting) Classic Serverless 아키텍처로 구현되어 있으며, 평가자 간의 신뢰도 통계 시각화 및 3단계 평가 라벨 합의(Consensus) 프로세스를 지원합니다.

---

## 1. 역할별 시스템 사용 가이드 (User Guide)

### 🧑‍💼 관리자 (Admin) 가이드
관리자는 시스템 데이터 관리 및 평가 프로세스 제어를 담당합니다.
1. **데이터셋 업로드 (CSV/JSON)**
   - 관리자 페이지(`http://localhost:5173/admin`)로 이동합니다.
   - 외부에서 사전 비식별화(Anonymization) 처리된 대화 텍스트 데이터셋을 업로드합니다.
   - 업로드 전 **PII Warning 스캔**이 수행되며, 실명/전화번호 등 개인정보 패턴 검출 시 경고 팝업이 노출됩니다.
2. **외부 LLM 예측 결과 및 통계 업로드**
   - 모델 판정 결과 JSON 파일과 외부 통계 엔진에서 사전 계산된 Kappa 합의도 통계 데이터를 업로드하여 데이터베이스를 갱신합니다.
3. **데이터베이스 초기화 (Reset)**
   - 필요 시 시스템 전체 데이터를 영구 삭제할 수 있습니다. 오동작 방지를 위해 `"DELETE ALL DATASET"` 텍스트를 정확하게 직접 타이핑해야만 삭제 버튼이 활성화됩니다.

### 📝 평가자 (Evaluator) 가이드
평가자는 대화 내용을 검토하고 유해성 라벨을 등록합니다.
1. **대화 데이터 선택 및 검토**
   - 로그인 후 평가 워크스페이스(`http://localhost:5173/workspace`)로 이동합니다.
   - 좌측 사이드바에서 할당된 `call_id` 대화 목록을 선택합니다.
   - 타임라인 형식으로 정렬된 상담사-고객 간 대화 턴을 검토합니다.
2. **평가 제출 (Round 1 & 2)**
   - 평가 입력 폼에서 대화의 **유해성 카테고리**(폭언, 성희롱, 협박 등), **위험 레벨**(Low, Medium, High)을 선택하고 **핵심 증거 텍스트**(Excerpt)를 추출하여 입력합니다.
   - 제출 후 라벨은 즉시 저장되며, 진행 중인 라벨 정보는 Firestore Security Rules에 의해 다른 평가자에게 노출되지 않도록 격리됩니다.

### ⚖️ 합의조정자 (Adjudicator) 가이드
합의조정자는 평가자 간 의견 불일치가 발생한 대화에 대해 최종 판정을 내립니다.
1. **의견 불일치 및 갈등 해결 (Round 3)**
   - 1, 2차 평가 결과가 일치하지 않는 대화 데이터는 자동으로 `Conflict` 상태로 전환됩니다.
   - 합의조정자 권한(`is_adjudicator: true`)을 가진 사용자는 워크스페이스에서 불일치 내역(평가자별 입력값 및 증거 비교)을 조회하고, 최종 조율 라벨(Gold Standard)을 등록합니다.

---

## 2. 개발자 및 환경 설정 가이드 (Developer Setup)

로컬 개발 환경 구축 및 테스트 검증을 위한 가이드라인입니다.

### 📋 사전 준비 사항
- **Node.js**: v18 이상 설치 필요
- **Java Runtime (JRE)**: v11 이상 필요 (Firebase Local Emulator 구동용)
- **Firebase CLI**: 글로벌 설치 및 로그인 권한 필요
  ```bash
  npm install -g firebase-tools
  firebase login
  ```

### 🚀 로컬 환경 기동
1. **의존성 설치**
   ```bash
   npm install
   ```
2. **Firebase 에뮬레이터 초기 설정 및 기동**
   - 로컬 샌드박스 환경(Port 8080 - Firestore, Port 9099 - Auth)을 기동합니다.
   ```bash
   npm run dev:emu
   ```
3. **Frontend Vite 서버 실행**
   - 별도 터미널에서 아래 명령을 실행하여 개발 웹 페이지를 엽니다.
   ```bash
   npm run dev
   ```
   - 브라우저에서 `http://localhost:5173`으로 접속합니다.

### 🧪 자동화 검증 및 테스트 실행
시스템 배포 또는 수정 시 무결성 보장을 위해 100% 테스트 통과를 보장해야 합니다.
- **전체 유효성 검사**: `npm test`
- **Firestore 보안 규칙 테스트 (rules-unit-testing)**:
  ```bash
  npm run test:rules
  ```
- **React 컴포넌트 & 유틸리티 단위 테스트 (Vitest)**:
  ```bash
  npm run test:unit
  ```
- **E2E 통합 기능 테스트 (Playwright)**:
  ```bash
  npm run test:e2e
  ```

---

## 3. 운영 및 아키텍처 상세 (Operations & Architecture)

- **상세 아키텍처 설계**: [05_architecture_plan.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/05_architecture/05_architecture_plan.md)
- **보안 및 개인정보 보호 규칙**: [12_security_privacy_review.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/12_review_release_handoff/12_security_privacy_review.md)
- **운영 런북 및 장애 조치 가이드**: [12_operations_runbook.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/12_review_release_handoff/12_operations_runbook.md)
