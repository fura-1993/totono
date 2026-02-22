import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type InquiryMailPayload = {
  inquiryId?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceType?: string;
  services?: string[];
  details?: string;
  preferredTiming?: string;
  preferredContactMethod?: string;
  message: string;
  photoUrls?: string[];
};

export async function sendAdminNotification(inquiry: InquiryMailPayload) {
  const adminEmail = process.env.ADMIN_EMAIL || "extend.engineer007@gmail.com";
  const serviceText = inquiry.services?.length ? inquiry.services.join(", ") : inquiry.serviceType || "未選択";

  const photoText = inquiry.photoUrls?.length
    ? `\n【添付写真】\n${inquiry.photoUrls.map((url, i) => `${i + 1}. ${url}`).join("\n")}`
    : "";

  const textContent = `新規お問い合わせがありました

【問い合わせID】${inquiry.inquiryId ?? "未採番"}
【お名前】${inquiry.name}
【メールアドレス】${inquiry.email || "未入力"}
【電話番号】${inquiry.phone || "未入力"}
【ご住所】${inquiry.address || "未入力"}
【ご依頼内容】${serviceText}
【ご希望時期】${inquiry.preferredTiming || "未選択"}
【希望連絡方法】${inquiry.preferredContactMethod || "未選択"}
【詳細】${inquiry.details || "未入力"}
【お問い合わせ内容】
${inquiry.message}
${photoText}

---
このメールはトトノLPのお問い合わせフォームから自動送信されています。`;

  await transporter.sendMail({
    from: `"トトノ お問い合わせ" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `【トトノ】新規お問い合わせ: ${inquiry.name}様${inquiry.photoUrls?.length ? ` (写真${inquiry.photoUrls.length}枚)` : ""}`,
    text: textContent,
  });
}

export async function sendCustomerAutoReply(inquiry: InquiryMailPayload & { email: string }) {
  if (!inquiry.email) return;
  const serviceText = inquiry.services?.length ? inquiry.services.join(", ") : inquiry.serviceType || "未選択";

  const photoText = inquiry.photoUrls?.length
    ? `\n添付いただいた写真（${inquiry.photoUrls.length}枚）を確認いたしました。\n`
    : "";

  const textContent = `${inquiry.name} 様

この度は「トトノ」にお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けました。

問い合わせID: ${inquiry.inquiryId ?? "発行中"}
ご希望のサービス: ${serviceText}
ご希望時期: ${inquiry.preferredTiming || "未選択"}
ご希望連絡方法: ${inquiry.preferredContactMethod || "未選択"}
${inquiry.details ? `ご相談内容: ${inquiry.details}\n` : ""}${photoText}
【今後の流れ】
1. 担当者が内容を確認し、12時間以内にご連絡いたします
2. 現地確認の日程を調整させていただきます
3. 現地にてお見積もりをご提示いたします

お急ぎの場合は、お電話でもお問い合わせいただけます。
電話: 090-5306-0197（7:00〜20:00）

---
トトノ
茨城県桜川市を拠点に、庭木の剪定・伐採・草刈りを承ります。`;

  await transporter.sendMail({
    from: `"トトノ" <${process.env.GMAIL_USER}>`,
    to: inquiry.email,
    subject: "【トトノ】お問い合わせありがとうございます",
    text: textContent,
  });
}
