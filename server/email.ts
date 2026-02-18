import nodemailer from "nodemailer";

// Gmail SMTP設定
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// 管理者宛てメール送信（写真URLを含む）
export async function sendAdminNotification(inquiry: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  serviceType?: string;
  message: string;
  photoUrls?: string[];
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "extend.engineer007@gmail.com";
  
  // 写真URLのテキスト
  const photoText = inquiry.photoUrls && inquiry.photoUrls.length > 0
    ? `\n【添付写真】\n${inquiry.photoUrls.map((url, i) => `${i + 1}. ${url}`).join("\n")}`
    : "";
  
  // 写真URLのHTML
  const photoHtml = inquiry.photoUrls && inquiry.photoUrls.length > 0
    ? `
      <tr style="background-color: #f5f5f5;">
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">添付写真</td>
        <td style="padding: 10px; border: 1px solid #ddd;">
          ${inquiry.photoUrls.map((url, i) => `
            <div style="margin-bottom: 10px;">
              <a href="${url}" target="_blank" style="color: #2d5a27;">写真${i + 1}を表示</a><br>
              <img src="${url}" alt="添付写真${i + 1}" style="max-width: 300px; max-height: 200px; margin-top: 5px; border-radius: 4px;">
            </div>
          `).join("")}
        </td>
      </tr>
    `
    : "";
  
  // プレーンテキスト版
  const textContent = `新規お問い合わせがありました

【お名前】${inquiry.name}
【メールアドレス】${inquiry.email || "未入力"}
【電話番号】${inquiry.phone || "未入力"}
【ご住所】${inquiry.address || "未入力"}
【サービス種別】${inquiry.serviceType || "未選択"}
【お問い合わせ内容】
${inquiry.message}
${photoText}

---
このメールはトトノLPのお問い合わせフォームから自動送信されています。`;

  const mailOptions = {
    from: `"トトノ お問い合わせ" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `【トトノ】新規お問い合わせ: ${inquiry.name}様${inquiry.photoUrls && inquiry.photoUrls.length > 0 ? ` (写真${inquiry.photoUrls.length}枚)` : ""}`,
    text: textContent,
    html: `
      <h2>新規お問い合わせがありました</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 120px;">お名前</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">メールアドレス</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.email || "未入力"}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">電話番号</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.phone || "未入力"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">ご住所</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.address || "未入力"}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">サービス種別</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${inquiry.serviceType || "未選択"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">お問い合わせ内容</td>
          <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${inquiry.message}</td>
        </tr>
        ${photoHtml}
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        このメールはトトノLPのお問い合わせフォームから自動送信されています。
      </p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// お客様宛て自動返信メール（写真URLを含む）
export async function sendCustomerAutoReply(inquiry: {
  name: string;
  email: string;
  serviceType?: string;
  photoUrls?: string[];
}) {
  if (!inquiry.email) {
    console.log("Customer email not provided, skipping auto-reply");
    return null;
  }

  // 写真URLのテキスト
  const photoText = inquiry.photoUrls && inquiry.photoUrls.length > 0
    ? `\n添付いただいた写真（${inquiry.photoUrls.length}枚）を確認いたしました。\n`
    : "";
  
  // 写真URLのHTML
  const photoHtml = inquiry.photoUrls && inquiry.photoUrls.length > 0
    ? `
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0 0 10px 0;"><strong>添付いただいた写真（${inquiry.photoUrls.length}枚）</strong></p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${inquiry.photoUrls.map((url, i) => `
            <a href="${url}" target="_blank" style="display: inline-block;">
              <img src="${url}" alt="添付写真${i + 1}" style="max-width: 150px; max-height: 100px; border-radius: 4px; border: 1px solid #ddd;">
            </a>
          `).join("")}
        </div>
      </div>
    `
    : "";

  // プレーンテキスト版
  const textContent = `${inquiry.name} 様

この度は「トトノ」にお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けました。

${inquiry.serviceType ? `ご希望のサービス: ${inquiry.serviceType}\n` : ""}${photoText}
【今後の流れ】
1. 担当者が内容を確認し、12時間以内にご連絡いたします
2. 現地確認の日程を調整させていただきます
3. 現地にてお見積もりをご提示いたします

お急ぎの場合は、お電話でもお問い合わせいただけます。
電話: 090-5306-0197（7:00〜20:00）

---
トトノ
茨城県桜川市を拠点に、庭木の剪定・伐採・草刈りを承ります。
電話: 090-5306-0197
メール: extend.engineer007@gmail.com

※このメールは自動送信されています。
※このメールに心当たりがない場合は、お手数ですが削除してください。`;

  const mailOptions = {
    from: `"トトノ" <${process.env.GMAIL_USER}>`,
    to: inquiry.email,
    subject: "【トトノ】お問い合わせありがとうございます",
    text: textContent,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a27;">お問い合わせありがとうございます</h2>
        
        <p>${inquiry.name} 様</p>
        
        <p>
          この度は「トトノ」にお問い合わせいただき、誠にありがとうございます。<br>
          以下の内容でお問い合わせを受け付けました。
        </p>
        
        ${inquiry.serviceType ? `<p><strong>ご希望のサービス:</strong> ${inquiry.serviceType}</p>` : ""}
        
        ${photoHtml}
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d5a27;">今後の流れ</h3>
          <ol style="padding-left: 20px;">
            <li>担当者が内容を確認し、<strong>12時間以内</strong>にご連絡いたします</li>
            <li>現地確認の日程を調整させていただきます</li>
            <li>現地にてお見積もりをご提示いたします</li>
          </ol>
        </div>
        
        <p>
          お急ぎの場合は、お電話でもお問い合わせいただけます。<br>
          <strong>電話: 090-5306-0197</strong>（7:00〜20:00）
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <div style="color: #666; font-size: 12px;">
          <p>
            <strong>トトノ</strong><br>
            茨城県桜川市を拠点に、庭木の剪定・伐採・草刈りを承ります。<br>
            電話: 090-5306-0197<br>
            メール: extend.engineer007@gmail.com
          </p>
          <p>
            ※このメールは自動送信されています。<br>
            ※このメールに心当たりがない場合は、お手数ですが削除してください。
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// メール送信テスト
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log("Email server connection verified");
    return true;
  } catch (error) {
    console.error("Email server connection failed:", error);
    return false;
  }
}
