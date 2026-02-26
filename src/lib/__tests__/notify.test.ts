import { buildEmailHtml, buildWhatsAppMessage } from "../notify";
import type { AIAnalysis, BodyPlacement, PriceEstimate } from "../types";

const params = {
  name: "Ion Popescu",
  phone: "+40721123456",
  estimate: {
    minPrice: 600, maxPrice: 800, estimatedPrice: 700,
    estimatedHours: 2.5, sizeTier: "Mediu", currency: "RON",
  } as PriceEstimate,
  analysis: {
    style: "realism", complexity: 7, color_type: "black_grey",
    estimated_colors: 1, detail_density: "high", fill_percentage: 60,
    contains_text: false, description: "test", special_notes: "",
  } as AIAnalysis,
  placement: "forearm" as BodyPlacement,
  widthCm: 10,
  heightCm: 12,
};

describe("buildEmailHtml", () => {
  it("includes client name and phone", () => {
    const html = buildEmailHtml(params);
    expect(html).toContain("Ion Popescu");
    expect(html).toContain("+40721123456");
  });

  it("includes price range", () => {
    const html = buildEmailHtml(params);
    expect(html).toContain("RON");
    expect(html).toContain("600");
    expect(html).toContain("800");
  });
});

describe("buildWhatsAppMessage", () => {
  it("includes name and phone", () => {
    const msg = buildWhatsAppMessage(params);
    expect(msg).toContain("Ion Popescu");
    expect(msg).toContain("+40721123456");
  });

  it("includes placement label in Romanian", () => {
    const msg = buildWhatsAppMessage(params);
    expect(msg).toContain("Antebraț");
  });
});
