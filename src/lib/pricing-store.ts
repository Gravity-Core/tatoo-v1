import { defaultPricingConfig, type PricingConfig } from "./calculate-price";

const KV_KEY = "pricing_config";

function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function loadPricingConfig(): Promise<PricingConfig> {
  if (!isKvConfigured()) return defaultPricingConfig;
  try {
    const { kv } = await import("@vercel/kv");
    const stored = await kv.get<PricingConfig>(KV_KEY);
    return stored ?? defaultPricingConfig;
  } catch {
    return defaultPricingConfig;
  }
}

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  if (!isKvConfigured()) {
    throw new Error(
      "Vercel KV nu este configurat. Adaugă KV_REST_API_URL și KV_REST_API_TOKEN în variabilele de mediu."
    );
  }
  const { kv } = await import("@vercel/kv");
  await kv.set(KV_KEY, config);
}
