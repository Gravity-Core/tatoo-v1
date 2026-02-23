import type { AIAnalysis, BodyPlacement, PriceEstimate } from "./types";

export interface PricingTier {
  maxSqCm: number;
  label: string;
  basePrice: number;
}

export interface PricingConfig {
  currency: string;
  tiers: PricingTier[];
  overflowPricePerSqCm: number;
  colorMultiplier: number;
  complexityMultiplier: number;
}

export const defaultPricingConfig: PricingConfig = {
  currency: "EUR",
  tiers: [
    { maxSqCm: 2, label: "Mic", basePrice: 80 },
    { maxSqCm: 10, label: "Mediu", basePrice: 140 },
    { maxSqCm: 20, label: "Mare", basePrice: 230 },
  ],
  overflowPricePerSqCm: 10,
  colorMultiplier: 1,
  complexityMultiplier: 0,
};

export function calculatePrice(
  analysis: AIAnalysis,
  _placement: BodyPlacement,
  widthCm: number,
  heightCm: number,
  config: PricingConfig = defaultPricingConfig
): PriceEstimate {
  const areaSqCm = widthCm * heightCm;

  const sortedTiers = [...config.tiers].sort((a, b) => a.maxSqCm - b.maxSqCm);
  const matchedTier = sortedTiers.find((t) => areaSqCm <= t.maxSqCm);

  let basePrice: number;
  let sizeTier: string;

  if (matchedTier) {
    basePrice = matchedTier.basePrice;
    sizeTier = matchedTier.label;
  } else {
    const lastTier = sortedTiers[sortedTiers.length - 1];
    basePrice = lastTier.basePrice + (areaSqCm - lastTier.maxSqCm) * config.overflowPricePerSqCm;
    sizeTier = "Extra Mare";
  }

  const colorMult = analysis.color_type !== "black_grey" ? config.colorMultiplier : 1.0;
  const complexityMult = Math.max(0.5, 1 + (analysis.complexity - 5) * config.complexityMultiplier);

  const estimatedPrice = Math.round(basePrice * colorMult * complexityMult);
  const range = 0.15;

  return {
    minPrice: Math.round(estimatedPrice * (1 - range)),
    maxPrice: Math.round(estimatedPrice * (1 + range)),
    estimatedPrice,
    estimatedHours: 0,
    sizeTier,
    currency: config.currency,
  };
}
