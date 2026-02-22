/**
 * PriceSimulator - 料金シミュレーター
 * 木の本数・高さを選んで概算見積もりを表示
 */

import { useState } from "react";
import { Calculator, TreeDeciduous, Scissors, Leaf, AlertTriangle, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackPhoneClick, trackLineClick } from "@/lib/analytics";

// 料金表（税込）
const PRICING = {
  sentei: { // 剪定
    low: { label: "低木（〜2m）", price: 3000 },
    medium: { label: "中木（2〜4m）", price: 7000 },
    high: { label: "高木（4〜6m）", price: 15000 },
    veryHigh: { label: "大木（6m〜）", price: 25000 },
    over15: { label: "超高木（15m超）", price: 0 },
  },
  batsuboku: { // 伐採
    low: { label: "低木（〜2m）", price: 5000 },
    medium: { label: "中木（2〜4m）", price: 12000 },
    high: { label: "高木（4〜6m）", price: 25000 },
    veryHigh: { label: "大木（6m〜）", price: 40000 },
    over15: { label: "超高木（15m超）", price: 0 },
  },
  kusakari: { // 草刈り（㎡単価）
    price: 50,
    minCharge: 500, // 最低料金
  },
};

type ServiceType = "sentei" | "batsuboku" | "kusakari" | "tokushu";
type TreeSize = "low" | "medium" | "high" | "veryHigh" | "over15";
type DisposalType = "without" | "with";

const PHONE = "090-5306-0197";
const LINE_URL = "https://lin.ee/UNR8hec";

type PriceSimulatorProps = {
  compact?: boolean;
  sectionId?: string;
};

