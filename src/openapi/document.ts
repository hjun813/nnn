export const openApiDocument = {
  openapi: "3.1.0",
  info: { title: "ApplyFlow API", version: "0.1.0", description: "채용 공고와 지원 준비 작업을 관리하는 ApplyFlow MVP API" },
  servers: [{ url: "/api", description: "현재 환경" }],
  tags: [{ name: "Auth" }, { name: "Account" }, { name: "Jobs" }, { name: "Tasks" }, { name: "Notifications" }],
  paths: {
    "/register": {
      post: { tags: ["Auth"], summary: "이메일 회원가입", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegistrationInput" } } } }, responses: { "201": { description: "가입 완료" }, "400": { $ref: "#/components/responses/BadRequest" }, "409": { description: "이미 가입된 이메일" }, "429": { description: "가입 요청 횟수 초과" } } },
    },
    "/account": {
      delete: { tags: ["Account"], summary: "계정과 연결 데이터 영구 삭제", security: [{ sessionCookie: [] }], responses: { "204": { description: "삭제 완료" }, "401": { $ref: "#/components/responses/Unauthorized" } } },
    },
    "/jobs": {
      get: { tags: ["Jobs"], summary: "내 공고 목록", security: [{ sessionCookie: [] }], responses: { "200": { description: "공고 목록" }, "401": { $ref: "#/components/responses/Unauthorized" } } },
      post: { tags: ["Jobs"], summary: "공고 직접 등록", security: [{ sessionCookie: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateJobInput" } } } }, responses: { "201": { description: "등록 완료" }, "400": { $ref: "#/components/responses/BadRequest" }, "409": { description: "중복 URL" } } },
    },
    "/jobs/{jobId}": {
      parameters: [{ $ref: "#/components/parameters/JobId" }],
      get: { tags: ["Jobs"], summary: "공고 상세", security: [{ sessionCookie: [] }], responses: { "200": { description: "공고 상세" }, "404": { $ref: "#/components/responses/NotFound" } } },
      patch: { tags: ["Jobs"], summary: "공고 수정", security: [{ sessionCookie: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateJobInput" } } } }, responses: { "200": { description: "수정 완료" }, "409": { description: "버전 충돌" } } },
      delete: { tags: ["Jobs"], summary: "공고 영구 삭제", security: [{ sessionCookie: [] }], responses: { "204": { description: "삭제 완료" }, "404": { $ref: "#/components/responses/NotFound" } } },
    },
    "/jobs/{jobId}/status": {
      post: {
        tags: ["Jobs"],
        summary: "지원 상태 변경",
        security: [{ sessionCookie: [] }],
        parameters: [{ $ref: "#/components/parameters/JobId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: { status: { type: "string", enum: ["SAVED", "IN_PROGRESS", "APPLIED", "ARCHIVED"] } },
              },
            },
          },
        },
        responses: { "200": { description: "상태 변경 완료" } },
      },
    },
    "/jobs/{jobId}/tasks": {
      post: { tags: ["Tasks"], summary: "준비 작업 추가", security: [{ sessionCookie: [] }], parameters: [{ $ref: "#/components/parameters/JobId" }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } } } }, responses: { "201": { description: "작업 추가 완료" } } },
    },
    "/jobs/{jobId}/tasks/{taskId}": {
      parameters: [{ $ref: "#/components/parameters/JobId" }, { name: "taskId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      patch: { tags: ["Tasks"], summary: "준비 작업 수정", security: [{ sessionCookie: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } } } }, responses: { "200": { description: "작업 수정 완료" } } },
      delete: { tags: ["Tasks"], summary: "준비 작업 삭제", security: [{ sessionCookie: [] }], responses: { "204": { description: "삭제 완료" } } },
    },
    "/notifications": {
      get: { tags: ["Notifications"], summary: "내 알림 목록", security: [{ sessionCookie: [] }], responses: { "200": { description: "최근 알림 목록" }, "401": { $ref: "#/components/responses/Unauthorized" } } },
      post: { tags: ["Notifications"], summary: "모든 알림 읽음 처리", security: [{ sessionCookie: [] }], responses: { "200": { description: "읽음 처리 개수" }, "401": { $ref: "#/components/responses/Unauthorized" } } },
    },
    "/notifications/{notificationId}/read": {
      post: { tags: ["Notifications"], summary: "알림 읽음 처리", security: [{ sessionCookie: [] }], parameters: [{ name: "notificationId", in: "path", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "읽음 처리 완료" }, "404": { $ref: "#/components/responses/NotFound" } } },
    },
  },
  components: {
    securitySchemes: { sessionCookie: { type: "apiKey", in: "cookie", name: "authjs.session-token", description: "Auth.js 로그인 세션 쿠키. Swagger UI와 같은 브라우저 세션을 사용합니다." } },
    parameters: { JobId: { name: "jobId", in: "path", required: true, schema: { type: "string", format: "uuid" } } },
    responses: {
      BadRequest: { description: "입력값 오류", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      Unauthorized: { description: "로그인 필요", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      NotFound: { description: "리소스 없음", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
    },
    schemas: {
      RegistrationInput: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string", minLength: 8, maxLength: 128, format: "password" } } },
      TaskInput: { type: "object", required: ["type", "title"], properties: { type: { type: "string", enum: ["RESUME", "PORTFOLIO", "ESSAY", "ASSIGNMENT", "CODING_TEST", "CUSTOM"] }, title: { type: "string", maxLength: 100 }, status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE", "NOT_REQUIRED"], default: "TODO" }, isRequired: { type: "boolean", default: true }, sortOrder: { type: "integer", minimum: 0 } } },
      CreateJobInput: { type: "object", required: ["companyName", "positionTitle"], properties: { companyName: { type: "string", maxLength: 100 }, positionTitle: { type: "string", maxLength: 150 }, sourceUrl: { type: ["string", "null"], format: "uri" }, platform: { type: ["string", "null"] }, deadlineType: { type: "string", enum: ["FIXED", "ALWAYS_OPEN", "UNKNOWN"] }, actualDeadline: { type: ["string", "null"], format: "date-time" }, targetDeadline: { type: ["string", "null"], format: "date-time" }, memo: { type: ["string", "null"], maxLength: 2000 }, tasks: { type: "array", maxItems: 30, items: { $ref: "#/components/schemas/TaskInput" } } } },
      UpdateJobInput: { type: "object", required: ["version"], properties: { companyName: { type: "string", maxLength: 100 }, positionTitle: { type: "string", maxLength: 150 }, sourceUrl: { type: ["string", "null"], format: "uri" }, platform: { type: ["string", "null"] }, deadlineType: { type: "string", enum: ["FIXED", "ALWAYS_OPEN", "UNKNOWN"] }, actualDeadline: { type: ["string", "null"], format: "date-time" }, targetDeadline: { type: ["string", "null"], format: "date-time" }, memo: { type: ["string", "null"], maxLength: 2000 }, version: { type: "integer", minimum: 1 } } },
      Error: { type: "object", properties: { error: { type: "object", required: ["code", "message"], properties: { code: { type: "string" }, message: { type: "string" }, fields: { type: "object", additionalProperties: true } } } } },
    },
  },
} as const;
