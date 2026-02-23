import { calculatePrice } from "../calculate-price";
import type { AIAnalysis } from "../types";

const baseAnalysis: AIAnalysis = {
  style: "traditional",
  complexity: 5,
  color_type: "black_grey",
  estimated_colors: 1,
  detail_density: "medium",
  fill_percentage: 50,
  contains_text: false,
  description: "Test tattoo",
  special_notes: "",
};

describe("calculatePrice", () => {
  it("uses Small tier for 1×1 cm tattoo", () => {
    const result = calculatePrice(baseAnalysis, "forearm", 1, 1);
    expect(result.sizeTier).toBe("Small");
    expect(result.currency).toBe("EUR");
    expect(result.estimatedPrice).toBeGreaterThanOrEqual(80);
  });

  it("uses Medium tier for 3×3 cm tattoo", () => {
    const result = calculatePrice(baseAnalysis, "forearm", 3, 3);
    expect(result.sizeTier).toBe("Medium");
    expect(result.estimatedPrice).toBeGreaterThanOrEqual(140);
  });

  it("uses Large tier for 4×5 cm tattoo", () => {
    const result = calculatePrice(baseAnalysis, "forearm", 4, 5);
    expect(result.sizeTier).toBe("Large");
    expect(result.estimatedPrice).toBeGreaterThanOrEqual(230);
  });

  it("uses overflow pricing for tattoos above 20 cm²", () => {
    const large = calculatePrice(baseAnalysis, "forearm", 5, 5); // 25 cm²
    expect(large.sizeTier).toBe("Extra Mare");
    // 230 + (25-20)*20 = 330 EUR
    expect(large.estimatedPrice).toBeGreaterThan(230);
  });

  it("applies color surcharge", () => {
    const bw = calculatePrice(baseAnalysis, "forearm", 3, 3);
    const color = calculatePrice({ ...baseAnalysis, color_type: "color" }, "forearm", 3, 3);
    expect(color.estimatedPrice).toBeGreaterThan(bw.estimatedPrice);
  });

  it("applies complexity multiplier correctly", () => {
    const simple = calculatePrice({ ...baseAnalysis, complexity: 1 }, "forearm", 3, 3);
    const complex = calculatePrice({ ...baseAnalysis, complexity: 10 }, "forearm", 3, 3);
    expect(complex.estimatedPrice).toBeGreaterThan(simple.estimatedPrice);
  });

  it("returns correct ±15% price range", () => {
    const result = calculatePrice(baseAnalysis, "forearm", 3, 3);
    expect(result.minPrice).toBeCloseTo(result.estimatedPrice * 0.85, 0);
    expect(result.maxPrice).toBeCloseTo(result.estimatedPrice * 1.15, 0);
  });
});
