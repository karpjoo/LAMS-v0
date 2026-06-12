# LAMS-v0 설치 및 배포 가이드

본 문서는 콜센터 유해 발화 탐지 연구를 위한 다중 평가자 비교 분석 및 합의 지원 시스템인 **LAMS-v0 (LLM & Agentic Multi-evaluator System)**의 로컬 개발 환경 구성 및 프로덕션 배포 방법을 안내합니다.

---

## 1. 사전 요구사항 (Prerequisites)

시스템을 설치하고 실행하기 위해 아래의 소프트웨어들이 필요합니다.

*   **Node.js**: `v18` 이상 설치 권장
*   **Java Runtime Environment (JRE)**: `v11` 이상 설치 필요 (Firebase Local Emulator Suite 구동에 필수)
*   **Firebase CLI**: 글로벌 설치 및 계정 로그인 권한 필요
    ```bash
    npm install -g firebase-tools
    firebase login
    ```
*   **지원 웹 브라우저**: Google Chrome, Safari, Firefox, Microsoft Edge (최신 버전 권장)

---

## 2. 로컬 개발 환경 설정 (Local Development Setup)

### 2.1 의존성 패키지 설치
프로젝트 루트 디렉터리에서 아래 명령어를 통해 필요한 Node.js 패키지들을 설치합니다.
```bash
npm install
```

### 2.2 Firebase 로컬 에뮬레이터 기동
LAMS-v0는 로컬 개발 및 테스트를 위해 서버리스 백엔드를 샌드박스 환경으로 모방하는 Firebase Emulator Suite를 사용합니다.
```bash
npm run dev:emu
```
*   **실행되는 에뮬레이터 구성**:
    *   **Authentication Emulator**: `localhost:9099` (사용자 인증 모킹)
    *   **Firestore Emulator**: `localhost:8080` (실시간 NoSQL 데이터베이스 모킹)
    *   **Emulator UI**: `localhost:4000` (에뮬레이터 상태를 모니터링할 수 있는 대시보드 웹 페이지)
*   *주의: Java Runtime(JRE)이 설치되어 있지 않거나 환경 변수에 등록되지 않은 경우 에뮬레이터가 구동되지 않습니다.*

