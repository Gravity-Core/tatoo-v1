# Tattoo Price Estimator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone Next.js 14 app (Romanian language) that uses Claude Vision to analyze tattoo reference images and generate a price estimate, to be later embedded in a WordPress site.

**Architecture:** Single-page wizard (3 steps: upload → details → results) using Next.js App Router. Client uploads 1–3 images (resized client-side to ≤1024px), selects body placement and dimensions, then calls `/api/analyze` which invokes Claude Vision + runs the pricing engine in-memory, returning a structured estimate.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Anthropic SDK (`@anthropic-ai/sdk`), no database.

**Project root:** `~/Work/tattoo-estimator`

---

## Task 1: Project Initialization

**Files:**
- Create: `~/Work/tattoo-estimator` (Next.js project root)
- Create: `.env.local`

**Step 1: Scaffold the Next.js project**

Run in `~/Work/`:
```bash
npx create-next-app@latest tattoo-estimator \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-git
```
Answer all prompts with defaults (or pass `--yes` if supported).

**Step 2: Install Anthropic SDK**

```bash
cd ~/Work/tattoo-estimator && npm install @anthropic-ai/sdk
```

**Step 3: Create `.env.local`**

```
ANTHROPIC_API_KEY=your_key_here
```

**Step 4: Verify dev server starts**

```bash
npm run dev
```
Expected: server starts on http://localhost:3000 with default Next.js page.

**Step 5: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 14 app with TypeScript and Tailwind"
```

---

## Task 2: Shared Types

**Files:**
- Create: `lib/types.ts`

**Step 1: Write the types file**

```typescript
// lib/types.ts

export type TattooStyle =
  | "realism" | "traditional" | "neo-traditional" | "geometric"
  | "watercolor" | "linework" | "dotwork" | "tribal" | "japanese"
  | "lettering" | "blackwork" | "trash-polka" | "mixed";

export type ColorType = "black_grey" | "color" | "mixed";
export type DetailDensity = "low" | "medium" | "high" | "very_high";

export interface AIAnalysis {
  style: TattooStyle;
  complexity: number;        // 1–10
  color_type: ColorType;
  estimated_colors: number;
  detail_density: DetailDensity;
  fill_percentage: number;   // 0–100
  contains_text: boolean;
  description: string;
  special_notes: string;
}

export type BodyPlacement =
  | "forearm" | "upper_arm" | "shoulder" | "back_upper" | "back_full"
  | "chest" | "ribs" | "neck" | "hand" | "fingers" | "foot" | "ankle"
  | "thigh" | "calf" | "hip" | "face" | "head" | "inner_arm"
  | "behind_ear" | "wrist" | "sternum";

export interface PriceEstimate {
  minPrice: number;
  maxPrice: number;
  estimatedPrice: number;
  estimatedHours: number;
  sizeTier: string;
  currency: string;
}

export interface AnalyzeRequest {
  images: string[];          // base64 data URLs
  placement: BodyPlacement;
  widthCm: number;
  heightCm: number;
  notes?: string;
}

export interface AnalyzeResponse {
  analysis: AIAnalysis;
  estimate: PriceEstimate;
}
```

**Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Pricing Configuration

**Files:**
- Create: `lib/pricing-config.ts`

**Step 1: Write the pricing config**

```typescript
// lib/pricing-config.ts
import type { TattooStyle, ColorType, BodyPlacement } from "./types";

