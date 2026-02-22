import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "【茨城・栃木・千葉】庭木の剪定・伐採・草刈りならトトノ｜1本からOK・見積無料",
  description:
    "茨城・栃木・千葉で庭木の剪定・伐採・草刈りに対応。写真見積もりOK、追加料金なし、1本から依頼可能。",
  openGraph: {
    title: "【茨城・栃木・千葉】庭木の剪定・伐採・草刈りならトトノ",
    description:
      "地域密着の造園サービス。写真見積もり・見積無料・12時間以内返信。",
    images: ["/images/ogp-logo.jpg"],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "【茨城・栃木・千葉】庭木の剪定・伐採・草刈りならトトノ",
    description:
      "地域密着の造園サービス。写真見積もり・見積無料・12時間以内返信。",
    images: ["/images/ogp-logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning className={notoSansJp.variable}>
      <body className={notoSansJp.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