### 2.3 프론트엔드 개발 서버 실행
새로운 터미널 창을 열고, 프론트엔드 어플리케이션(Vite + React)을 실행합니다.
```bash
npm run dev
```
*   프론트엔드 서버가 기동되면 웹 브라우저에서 [http://localhost:5173](http://localhost:5173)으로 접속할 수 있습니다.
*   `src/firebase.js`에 설정된 감지 로직에 의해 브라우저 주소가 `localhost`이거나 포트가 `5173`일 경우 자동으로 로컬 에뮬레이터 백엔드(9099, 8080 포트)로 연결됩니다.

---

## 3. 자동화 테스트 실행 (Testing)

배포 전 코드 무결성을 검증하기 위해 테스트 스위트를 기동합니다.

*   **전체 유효성 검증 (Unit + Rules + E2E)**:
    ```bash
    npm test
    ```
*   **Firestore 보안 규칙 테스트 (rules-unit-testing)**:
    ```bash
    npm run test:rules
    ```
*   **React 컴포넌트 및 유틸리티 단위 테스트 (Vitest)**:
    ```bash
    npm run test:unit
    ```
*   **E2E 통합 기능 테스트 (Playwright)**:
    ```bash
    npm run test:e2e
    ```

---

## 4. 프로덕션 배포 가이드 (Production Deployment)

LAMS-v0을 프로덕션 Firebase 환경에 배포하는 전체 단계입니다.

### 4.1 Firebase 프로젝트 준비
1. [Firebase Console](https://console.firebase.google.com/)에 접속하여 신규 프로젝트를 생성합니다.
2. 아래 서비스들을 활성화합니다.
    *   **Authentication**: Email/Password 방식 또는 Google 로그인 방식을 활성화합니다.
    *   **Cloud Firestore**: 프로덕션 모드 또는 테스트 모드로 데이터베이스를 초기 기동합니다.
    *   **Hosting**: 호스팅 서비스를 시작합니다.

### 4.2 Firebase 프로젝트 연동 및 설정
1. 로컬 코드에서 배포 타겟 프로젝트를 지정합니다.
    ```bash
    firebase use <your-firebase-project-id>
    ```
2. 필요시 [src/firebase.js](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/src/firebase.js) 파일의 `firebaseConfig` 객체 상수를 Firebase 콘솔에서 발급받은 프로덕션 설정 키 값으로 업데이트합니다.
   *(참고: 에뮬레이터 감지 로직 `isLocalhost`가 내장되어 있어 설정 값만 변경해 두어도 로컬 접속 시에는 로컬 에뮬레이터로 안전하게 동작합니다.)*

### 4.3 데이터베이스 규칙 및 인덱스 배포
보안 경계 및 쿼리 최적화를 위한 룰 파일을 Firestore 백엔드에 배포합니다.
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 4.4 프론트엔드 빌드 및 배포
1. 배포용 정적 애셋 빌드를 수행합니다. 이 작업은 루트 경로에 `/dist` 폴더를 생성합니다.
    ```bash
    npm run build
    ```
2. 빌드된 결과물을 Firebase Hosting에 배포합니다.
    ```bash
    firebase deploy --only hosting
    ```
3. 콘솔에 출력되는 호스팅 도메인 주소(예: `https://<your-project>.web.app`)로 정상 접속이 되는지 확인합니다.

---

## 5. 운영 관리 설정 (Operations)

### 5.1 사용자 역할 및 권한 구성
Firebase Authentication에 가입한 계정은 기본적으로 권한이 할당되지 않아 워크스페이스나 대시보드에 접근할 수 없습니다. 시스템 관리자가 **Firebase Console > Firestore 데이터베이스**에 직접 접근하여 사용자 권한 도큐먼트를 수동으로 생성해주어야 합니다.

*   **경로**: `/users/{User_UID}`
*   **필드 값**:
    *   `role`: `Admin` 또는 `Evaluator` (문자열)
    *   `is_adjudicator`: `true` 또는 `false` (불리언, `Adjudicator` 역할 여부)
    *   `email`: 가입된 이메일 주소 (문자열)

> [!NOTE]
> `User_UID`는 Firebase Console의 Authentication 탭에서 각 사용자별 고유 식별자(UID)를 복사하여 입력해야 합니다.

---

## 6. 장애 처리 및 롤백 (Troubleshooting & Rollback)

### 6.1 흔히 발생하는 문제와 해결 방안

*   **문제: 로그인 후 Workspace 접근 시 빈 화면이 나타나거나 권한 부족 오류가 뜹니다.**
    *   *해결*: Firestore에 생성된 `/users/{User_UID}` 문서 정보가 누락되었거나 필드 값 철자(`role`, `is_adjudicator`)가 올바른지 확인하십시오.
*   **문제: 어드민 대시보드에서 정렬을 시도하거나 대화 데이터를 정렬해 가져올 때 조회가 실패합니다.**
    *   *해결*: Firestore의 복합 인덱스(Compound Index)가 설정되지 않아 발생하는 문제입니다. `firebase deploy --only firestore:indexes` 명령어를 수행했는지 확인하십시오.
*   **문제: 외부 방화벽으로 인해 Firebase DB 통신이 실패합니다.**
    *   *해결*: 브라우저 개발자 도구(F12) 콘솔 탭에서 네트워크 요청 상태를 확인하고, `firestore.googleapis.com` 및 `identitytoolkit.googleapis.com` 도메인이 사내망 등에서 차단되어 있는지 확인하십시오.

### 6.2 롤백 및 복구 절차

*   **프론트엔드 롤백**:
    1.  Firebase Console 접속 > **Hosting** 메뉴 이동.
    2.  **출시 내역(Release History)** 섹션에서 복구하고자 하는 이전 버전의 우측 점 3개 메뉴를 누르고 **롤백(Rollback)**을 실행합니다.
*   **데이터베이스 보안 규칙 롤백**:
    1.  Git 저장소를 통해 이전 보안 규칙(`firestore.rules`)을 체크아웃합니다.
        ```bash
        git checkout HEAD~1 firestore.rules
        ```
    2.  이후 다시 CLI 배포를 실행합니다.
        ```bash
        firebase deploy --only firestore:rules
        ```
*   **데이터베이스 완전 초기화 및 복구**:
    *   데이터 유출 우려 또는 심각한 데이터 손상이 발생한 경우 Admin 대시보드(`/admin`)의 데이터셋 리셋 기능을 수행한 후, 암호화 보관 처리된 비식별 데이터셋 원본 파일을 다시 순차적으로 업로드하여 복원하십시오.
