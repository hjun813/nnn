import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  client ??= postgres(url, { max: process.env.NODE_ENV === "production" ? 10 : 1 });
  return drizzle(client, { schema });
}
