/**
 * useUtmParams - UTMパラメータを保持・管理するカスタムフック
 * 
 * 機能:
 * - 初回訪問時にURLからUTMパラメータを取得してsessionStorageに保存
 * - ページ遷移してもUTMパラメータを保持
 * - フォーム送信時に流入元情報を取得可能
 * 
 * 対応パラメータ:
 * - utm_source: 流入元（google, facebook, twitter等）
 * - utm_medium: メディア（cpc, organic, social等）
 * - utm_campaign: キャンペーン名
 * - utm_term: 検索キーワード
 * - utm_content: 広告コンテンツ識別
 * - gclid: Google広告クリックID
 * - fbclid: Facebook広告クリックID
 * - ref: リファラー（独自パラメータ）
 */

import { useEffect, useState } from "react";

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  ref?: string;
  landing_page?: string;
  referrer?: string;
  first_visit?: string;
}

const UTM_STORAGE_KEY = "totono_utm_params";

const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ref",
];

/**
 * URLからUTMパラメータを抽出
 */
function extractUtmParams(): Partial<UtmParams> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utmParams: Partial<UtmParams> = {};

  UTM_PARAM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmParams[key as keyof UtmParams] = value;
    }
  });

  return utmParams;
}

/**
 * sessionStorageからUTMパラメータを取得
 */
function getStoredUtmParams(): UtmParams | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * sessionStorageにUTMパラメータを保存
 */
function storeUtmParams(params: UtmParams): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * UTMパラメータを管理するカスタムフック
 */
export function useUtmParams() {
  const [utmParams, setUtmParams] = useState<UtmParams>({});

  useEffect(() => {
    // 既存の保存済みパラメータを取得
    const storedParams = getStoredUtmParams();
    
    // URLから新しいパラメータを抽出
    const urlParams = extractUtmParams();
    
    // 新しいUTMパラメータがある場合は更新（上書き）
    const hasNewUtmParams = Object.keys(urlParams).length > 0;
    
    if (hasNewUtmParams) {
      // 新しい流入の場合、全て更新
      const newParams: UtmParams = {
        ...urlParams,
        landing_page: window.location.pathname,
        referrer: document.referrer || undefined,
        first_visit: new Date().toISOString(),
      };
      storeUtmParams(newParams);
      setUtmParams(newParams);
    } else if (storedParams) {
      // 既存のパラメータを使用
      setUtmParams(storedParams);
    } else {
      // UTMパラメータなしの初回訪問
      const newParams: UtmParams = {
        landing_page: window.location.pathname,
        referrer: document.referrer || undefined,
        first_visit: new Date().toISOString(),
      };
      storeUtmParams(newParams);
      setUtmParams(newParams);
    }
  }, []);

  /**
   * フォーム送信用にUTMパラメータを取得
   */
  const getUtmParamsForForm = (): Record<string, string> => {
    const formParams: Record<string, string> = {};
    
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        formParams[key] = value;
      }
    });

    return formParams;
  };

  /**
   * UTMパラメータの概要を人間が読める形式で取得
   */
  const getUtmSummary = (): string => {
    const parts: string[] = [];

    if (utmParams.utm_source) {
      parts.push(`流入元: ${utmParams.utm_source}`);
    }
    if (utmParams.utm_medium) {
      parts.push(`メディア: ${utmParams.utm_medium}`);
    }
    if (utmParams.utm_campaign) {
      parts.push(`キャンペーン: ${utmParams.utm_campaign}`);
    }
    if (utmParams.gclid) {
      parts.push("Google広告経由");
    }
    if (utmParams.fbclid) {
      parts.push("Facebook広告経由");
    }
    if (utmParams.referrer) {
      parts.push(`参照元: ${utmParams.referrer}`);
    }

    return parts.length > 0 ? parts.join(" / ") : "直接訪問";
  };

  return {
    utmParams,
    getUtmParamsForForm,
    getUtmSummary,
  };
}

export default useUtmParams;
