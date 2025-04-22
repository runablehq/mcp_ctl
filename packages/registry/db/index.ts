import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "./schema.js";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();
// Create PG pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle client
export const db = drizzle(pool, { schema });
