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

export const orderRequests = sqliteTable(
  "order_requests",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    fulfillment: text("fulfillment").notNull().default("Pickup"),
    address: text("address").notNull().default(""),
    items: text("items").notNull(),
    total: integer("total").notNull(),
    status: text("status").notNull().default("pending"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("order_requests_reference_idx").on(table.reference),
    index("order_requests_status_idx").on(table.status),
    index("order_requests_created_at_idx").on(table.createdAt),
  ],
);

export const loyaltyMembers = sqliteTable(
  "loyalty_members",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    visits: integer("visits").notNull().default(0),
    rewards: integer("rewards").notNull().default(0),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("loyalty_members_code_idx").on(table.code),
    uniqueIndex("loyalty_members_phone_idx").on(table.phone),
    index("loyalty_members_status_idx").on(table.status),
  ],
);

export const guestFeedback = sqliteTable(
  "guest_feedback",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone"),
    rating: integer("rating").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("guest_feedback_status_idx").on(table.status),
    index("guest_feedback_created_at_idx").on(table.createdAt),
  ],
);