export const pricingConfig = {
  currency: "RON",
  baseRatePerHour: 300,
  minimumPrice: 200,

  sizeTiers: [
    { name: "Foarte mic",  maxCm: 5,        baseHours: 0.75 },
    { name: "Mic",         maxCm: 10,       baseHours: 1.5  },
    { name: "Mediu",       maxCm: 20,       baseHours: 3    },
    { name: "Mare",        maxCm: 35,       baseHours: 5    },
    { name: "Foarte mare", maxCm: 50,       baseHours: 8    },
    { name: "Extra mare",  maxCm: Infinity, baseHours: 12   },
  ],

  complexityMultiplier: (complexity: number) => 0.6 + complexity * 0.08,

  styleMultipliers: {
    realism:          1.4,
    japanese:         1.2,
    "neo-traditional":1.1,
    watercolor:       1.15,
    "trash-polka":    1.2,
    geometric:        1.1,
    dotwork:          1.25,
    traditional:      1.0,
    linework:         0.9,
    tribal:           0.95,
    lettering:        0.85,
    blackwork:        1.05,
    mixed:            1.1,
  } as Record<TattooStyle, number>,

  colorMultiplier: {
    black_grey: 1.0,
    color:      1.2,
    mixed:      1.15,
  } as Record<ColorType, number>,

  placementMultipliers: {
    forearm:    1.0,  upper_arm: 1.0,  shoulder:   1.0,
    back_upper: 1.0,  back_full: 1.05, chest:      1.1,
    ribs:       1.25, neck:      1.3,  hand:       1.3,
    fingers:    1.35, foot:      1.2,  ankle:      1.1,
    thigh:      1.0,  calf:      1.05, hip:        1.15,
    face:       1.5,  head:      1.4,  inner_arm:  1.1,
    behind_ear: 1.2,  wrist:     1.1,  sternum:    1.2,
  } as Record<BodyPlacement, number>,

  rangePercentage: 15,
} as const;
```

**Step 2: Commit**

```bash
git add lib/pricing-config.ts
git commit -m "feat: add pricing configuration"
```

---

## Task 4: Pricing Engine (with tests)

**Files:**
- Create: `lib/calculate-price.ts`
- Create: `lib/__tests__/calculate-price.test.ts`

**Step 1: Install Jest + ts-jest**

```bash
npm install --save-dev jest ts-jest @types/jest
```

Add to `package.json` (merge into existing scripts/jest config):
```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    }
  }
}
```

**Step 2: Write the failing test**

```typescript
// lib/__tests__/calculate-price.test.ts
import { calculatePrice } from "../calculate-price";
import type { AIAnalysis, BodyPlacement } from "../types";

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
    expect(result.estimatedPrice).toBeGreaterThanOrEqual(200); // minimum
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
```

**Step 3: Run test to verify it fails**

```bash
npm test
```
Expected: FAIL — `calculatePrice` not found.

**Step 4: Write the implementation**

```typescript
// lib/calculate-price.ts
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
```

**Step 5: Run tests to verify they pass**

```bash
npm test
```
Expected: All 6 tests PASS.

**Step 6: Commit**

```bash
git add lib/calculate-price.ts lib/__tests__/calculate-price.test.ts package.json
git commit -m "feat: add pricing engine with tests"
```

---

## Task 5: Claude Vision Integration

**Files:**
- Create: `lib/analyze.ts`

**Step 1: Write the analyzer**

```typescript
// lib/analyze.ts
import Anthropic from "@anthropic-ai/sdk";
import type { AIAnalysis } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a tattoo analysis expert. Analyze the provided tattoo image(s) and return ONLY a valid JSON object with these attributes:

{
  "style": one of ["realism", "traditional", "neo-traditional", "geometric", "watercolor", "linework", "dotwork", "tribal", "japanese", "lettering", "blackwork", "trash-polka", "mixed"],
  "complexity": integer 1-10 (1=simple outline, 10=photorealistic portrait with full detail),
  "color_type": one of ["black_grey", "color", "mixed"],
  "estimated_colors": integer (number of distinct colors, 1 for black and grey),
  "detail_density": one of ["low", "medium", "high", "very_high"],
  "fill_percentage": integer 0-100 (how much of the area is filled vs negative space),
  "contains_text": boolean,
  "description": "brief 1-2 sentence description of what the tattoo depicts",
  "special_notes": "any factors that might affect pricing (fine lines, heavy shading, cover-up indicators, etc.)"
}

Return ONLY the JSON, no markdown, no explanation.`;

export async function analyzeTattooImages(base64DataUrls: string[]): Promise<AIAnalysis> {
  const imageContent = base64DataUrls.map((dataUrl) => {
    const [header, data] = dataUrl.split(",");
    const mediaType = header.match(/data:(image\/\w+);/)?.[1] as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif";

    return {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: mediaType ?? "image/jpeg",
        data,
      },
    };
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          { type: "text", text: "Analyze this tattoo and return the JSON." },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text) as AIAnalysis;
  } catch {
    throw new Error(`Failed to parse AI response: ${text}`);
  }
}
```

