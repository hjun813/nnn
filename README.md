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

## 개발 시작하기

요구 환경은 Node.js 24와 npm 11 이상입니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 현재는 Sprint 0 Dashboard preview와 프레임워크에 독립적인 핵심 도메인 규칙이 구현되어 있습니다.

## 품질 검사

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`.env.example`을 복사해 `.env.local`을 만들고 PostgreSQL 연결 문자열과 인증 secret을 설정합니다. 로컬 비밀값 파일은 커밋하지 않습니다.

```bash
npm run db:up
npm run db:generate
npm run db:migrate
```

Docker Compose는 `postgres:17-alpine`을 `localhost:5432`에 실행하고 named volume에 데이터를 보존합니다. 종료는 `npm run db:down`, 로그 확인은 `npm run db:logs`를 사용합니다.

Drizzle migration 적용 후 `/register`에서 계정을 만들 수 있습니다. 비밀번호는 bcrypt로 해시되며 Dashboard는 로그인한 사용자의 공고만 조회합니다.

## API 문서

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI 3.1 JSON: `http://localhost:3000/api/openapi`

Swagger UI의 인증 API는 로그인 후 생성된 Auth.js 세션 쿠키를 사용합니다. 현재 공고·상태·제출물 CRUD 계약을 문서화합니다.
