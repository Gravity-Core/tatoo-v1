import fs from "fs";
import path from "path";
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

const defaultConfig: PricingConfig = {
  currency: "EUR",
  tiers: [
    { maxSqCm: 2, label: "Mic", basePrice: 80 },
    { maxSqCm: 10, label: "Mediu", basePrice: 140 },
    { maxSqCm: 20, label: "Mare", basePrice: 230 },
  ],
  overflowPricePerSqCm: 20,
  colorMultiplier: 1.25,
  complexityMultiplier: 0.08,
};

export function loadPricingConfig(): PricingConfig {
  try {
    const filePath = path.join(process.cwd(), "data", "pricing.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return defaultConfig;
  }
}

export function calculatePrice(
  analysis: AIAnalysis,
  _placement: BodyPlacement,
  widthCm: number,
  heightCm: number
): PriceEstimate {
  const config = loadPricingConfig();
  const areaSqCm = widthCm * heightCm;

  // Sort tiers ascending so find works correctly
  const sortedTiers = [...config.tiers].sort((a, b) => a.maxSqCm - b.maxSqCm);
  const matchedTier = sortedTiers.find((t) => areaSqCm <= t.maxSqCm);

  let basePrice: number;
  let sizeTier: string;

  if (matchedTier) {
    basePrice = matchedTier.basePrice;
    sizeTier = matchedTier.label;
  } else {
    // Area exceeds all tiers: charge per sq cm above the largest tier
    const lastTier = sortedTiers[sortedTiers.length - 1];
    const overflow = areaSqCm - lastTier.maxSqCm;
    basePrice = lastTier.basePrice + overflow * config.overflowPricePerSqCm;
    sizeTier = "Extra Mare";
  }

  // Color multiplier: color/mixed tattoos cost more
  const colorMult = analysis.color_type !== "black_grey" ? config.colorMultiplier : 1.0;

  // Complexity multiplier: 5 is neutral, each point above/below adjusts price
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
