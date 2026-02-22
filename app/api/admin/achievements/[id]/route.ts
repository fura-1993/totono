import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadFiles } from "@/lib/storage";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const serviceType = String(formData.get("serviceType") || "").trim();
    const workDate = String(formData.get("workDate") || "").trim();
    const details = String(formData.get("details") || "").trim();
    const duration = String(formData.get("duration") || "").trim();
    const scope = String(formData.get("scope") || "").trim();
    const displayOrder = Number(formData.get("displayOrder") || 0);
    const isPublished = formData.get("isPublished") === "true" ? 1 : 0;

    const imageFile = formData.get("image") as File | null;
    let imageUrl = String(formData.get("imageUrl") || "").trim();

    if (imageFile && imageFile.size > 0) {
      try {
        const uploads = await uploadFiles(
          [
            {
              buffer: Buffer.from(await imageFile.arrayBuffer()),
              originalname: imageFile.name,
              mimetype: imageFile.type || "application/octet-stream",
            },
          ],
          "achievements"
        );
        imageUrl = uploads[0]?.url || imageUrl;
      } catch (error) {
        console.error("Achievement image upload skipped:", error);
      }
    }

    await db
      .update(schema.achievements)
      .set({
        title,
        description,
        location: location || null,
        serviceType: serviceType || null,
        workDate: workDate || null,
        details: details || null,
        duration: duration || null,
        scope: scope || null,
        imageUrl: imageUrl || null,
        displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
        isPublished,
      })
      .where(eq(schema.achievements.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating achievement:", error);
    return NextResponse.json({ error: "実績の更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.delete(schema.achievements).where(eq(schema.achievements.id, id));
  return NextResponse.json({ success: true });
}
