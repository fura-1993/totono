import { mysqlTable, int, varchar, text, timestamp, json, mysqlEnum } from "drizzle-orm/mysql-core";

// ユーザーテーブル
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).notNull().default("user"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  lastSignedIn: timestamp("lastSignedIn").notNull().defaultNow(),
});

// お問い合わせテーブル
export const inquiries = mysqlTable("inquiries", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  serviceType: varchar("serviceType", { length: 50 }),
  message: text("message").notNull(),
  utmParams: json("utmParams"),
  trafficSource: text("trafficSource"),
  landingPage: text("landingPage"),
  referrer: text("referrer"),
  status: mysqlEnum("status", ["new", "contacted", "quoted", "completed", "cancelled"]).notNull().default("new"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
});

// お問い合わせ写真テーブル
export const inquiryPhotos = mysqlTable("inquiry_photos", {
  id: int("id").primaryKey().autoincrement(),
  inquiryId: int("inquiryId").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// 型定義のエクスポート
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type InquiryPhoto = typeof inquiryPhotos.$inferSelect;
export type NewInquiryPhoto = typeof inquiryPhotos.$inferInsert;
