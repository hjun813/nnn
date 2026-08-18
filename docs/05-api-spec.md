# API 명세 초안

기본 경로는 `/api/v1`이며 JSON을 사용한다. 인증 실패는 401, 소유권이 없는 리소스는 존재 여부를 노출하지 않도록 404를 반환한다.

## 1. 공통 오류

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인해주세요.",
    "fields": { "targetDeadline": "실제 마감 이후일 수 없습니다." },
    "requestId": "req_123"
  }
}
```

## 2. 공고

### `GET /jobs`

쿼리: `status`, `due=week|expired`, `q`, `cursor`, `limit`, `sort=priority|createdAt`.

### `POST /jobs`

```json
{
  "companyName": "Toss",
  "positionTitle": "Server Developer",
  "sourceUrl": "https://example.com/jobs/1",
  "platform": "company",
  "deadlineType": "FIXED",
  "actualDeadline": "2026-08-25T23:59:00+09:00",
  "targetDeadline": "2026-08-23T23:59:00+09:00",
  "memo": "채용 페이지 확인",
  "tasks": [
    { "type": "RESUME", "title": "이력서", "isRequired": true },
    { "type": "PORTFOLIO", "title": "포트폴리오", "isRequired": true }
  ]
}
```

응답은 생성된 공고와 계산된 `effectiveDeadline`, `progress`, `nextAction`을 반환한다.

### `GET /jobs/{jobId}`

공고, 작업, 문항, 계산 필드를 반환한다.

### `PATCH /jobs/{jobId}`

전달된 필드만 수정한다. 동시 수정 충돌 방지를 위해 `updatedAt` 또는 version을 함께 받는다.

### `DELETE /jobs/{jobId}`

영구 삭제. 일반 UI에서는 `POST /jobs/{jobId}/archive`를 사용한다.

### `POST /jobs/{jobId}/archive`

상태를 ARCHIVED로 변경한다.

### `POST /jobs/{jobId}/restore`

보관 또는 만료 이전 상태로 복구하되 실제 마감이 지났으면 EXPIRED를 유지한다.

### `POST /jobs/{jobId}/status`

```json
{ "status": "APPLIED" }
```

상태 이력을 생성하고 APPLIED이면 appliedAt을 기록한다.

## 3. 준비 작업

- `POST /jobs/{jobId}/tasks`
- `PATCH /jobs/{jobId}/tasks/{taskId}`
- `DELETE /jobs/{jobId}/tasks/{taskId}`
- `PUT /jobs/{jobId}/tasks/order`

상태 변경 예시:

```json
{ "status": "DONE", "version": 3 }
```

## 4. Dashboard

### `GET /dashboard`

```json
{
  "today": [
    {
      "jobId": "job_1",
      "companyName": "Toss",
      "positionTitle": "Server Developer",
      "effectiveDeadline": "2026-08-23T23:59:00+09:00",
      "actualDeadline": "2026-08-25T23:59:00+09:00",
      "dDay": 5,
      "progress": 50,
      "nextAction": { "type": "CONTINUE_TASK", "taskId": "task_1", "label": "자기소개서 계속하기" }
    }
  ],
  "thisWeek": [],
  "expiredCount": 0
}
```

## 5. AI 분석

### `POST /analyses`

```json
{ "url": "https://example.com/jobs/1" }
```

응답 `202 Accepted`:

```json
{ "analysisId": "ana_1", "status": "PENDING" }
```

### `GET /analyses/{analysisId}`

`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` 상태와 완료 시 추출값·필드별 근거를 반환한다.

### `POST /analyses/{analysisId}/confirm`

사용자가 수정한 최종 데이터를 받아 공고를 생성한다. 동일 분석을 두 번 확정하지 않도록 멱등 처리한다.

## 6. 알림

- `GET /notifications`
- `POST /notifications/{notificationId}/read`
- `POST /notifications/read-all`

## 7. 보안 요구사항

- 모든 변경 요청은 인증 및 소유권을 확인한다.
- 상태 변경과 분석 확정에는 서버 검증을 적용한다.
- URL은 http/https만 허용하고 리디렉션마다 목적지를 재검사한다.
- 요청 크기, 분석 횟수, 로그인 시도에 rate limit을 적용한다.
- 외부 HTML과 AI 출력은 신뢰하지 않고 검증·정제한다.

