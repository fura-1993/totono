import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadFiles } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(schema.achievements)
    .orderBy(desc(schema.achievements.workDate), schema.achievements.displayOrder, desc(schema.achievements.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    if (!title || !description) {
      return NextResponse.json({ error: "タイトルと説明は必須です" }, { status: 400 });
    }

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

    await db.insert(schema.achievements).values({
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
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating achievement:", error);
    return NextResponse.json({ error: "実績の作成に失敗しました" }, { status: 500 });
  }
}
