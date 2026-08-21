# Vercel + Render 평가 배포 가이드

## 배포 구조

평가용 MVP는 Next.js 화면, Route Handler, Auth.js를 하나의 Vercel 프로젝트에 배포하고 PostgreSQL만 Render에서 운영한다.

```text
Browser → Vercel (Next.js + API + Auth.js) → Render PostgreSQL
```

API를 Render Web Service로 분리하는 작업은 사용자 평가 이후 필요성이 확인될 때 진행한다.

## 1. Render PostgreSQL 생성

1. Render Dashboard에서 `New > Postgres`를 선택한다.
2. 데이터베이스 이름과 사용자를 생성하고 Vercel과 가까운 리전을 선택한다.
3. 가능하면 Connection Pooling을 활성화한다.
4. migration용 **External Database URL**과 Vercel 런타임용 **External Connection Pool URL**을 각각 복사한다. 풀링을 사용할 수 없다면 런타임도 External Database URL을 사용한다.
5. URL에 TLS 옵션(`sslmode=require`)이 포함됐는지 확인한다.

Vercel은 Render 사설 네트워크 밖에 있으므로 Internal URL을 사용할 수 없다.

## 2. 최초 migration

운영 DB URL을 현재 PowerShell 세션에만 설정하고 migration을 실행한다. URL을 파일이나 Git 기록에 남기지 않는다.

```powershell
$env:DATABASE_URL="<Render external direct database URL>"
npm run db:migrate
Remove-Item Env:DATABASE_URL
```

성공 후 Render에서 `app_user`, `job_posting`, `application_task`, `notification`, `rate_limit` 등의 테이블을 확인한다.

## 3. Vercel 프로젝트 생성

1. Vercel에서 GitHub 저장소 `hjun813/nnn`을 Import한다.
2. Framework Preset은 Next.js, Production Branch는 `master`로 둔다.
3. 다음 환경변수를 **Production**에 등록한다.

| 이름 | 값 |
|---|---|
| `DATABASE_URL` | Render External Connection Pool URL(권장) |
| `AUTH_SECRET` | 32자 이상의 무작위 값 |
| `AUTH_URL` | 최종 Vercel production URL 또는 사용자 도메인 |
| `CRON_SECRET` | 16자 이상의 별도 무작위 값 |

`OPENAI_API_KEY`는 수동 등록 MVP에 필요하지 않다. Preview 환경에는 운영 DB 값을 복사하지 않는다. Preview가 필요하면 별도 DB를 사용한다.

로컬에서 값의 형식을 확인할 수 있다.

```powershell
$env:DATABASE_URL="<Render URL>"
$env:AUTH_SECRET="<secret>"
$env:AUTH_URL="https://<production-domain>"
$env:CRON_SECRET="<separate-secret>"
npm run deploy:check
```

## 4. 배포와 자동 작업

`master`가 Vercel에 연결되면 push마다 production 배포가 실행된다. `vercel.json`은 매일 `15:10 UTC`(한국 시간 00:10)에 `/api/internal/maintenance`를 호출한다.

Vercel은 `CRON_SECRET`을 `Authorization: Bearer ...` 헤더로 전달한다. 유지보수 요청은 다음을 한 번에 처리한다.

- 마감 공고 Expired 전환
- D-7/D-3/D-1 알림 생성
- 만료된 rate-limit 버킷 삭제

## 5. 배포 확인

1. `https://<domain>/api/health`가 `200`과 `database: connected`를 반환하는지 확인한다.
2. 회원가입 → 로그인 → 공고 등록 → 작업 완료 → 지원 완료 → 계정 삭제를 수행한다.
3. `https://<domain>/api-docs`에서 API 문서가 열리는지 확인한다.
4. Vercel Functions 로그에서 DB 또는 인증 오류가 없는지 확인한다.
5. Vercel Cron Jobs 화면에서 유지보수 작업이 등록됐는지 확인한다.

## 6. 운영 주의사항

- Render DB의 direct URL보다 pooled URL을 우선한다.
- Render DB 외부 접근은 기본적으로 공개 범위가 넓을 수 있다. Vercel의 동적 outbound IP 특성과 Render 접근 제어 정책을 확인한다.
- 무료 또는 평가 플랜의 데이터 보존, 백업, 절전, cron 실행 빈도 제한을 배포 시점에 확인한다.
- 개인정보처리방침과 이용약관이 준비되기 전에는 불특정 다수에게 공개 가입을 홍보하지 않는다.
- migration은 앱의 일반 build 과정에 넣지 않는다. 새 migration을 배포하기 전에 운영 DB에 별도로 적용한다.
