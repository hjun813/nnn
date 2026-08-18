# ApplyFlow

발견한 채용 공고를 저장하는 데서 끝내지 않고, 준비와 실제 지원 완료까지 연결하는 개인 채용 지원 관리 서비스입니다.

핵심 경험은 `Find → Save → Prepare → Apply`이며, 첫 화면은 공고 목록보다 사용자가 지금 해야 할 행동을 우선해서 보여줍니다.

## 문서

- [제품 기획서](docs/01-product-plan.md)
- [제품 요구사항 명세서](docs/02-prd.md)
- [사용자 흐름 및 화면 명세](docs/03-ux-spec.md)
- [업무 규칙 및 데이터 모델](docs/04-domain-data.md)
- [API 명세](docs/05-api-spec.md)
- [AI 공고 분석 설계](docs/06-ai-analysis.md)
- [개발 계획서](docs/07-development-plan.md)
- [테스트 및 운영 계획](docs/08-test-operations.md)
- [의사결정 기록](docs/09-decisions.md)

## MVP 원칙

1. 수동 등록만으로도 지원 관리의 효용이 있어야 한다.
2. AI는 등록 비용을 줄이지만 저장을 막는 필수 의존성이 아니다.
3. 마감일과 다음 행동이 항상 가장 먼저 보여야 한다.
4. 사용자의 명시적인 확인 없이 AI 결과를 확정하지 않는다.

