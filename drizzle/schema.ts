import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const cassettes = mysqlTable("cassettes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: int("ownerId").notNull(),
  shareToken: varchar("shareToken", { length: 32 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  recipient: varchar("recipient", { length: 120 }).notNull().default(""),
  sender: varchar("sender", { length: 120 }).notNull().default(""),
  letter: text("letter").notNull(),
  bodyJson: longtext("bodyJson").notNull(),
  songsJson: longtext("songsJson").notNull(),
  decorationsJson: longtext("decorationsJson").notNull(),
  effectsJson: longtext("effectsJson").notNull(),
  background: varchar("background", { length: 64 }).notNull().default("desk"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cassette = typeof cassettes.$inferSelect;
export type InsertCassette = typeof cassettes.$inferInsert;
