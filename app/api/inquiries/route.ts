import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { sendAdminNotification, sendCustomerAutoReply } from "@/lib/email";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadFiles } from "@/lib/storage";

export const runtime = "nodejs";

type MysqlLikeError = {
  code?: string;
  message?: string;
};

function isMissingColumnError(error: unknown) {
  const mysqlError = error as MysqlLikeError;
  return (
    mysqlError?.code === "ER_BAD_FIELD_ERROR" ||
    /Unknown column/i.test(String(mysqlError?.message || ""))
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const serviceType = String(formData.get("serviceType") || "").trim();
    const servicesRaw = String(formData.get("services") || "").trim();
    const details = String(formData.get("details") || "").trim();
    const preferredTiming = String(formData.get("timing") || "").trim();
    const preferredContactMethod = String(formData.get("contactMethod") || formData.get("contact_method") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const trafficSource = String(formData.get("trafficSource") || "").trim();
    const landingPage = String(formData.get("landingPage") || "").trim();
    const referrer = String(formData.get("referrer") || "").trim();

    let services: string[] = [];
    if (servicesRaw) {
      try {
        const parsed = JSON.parse(servicesRaw);
        if (Array.isArray(parsed)) {
          services = parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        services = servicesRaw.split(",").map((item) => item.trim()).filter(Boolean);
      }
    }
    if (!services.length && serviceType) {
      services = serviceType.split(",").map((item) => item.trim()).filter(Boolean);
    }

    const normalizedMessage =
      message ||
      `【ご依頼内容】${services.join(", ") || serviceType || "未選択"}\n【詳細】${details || "なし"}\n【希望時期】${preferredTiming || "未選択"}\n【連絡方法】${preferredContactMethod || "未選択"}`;

    if (!name || (!normalizedMessage && !details && !services.length)) {
      return NextResponse.json({ error: "名前とお問い合わせ内容は必須です" }, { status: 400 });
    }

    const utmRaw = String(formData.get("utmParams") || "").trim();
    let utmParams: unknown = null;
    if (utmRaw) {
      try {
        utmParams = JSON.parse(utmRaw);
      } catch {
        utmParams = null;
      }
    }

    const baseInquiryValues = {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      serviceType: serviceType || null,
      message: normalizedMessage,
      utmParams: (utmParams as any) ?? null,
      trafficSource: trafficSource || null,
      landingPage: landingPage || null,
      referrer: referrer || null,
      status: "new" as const,
    };
    const extendedInquiryValues = {
      ...baseInquiryValues,
      services: services.length ? services : null,
      details: details || null,
      preferredTiming: preferredTiming || null,
      preferredContactMethod: preferredContactMethod || null,
      photoCount: 0,
    };

    let insertedWithLegacySchema = false;
    let result: unknown;
    try {
      result = await db.insert(schema.inquiries).values(extendedInquiryValues);
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;
      insertedWithLegacySchema = true;
      console.warn("inquiries table is legacy schema; saving without extended columns");
      result = await db.insert(schema.inquiries).values(baseInquiryValues);
    }

    const inquiryId = String((result as any)[0]?.insertId ?? (result as any).insertId ?? 0);
    const inquiryIdNumber = Number(inquiryId);

    const rawFiles = formData.getAll("photos").filter((item): item is File => item instanceof File);
    const files = await Promise.all(
      rawFiles.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: file.name,
        mimetype: file.type || "application/octet-stream",
      }))
    );

    let uploaded: Awaited<ReturnType<typeof uploadFiles>> = [];
    if (files.length > 0) {
      try {
        uploaded = await uploadFiles(files, `inquiries/${inquiryId}`);
      } catch (error) {
        console.error("Photo upload skipped:", error);
      }
    }

    if (uploaded.length > 0) {
      await db.insert(schema.inquiryPhotos).values(
        uploaded.map((item) => ({
          inquiryId: inquiryIdNumber,
          fileKey: item.fileKey,
          url: item.url,
          filename: item.filename,
          mimeType: item.mimeType,
          fileSize: item.fileSize,
        }))
      );
    }

    if (!insertedWithLegacySchema) {
      await db
        .update(schema.inquiries)
        .set({ photoCount: uploaded.length })
        .where(eq(schema.inquiries.id, inquiryIdNumber));
    }

    const photoUrls = uploaded.map((item) => item.url);

    let adminNotificationSentAt: Date | null = null;
    let autoReplySentAt: Date | null = null;

    try {
      await sendAdminNotification({
        inquiryId: inquiryIdNumber,
        name,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        serviceType: serviceType || undefined,
        services,
        details: details || undefined,
        preferredTiming: preferredTiming || undefined,
        preferredContactMethod: preferredContactMethod || undefined,
        message: normalizedMessage,
        photoUrls,
      });
      adminNotificationSentAt = new Date();
    } catch (error) {
      console.error("Failed to send admin notification:", error);
    }

    if (email) {
      try {
        await sendCustomerAutoReply({
          inquiryId: inquiryIdNumber,
          name,
          email,
          serviceType: serviceType || undefined,
          services,
          details: details || undefined,
          preferredTiming: preferredTiming || undefined,
          preferredContactMethod: preferredContactMethod || undefined,
          message: normalizedMessage,
          photoUrls,
        });
        autoReplySentAt = new Date();
      } catch (error) {
        console.error("Failed to send customer auto-reply:", error);
      }
    }

    if (!insertedWithLegacySchema && (adminNotificationSentAt || autoReplySentAt)) {
      await db
        .update(schema.inquiries)
        .set({
          adminNotificationSentAt: adminNotificationSentAt ?? null,
          autoReplySentAt: autoReplySentAt ?? null,
        })
        .where(eq(schema.inquiries.id, inquiryIdNumber));
    }

    return NextResponse.json({
      success: true,
      message: "お問い合わせを受け付けました",
      id: inquiryId,
      photoUrls,
    });
  } catch (error) {
    console.error("Error saving inquiry:", error);
    return NextResponse.json({ error: "お問い合わせの保存に失敗しました" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let usingLegacySchema = false;
    let inquiries: any[] = [];
    try {
      inquiries = await db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt));
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;
      usingLegacySchema = true;
      console.warn("inquiries table is legacy schema; reading without extended columns");
      inquiries = await db
        .select({
          id: schema.inquiries.id,
          name: schema.inquiries.name,
          email: schema.inquiries.email,
          phone: schema.inquiries.phone,
          address: schema.inquiries.address,
          serviceType: schema.inquiries.serviceType,
          message: schema.inquiries.message,
          utmParams: schema.inquiries.utmParams,
          trafficSource: schema.inquiries.trafficSource,
          landingPage: schema.inquiries.landingPage,
          referrer: schema.inquiries.referrer,
          status: schema.inquiries.status,
          createdAt: schema.inquiries.createdAt,
          updatedAt: schema.inquiries.updatedAt,
        })
        .from(schema.inquiries)
        .orderBy(desc(schema.inquiries.createdAt));
    }
    const photos = await db.select().from(schema.inquiryPhotos).orderBy(desc(schema.inquiryPhotos.createdAt));

    const photoMap = new Map<number, typeof photos>();
    for (const photo of photos) {
      const arr = photoMap.get(photo.inquiryId) || [];
      arr.push(photo);
      photoMap.set(photo.inquiryId, arr);
    }

    const payload = inquiries.map((inquiry) => {
      const attachedPhotos = photoMap.get(inquiry.id) || [];
      if (!usingLegacySchema) {
        return {
          ...inquiry,
          photos: attachedPhotos,
        };
      }

      return {
        ...inquiry,
        services: null,
        details: null,
        preferredTiming: null,
        preferredContactMethod: null,
        photoCount: attachedPhotos.length,
        adminNotificationSentAt: null,
        autoReplySentAt: null,
        photos: attachedPhotos,
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ error: "お問い合わせの取得に失敗しました" }, { status: 500 });
  }
}
