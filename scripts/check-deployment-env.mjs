const required = ["DATABASE_URL", "AUTH_SECRET", "AUTH_URL", "CRON_SECRET"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing deployment environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const problems = [];
if (process.env.AUTH_SECRET.length < 32) problems.push("AUTH_SECRET must contain at least 32 characters.");
if (process.env.CRON_SECRET.length < 16) problems.push("CRON_SECRET must contain at least 16 characters.");

for (const name of ["DATABASE_URL", "AUTH_URL"]) {
  try {
    new URL(process.env[name]);
  } catch {
    problems.push(`${name} must be a valid URL.`);
  }
}

if (!process.env.AUTH_URL.startsWith("https://") && !process.env.AUTH_URL.startsWith("http://localhost")) {
  problems.push("AUTH_URL must use HTTPS outside localhost.");
}
if (/replace|change-this|applyflow:applyflow/i.test(process.env.AUTH_SECRET + process.env.CRON_SECRET + process.env.DATABASE_URL)) {
  problems.push("Default or placeholder credentials must not be used for deployment.");
}

if (problems.length) {
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("Deployment environment variables look valid.");
