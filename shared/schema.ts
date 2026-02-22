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
  services: json("services"),
  details: text("details"),
  preferredTiming: varchar("preferredTiming", { length: 64 }),
  preferredContactMethod: varchar("preferredContactMethod", { length: 32 }),
  photoCount: int("photoCount").notNull().default(0),
  message: text("message").notNull(),
  utmParams: json("utmParams"),
  trafficSource: text("trafficSource"),
  landingPage: text("landingPage"),
  referrer: text("referrer"),
  adminNotificationSentAt: timestamp("adminNotificationSentAt"),
  autoReplySentAt: timestamp("autoReplySentAt"),
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

// 施工実績テーブル
export const achievements = mysqlTable("achievements", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 255 }),
  serviceType: varchar("serviceType", { length: 100 }),
  workDate: varchar("workDate", { length: 10 }),
  details: text("details"),
  duration: varchar("duration", { length: 100 }),
  scope: varchar("scope", { length: 100 }),
  imageUrl: text("imageUrl"),
  isPublished: int("isPublished").notNull().default(1),
  displayOrder: int("displayOrder").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
});

// 型定義のエクスポート
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type InquiryPhoto = typeof inquiryPhotos.$inferSelect;
export type NewInquiryPhoto = typeof inquiryPhotos.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
