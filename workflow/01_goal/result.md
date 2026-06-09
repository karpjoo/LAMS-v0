# Result: 01 Service Goal Definition

## 1. Task Summary
- **수행 작업**: Stage 1 Service Goal Definition(서비스 목표 정의) 단계를 완료하였습니다.
- **수행 목표**: 콜센터 유해 발화 탐지 연구의 무결성을 확보하고 대화 등록, 전문가/상담원 라벨링 웹 UI 기록, 외부 LLM 판정 및 Kappa 통계 업로드, Dashboard 조회 등의 핵심 목표를 명시적으로 구상하고, 논골(Non-goals)과 MVP 바운더리를 수립하였습니다.

## 2. Inputs Used
| Input | Status | Approval State | Notes |
|---|---|---|---|
| [USER_DIRECTIVES.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/00_intake/USER_DIRECTIVES.md) | Active | Approved | 기술 스택 및 MVP 지향점 참고 |
| [00_project_intake.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/00_intake/00_project_intake.md) | Active | Ready for review | Greenfield 설정 및 외부 연동 원칙 차용 |
| [260528-revised-research-overview.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/docs/research/260528-revised-research-overview.md) | Active | Draft | 7유해 유형, 3종 프롬프트 비교 실험 설계 참고 |

## 3. Outputs Created or Updated
| Artifact | Created / Updated / N/A | Notes |
|---|---|---|
| [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md) | Created | 서비스 목표, 타겟 사용자, 성공 지표, assumptions, open questions 등 수록 |
| [result.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/result.md) | Created | 본 수행 결과 요약 문서 |
| [context_packet.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/context_packet.md) | Updated | Stage 2 Handoff를 위한 컨텍스트 업데이트 |
| [ASSUMPTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/ASSUMPTIONS.md) | Updated | 신규 가정 사항(A-101 ~ A-103) 추가 |
| [OPEN_QUESTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/OPEN_QUESTIONS.md) | Updated | 신규 열린 질문(Q-101 ~ Q-102) 추가 |
| `01_goal_options.md` | N/A | 단일 서비스 목표 방향이 지배적이어서 불필요함 |
| `01_success_metrics.md` | N/A | 성공 기준이 심플하여 01_service_goal.md 내부로 충분함 |
| `01_non_goals.md` | N/A | 비범위 항목이 심플하여 01_service_goal.md 내부로 충분함 |
| `review_notes.md` | N/A | 최초 실행이므로 없음 |

## 4. Key Findings
- **사용자 풀 구체화**: 연구원/관리자, 언어학 전문가, 실제 상담원 등 명확히 분리된 3대 사용자 그룹이 시스템의 핵심 타겟입니다.
- **오프라인 연동성 극대화**: 실시간 연산 및 복잡한 API 연동 부담을 외부로 넘김으로써 LAMS-v0 시스템 자체는 가벼운 CRUD, 일괄 JSON 적재, 그리고 Vanilla CSS 기반의 미려하고 정돈된 대시보드를 안정적으로 제공하는 데에만 주력할 수 있습니다.

## 5. Decision Candidates
- 서비스의 4대 핵심 목표(G-001 ~ G-004) 및 그에 따른 MVP 스코프 승인 요청.
- 외부 오프라인 실행 및 수동 JSON 업로드 방식(옵션 B)을 서비스의 최우선 연동 아키텍처 방향으로 설정.
- 일반 상담원 계정과 언어학 전문가 계정은 동일한 평가 화면을 공유하여 사용하도록 결정.
- 엄격한 처리 속도 한계(10초/1초) 대신 시스템의 기능 안정성(Stability)을 최우선 성공 기준으로 설정.

## 6. Working Assumptions
- **A-101**: 동시 접속자 수 10명 내외의 소규모 인프라 운영 가정.
- **A-102**: JSON 파일 수동 로드를 통한 데이터셋 일괄 등록 가정.
- **A-103**: 대시보드의 배치식 데이터 로딩 및 정적 시각화 연동 가정.

## 7. Open Questions
- **Q-101**: 전문가 합의 라벨(Gold Standard)을 구성하는 다수결(Adjudication) 프로세스를 웹 UI에서 직접 지원해야 하는가, 아니면 단순히 합의된 결과 라벨을 관리자가 직접 등록하는 수준인가요? (미확정 상태)
- **Q-102**: 업로드할 오프라인 LLM 판정 결과(JSON) 및 사전 계산된 통계 지표의 포맷 예시나 스키마가 존재하나요?
- 자세한 내용은 [OPEN_QUESTIONS.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/OPEN_QUESTIONS.md)를 참고하십시오.

## 8. Risks and Constraints
- **R-101**: 외부 비식별화 작업의 불완전성으로 인한 개인정보 유출 위험.
- **R-102**: Firebase configuration key 노출로 인한 악의적 DB 조작 위험.

## 9. Rejected or Superseded Options
- 없음.

## 10. Traceability Updates
- 목표(G-001 ~ G-004)를 초기 문제(Problem), 사용자(Users), 성공 지표(Success Criteria), 가정(Assumptions)과 매핑하는 초기 추적성을 [01_service_goal.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/01_goal/01_service_goal.md) 섹션 12에 기록하였으며, [TRACEABILITY_MATRIX.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/context/TRACEABILITY_MATRIX.md)도 이에 맞춰 추후 업데이트될 예정입니다.

## 11. Human Approval Required
- 서비스 목표(G-001 ~ G-004), 타겟 사용자(연구원/관리자, 언어학자, 상담원), 성공 기준(기능 및 데이터 적재 안정성 최우선), 논골(자동 비식별화 배제, 실시간 Kappa 연산 배제, 실시간 LLM API 호출 배제), 평가 화면 공유 연동에 대한 최종 승인.

## 12. Recommended Next Step
- **Stage 2 - Stakeholder & Risk Framing**으로 이동하여 본 목표에 맞는 구체적인 사용자 역할, 데이터 노출 맵, 그리고 초기 리스크 심사를 실행할 것을 제안합니다.