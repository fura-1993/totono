import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema";

// 環境変数からデータベース接続情報を取得
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL is not set");
}

// MySQL接続プールを作成
const pool = mysql.createPool({
  uri: DATABASE_URL || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Drizzle ORMインスタンスを作成
export const db = drizzle(pool, { schema, mode: "default" });

export { schema };
