import { NextRequest, NextResponse } from "next/server";
import { analyzeTattooImages } from "@/lib/analyze";
import { calculatePrice } from "@/lib/calculate-price";
import { loadPricingConfig } from "@/lib/pricing-store";
import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";

// Simple in-memory rate limiting (resets on server restart — fine for demo)
const requestLog = new Map<string, number[]>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return true;
  requestLog.set(ip, [...timestamps, now]);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Prea multe cereri. Vă rugăm să așteptați un minut." },
      { status: 429 }
    );
  }

  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const { images, placement, widthCm, heightCm } = body;

  if (!images?.length || !placement || !widthCm || !heightCm) {
    return NextResponse.json({ error: "Lipsesc câmpuri obligatorii." }, { status: 400 });
  }

  try {
    const [analysis, pricingConfig] = await Promise.all([
      analyzeTattooImages(images),
      loadPricingConfig(),
    ]);
    const estimate = calculatePrice(analysis, placement, widthCm, heightCm, pricingConfig);
    const response: AnalyzeResponse = { analysis, estimate };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Analysis error:", message);
    return NextResponse.json(
      { error: "Analiza a eșuat. Vă rugăm să încercați din nou.", detail: message },
      { status: 500 }
    );
  }
}
