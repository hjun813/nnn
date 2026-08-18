import { expect, test } from "@playwright/test";

test("회원가입부터 수동 공고 등록과 지원 완료까지 진행한다", async ({ page }) => {
  const email = `e2e-${Date.now()}@applyflow.test`;
  const deadline = new Date(Date.now() + 5 * 86_400_000);
  const localDeadline = new Date(deadline.getTime() - deadline.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

  await page.goto("/register");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill("applyflow-e2e-password");
  await page.getByRole("button", { name: "계정 만들기" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("link", { name: /공고 추가/ }).first().click();
  await page.getByLabel("회사명 *").fill("ApplyFlow Test Company");
  await page.getByLabel("직무명 *").fill("Backend Developer");
  await page.getByLabel("공고 URL").fill("https://example.com/jobs/e2e");
  await page.getByLabel("실제 마감").fill(localDeadline);
  await page.getByRole("button", { name: "공고 저장" }).click();

  await expect(page.getByRole("heading", { name: "ApplyFlow Test Company" })).toBeVisible();
  await page.getByLabel("이력서 완료").check();
  await expect(page.getByLabel("이력서 상태")).toHaveValue("DONE");

  await page.getByRole("button", { name: "준비 시작" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "지원 완료" }).click();
  await expect(page.getByText("APPLIED", { exact: true })).toBeVisible();

  await page.goto("/settings");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "계정과 데이터 영구 삭제" }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test("Swagger API 문서를 제공한다", async ({ page }) => {
  await page.goto("/api-docs");
  await expect(page.getByText("ApplyFlow API")).toBeVisible();
  await expect(page.getByText("OpenAPI 3.1")).toBeVisible();
  const response = await page.request.get("/api/health");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});
