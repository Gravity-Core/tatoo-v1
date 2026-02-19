import { pricingConfig } from "./pricing-config";
import type { AIAnalysis, BodyPlacement, PriceEstimate } from "./types";

export function calculatePrice(
  analysis: AIAnalysis,
  placement: BodyPlacement,
  widthCm: number,
  heightCm: number
): PriceEstimate {
  const longestDim = Math.max(widthCm, heightCm);
  const tier = pricingConfig.sizeTiers.find((t) => longestDim <= t.maxCm)!;

  const complexityMult = pricingConfig.complexityMultiplier(analysis.complexity);
  const styleMult = pricingConfig.styleMultipliers[analysis.style] ?? 1.0;
  const colorMult = pricingConfig.colorMultiplier[analysis.color_type] ?? 1.0;
  const placementMult = pricingConfig.placementMultipliers[placement] ?? 1.0;

  const estimatedHours = tier.baseHours * complexityMult * styleMult * colorMult * placementMult;
  const rawPrice = estimatedHours * pricingConfig.baseRatePerHour;
  const estimatedPrice = Math.max(rawPrice, pricingConfig.minimumPrice);

  const range = pricingConfig.rangePercentage / 100;
  return {
    minPrice: Math.round(estimatedPrice * (1 - range)),
    maxPrice: Math.round(estimatedPrice * (1 + range)),
    estimatedPrice: Math.round(estimatedPrice),
    estimatedHours: Math.round(estimatedHours * 10) / 10,
    sizeTier: tier.name,
    currency: pricingConfig.currency,
  };
}
