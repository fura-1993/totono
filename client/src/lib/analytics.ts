/**
 * Google Analytics 4 イベントトラッキング
 * コンバージョン計測用のユーティリティ関数
 */

// GA4のgtagが存在するかチェック
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * GA4にカスタムイベントを送信
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

/**
 * 電話ボタンクリックをトラッキング
 */
export function trackPhoneClick(location: string = "unknown") {
  trackEvent("phone_click", {
    event_category: "contact",
    event_label: location,
    value: 1,
  });
}

/**
 * LINEボタンクリックをトラッキング
 */
export function trackLineClick(location: string = "unknown") {
  trackEvent("line_click", {
    event_category: "contact",
    event_label: location,
    value: 1,
  });
}

/**
 * メールボタンクリックをトラッキング
 */
export function trackEmailClick(location: string = "unknown") {
  trackEvent("email_click", {
    event_category: "contact",
    event_label: location,
    value: 1,
  });
}

/**
 * フォーム送信をトラッキング
 */
export function trackFormSubmit(formType: string = "contact") {
  trackEvent("form_submit", {
    event_category: "conversion",
    event_label: formType,
    value: 1,
  });
}

/**
 * CTAボタンクリックをトラッキング
 */
export function trackCtaClick(ctaName: string, location: string = "unknown") {
  trackEvent("cta_click", {
    event_category: "engagement",
    event_label: `${ctaName}_${location}`,
    value: 1,
  });
}

/**
 * ページスクロール深度をトラッキング
 */
export function trackScrollDepth(depth: number) {
  trackEvent("scroll_depth", {
    event_category: "engagement",
    event_label: `${depth}%`,
    value: depth,
  });
}

/**
 * FAQ項目の開閉をトラッキング
 */
export function trackFaqInteraction(question: string, action: "open" | "close") {
  trackEvent("faq_interaction", {
    event_category: "engagement",
    event_label: question,
    action: action,
  });
}
