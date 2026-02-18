/**
 * サンクスページ - フォーム送信完了後のコンバージョンページ
 * このページへの到達をコンバージョンとして計測可能
 * 
 * Google Analytics: /thanks ページビューをコンバージョンとして設定
 * Google Tag Manager: ページURLが /thanks の場合にコンバージョンタグを発火
 */

import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, Phone, MessageCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PHONE = "090-5306-0197";
const LINE_URL = "#line";

export default function Thanks() {
  // コンバージョン計測用のイベント発火
  useEffect(() => {
    // Google Analytics 4 イベント送信（gtag.jsが設置されている場合）
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        event_category: "form",
        event_label: "contact_form_submission",
        value: 1,
      });
    }

    // Google Tag Manager データレイヤープッシュ
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "form_submission",
        formType: "contact",
        conversionType: "lead",
      });
    }

    // Facebook Pixel イベント（設置されている場合）
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead");
    }

    // ページトップへスクロール
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest/5 to-background">
      {/* Header */}
      <header className="py-4 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="container">
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="w-10 h-10 bg-forest rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-charcoal">トトノ</span>
            </a>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-forest/10 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
                <CheckCircle className="w-12 h-12 text-forest" />
              </div>
            </div>

            {/* Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              お問い合わせありがとうございます
            </h1>
            <p className="text-lg text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              内容を確認の上、<strong className="text-foreground">12時間以内</strong>にご連絡いたします。<br />
              お急ぎの場合は、お電話またはLINEでお問い合わせください。
            </p>

            {/* Contact Options */}
            <Card className="border-0 shadow-lg mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  お急ぎの方はこちら
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`tel:${PHONE.replace(/-/g, "")}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-coral hover:bg-coral-dark text-white rounded-full font-medium transition-all hover:scale-105"
                  >
                    <Phone className="w-5 h-5" />
                    今すぐ電話で相談
                  </a>
                  <a
                    href={LINE_URL}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-full font-medium transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5" />
                    LINEで写真を送る
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  電話受付: 7:00〜20:00（不在時は折り返します）
                </p>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card className="border-0 shadow-md bg-muted/50 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  今後の流れ
                </h3>
                <ol className="text-left space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <span>お送りいただいた内容を確認し、概算見積もりをご連絡します</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                    <span>ご希望の場合、現地調査の日程を調整します（無料）</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <span>正式なお見積もりをご提示し、ご納得いただければ作業開始</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Back to Home */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <Home className="w-4 h-4" />
                  トップページに戻る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-charcoal text-white">
        <div className="container text-center">
          <p className="text-sm text-white/60">
            © 2024 トトノ - 地域密着の造園・伐採・草刈りサービス
          </p>
        </div>
      </footer>
    </div>
  );
}
