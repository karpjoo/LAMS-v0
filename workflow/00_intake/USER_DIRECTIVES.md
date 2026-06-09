# User Directives (Project-Specific)

## Background Research Plan

- `file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md`

## Project Summary

아래 서비스를 제공하는 시스템을 개발한다.
- 콜센터 상담대화를 여러 방법(상담원, 언어학 전문가, LLM)으로 유해발화를 탐지하고, 탐지 결과를 비교 평가
- 상담대화: 실제 업무에서 수집된 *현실 데이터*와 다양한 상황과 조건에 따라 인공적으로 만들어진 *합성데이터*
- 상담대화를 간편하게 등록하고 관리할 수 있는 서비스 제공
- 웹 기반 UI를 사용해서 간편하게 상담대화를 읽고 탐지 결과를 기록할 수 있는 서비스 제공
- 현재 작업 상황을 보여주는 Dashboard 서비스 제공

## Project Profile

- origin: greenfield
- intent: research

## Technology Stack

- frontend: React
- backend: Firebase
- database: Firebase

## Preferences

- Keep MVP scope small
- Avoid unnecessary enterprise architecture.

## Clarifications / Constraints

- **Dashboard**: 실시간 모니터링 및 시각화보다는 현재의 수동 작업 진행 상황 및 평가 통계를 보여주는 대시보드 서비스를 구축한다.
- **LLM Evaluation**: LLM 분석 파이프라인(실행)은 본 웹 애플리케이션 내부가 아닌 외부의 별도 시스템에서 독립적으로 오프라인 수행하며, 생성된 판정 결과 JSON 파일을 업로드하여 사용한다 (옵션 B).
- **De-identification**: 실제 상담 대화의 개인정보 비식별화 작업은 외부의 별도 작업으로 수행하며, 시스템에는 비식별화가 완료된 파일만 업로드한다.
- **AI / Data Analytics**: Kappa 합의도 등의 정밀 통계 연산은 외부 별도 시스템을 이용해 계산하며, 본 시스템은 그 결과 통계를 업로드받아 표시하는 데 집중한다.