import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(schema.achievements)
      .where(eq(schema.achievements.isPublished, 1))
      .orderBy(desc(schema.achievements.workDate), schema.achievements.displayOrder, desc(schema.achievements.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json({ error: "実績の取得に失敗しました" }, { status: 500 });
  }
}
