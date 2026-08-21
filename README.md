# ApplyFlow

발견한 채용 공고를 저장하는 데서 끝내지 않고, 준비와 실제 지원까지 연결하는 개인 채용 지원 관리 서비스입니다.

```text
Find → Save → Prepare → Apply
```

현재 MVP는 사용자가 공고 정보를 직접 등록하는 방식입니다. AI URL 분석은 MVP 이후에도 기존 저장 계약을 그대로 재사용할 수 있도록 별도 확장 기능으로 분리했습니다.

## 주요 기능

- 이메일 회원가입·로그인과 사용자별 데이터 격리
- 채용 공고 직접 등록·조회·수정·삭제
- 실제 마감일과 개인 목표일 관리
- Saved / In Progress / Applied / Expired / Archived 상태
- 이력서·포트폴리오·자기소개서 및 사용자 정의 작업
- Todo / In Progress / Done / Not Required 작업 상태
- 마감일과 준비 상태에 따른 오늘의 다음 행동
- D-7 / D-3 / D-1 인앱 알림
- 공고 보관·복원과 계정 전체 데이터 삭제
- OpenAPI 3.1 및 Swagger UI
- PostgreSQL healthcheck와 자동 migration

## 기술 스택

| 영역 | 기술 |
|---|---|
| Web | Next.js 16, React 19, TypeScript |
| Database | PostgreSQL 17, Drizzle ORM |
| Authentication | Auth.js Credentials, bcrypt, JWT session |
| Validation | Zod |
| API 문서 | OpenAPI 3.1, Swagger UI |
| Test | Vitest, Playwright |
| Runtime | Docker, Docker Compose |
| CI | GitHub Actions |

## 빠른 시작: 전체 Docker 실행

요구 환경:

- Docker Desktop 또는 Docker Engine
- Docker Compose v2

환경변수 파일을 준비합니다.

```powershell
Copy-Item .env.example .env
```

macOS 또는 Linux:

```bash
cp .env.example .env
```

`.env`에서 다음 secret을 개발 환경에 맞게 변경합니다.

```env
POSTGRES_PASSWORD=change-this-database-password
AUTH_SECRET=change-this-long-random-auth-secret
CRON_SECRET=change-this-separate-cron-secret
APP_PORT=3000
```

전체 스택을 실행합니다.

```bash
npm run docker:up
```

Compose 실행 순서:

```text
PostgreSQL 시작
→ DB healthcheck 통과
→ Drizzle migration 실행
→ Next.js app 시작
→ /api/health 검사
```

접속 주소:

- 서비스: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api/openapi`
- Healthcheck: `http://localhost:3000/api/health`

### Docker 관리 명령

```bash
npm run docker:ps       # 컨테이너 상태
npm run docker:logs     # 앱과 DB 로그
npm run docker:down     # 전체 스택 종료
```

`docker:down`은 컨테이너만 종료하며 DB 데이터는 `applyflow-postgres-data` named volume에 유지됩니다.

데이터까지 초기화하려면 삭제 대상을 확인한 후 다음 명령을 직접 실행합니다.

```bash
docker compose down --volumes
```

## 로컬 개발 실행

Node.js 24와 npm 11 이상이 필요합니다.

```bash
npm install
npm run db:up
npm run db:migrate
npm run dev
```

이 방식에서는 PostgreSQL만 Docker로 실행하고 Next.js 개발 서버는 호스트에서 실행합니다. `.env.local`의 `DATABASE_URL`은 다음 형태를 사용합니다.

```env
DATABASE_URL=postgresql://applyflow:applyflow@localhost:5432/applyflow
AUTH_URL=http://localhost:3000
```

종료:

```bash
# 실행 중인 npm run dev에서 Ctrl+C
npm run db:down
```

## 주요 사용자 흐름

```text
회원가입
→ Dashboard
→ 공고 직접 등록
→ 제출 작업 준비
→ In Progress
→ 외부 채용 사이트에서 지원
→ 지원 완료 처리
→ Applied
```

마감된 미지원 공고는 예약 작업을 통해 Expired로 변경됩니다.

## 예약 작업

내부 작업 API는 `CRON_SECRET`으로 보호됩니다.

### 마감 공고 처리

