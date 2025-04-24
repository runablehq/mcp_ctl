import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import dotenv from "dotenv";
dotenv.config();
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
});

export const database = drizzle(client, { schema });