**Step 2: Commit**

```bash
git add lib/analyze.ts
git commit -m "feat: add Claude Vision tattoo analyzer"
```

---

## Task 6: API Route

**Files:**
- Create: `app/api/analyze/route.ts`

**Step 1: Write the route handler**

```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeTattooImages } from "@/lib/analyze";
import { calculatePrice } from "@/lib/calculate-price";
import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";

// Simple in-memory rate limiting (resets on server restart — fine for demo)
const requestLog = new Map<string, number[]>();
const RATE_LIMIT = 5;      // max requests
const WINDOW_MS = 60_000;  // per minute

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
    const analysis = await analyzeTattooImages(images);
    const estimate = calculatePrice(analysis, placement, widthCm, heightCm);
    const response: AnalyzeResponse = { analysis, estimate };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Analiza a eșuat. Vă rugăm să încercați din nou." },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/analyze/route.ts
git commit -m "feat: add /api/analyze route with rate limiting"
```

---

## Task 7: Global Styles & Layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: Update globals.css — dark tattoo-studio aesthetic**

Replace contents of `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --bg-primary: #0d0d0d;
  --bg-secondary: #141414;
  --bg-card: #1a1a1a;
  --accent-gold: #c9a84c;
  --accent-gold-light: #e8c878;
  --text-primary: #f0ede8;
  --text-muted: #8a8480;
  --border-subtle: #2a2a2a;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  /* subtle grain texture */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

/* Gold accent utilities */
.text-gold { color: var(--accent-gold); }
.border-gold { border-color: var(--accent-gold); }
.bg-card { background-color: var(--bg-card); }

/* Smooth transitions */
* { transition-property: color, background-color, border-color, opacity, transform;
    transition-duration: 150ms; transition-timing-function: ease; }
```

**Step 2: Update layout.tsx**

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estimare Preț Tatuaj",
  description: "Estimator AI pentru prețul tatuajului tău",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
```

**Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add dark tattoo-studio theme and layout"
```

---

## Task 8: ImageUpload Component

**Files:**
- Create: `components/ImageUpload.tsx`

**Step 1: Write the component**

