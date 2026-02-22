import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const VALID_STATUS = ["new", "contacted", "quoted", "completed", "cancelled"] as const;

type InquiryStatus = (typeof VALID_STATUS)[number];

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = (await request.json()) as { status?: InquiryStatus };
    const status = body.status;

    if (!status || !VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await db
      .update(schema.inquiries)
      .set({ status })
      .where(eq(schema.inquiries.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
