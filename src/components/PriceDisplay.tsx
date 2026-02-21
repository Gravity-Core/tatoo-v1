"use client";
import type { PriceEstimate } from "@/lib/types";

interface Props {
  estimate: PriceEstimate;
}

export default function PriceDisplay({ estimate }: Props) {
  const { minPrice, maxPrice, currency, estimatedHours } = estimate;
  return (
    <div
      className="rounded-xl p-6 text-center space-y-3"
      style={{
        background: "linear-gradient(135deg, #e6f4fe 0%, #f0f8ff 100%)",
        border: "1px solid #c5e0fc",
      }}
    >
      <p className="text-sm font-medium uppercase tracking-widest" style={{ color: "#0090ff" }}>
        Estimare preț
      </p>
      <div className="flex items-baseline justify-center gap-2 flex-wrap">
        <span className="font-bold" style={{ color: "#113264", fontSize: "clamp(2rem, 8vw, 3rem)" }}>
          {minPrice.toLocaleString("ro-RO")}
        </span>
        <span className="text-2xl" style={{ color: "#65636d" }}>—</span>
        <span className="font-bold" style={{ color: "#113264", fontSize: "clamp(2rem, 8vw, 3rem)" }}>
          {maxPrice.toLocaleString("ro-RO")}
        </span>
        <span className="text-xl font-medium ml-1" style={{ color: "#0090ff" }}>{currency}</span>
      </div>
      <p className="text-sm" style={{ color: "#65636d" }}>~{estimatedHours}h lucru estimat</p>
    </div>
  );
}