```typescript
// components/ImageUpload.tsx
"use client";
import { useCallback, useState } from "react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;
const MAX_DIM = 1024;

async function resizeImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ images, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(async (files: FileList) => {
    setError("");
    const accepted = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );

    const oversized = accepted.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length) { setError(`Fișierele trebuie să fie sub ${MAX_SIZE_MB}MB.`); return; }

    const remaining = MAX_IMAGES - images.length;
    const toAdd = accepted.slice(0, remaining);

    if (accepted.length > remaining) {
      setError(`Poți încărca maxim ${MAX_IMAGES} imagini.`);
    }

    const dataUrls = await Promise.all(toAdd.map(readFile));
    const resized = await Promise.all(dataUrls.map(resizeImage));
    onChange([...images, ...resized]);
  }, [images, onChange]);

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragging
            ? "border-yellow-500/70 bg-yellow-500/5"
            : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/40"}`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="space-y-2 pointer-events-none">
          <svg className="w-10 h-10 mx-auto text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-zinc-300 font-medium">Încarcă imaginea tatuajului dorit</p>
          <p className="text-zinc-500 text-sm">Trage sau apasă · JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB · 1–{MAX_IMAGES} imagini</p>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {images.map((src, i) => (
            <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Referință ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => remove(i)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium"
              >
                Elimină
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/ImageUpload.tsx
git commit -m "feat: add ImageUpload component with drag-drop and resize"
```

---

## Task 9: BodyPlacement Component

**Files:**
- Create: `components/BodyPlacement.tsx`

**Step 1: Write the component — grouped dropdown**

```typescript
// components/BodyPlacement.tsx
"use client";
import type { BodyPlacement } from "@/lib/types";

interface Props {
  value: BodyPlacement | "";
  onChange: (v: BodyPlacement) => void;
}

const placementGroups: { label: string; options: { value: BodyPlacement; label: string }[] }[] = [
  {
    label: "Braț",
    options: [
      { value: "forearm", label: "Antebraț" },
      { value: "upper_arm", label: "Braț superior" },
      { value: "inner_arm", label: "Braț interior" },
      { value: "shoulder", label: "Umăr" },
      { value: "wrist", label: "Încheietură" },
      { value: "hand", label: "Mână" },
      { value: "fingers", label: "Degete" },
    ],
  },
  {
    label: "Trunchi",
    options: [
      { value: "chest", label: "Piept" },
      { value: "sternum", label: "Stern" },
      { value: "back_upper", label: "Spate superior" },
      { value: "back_full", label: "Spate complet" },
      { value: "ribs", label: "Coaste" },
      { value: "hip", label: "Șold" },
    ],
  },
  {
    label: "Picior",
    options: [
      { value: "thigh", label: "Coapsă" },
      { value: "calf", label: "Gambă" },
      { value: "ankle", label: "Gleznă" },
      { value: "foot", label: "Picior (labă)" },
    ],
  },
  {
    label: "Cap & Gât",
    options: [
      { value: "neck", label: "Gât" },
      { value: "behind_ear", label: "După ureche" },
      { value: "face", label: "Față" },
      { value: "head", label: "Cap" },
    ],
  },
];

export const placementLabels: Record<BodyPlacement, string> = Object.fromEntries(
  placementGroups.flatMap((g) => g.options.map((o) => [o.value, o.label]))
) as Record<BodyPlacement, string>;

export default function BodyPlacementSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-400">Zonă corp</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BodyPlacement)}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100
                   focus:outline-none focus:border-yellow-500/60 appearance-none cursor-pointer"
      >
        <option value="" disabled>Selectează zona corpului...</option>
        {placementGroups.map((group) => (
          <optgroup key={group.label} label={group.label} className="text-zinc-400">
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/BodyPlacement.tsx
git commit -m "feat: add BodyPlacement grouped dropdown selector"
```

---

## Task 10: DimensionInput Component

**Files:**
- Create: `components/DimensionInput.tsx`

**Step 1: Write the component**

```typescript
// components/DimensionInput.tsx
"use client";

interface Props {
  width: string;
  height: string;
  onWidthChange: (v: string) => void;
  onHeightChange: (v: string) => void;
}

const sizeHints = [
  { cm: 5,   label: "5cm ≈ card de credit (lățime)" },
  { cm: 10,  label: "10cm ≈ palma ta" },
  { cm: 20,  label: "20cm ≈ coală A5" },
  { cm: 35,  label: "35cm ≈ coală A4" },
];

export default function DimensionInput({ width, height, onWidthChange, onHeightChange }: Props) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-400">Dimensiuni dorite</label>

      <div className="flex gap-4">
        {[
          { label: "Lățime (cm)", value: width, onChange: onWidthChange },
          { label: "Înălțime (cm)", value: height, onChange: onHeightChange },
        ].map(({ label, value, onChange }) => (
          <div key={label} className="flex-1 space-y-1">
            <label className="text-xs text-zinc-500">{label}</label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="cm"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3
                         text-zinc-100 focus:outline-none focus:border-yellow-500/60
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ))}
      </div>

      {/* Size hints */}
      <div className="grid grid-cols-2 gap-2">
        {sizeHints.map((hint) => (
          <div key={hint.cm} className="text-xs text-zinc-600 bg-zinc-900/50 rounded px-2 py-1">
            {hint.label}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/DimensionInput.tsx
git commit -m "feat: add DimensionInput component with size hints"
```

---

## Task 11: PriceDisplay Component

**Files:**
- Create: `components/PriceDisplay.tsx`

**Step 1: Write the component**

```typescript
// components/PriceDisplay.tsx
"use client";
import type { PriceEstimate } from "@/lib/types";

interface Props { estimate: PriceEstimate; }

export default function PriceDisplay({ estimate }: Props) {
  const { minPrice, maxPrice, currency } = estimate;
  return (
    <div className="text-center space-y-2 py-6">
      <p className="text-zinc-400 text-sm uppercase tracking-widest">Estimare preț</p>
      <div className="text-5xl font-bold text-yellow-400">
        {minPrice.toLocaleString("ro-RO")} — {maxPrice.toLocaleString("ro-RO")}
        <span className="text-2xl ml-2 text-yellow-600">{currency}</span>
      </div>
      <p className="text-zinc-500 text-sm">~{estimate.estimatedHours}h lucru estimat</p>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/PriceDisplay.tsx
git commit -m "feat: add PriceDisplay component"
```

---

## Task 12: ResultsCard Component

**Files:**
- Create: `components/ResultsCard.tsx`

**Step 1: Write the component**

```typescript
// components/ResultsCard.tsx
"use client";
import type { AnalyzeResponse, BodyPlacement } from "@/lib/types";
import { placementLabels } from "./BodyPlacement";
import PriceDisplay from "./PriceDisplay";

const styleLabels: Record<string, string> = {
  realism: "Realism", traditional: "Tradițional", "neo-traditional": "Neo-tradițional",
  geometric: "Geometric", watercolor: "Acuarelă", linework: "Linii",
  dotwork: "Puncte", tribal: "Tribal", japanese: "Japonez",
  lettering: "Litere", blackwork: "Blackwork", "trash-polka": "Trash Polka", mixed: "Mixt",
};

const colorLabels: Record<string, string> = {
  black_grey: "Negru & Gri", color: "Color", mixed: "Mixt",
};

interface Props {
  result: AnalyzeResponse;
  placement: BodyPlacement;
  widthCm: number;
  heightCm: number;
}

export default function ResultsCard({ result, placement, widthCm, heightCm }: Props) {
  const { analysis, estimate } = result;

  return (
    <div className="space-y-6 animate-fade-in">
      <PriceDisplay estimate={estimate} />

      {/* Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-widest text-zinc-400 font-medium">Detalii analiză</h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Stil detectat", value: styleLabels[analysis.style] ?? analysis.style },
            { label: "Tip culori", value: colorLabels[analysis.color_type] ?? analysis.color_type },
            { label: "Zonă corp", value: placementLabels[placement] },
            { label: "Dimensiune", value: `${widthCm} × ${heightCm} cm` },
            { label: "Categorie", value: estimate.sizeTier },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-0.5">
              <p className="text-zinc-500 text-xs">{label}</p>
              <p className="text-zinc-100 font-medium">{value}</p>
            </div>
          ))}

          {/* Complexity bar */}
          <div className="col-span-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Complexitate</span>
              <span className="text-zinc-300">{analysis.complexity}/10</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${analysis.complexity * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI description */}
        {analysis.description && (
          <div className="pt-2 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">Descriere AI</p>
            <p className="text-zinc-300 text-sm">{analysis.description}</p>
          </div>
        )}

        {/* Special notes */}
        {analysis.special_notes && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-400 text-xs font-medium mb-1">Note speciale</p>
            <p className="text-zinc-300 text-sm">{analysis.special_notes}</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-zinc-600 text-xs text-center">
        Aceasta este o estimare orientativă. Prețul final va fi stabilit la consultație.
      </p>

      {/* CTA */}
      <a
        href="#contact"
        className="block w-full text-center py-3 rounded-xl border border-yellow-500/40 text-yellow-400
                   hover:bg-yellow-500/10 font-medium transition-colors"
      >
        Programează o consultație
      </a>
    </div>
  );
}
```

**Step 2: Add fade-in animation to tailwind.config.ts**

In `tailwind.config.ts`, extend theme:
```typescript
theme: {
  extend: {
    keyframes: {
      "fade-in": {
        "0%": { opacity: "0", transform: "translateY(12px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
    },
    animation: {
      "fade-in": "fade-in 0.4s ease-out",
    },
  },
},
```

**Step 3: Commit**

```bash
git add components/ResultsCard.tsx components/PriceDisplay.tsx tailwind.config.ts
git commit -m "feat: add ResultsCard and PriceDisplay components"
```

---

## Task 13: Main Page Assembly

**Files:**
- Modify: `app/page.tsx`

**Step 1: Write the main page**

```typescript
// app/page.tsx
"use client";
import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import BodyPlacementSelector from "@/components/BodyPlacement";
import DimensionInput from "@/components/DimensionInput";
import ResultsCard from "@/components/ResultsCard";
import type { AnalyzeResponse, BodyPlacement } from "@/lib/types";

type Step = "input" | "loading" | "results";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [placement, setPlacement] = useState<BodyPlacement | "">("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");

  const canSubmit = images.length > 0 && placement && width && height && step === "input";

  async function handleSubmit() {
    if (!canSubmit) return;
    setStep("loading");
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          placement,
          widthCm: parseFloat(width),
          heightCm: parseFloat(height),
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare necunoscută");
      setResult(data);
      setStep("results");
    } catch (e) {
      setError((e as Error).message);
      setStep("input");
    }
  }

  function reset() {
    setStep("input");
    setResult(null);
    setImages([]);
    setPlacement("");
    setWidth("");
    setHeight("");
    setNotes("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      {/* Hero */}
      <div className="border-b border-zinc-800/60 bg-gradient-to-b from-zinc-900/40 to-transparent">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Estimare Preț{" "}
            <span className="text-yellow-400">Tatuaj</span>
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            Încarcă o imagine, selectează zona și dimensiunile — AI-ul analizează și îți oferă
            o estimare de preț instantanee.
          </p>
        </div>
      </div>

      {/* Form / Results */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {step === "loading" && (
          <div className="text-center py-20 space-y-6">
            {/* Spinner */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-yellow-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-zinc-300 font-medium">Analizăm tatuajul...</p>
              <p className="text-zinc-600 text-sm">Procesare imagine cu AI, câteva secunde</p>
            </div>
            {/* Skeleton bars */}
            <div className="space-y-2 max-w-sm mx-auto">
              {[80, 60, 70, 50].map((w, i) => (
                <div key={i} className="h-3 bg-zinc-800 rounded animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}

        {step === "results" && result && (
          <>
            <ResultsCard
              result={result}
              placement={placement as BodyPlacement}
              widthCm={parseFloat(width)}
              heightCm={parseFloat(height)}
            />
            <button onClick={reset} className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-sm">
              Estimează alt tatuaj
            </button>
          </>
        )}

        {step === "input" && (
          <div className="space-y-8">
            {/* Step 1 */}
            <section className="space-y-3">
              <SectionHeader number={1} title="Imaginea tatuajului" />
              <ImageUpload images={images} onChange={setImages} />
            </section>

            {/* Step 2 */}
            <section className="space-y-4">
              <SectionHeader number={2} title="Detalii" />
              <BodyPlacementSelector value={placement} onChange={setPlacement} />
              <DimensionInput
                width={width} height={height}
                onWidthChange={setWidth} onHeightChange={setHeight}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-400">Note suplimentare (opțional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex. cover-up, culori specifice, detalii importante..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100
                             focus:outline-none focus:border-yellow-500/60 resize-none text-sm placeholder:text-zinc-600"
                />
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800
                         disabled:text-zinc-600 text-black font-bold text-lg tracking-wide
                         transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              Estimează Prețul
            </button>
          </div>
        )}
      </div>

      {/* Footer badge */}
      <div className="text-center pb-8">
        <span className="text-zinc-700 text-xs">Powered by AI ✦ Anthropic Claude</span>
      </div>
    </main>
  );
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center">
        {number}
      </span>
      <h2 className="text-zinc-200 font-semibold">{title}</h2>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble main estimator page"
```

---

## Task 14: Final Verification

**Step 1: Run all tests**

```bash
npm test
```
Expected: All tests pass.

**Step 2: Build check**

```bash
npm run build
```
Expected: Build completes without errors.

**Step 3: Smoke test**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- [ ] Page loads with hero section
- [ ] Can drag & drop or click to upload an image
- [ ] Thumbnails appear with remove button
- [ ] Body placement dropdown shows grouped options
- [ ] Dimension inputs accept numeric values with size hints
- [ ] Submit button is disabled until all fields filled
- [ ] Loading spinner appears on submit
- [ ] Results show price range, breakdown, AI description
- [ ] "Estimează alt tatuaj" resets the form
- [ ] Mobile layout looks clean on narrow viewport

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: tattoo price estimator MVP complete"
```
