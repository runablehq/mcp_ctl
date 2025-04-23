import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import postgres from "postgres";

const connection = postgres(process.env.DATABASE_URL!, {
  prepare: false,
});

export const database = drizzle(connection, { schema });
