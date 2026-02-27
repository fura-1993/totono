"use client";

/**
 * トトノLP - 地域密着の造園・伐採・草刈りサービス
 * デザイン: プロフェッショナル・クラフト
 * - 職人の道具箱のような実直さと現代的な洗練の融合
 * - カラー: オフホワイト + チャコール + ディープグリーン + コーラルオレンジCTA
 * - アニメーション: 軽量なtransform/opacityベース
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Phone, MessageCircle, Mail, Check, ChevronRight, Clock, MapPin, Shield, Sparkles, TreeDeciduous, Scissors, Leaf, Home as HomeIcon, Building, Mountain, AlertTriangle, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContactForm } from "@/components/ContactForm";
import { Testimonials } from "@/components/Testimonials";
import { PriceSimulator } from "@/components/PriceSimulator";
import { trackPhoneClick, trackLineClick, trackEmailClick } from "@/lib/analytics";

// Contact info
const PHONE = "090-5306-0197";
const EMAIL = "extend.engineer007@gmail.com";
const LINE_URL = "https://lin.ee/UNR8hec"; // LINE公式アカウントURL

type ContactChannelId = "phone" | "line" | "email";

type ContactChannel = {
  id: ContactChannelId;
  href: string;
  icon: LucideIcon;
  label: string;
  subLabel: string;
  floatingLabelDesktop: string;
  floatingLabelMobile: string;
  sectionClassName: string;
  floatingClassName: string;
};

const GLOBAL_NAV_ITEMS = [
  { href: "#services", label: "サービス" },
  { href: "#pricing", label: "料金" },
  { href: "#cases", label: "施工事例" },
  { href: "#testimonials", label: "お客様の声" },
  { href: "#faq", label: "よくある質問" },
  { href: "#contact", label: "お問い合わせ" },
];

export type HomeAchievement = {
  id: number;
  title: string;
  description: string;
  location?: string | null;
  serviceType?: string | null;
  workDate?: string | null;
  duration?: string | null;
  scope?: string | null;
  imageUrl?: string | null;
};

export default function Home({ achievements = [] }: { achievements?: HomeAchievement[] }) {
  const [isFloatingCtaVisible, setIsFloatingCtaVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroHeadlineSecondaryRef = useRef<HTMLSpanElement>(null);

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Floating CTA visibility
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setIsFloatingCtaVisible(heroBottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep the second headline segment on one line while fitting the card width.
  useLayoutEffect(() => {
    const headingEl = heroHeadlineRef.current;
    const secondaryEl = heroHeadlineSecondaryRef.current;

    if (!headingEl || !secondaryEl || typeof ResizeObserver === "undefined") {
      return;
    }

    const minFontPx = 12;

    const fitSecondaryText = () => {
      const headingFontPx = Number.parseFloat(window.getComputedStyle(headingEl).fontSize) || 24;
      const maxFontPx = Math.max(headingFontPx, 24);
      secondaryEl.style.fontSize = `${maxFontPx}px`;

      const availableWidth = headingEl.clientWidth;
      if (availableWidth <= 0) {
        secondaryEl.style.fontSize = `${minFontPx}px`;
        return;
      }

      const secondaryWidth = secondaryEl.scrollWidth;
      if (secondaryWidth <= availableWidth) {
        return;
      }

      const fittedFontSize = Math.max(
        minFontPx,
        Math.min(maxFontPx, maxFontPx * (availableWidth / secondaryWidth))
      );
      secondaryEl.style.fontSize = `${fittedFontSize}px`;
    };

    let rafId = 0;
    const scheduleFit = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(fitSecondaryText);
    };

    scheduleFit();

    const observer = new ResizeObserver(scheduleFit);
    observer.observe(headingEl);
    observer.observe(secondaryEl);
    window.addEventListener("resize", scheduleFit, { passive: true });

    if ("fonts" in document) {
      void document.fonts.ready.then(scheduleFit).catch(() => undefined);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", scheduleFit);
    };
  }, []);

  const comparisonRows = [
    { item: "見積もり方法", us: "写真でOK / 現地無料", them: "現地のみ（有料の場合も）" },
    { item: "返信スピード", us: "12時間以内", them: "数日〜1週間" },
    { item: "最低依頼本数", us: "1本からOK", them: "複数本〜" },
    { item: "追加料金", us: "事前説明・了承制", them: "作業後に請求されることも" },
    { item: "近隣への配慮", us: "事前挨拶・養生徹底", them: "業者による" },
  ];

  const contactChannels: ContactChannel[] = [
    {
      id: "phone",
      href: `tel:${PHONE}`,
      icon: Phone,
      label: "電話で無料相談",
      subLabel: "7:00〜20:00",
      floatingLabelDesktop: PHONE,
      floatingLabelMobile: "電話相談",
      sectionClassName: "cta-button bg-coral text-white flex flex-col items-center gap-2 py-6",
      floatingClassName: "flex-1 sm:flex-none cta-button bg-coral text-white text-sm py-3 px-4 flex items-center justify-center gap-2",
    },
    {
      id: "line",
      href: LINE_URL,
      icon: MessageCircle,
      label: "LINEで無料概算",
      subLabel: "写真を送るだけ",
      floatingLabelDesktop: "LINEで無料概算",
      floatingLabelMobile: "LINE概算",
      sectionClassName: "cta-button bg-[#06C755] text-white flex flex-col items-center gap-2 py-6",
      floatingClassName: "flex-1 sm:flex-none cta-button bg-[#06C755] text-white text-sm py-3 px-4 flex items-center justify-center gap-2",
    },
    {
      id: "email",
      href: `mailto:${EMAIL}`,
      icon: Mail,
      label: "メールで無料見積もり",
      subLabel: "24時間受付",
      floatingLabelDesktop: "メール",
      floatingLabelMobile: "メール",
      sectionClassName: "cta-button bg-white text-forest flex flex-col items-center gap-2 py-6",
      floatingClassName: "hidden sm:flex flex-1 sm:flex-none cta-button bg-forest text-white text-sm py-3 px-4 items-center justify-center gap-2",
    },
  ];

  const trackContactClick = (channelId: ContactChannelId, placement: string) => {
    if (channelId === "phone") {
      trackPhoneClick(placement);
      return;
    }
    if (channelId === "line") {
      trackLineClick(placement);
      return;
    }
    trackEmailClick(placement);
  };

  return (
    <div className="lp-page min-h-screen bg-background overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
      >
        メインコンテンツへスキップ
      </a>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/15 bg-charcoal/55 backdrop-blur-md shadow-[0_8px_24px_-18px_rgba(0,0,0,0.75)]">
        <div className="container flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg border border-white/25 bg-white/10 flex items-center justify-center">
              <TreeDeciduous className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold tracking-wide text-xl text-white">トトノ</span>
          </a>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {GLOBAL_NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="hero-header-link">
                {item.label}
              </a>
            ))}
            <div className="hero-header-cta" aria-label={`電話番号 ${PHONE}`}>
              <Phone className="w-4 h-4 inline mr-1" />
              {PHONE}
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <button
            type="button"
            className={`mobile-menu-toggle inline-flex md:hidden ${mobileMenuOpen ? "is-open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="sr-only">{mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}</span>
            <span className="mobile-menu-toggle-bar" aria-hidden="true" />
            <span className="mobile-menu-toggle-bar" aria-hidden="true" />
            <span className="mobile-menu-toggle-bar" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu-layer md:hidden ${mobileMenuOpen ? "is-open" : ""}`} aria-hidden={!mobileMenuOpen}>
          <button
            type="button"
            className="mobile-menu-scrim"
            aria-label="メニューを閉じる"
            tabIndex={mobileMenuOpen ? 0 : -1}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div id="mobile-navigation" className="mobile-menu-panel">
            <nav className="container flex flex-col gap-1 py-3" aria-label="モバイルナビゲーション">
              {GLOBAL_NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="mobile-menu-link"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-white/55" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content">
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 md:pt-24 min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Hero image - 伐採作業中のスタッフ */}
          <Image
            src="/images/hero-work.png"
            alt="トトノのスタッフ - チェーンソーで伐採作業中"
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/68 via-charcoal/42 to-transparent" />
        </div>
        
        <div className="relative z-10 container pt-2 md:pt-4 lg:pt-6 pb-16 md:pb-24 lg:pb-32">
          <div className="max-w-3xl rounded-2xl border border-white/18 bg-black/24 backdrop-blur-[2px] px-6 py-8 md:px-8 md:py-10 lg:px-9 lg:py-11">
            {/* Badges */}
            <div className="-mt-1 md:-mt-2 flex flex-wrap md:flex-nowrap items-center gap-2 mb-4 animate-fade-in-up">
              <span className="hero-meta-badge">
                <MapPin className="hero-meta-icon" />
                茨城・栃木・千葉対応
              </span>
            </div>
            
            {/* Main headline */}
            <h1 ref={heroHeadlineRef} className="text-[clamp(1.5rem,4.8vw,3rem)] font-semibold tracking-tight text-white leading-[1.22] mb-3 animate-fade-in-up stagger-1">
              <span className="inline-flex items-center rounded-md border border-white/24 bg-black/30 px-2.5 py-1 text-[#f3dcc7] [text-shadow:0_2px_10px_rgba(0,0,0,0.35)]">
                剪定・伐採・草刈り
              </span>
              <span ref={heroHeadlineSecondaryRef} className="block mt-1 whitespace-nowrap leading-tight">
                写真で無料概算、12時間以内に返信
              </span>
            </h1>
            
            <p className="text-[clamp(0.84rem,2.25vw,1.1rem)] leading-relaxed text-white/95 mb-4 animate-fade-in-up stagger-2">
              茨城・栃木・千葉で、庭木の剪定・伐採・草刈りに専門対応。<br className="hidden md:block" />
              1本からご依頼OK。追加作業は必ず事前説明のうえご判断いただきます。
            </p>

            <div className="mt-6 md:mt-7 grid grid-cols-3 gap-[clamp(0.5rem,1.3vw,1rem)] mb-6 animate-fade-in-up stagger-2">
              <div className="hero-service-card">
                <Scissors className="hero-service-icon text-coral" />
                <p className="hero-service-title">剪定</p>
                <p className="hero-service-desc">樹形を整えて見た目と風通しを改善</p>
              </div>
              <div className="hero-service-card">
                <TreeDeciduous className="hero-service-icon text-coral" />
                <p className="hero-service-title">伐採</p>
                <p className="hero-service-desc">危険木や不要木を安全に撤去</p>
              </div>
              <div className="hero-service-card">
                <Leaf className="hero-service-icon text-coral" />
                <p className="hero-service-title">草刈り</p>
                <p className="hero-service-desc">空き地や庭の草をすっきり管理</p>
              </div>
            </div>
            
            {/* Trust badges */}
            <div className="hero-trust-row mb-3 md:mb-6 animate-fade-in-up stagger-3">
              <div className="hero-trust-item">
                <Check className="hero-trust-icon" />
                <span className="hero-trust-text">内訳明瞭</span>
              </div>
              <div className="hero-trust-item">
                <Check className="hero-trust-icon" />
                <span className="hero-trust-text">12h返信</span>
              </div>
              <div className="hero-trust-item">
                <Check className="hero-trust-icon" />
                <span className="hero-trust-text">追加前確認</span>
              </div>
            </div>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up stagger-4">
              <a 
                href={`tel:${PHONE}`} 
                className="hero-cta hero-cta-phone cta-button text-white flex items-center justify-center gap-2"
                onClick={() => trackPhoneClick('hero')}
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">{PHONE}</span>
                <span className="sm:hidden">電話で無料相談する</span>
              </a>
              <a 
                href={LINE_URL} 
                className="hero-cta hero-cta-line cta-button text-white flex items-center justify-center gap-2"
                onClick={() => trackLineClick('hero')}
              >
                <MessageCircle className="w-5 h-5" />
                <span>LINEで無料概算を受け取る</span>
              </a>
            </div>
            
            <p className="text-sm text-white/70 mt-4 animate-fade-in-up stagger-5">
              電話受付: 7:00〜20:00（不在時は折り返します）
            </p>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-background"/>
          </svg>
        </div>
      </section>

      {/* Quick Price Simulator (first view immediately below) */}
      <PriceSimulator compact sectionId="pricing" />

      {achievements.length > 0 && (
        <section className="py-12 md:py-20 bg-muted">
          <div className="container">
            <div className="reveal text-center mb-10">
              <span className="badge bg-forest/10 text-forest mb-4">最新の施工実績</span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                管理画面から更新された実績
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 reveal">
              {achievements.map((item) => (
                <Card key={item.id} className="overflow-hidden border-0 shadow-md">
                  {item.imageUrl ? (
                    <div className="aspect-video">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {item.location ? <span className="text-muted-foreground">{item.location}</span> : null}
                      {item.duration ? <span className="text-muted-foreground">作業時間: {item.duration}</span> : null}
                      {item.scope ? <span className="text-muted-foreground">規模: {item.scope}</span> : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service Area Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="reveal">
            <div className="text-center mb-8">
              <span className="badge bg-forest/10 text-forest mb-4">
                <MapPin className="w-4 h-4" />
                対応エリア
              </span>
              <h2 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(1.25rem,4.8vw,1.875rem)] font-bold text-foreground">
                茨城・栃木・千葉の広域に対応
              </h2>
            </div>
            
            <div className="bg-secondary/50 rounded-2xl p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold text-forest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-forest rounded-full"></span>
                    茨城県
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    桜川市・筑西市・結城市・下妻市・常総市・つくば市・土浦市・石岡市・笠間市・水戸市・古河市・坂東市・境町・八千代町・五霞町
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-forest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-forest rounded-full"></span>
                    栃木県
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    栃木市・小山市・佐野市・足利市・真岡市・下野市・壬生町・野木町
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-forest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-forest rounded-full"></span>
                    千葉県
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    我孫子市・柏市・野田市・流山市・松戸市・印西市・白井市
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6 text-center">
                ※上記以外のエリアもお気軽にご相談ください
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-12 md:py-20 bg-muted">
        <div className="container">
          <div className="problem-board reveal">
            <div className="problem-board-head">
              <h2 className="problem-board-title">こんな悩み、ありませんか？</h2>
              <p className="problem-board-sub">放置すると、見た目だけでなく安全面やご近所への配慮にも不安が出てきます。</p>
            </div>

            <div className="problem-soil" aria-hidden="true" />

            <div className="problem-cards">
              {[
                { text: "庭木が伸びすぎて、ご近所に迷惑をかけていないか心配", slot: "problem-1" },
                { text: "空き家の庭が荒れ放題で、どこに頼めばいいかわからない", slot: "problem-2" },
                { text: "業者に頼むと高そう…追加料金が怖い", slot: "problem-3" },
                { text: "自分で草刈りするのは体力的にキツくなってきた", slot: "problem-4" },
                { text: "山林の木が倒れそうで危険だけど、対応してくれる業者が見つからない", slot: "problem-5" },
                { text: "見積もりを取りたいけど、立ち会う時間がない", slot: "problem-6" },
                { text: "以前頼んだ業者の仕上がりがイマイチだった", slot: "problem-7" },
              ].map((item, i) => (
                <article key={i} className="problem-wood-card">
                  <div className="problem-image-slot" data-slot={item.slot}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <p className="problem-wood-text">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="problem-arrow" aria-hidden="true" />

            <div className="problem-answer">
              <p className="problem-answer-title">そのお悩み、トトノが解決します</p>
              <p className="problem-answer-text">地元密着だからできる、丁寧で誠実な対応をお約束</p>
              <div className="problem-answer-icons" aria-hidden="true">
                <MapPin className="w-5 h-5" />
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="services" className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="reveal text-center mb-10">
            <span className="badge bg-forest/10 text-forest mb-4">
              <Sparkles className="w-4 h-4" />
              選ばれる理由
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              トトノが選ばれる5つの理由
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 reveal">
            {[
              {
                icon: <Clock className="w-8 h-8" />,
                title: "12時間以内に返信",
                description: "LINE・メールは24時間受付。お問い合わせから12時間以内にスタッフが返信します。急ぎの場合は電話でどうぞ。",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "追加料金なしの明朗会計",
                description: "お見積もり金額から追加請求は一切なし。作業前に料金の内訳をしっかりご説明します。",
              },
              {
                icon: <TreeDeciduous className="w-8 h-8" />,
                title: "1本からでもOK",
                description: "「この木1本だけ切ってほしい」も大歓迎。小さな作業でも丁寧に対応します。",
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "写真で概算見積もり",
                description: "LINEで写真を送るだけで概算をお伝えできます。忙しくて立ち会えない方も安心。",
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "地元密着の安心感",
                description: "茨城県桜川市を拠点に、地域の気候や植生を熟知。ご近所への配慮も万全です。",
              },
            ].map((item, i) => (
              <Card key={i} className="card-hover border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-forest/10 rounded-xl flex items-center justify-center text-forest mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 md:py-20 bg-forest text-white">
        <div className="container">
          <div className="reveal text-center mb-10">
            <h2 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(1.15rem,3.3vw,2rem)] font-bold">
              ご依頼から完了まで3ステップ
            </h2>
            <p className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(0.86rem,2.2vw,1.08rem)] text-white/80 mt-2">かんたん・スピーディーにお庭をキレイに</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 reveal">
            {[
              {
                step: "01",
                title: "お問い合わせ",
                description: "電話・LINE・メールでお気軽にご連絡ください。LINEなら写真を送るだけで概算をお伝えできます。",
              },
              {
                step: "02",
                title: "現地確認・お見積もり",
                description: "必要に応じて現地を確認し、正式なお見積もりをご提示。ご納得いただいてから作業開始です。",
              },
              {
                step: "03",
                title: "作業・お支払い",
                description: "プロの技術で丁寧に作業。完了後にご確認いただき、現金またはお振込みでお支払い。",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white/12 border border-white/25 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest font-black text-lg shadow-md ring-2 ring-coral/60">
                      {item.step}
                    </div>
                    <span className="text-xs font-semibold tracking-[0.14em] text-white/80">STEP</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="reveal text-center mb-10">
            <span className="badge bg-forest/10 text-forest mb-4">
              料金目安
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              サービス・料金のご案内
            </h2>
            <p className="text-muted-foreground">
              ※料金は目安です。木の高さ・処分量・作業環境により変動します
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal">
            {[
              {
                icon: <Scissors className="w-8 h-8" />,
                title: "庭木の剪定",
                price: "3,000円〜",
                unit: "/ 1本",
                description: "松・槙・庭木全般の本格剪定。樹形を整え、美しいお庭に。",
                example: "例: 高さ2〜3mの庭木1本（枝葉処分込み）",
                features: ["低木〜高木まで対応", "枝葉の処分込み", "年間管理もOK"],
                image: "/images/service-sentei.png",
              },
              {
                icon: <TreeDeciduous className="w-8 h-8" />,
                title: "伐採・抜根",
                price: "5,000円〜",
                unit: "/ 1本",
                description: "邪魔な木、危険な木を安全に伐採。山林の間伐も対応。",
                example: "例: 高さ2m程度の伐採1本（重機なし）",
                features: ["重機使用可能", "処分費込み", "山林・竹林OK"],
                image: "/images/service-batsuboku.png",
              },
              {
                icon: <Leaf className="w-8 h-8" />,
                title: "草刈り・草抜き",
                price: "50円〜",
                unit: "/ 1㎡",
                description: "伸び放題の雑草をスッキリ。定期的な管理もお任せください。",
                example: "例: 30㎡の機械草刈り（最低料金500円〜）",
                features: ["機械刈り・手作業", "除草剤散布可", "定期契約割引あり"],
                image: "/images/service-kusakari.png",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "防草シート施工",
                price: "1,500円〜",
                unit: "/ 1㎡",
                description: "草刈りの手間を大幅削減。長期間雑草を抑制します。",
                example: "例: 20㎡の施工（下地調整込み）",
                features: ["高耐久シート使用", "砂利敷き対応", "10年保証品あり"],
                image: "/images/防草シート施工.png",
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "人工芝施工",
                price: "8,000円〜",
                unit: "/ 1㎡",
                description: "お手入れ不要で年中キレイな緑。お子様やペットにも安心。",
                example: "例: 15㎡の施工（下地処理込み）",
                features: ["高品質人工芝", "下地処理込み", "10年耐久品"],
                image: "/images/人工芝施工.png",
              },
              {
                icon: <HomeIcon className="w-8 h-8" />,
                title: "空き家の定期管理",
                price: "5,000円〜",
                unit: "/ 月",
                description: "遠方にお住まいの方も安心。定期的な見回りと庭の管理。",
                example: "例: 月1回の巡回＋写真報告",
                features: ["月1回〜対応", "写真報告あり", "郵便物確認可"],
                image: "/images/空き家の定期管理.png",
              },
            ].map((item, i) => (
              <Card key={i} className="card-hover border-0 shadow-md overflow-hidden">
                {item.image && (
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={72}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-forest/10 rounded-xl flex items-center justify-center text-forest">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-black text-coral">{item.price}</span>
                    <span className="text-sm text-muted-foreground">{item.unit}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <p className="text-xs text-foreground/80 bg-muted rounded-lg px-3 py-2 mb-4">{item.example}</p>
                  <ul className="space-y-2">
                    {item.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-forest" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pricing transparency */}
          <div className="reveal mt-10 factor-panel">
            <div className="factor-title">料金が決まる要素</div>

            <div className="factor-grid">
              {[
                {
                  icon: <TreeDeciduous className="w-5 h-5" />,
                  label: "木の高さ・太さ",
                  note: "高木・大径木は割増",
                  image: "/images/木の大きさ高さ.png",
                },
                {
                  icon: <AlertTriangle className="w-5 h-5" />,
                  label: "作業の難易度",
                  note: "狭所・傾斜地など",
                  image: "/images/作業難易度.png",
                },
                {
                  icon: <Leaf className="w-5 h-5" />,
                  label: "処分量",
                  note: "枝葉・幹の量",
                  image: "/images/処分量.png",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  label: "重機の必要性",
                  note: "クレーン・ユンボ等",
                  image: "/images/重機の必要性.png",
                },
              ].map((item, i) => (
                <div key={i} className="factor-card">
                  <div className="factor-card-head">
                    <span className="factor-card-icon">{item.icon}</span>
                    <span className="factor-card-label">{item.label}</span>
                  </div>
                  <div className="factor-card-body">
                    <Image
                      src={item.image}
                      alt={item.label}
                      width={360}
                      height={240}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      quality={72}
                      className="factor-card-image"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="factor-warning">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p>※追加料金が発生する場合は、必ず事前にご説明・ご了承をいただきます</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Locations */}
      <section className="py-12 md:py-20 bg-muted">
        <div className="container">
          <div className="reveal text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              こんな場所も対応します
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 reveal">
            {[
              { icon: <HomeIcon className="w-6 h-6" />, label: "戸建て住宅" },
              { icon: <Building className="w-6 h-6" />, label: "空き家・空き地" },
              { icon: <Building className="w-6 h-6" />, label: "店舗・施設" },
              { icon: <Mountain className="w-6 h-6" />, label: "山林・竹林" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center text-forest mx-auto mb-3">
                  {item.icon}
                </div>
                <p className="font-medium text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="reveal text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              業者選びのポイント
            </h2>
            <p className="text-muted-foreground">
              後悔しない業者選びのために
            </p>
          </div>
          
          <div className="reveal">
            <div className="md:hidden space-y-3">
              {comparisonRows.map((row, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">{row.item}</p>
                    <div className="rounded-lg bg-forest/5 px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-1">トトノ</p>
                      <p className="text-sm font-medium text-forest inline-flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        {row.us}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-1">一般的な業者</p>
                      <p className="text-sm text-muted-foreground">{row.them}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full bg-white rounded-2xl shadow-md overflow-hidden">
                <thead>
                  <tr className="bg-forest text-white">
                    <th className="p-4 text-left font-medium">比較項目</th>
                    <th className="p-4 text-center font-medium">トトノ</th>
                    <th className="p-4 text-center font-medium">一般的な業者</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="p-4 font-medium text-foreground">{row.item}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-forest font-medium">
                          <Check className="w-4 h-4" />
                          {row.us}
                        </span>
                      </td>
                      <td className="p-4 text-center text-muted-foreground">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Section */}
      <section className="py-12 md:py-20 bg-coral/5">
        <div className="container">
          <div className="reveal text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              放置するとこんなリスクが…
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal">
            {[
              { title: "近隣トラブル", desc: "枝葉が隣家に侵入、落ち葉で迷惑をかける" },
              { title: "害虫の発生", desc: "毛虫・蜂の巣など、人体への被害も" },
              { title: "倒木の危険", desc: "台風・強風で倒れ、建物や人に被害" },
              { title: "景観の悪化", desc: "荒れた庭は地域の美観を損ねる" },
              { title: "防犯上の問題", desc: "空き家と見なされ、不法侵入のリスク" },
              { title: "資産価値の低下", desc: "売却時に大幅なマイナス評価に" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-coral">
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="reveal mt-8 text-center">
            <p className="text-lg font-medium text-foreground">
              早めの対処で、費用も手間も最小限に
            </p>
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section id="cases" className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="reveal text-center mb-10">
            <span className="badge bg-forest/10 text-forest mb-4">
              施工事例
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              ビフォー・アフター
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 reveal">
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="relative aspect-video">
                <Image
                  src="/images/grass-cutting.jpg"
                  alt="草刈りビフォーアフター"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={72}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-foreground mb-2">草刈り｜桜川市 S様邸</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  1年以上放置されていた庭の草刈り。膝丈まで伸びた雑草を機械と手作業で除去。防草シートの施工もご提案しました。
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">作業時間: 半日</span>
                  <span className="text-muted-foreground">面積: 約50㎡</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="relative aspect-video">
                <Image
                  src="/images/before-after-garden.jpg"
                  alt="庭木剪定ビフォーアフター"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={72}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-foreground mb-2">庭木剪定｜筑西市 T様邸</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  伸び放題だった庭木を本格剪定。樹形を整え、日当たりと風通しを改善。お客様から「見違えるようになった」とお喜びの声。
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">作業時間: 1日</span>
                  <span className="text-muted-foreground">本数: 8本</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="relative aspect-video">
                <Image
                  src="/images/service-batsuboku.png"
                  alt="伐採ビフォーアフター"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={72}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-foreground mb-2">伐採・抹根｜下妻市 K様邸</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  台風で傾いた危険な樹木を安全に伐採。根まで完全に除去し、整地まで完了。「危ないと思っていたので安心しました」との声。
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">作業時間: 1日</span>
                  <span className="text-muted-foreground">本数: 3本</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="relative aspect-video">
                <Image
                  src="/images/service-sentei.png"
                  alt="松の剪定ビフォーアフター"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={72}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-foreground mb-2">松の剪定｜古河市 M様邸</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  伝統的な日本庭園の松を丁寧に剪定。美しい樹形を保ちながら、風通しと日当たりを改善。「職人の技が光る」と御満足いただきました。
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">作業時間: 2日</span>
                  <span className="text-muted-foreground">本数: 5本</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-forest text-white">
        <div className="container">
          <div className="reveal text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              まずはお気軽にご相談ください
            </h2>
            <p className="text-white/80 mb-8">
              写真を送るだけで無料概算をご案内。お問い合わせには12時間以内に返信します。<br />
              「この木1本だけ頼みたい」といったご相談も歓迎です。
            </p>
            
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                const subLabelClassName = channel.id === "email" ? "text-sm text-forest/70" : "text-sm text-white/80";
                return (
                  <a
                    key={channel.id}
                    href={channel.href}
                    className={channel.sectionClassName}
                    onClick={() => trackContactClick(channel.id, "cta_section")}
                  >
                    <Icon className="w-8 h-8" />
                    {channel.id === "phone" ? (
                      <span className="font-bold">
                        <span className="hidden sm:inline">{PHONE}</span>
                        <span className="sm:hidden">{channel.label}</span>
                      </span>
                    ) : (
                      <span className="font-bold">{channel.label}</span>
                    )}
                    <span className={subLabelClassName}>{channel.subLabel}</span>
                  </a>
                );
              })}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                見積無料
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                12時間以内返信
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                1本からOK
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="reveal text-center mb-10">
            <span className="badge bg-forest/10 text-forest mb-4">
              FAQ
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              よくあるご質問
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto reveal">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  q: "見積もりは無料ですか？",
                  a: "はい、お見積もりは完全無料です。LINEで写真を送っていただければ概算をお伝えすることもできます。正式なお見積もりは現地確認後にご提示します。",
                },
                {
                  q: "1本だけでも依頼できますか？",
                  a: "もちろんです。「この木1本だけ」「この部分の草だけ」といった小さなご依頼も喜んでお受けします。お気軽にご相談ください。",
                },
                {
                  q: "作業後に追加料金を請求されることはありますか？",
                  a: "お見積もり金額から追加請求することは一切ありません。万が一、作業中に追加作業が必要になった場合は、必ず事前にご説明し、ご了承をいただいてから行います。",
                },
                {
                  q: "切った枝や草は処分してもらえますか？",
                  a: "はい、基本的にお見積もりに処分費用を含めてご提示します。ご自身で処分される場合は、その分お安くすることも可能です。",
                },
                {
                  q: "どのくらいの期間で作業してもらえますか？",
                  a: "繁忙期を除き、お問い合わせから1〜2週間程度で作業可能です。お急ぎの場合はご相談ください。できる限り対応いたします。",
                },
                {
                  q: "雨の日でも作業できますか？",
                  a: "小雨程度であれば作業可能ですが、安全面を考慮し、大雨や強風の日は延期させていただく場合があります。その際は事前にご連絡いたします。",
                },
                {
                  q: "支払い方法は？",
                  a: "現金またはお振込みでお願いしております。作業完了後、ご確認いただいてからのお支払いとなります。",
                },
              ].map((item, i) => {
                const triggerId = `faq-trigger-${i}`;
                const contentId = `faq-content-${i}`;
                return (
                  <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-xl shadow-sm border-0 px-6">
                    <AccordionTrigger
                      id={triggerId}
                      aria-controls={contentId}
                      className="text-left font-medium text-foreground hover:no-underline py-5"
                    >
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent
                      id={contentId}
                      aria-labelledby={triggerId}
                      className="text-muted-foreground pb-5"
                    >
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-12 md:py-20 bg-muted">
        <div className="container">
          <div className="reveal text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              メールでのお問い合わせ
            </h2>
            <p className="text-muted-foreground">
              24時間受付・12時間以内に返信いたします
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto reveal">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-charcoal text-white">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-forest rounded-lg flex items-center justify-center">
                  <TreeDeciduous className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">トトノ</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                茨城県桜川市を拠点に、庭木の剪定・伐採・草刈りを承ります。<br />
                地域密着の丁寧な対応で、お庭のお悩みを解決します。
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">事業者情報</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>屋号：トトノ</li>
                <li>代表：棟方 信行</li>
                <li>本拠点：茨城県桜川市</li>
                <li>その他拠点：栃木県栃木市、茨城県筑西市、千葉県我孫子市</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">お問い合わせ</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href={`tel:${PHONE}`} 
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    onClick={() => trackPhoneClick('footer')}
                  >
                    <Phone className="w-4 h-4" />
                    {PHONE}（7:00〜20:00）
                  </a>
                </li>
                <li>
                  <a 
                    href={`mailto:${EMAIL}`} 
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    onClick={() => trackEmailClick('footer')}
                  >
                    <Mail className="w-4 h-4" />
                    {EMAIL}
                  </a>
                </li>
                <li>
                  <a 
                    href={LINE_URL} 
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    onClick={() => trackLineClick('footer')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    LINE公式アカウント
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/50">
            <p>© 2024 トトノ All rights reserved.</p>
          </div>
        </div>
      </footer>
      </main>

      {/* Floating CTA */}
      <div className={`floating-cta ${isFloatingCtaVisible ? "" : "hidden"}`}>
        <div className="container py-3">
          <div className="flex items-center justify-center gap-3">
            {contactChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.id}
                  href={channel.href}
                  className={channel.floatingClassName}
                  onClick={() => trackContactClick(channel.id, "floating_cta")}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{channel.floatingLabelDesktop}</span>
                  <span className="sm:hidden">{channel.floatingLabelMobile}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