```http
POST /api/internal/expire
Authorization: Bearer <CRON_SECRET>
```

### 마감 알림 생성

```http
POST /api/internal/notifications
Authorization: Bearer <CRON_SECRET>
```

배포 환경에서 두 API를 하루 한 번 이상 호출하도록 cron 또는 scheduler를 연결해야 합니다. 두 작업 모두 반복 호출에 안전하도록 구성되어 있습니다.

## 테스트와 품질 검사

```bash
npm run typecheck      # TypeScript
npm run lint           # ESLint
npm test               # Vitest 단위 테스트
npm run build          # production standalone 빌드
npm run test:e2e       # 실행 중인 전체 스택 대상 Playwright
```

Playwright E2E는 다음 흐름을 검증합니다.

```text
회원가입
→ 공고 직접 등록
→ 제출물 완료
→ 준비 시작
→ 지원 완료
→ 계정과 데이터 삭제
```

`master` push와 pull request에서는 GitHub Actions가 품질 검사와 Docker 기반 E2E를 실행합니다.

## 평가용 배포

평가용 운영 구조는 Next.js 화면·API·인증을 Vercel에 배포하고 PostgreSQL을 Render에 두는 방식입니다.

```text
Browser → Vercel (Next.js + API + Auth.js) → Render PostgreSQL
```

배포 전에 Render의 외부 connection pool URL, `AUTH_SECRET`, production `AUTH_URL`, `CRON_SECRET`을 Vercel 환경변수로 등록합니다. 환경변수 형식은 다음 명령으로 검사할 수 있습니다.

```bash
npm run deploy:check
```

Vercel Cron은 매일 한국 시간 00:10에 만료 처리, 알림 생성, rate-limit 정리를 실행합니다. 생성부터 migration, 검증까지의 전체 절차는 [Vercel + Render 평가 배포 가이드](docs/11-vercel-render-deployment.md)를 따릅니다.

## 데이터와 보안

- 비밀번호는 bcrypt로 해시합니다.
- 모든 공고·작업·알림 API는 인증과 사용자 소유권을 확인합니다.
- DB 외래키와 cascade 정책으로 계정 삭제 시 연결 데이터를 제거합니다.
- API 수정에는 version 기반 낙관적 잠금을 사용합니다.
- 앱 컨테이너는 non-root 사용자로 실행합니다.
- 배포 환경에서는 기본 secret을 사용하지 마세요.
- 회원가입은 IP당 시간당 5회, 로그인은 IP·이메일 조합당 15분간 10회로 제한합니다.

## 프로젝트 구조

```text
src/
├─ app/             # Next.js 화면과 Route Handlers
├─ components/      # UI 컴포넌트
├─ db/              # Drizzle schema와 query
├─ domain/          # 프레임워크 독립 업무 규칙
├─ features/        # 공고·알림 기능 서비스
├─ lib/             # 공통 API 유틸리티
└─ openapi/         # OpenAPI 3.1 문서

drizzle/            # PostgreSQL migration
e2e/                # Playwright 사용자 흐름
docs/               # 제품·개발·운영 문서
```

## 문서

- [제품 기획서](docs/01-product-plan.md)
- [제품 요구사항 명세서](docs/02-prd.md)
- [사용자 흐름 및 화면 명세](docs/03-ux-spec.md)
- [업무 규칙 및 데이터 모델](docs/04-domain-data.md)
- [API 명세](docs/05-api-spec.md)
- [AI 공고 분석 설계 — Post-MVP](docs/06-ai-analysis.md)
- [개발 계획서](docs/07-development-plan.md)
- [테스트 및 운영 계획](docs/08-test-operations.md)
- [의사결정 기록](docs/09-decisions.md)
- [수동 등록 MVP 출시 체크리스트](docs/10-release-checklist.md)
- [Vercel + Render 평가 배포 가이드](docs/11-vercel-render-deployment.md)

## MVP 이후

- 채용 공고 URL 자동 분석
- 이메일·Push·메신저 알림
- 제출 파일 버전 관리
- 자기소개서 답변 검색과 재사용
- 코딩테스트·면접 등 후속 전형 관리
- 지원 통계와 캘린더
- 브라우저 확장 프로그램
