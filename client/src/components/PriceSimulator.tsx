/**
 * PriceSimulator - 料金シミュレーター
 * 木の本数・高さを選んで概算見積もりを表示
 */

import { useState } from "react";
import { Calculator, TreeDeciduous, Scissors, Leaf, ArrowRight, Phone, MessageCircle } from "lucide-react";
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
  },
  batsuboku: { // 伐採
    low: { label: "低木（〜2m）", price: 5000 },
    medium: { label: "中木（2〜4m）", price: 12000 },
    high: { label: "高木（4〜6m）", price: 25000 },
    veryHigh: { label: "大木（6m〜）", price: 40000 },
  },
  kusakari: { // 草刈り（㎡単価）
    price: 500,
    minCharge: 5000, // 最低料金
  },
};

type ServiceType = "sentei" | "batsuboku" | "kusakari";
type TreeSize = "low" | "medium" | "high" | "veryHigh";

const PHONE = "090-5306-0197";
const LINE_URL = "https://lin.ee/UNR8hec";

export function PriceSimulator() {
  const [serviceType, setServiceType] = useState<ServiceType>("sentei");
  const [treeSize, setTreeSize] = useState<TreeSize>("medium");
  const [treeCount, setTreeCount] = useState(1);
  const [area, setArea] = useState(10); // 草刈り用（㎡）
  const [showResult, setShowResult] = useState(false);

  // 料金計算
  const calculatePrice = () => {
    if (serviceType === "kusakari") {
      const calculated = area * PRICING.kusakari.price;
      return Math.max(calculated, PRICING.kusakari.minCharge);
    }
    const pricing = PRICING[serviceType];
    return pricing[treeSize].price * treeCount;
  };

  const estimatedPrice = calculatePrice();
  const priceRange = {
    min: Math.floor(estimatedPrice * 0.8),
    max: Math.ceil(estimatedPrice * 1.2),
  };

  const handleCalculate = () => {
    setShowResult(true);
  };

  return (
    <section id="simulator" className="py-16 md:py-24 bg-forest/5">
      <div className="container">
        <div className="reveal">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="badge bg-coral/10 text-coral mb-4">
              <Calculator className="w-4 h-4" />
              料金シミュレーター
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              概算料金をチェック
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              サービス内容を選んで、おおよその料金を確認できます。<br />
              正確なお見積もりは現地確認後にご提示します。
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
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => { setServiceType("sentei"); setShowResult(false); }}
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
                      onClick={() => { setServiceType("batsuboku"); setShowResult(false); }}
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
                      onClick={() => { setServiceType("kusakari"); setShowResult(false); }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        serviceType === "kusakari"
                          ? "border-forest bg-forest/5"
                          : "border-border hover:border-forest/50"
                      }`}
                    >
                      <Leaf className={`w-6 h-6 mx-auto mb-2 ${serviceType === "kusakari" ? "text-forest" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${serviceType === "kusakari" ? "text-forest" : "text-foreground"}`}>草刈り</span>
                    </button>
                  </div>
                </div>

                {/* Step 2: 詳細選択 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 bg-forest text-white rounded-full flex items-center justify-center text-sm">2</span>
                    {serviceType === "kusakari" ? "面積を選択" : "木の高さと本数を選択"}
                  </h3>

                  {serviceType !== "kusakari" ? (
                    <>
                      {/* 木の高さ */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">木の高さ</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {(Object.keys(PRICING[serviceType]) as TreeSize[]).map((size) => (
                            <button
                              key={size}
                              onClick={() => { setTreeSize(size); setShowResult(false); }}
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
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => { setTreeCount(Math.max(1, treeCount - 1)); setShowResult(false); }}
                            className="w-10 h-10 rounded-full border border-border hover:border-forest/50 flex items-center justify-center text-xl"
                          >
                            -
                          </button>
                          <span className="text-2xl font-bold text-foreground w-16 text-center">{treeCount}</span>
                          <button
                            onClick={() => { setTreeCount(treeCount + 1); setShowResult(false); }}
                            className="w-10 h-10 rounded-full border border-border hover:border-forest/50 flex items-center justify-center text-xl"
                          >
                            +
                          </button>
                          <span className="text-muted-foreground">本</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 草刈り面積 */
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">面積（㎡）</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="10"
                          max="500"
                          step="10"
                          value={area}
                          onChange={(e) => { setArea(Number(e.target.value)); setShowResult(false); }}
                          className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-forest"
                        />
                        <span className="text-2xl font-bold text-foreground w-20 text-right">{area}㎡</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">※最低料金: 5,000円〜</p>
                    </div>
                  )}
                </div>

                {/* 計算ボタン */}
                <Button
                  onClick={handleCalculate}
                  className="w-full bg-coral hover:bg-coral/90 text-white py-6 text-lg"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  概算料金を計算する
                </Button>

                {/* 結果表示 */}
                {showResult && (
                  <div className="mt-8 p-6 bg-forest/5 rounded-xl animate-fade-in-up">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-2">概算料金</p>
                      <p className="text-4xl font-black text-forest">
                        ¥{priceRange.min.toLocaleString()} 〜 ¥{priceRange.max.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        ※実際の料金は現地確認後にご提示します
                      </p>
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
                          電話で相談
                        </a>
                        <a
                          href={LINE_URL}
                          className="flex-1 cta-button bg-[#06C755] text-white flex items-center justify-center gap-2"
                          onClick={() => trackLineClick('simulator')}
                        >
                          <MessageCircle className="w-5 h-5" />
                          LINEで写真を送る
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
              <p>※処分費は別途お見積もりとなる場合があります。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
