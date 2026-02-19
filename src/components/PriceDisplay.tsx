"use client";
import type { PriceEstimate } from "@/lib/types";

interface Props {
  estimate: PriceEstimate;
}

export default function PriceDisplay({ estimate }: Props) {
  const { minPrice, maxPrice, currency, estimatedHours } = estimate;
  return (
    <div className="text-center space-y-2 py-6">
      <p className="text-zinc-400 text-sm uppercase tracking-widest">Estimare preț</p>
      <div className="flex items-baseline justify-center gap-2 flex-wrap">
        <span className="text-5xl font-bold text-yellow-400">
          {minPrice.toLocaleString("ro-RO")}
        </span>
        <span className="text-3xl text-zinc-500">—</span>
        <span className="text-5xl font-bold text-yellow-400">
          {maxPrice.toLocaleString("ro-RO")}
        </span>
        <span className="text-2xl text-yellow-600 ml-1">{currency}</span>
      </div>
      <p className="text-zinc-500 text-sm">~{estimatedHours}h lucru estimat</p>
    </div>
  );
}
