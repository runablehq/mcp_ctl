import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const Package = pgTable("packages", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  latest_version: text("latest_version").notNull(),
  description: text("description"),
  repository: text("repository"),
  maintainer: text("maintainer"),
  manifest: jsonb("manifest").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}).enableRLS();
