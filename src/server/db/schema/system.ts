import { date, integer, varchar } from "drizzle-orm/pg-core";
import { createTable } from "../schema";
import { contacts } from "./coreforce";

export const errorLogs = createTable("error_log", {
  id: integer("id").primaryKey(),
  contact: integer("contact").references(() => contacts.id),
  message: varchar("message").notNull(),
  createdAt: date("created_at").notNull(),
});
