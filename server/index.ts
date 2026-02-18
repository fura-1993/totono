import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { db, schema } from "./db";
import { sendAdminNotification, sendCustomerAutoReply, testEmailConnection } from "./email";
import { uploadFiles, ensureBucketExists } from "./storage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer設定（メモリストレージ）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("画像ファイルのみアップロード可能です"));
    }
  },
});

async function startServer() {
  const app = express();
  const server = createServer(app);

  // JSONボディパーサーを追加
  app.use(express.json());

  // メール接続テスト（起動時）
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    testEmailConnection();
  } else {
    console.log("Email credentials not configured. Email notifications disabled.");
  }

  // Supabase Storageバケットの確認
  await ensureBucketExists();

  // API: お問い合わせを保存（写真アップロード対応）
  app.post("/api/inquiries", upload.array("photos", 10), async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        serviceType,
        message,
        utmParams,
        trafficSource,
        landingPage,
        referrer,
      } = req.body;

      // バリデーション
      if (!name || !message) {
        return res.status(400).json({ error: "名前とメッセージは必須です" });
      }

      // データベースに保存
      const result = await db.insert(schema.inquiries).values({
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        serviceType: serviceType || null,
        message,
        utmParams: utmParams ? JSON.parse(utmParams) : null,
        trafficSource: trafficSource || null,
        landingPage: landingPage || null,
        referrer: referrer || null,
        status: "new",
      });

      const inquiryId = result[0].insertId.toString();

      // 写真をアップロード
      let photoUrls: string[] = [];
      const files = req.files as Express.Multer.File[];
      
      if (files && files.length > 0) {
        console.log(`Uploading ${files.length} photos...`);
        photoUrls = await uploadFiles(
          files.map(f => ({
            buffer: f.buffer,
            originalname: f.originalname,
            mimetype: f.mimetype,
          })),
          inquiryId
        );
        console.log(`Uploaded ${photoUrls.length} photos successfully`);
      }

      // メール通知を送信（非同期で実行、エラーがあってもレスポンスは返す）
      const inquiry = { name, email, phone, address, serviceType, message, photoUrls };
      
      // 管理者宛て通知
      sendAdminNotification(inquiry)
        .then(() => console.log("Admin notification sent successfully"))
        .catch((err) => console.error("Failed to send admin notification:", err));

      // お客様宛て自動返信
      if (email) {
        sendCustomerAutoReply({ name, email, serviceType, photoUrls })
          .then(() => console.log("Customer auto-reply sent successfully"))
          .catch((err) => console.error("Failed to send customer auto-reply:", err));
      }

      res.status(201).json({
        success: true,
        message: "お問い合わせを受け付けました",
        id: inquiryId,
        photoUrls,
      });
    } catch (error) {
      console.error("Error saving inquiry:", error);
      res.status(500).json({ error: "お問い合わせの保存に失敗しました" });
    }
  });

  // API: お問い合わせ一覧を取得（管理用）
  app.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries = await db.select().from(schema.inquiries).orderBy(schema.inquiries.createdAt);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "お問い合わせの取得に失敗しました" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
  });
}

startServer().catch(console.error);
