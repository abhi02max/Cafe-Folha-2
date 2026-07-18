import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const reservations = sqliteTable(
  "reservations",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    visitDate: text("visit_date").notNull(),
    visitTime: text("visit_time").notNull(),
    guests: integer("guests").notNull(),
    occasion: text("occasion").notNull().default("Regular visit"),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("reservations_reference_idx").on(table.reference),
    index("reservations_visit_date_idx").on(table.visitDate),
    index("reservations_status_idx").on(table.status),
  ],
);

export const eventRequests = sqliteTable(
  "event_requests",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    preferredDate: text("preferred_date").notNull(),
    guests: integer("guests").notNull(),
    eventType: text("event_type").notNull(),
    notes: text("notes").notNull().default(""),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("event_requests_reference_idx").on(table.reference),
    index("event_requests_date_idx").on(table.preferredDate),
    index("event_requests_status_idx").on(table.status),
  ],
);
