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
  it("returns minimum price for tiny simple tattoo", () => {
    const result = calculatePrice(baseAnalysis, "forearm", 3, 3);
    expect(result.estimatedPrice).toBeGreaterThanOrEqual(200);
    expect(result.sizeTier).toBe("Foarte mic");
    expect(result.currency).toBe("RON");
  });

  it("applies complexity multiplier correctly", () => {
    const simple = calculatePrice({ ...baseAnalysis, complexity: 1 }, "forearm", 15, 15);
    const complex = calculatePrice({ ...baseAnalysis, complexity: 10 }, "forearm", 15, 15);
    expect(complex.estimatedPrice).toBeGreaterThan(simple.estimatedPrice);
  });

  it("applies realism style surcharge", () => {
    const traditional = calculatePrice(baseAnalysis, "forearm", 15, 15);
    const realism = calculatePrice({ ...baseAnalysis, style: "realism" }, "forearm", 15, 15);
    expect(realism.estimatedPrice).toBeGreaterThan(traditional.estimatedPrice);
  });

  it("applies color surcharge", () => {
    const bw = calculatePrice(baseAnalysis, "forearm", 15, 15);
    const color = calculatePrice({ ...baseAnalysis, color_type: "color" }, "forearm", 15, 15);
    expect(color.estimatedPrice).toBeGreaterThan(bw.estimatedPrice);
  });

  it("applies placement difficulty surcharge for ribs", () => {
    const forearm = calculatePrice(baseAnalysis, "forearm", 15, 15);
    const ribs = calculatePrice(baseAnalysis, "ribs", 15, 15);
    expect(ribs.estimatedPrice).toBeGreaterThan(forearm.estimatedPrice);
  });

  it("returns correct price range", () => {
    const result = calculatePrice(baseAnalysis, "forearm", 15, 15);
    expect(result.minPrice).toBeCloseTo(result.estimatedPrice * 0.85, 0);
    expect(result.maxPrice).toBeCloseTo(result.estimatedPrice * 1.15, 0);
  });
});
