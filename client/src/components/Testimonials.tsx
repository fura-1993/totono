/**
 * Testimonials - お客様の声セクション
 * 信頼性向上のためのレビュー表示コンポーネント
 */

import { Star, Quote, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
}

// サンプルデータ（後で実際のお客様の声に差し替え可能）
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "田中様",
    location: "茨城県桜川市",
    service: "庭木の剪定",
    rating: 5,
    comment: "10年以上放置していた庭木を綺麗に剪定していただきました。見積もりも丁寧で、作業後の掃除も完璧。近所の方からも「庭が明るくなったね」と言われました。また来年もお願いしたいです。",
    date: "2024年11月",
  },
  {
    id: 2,
    name: "佐藤様",
    location: "茨城県筑西市",
    service: "伐採・抜根",
    rating: 5,
    comment: "台風で傾いた大きな木を伐採してもらいました。危険な作業なので心配でしたが、手際よく安全に作業していただき感謝しています。料金も事前の見積もり通りで安心でした。",
    date: "2024年10月",
  },
  {
    id: 3,
    name: "鈴木様",
    location: "栃木県小山市",
    service: "草刈り・除草",
    rating: 5,
    comment: "空き家の草刈りをお願いしました。遠方に住んでいるため立ち会えませんでしたが、LINEで写真を送ってくれて安心できました。定期的にお願いしようと思います。",
    date: "2024年9月",
  },
  {
    id: 4,
    name: "山田様",
    location: "茨城県つくば市",
    service: "松の剪定",
    rating: 5,
    comment: "他社では断られた松の剪定を引き受けてくださいました。職人さんの技術が素晴らしく、松が見違えるほど美しくなりました。価格も良心的で大満足です。",
    date: "2024年8月",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="reveal">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="badge bg-forest/10 text-forest mb-4">
              <Star className="w-4 h-4 fill-current" />
              お客様の声
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              多くのお客様にご満足いただいています
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              実際にサービスをご利用いただいたお客様からの声をご紹介します。
            </p>
          </div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-forest/20 mb-4" />

                  {/* Rating and service */}
                  <div className="flex items-center justify-between mb-3">
                    <StarRating rating={testimonial.rating} />
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {testimonial.service}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-foreground leading-relaxed mb-4">
                    {testimonial.comment}
                  </p>

                  {/* Customer info */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {testimonial.location}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {testimonial.date}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                平均評価 <span className="text-forest font-bold">5.0</span> / お客様満足度{" "}
                <span className="text-forest font-bold">98%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
