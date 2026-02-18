import { describe, it, expect } from "vitest";

// 料金計算ロジックのテスト
describe("PriceSimulator", () => {
  // 料金表（税込）
  const PRICING = {
    sentei: {
      low: { label: "低木（〜2m）", price: 3000 },
      medium: { label: "中木（2〜4m）", price: 7000 },
      high: { label: "高木（4〜6m）", price: 15000 },
      veryHigh: { label: "大木（6m〜）", price: 25000 },
    },
    batsuboku: {
      low: { label: "低木（〜2m）", price: 5000 },
      medium: { label: "中木（2〜4m）", price: 12000 },
      high: { label: "高木（4〜6m）", price: 25000 },
      veryHigh: { label: "大木（6m〜）", price: 40000 },
    },
    kusakari: {
      price: 500,
      minCharge: 5000,
    },
  };

  type ServiceType = "sentei" | "batsuboku" | "kusakari";
  type TreeSize = "low" | "medium" | "high" | "veryHigh";

  // 料金計算関数
  const calculatePrice = (
    serviceType: ServiceType,
    treeSize: TreeSize,
    treeCount: number,
    area: number
  ): number => {
    if (serviceType === "kusakari") {
      const calculated = area * PRICING.kusakari.price;
      return Math.max(calculated, PRICING.kusakari.minCharge);
    }
    const pricing = PRICING[serviceType];
    return pricing[treeSize].price * treeCount;
  };

  describe("剪定料金計算", () => {
    it("低木1本の料金が正しく計算される", () => {
      const price = calculatePrice("sentei", "low", 1, 0);
      expect(price).toBe(3000);
    });

    it("中木3本の料金が正しく計算される", () => {
      const price = calculatePrice("sentei", "medium", 3, 0);
      expect(price).toBe(21000);
    });

    it("高木2本の料金が正しく計算される", () => {
      const price = calculatePrice("sentei", "high", 2, 0);
      expect(price).toBe(30000);
    });

    it("大木1本の料金が正しく計算される", () => {
      const price = calculatePrice("sentei", "veryHigh", 1, 0);
      expect(price).toBe(25000);
    });
  });

  describe("伐採料金計算", () => {
    it("低木1本の料金が正しく計算される", () => {
      const price = calculatePrice("batsuboku", "low", 1, 0);
      expect(price).toBe(5000);
    });

    it("中木2本の料金が正しく計算される", () => {
      const price = calculatePrice("batsuboku", "medium", 2, 0);
      expect(price).toBe(24000);
    });

    it("高木1本の料金が正しく計算される", () => {
      const price = calculatePrice("batsuboku", "high", 1, 0);
      expect(price).toBe(25000);
    });

    it("大木1本の料金が正しく計算される", () => {
      const price = calculatePrice("batsuboku", "veryHigh", 1, 0);
      expect(price).toBe(40000);
    });
  });

  describe("草刈り料金計算", () => {
    it("10㎡の場合、最低料金が適用される", () => {
      const price = calculatePrice("kusakari", "low", 0, 10);
      expect(price).toBe(5000); // 10 * 500 = 5000 = 最低料金
    });

    it("5㎡の場合、最低料金が適用される", () => {
      const price = calculatePrice("kusakari", "low", 0, 5);
      expect(price).toBe(5000); // 5 * 500 = 2500 < 5000 → 最低料金適用
    });

    it("100㎡の場合、面積×単価で計算される", () => {
      const price = calculatePrice("kusakari", "low", 0, 100);
      expect(price).toBe(50000); // 100 * 500 = 50000
    });

    it("50㎡の場合、面積×単価で計算される", () => {
      const price = calculatePrice("kusakari", "low", 0, 50);
      expect(price).toBe(25000); // 50 * 500 = 25000
    });
  });

  describe("料金範囲計算", () => {
    it("概算料金の±20%範囲が正しく計算される", () => {
      const basePrice = 10000;
      const priceRange = {
        min: Math.floor(basePrice * 0.8),
        max: Math.ceil(basePrice * 1.2),
      };
      expect(priceRange.min).toBe(8000);
      expect(priceRange.max).toBe(12000);
    });
  });
});