export function PriceSimulator({ compact = false, sectionId = "simulator" }: PriceSimulatorProps) {
  const [serviceType, setServiceType] = useState<ServiceType>("sentei");
  const [treeSize, setTreeSize] = useState<TreeSize>("medium");
  const [treeCount, setTreeCount] = useState(1);
  const [isManyTrees, setIsManyTrees] = useState(false);
  const [area, setArea] = useState(50); // 草刈り用（㎡）
  const [disposalType, setDisposalType] = useState<DisposalType>("without");
  const [showResult, setShowResult] = useState(false);
  const requiresConsult = serviceType === "tokushu" || (serviceType !== "kusakari" && (isManyTrees || treeSize === "over15"));

  // 料金計算
  const calculatePrice = () => {
    if (requiresConsult) return null;

    let basePrice = 0;

    if (serviceType === "kusakari") {
      const calculated = area * PRICING.kusakari.price;
      basePrice = Math.max(calculated, PRICING.kusakari.minCharge);
    } else if (serviceType === "sentei" || serviceType === "batsuboku") {
      const pricing = PRICING[serviceType];
      basePrice = pricing[treeSize].price * treeCount;
    } else {
      return null;
    }

    const disposalMultiplier = disposalType === "with" ? 1.8 : 1;
    return Math.round(basePrice * disposalMultiplier);
  };

  const estimatedPrice = calculatePrice();
  const priceRange = estimatedPrice !== null ? {
    min: Math.floor(estimatedPrice * 0.8),
    max: Math.ceil(estimatedPrice * 1.2),
  } : null;

  const handleCalculate = () => {
    setShowResult(true);
  };

  const shouldShowResult = compact || showResult;

  return (
    <section id={sectionId} className={compact ? "py-12 md:py-16 bg-forest/5" : "py-16 md:py-24 bg-forest/5"}>
      <div className="container">
        <div className="reveal">
          {/* Section header */}
          <div className={compact ? "text-center mb-8" : "text-center mb-12"}>
            <span className="badge bg-coral/10 text-coral mb-4">
              <Calculator className="w-4 h-4" />
              {compact ? "30秒見積もり" : "料金シミュレーター"}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {compact ? "まずは概算をチェック" : "概算料金をチェック"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {compact ? (
                <>
                  3ステップでおおよその料金帯を確認できます。<br />
                  正式見積もりは無料でご案内します。
                </>
              ) : (
                <>
                  サービス内容を選んで、おおよその料金を確認できます。<br />
                  正確なお見積もりは現地確認後にご提示します。
                </>
              )}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-white border-none shadow-lg">
              <CardContent className="p-6 md:p-8">
                {/* Step 1: サービス選択 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 bg-forest text-white rounded-full flex items-center justify-center text-sm">1</span>
                    サービスを選択
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => { setServiceType("sentei"); setShowResult(false); }}
                      aria-pressed={serviceType === "sentei"}
                      aria-label="サービス種別: 剪定"
                      className={`p-4 rounded-xl border-2 transition-all ${
                        serviceType === "sentei"
                          ? "border-forest bg-forest/5"
                          : "border-border hover:border-forest/50"
                      }`}
                    >
                      <Scissors className={`w-6 h-6 mx-auto mb-2 ${serviceType === "sentei" ? "text-forest" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${serviceType === "sentei" ? "text-forest" : "text-foreground"}`}>剪定</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setServiceType("batsuboku"); setShowResult(false); }}
                      aria-pressed={serviceType === "batsuboku"}
                      aria-label="サービス種別: 伐採"
                      className={`p-4 rounded-xl border-2 transition-all ${
                        serviceType === "batsuboku"
                          ? "border-forest bg-forest/5"
                          : "border-border hover:border-forest/50"
                      }`}
                    >
                      <TreeDeciduous className={`w-6 h-6 mx-auto mb-2 ${serviceType === "batsuboku" ? "text-forest" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${serviceType === "batsuboku" ? "text-forest" : "text-foreground"}`}>伐採</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setServiceType("kusakari"); setShowResult(false); }}
                      aria-pressed={serviceType === "kusakari"}
                      aria-label="サービス種別: 草刈り"
                      className={`p-4 rounded-xl border-2 transition-all ${
                        serviceType === "kusakari"
                          ? "border-forest bg-forest/5"
                          : "border-border hover:border-forest/50"
                      }`}
                    >
                      <Leaf className={`w-6 h-6 mx-auto mb-2 ${serviceType === "kusakari" ? "text-forest" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${serviceType === "kusakari" ? "text-forest" : "text-foreground"}`}>草刈り</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setServiceType("tokushu"); setShowResult(false); }}
                      aria-pressed={serviceType === "tokushu"}
                      aria-label="サービス種別: 非常に危険特殊伐採"
                      className={`p-4 rounded-xl border-2 transition-all ${
                        serviceType === "tokushu"
                          ? "border-forest bg-forest/5"
                          : "border-border hover:border-forest/50"
                      }`}
                    >
                      <AlertTriangle className={`w-6 h-6 mx-auto mb-2 ${serviceType === "tokushu" ? "text-forest" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${serviceType === "tokushu" ? "text-forest" : "text-foreground"}`}>特殊伐採</span>
                    </button>
                  </div>
                </div>

                {/* Step 2: 詳細選択 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 bg-forest text-white rounded-full flex items-center justify-center text-sm">2</span>
                    {serviceType === "kusakari"
                      ? "面積を選択"
                      : serviceType === "tokushu"
                        ? "状況確認"
                        : "木の高さと本数を選択"}
                  </h3>

                  {serviceType === "tokushu" ? (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">非常に危険な特殊伐採は要相談です</p>
                      <p className="text-xs text-amber-800 mt-1">
                        周辺環境・重機可否・安全計画の確認が必要なため、現地確認後にお見積もりします。
                      </p>
                    </div>
                  ) : serviceType !== "kusakari" ? (
                    <>
                      {/* 木の高さ */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">木の高さ</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup" aria-label="木の高さ">
                          {(Object.keys(PRICING[serviceType]) as TreeSize[]).map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => { setTreeSize(size); setShowResult(false); }}
                              aria-pressed={treeSize === size}
                              className={`p-3 rounded-lg border transition-all text-sm ${
                                treeSize === size
                                  ? "border-forest bg-forest text-white"
                                  : "border-border hover:border-forest/50"
                              }`}
                            >
                              {PRICING[serviceType][size].label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 本数 */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">本数</label>
                        <div className="grid sm:grid-cols-2 gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => { setIsManyTrees(false); setShowResult(false); }}
                            aria-pressed={!isManyTrees}
                            className={`p-3 rounded-lg border text-sm transition-all ${
                              !isManyTrees
                                ? "border-forest bg-forest/5 text-forest"
                                : "border-border hover:border-forest/50"
                            }`}
                          >
                            通常（1〜19本）
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsManyTrees(true); setShowResult(false); }}
                            aria-pressed={isManyTrees}
                            className={`p-3 rounded-lg border text-sm transition-all ${
                              isManyTrees
                                ? "border-forest bg-forest/5 text-forest"
                                : "border-border hover:border-forest/50"
                            }`}
                          >
                            多数（20本以上）
                          </button>
                        </div>
                        {!isManyTrees ? (
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => { setTreeCount(Math.max(1, treeCount - 1)); setShowResult(false); }}
                              aria-label="本数を1本減らす"
                              className="w-10 h-10 rounded-full border border-border hover:border-forest/50 flex items-center justify-center text-xl"
                            >
                              -
                            </button>
                            <span className="text-2xl font-bold text-foreground w-16 text-center">{treeCount}</span>
                            <button
                              type="button"
                              onClick={() => { setTreeCount(treeCount + 1); setShowResult(false); }}
                              aria-label="本数を1本増やす"
                              className="w-10 h-10 rounded-full border border-border hover:border-forest/50 flex items-center justify-center text-xl"
                            >
                              +
                            </button>
                            <span className="text-muted-foreground">本</span>
                          </div>
                        ) : (
                          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            20本以上は要相談です
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    /* 草刈り面積 */
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">面積（㎡）</label>
                      <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="50"
                            max="10000"
                            step="50"
                            value={area}
                            onChange={(e) => { setArea(Number(e.target.value)); setShowResult(false); }}
                            className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-forest"
                          />
                        <span className="text-2xl font-bold text-foreground w-20 text-right">{area}㎡</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">※最低料金: 500円〜</p>
                    </div>
                  )}
                </div>

                {/* Step 3: 処分有無 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 bg-forest text-white rounded-full flex items-center justify-center text-sm">3</span>
                    処分の有無
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setDisposalType("without"); setShowResult(false); }}
                      aria-pressed={disposalType === "without"}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        disposalType === "without"
                          ? "border-forest bg-forest/5"
                          : "border-border hover:border-forest/50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">処分なし</p>
                      <p className="text-xs text-muted-foreground mt-1">通常料金で計算</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDisposalType("with"); setShowResult(false); }}
                      aria-pressed={disposalType === "with"}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        disposalType === "with"
                          ? "border-forest bg-forest/5"
                          : "border-border hover:border-forest/50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">処分あり</p>
                      <p className="text-xs text-muted-foreground mt-1">通常料金の1.8倍で計算</p>
                    </button>
                  </div>
                </div>

                {/* 計算ボタン */}
                {!compact ? (
                  <Button
                    onClick={handleCalculate}
                    className="w-full bg-coral hover:bg-coral/90 text-white py-6 text-lg"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    概算料金を計算する
                  </Button>
                ) : null}

                {/* 結果表示 */}
                {shouldShowResult && (
                  <div className="mt-8 p-6 bg-forest/5 rounded-xl animate-fade-in-up">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-2">概算料金</p>
                      {requiresConsult || priceRange === null ? (
                        <>
                          <p className="text-4xl font-black text-coral">要相談</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            20本以上または15mを超える木・非常に危険な特殊伐採は、現地確認のうえご案内します
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-4xl font-black text-forest">
                            ¥{priceRange.min.toLocaleString()} 〜 ¥{priceRange.max.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            処分: {disposalType === "with" ? "あり（1.8倍計算）" : "なし（通常計算）"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            ※実際の料金は現地確認後にご提示します
                          </p>
                        </>
                      )}
                    </div>

                    <div className="border-t border-border pt-6">
                      <p className="text-center text-sm text-foreground mb-4">
                        正確なお見積もりは<span className="font-bold text-coral">無料</span>でご提示します
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={`tel:${PHONE}`}
                          className="flex-1 cta-button bg-coral text-white flex items-center justify-center gap-2"
                          onClick={() => trackPhoneClick('simulator')}
                        >
                          <Phone className="w-5 h-5" />
                          電話で無料相談
                        </a>
                        <a
                          href={LINE_URL}
                          className="flex-1 cta-button bg-[#06C755] text-white flex items-center justify-center gap-2"
                          onClick={() => trackLineClick('simulator')}
                        >
                          <MessageCircle className="w-5 h-5" />
                          LINEで無料概算
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 注意事項 */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>※料金は目安です。木の種類・状態・作業環境により変動します。</p>
              <p>※シミュレーターでは「処分あり」を通常料金の1.8倍として計算します。</p>
              <p>※20本以上または15mを超える木・非常に危険な特殊伐採は要相談となります。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
