"use client";
import type { PriceEstimate } from "@/lib/types";

interface Props {
  estimate: PriceEstimate;
}

export default function PriceDisplay({ estimate }: Props) {
  const { minPrice, maxPrice, currency, estimatedHours } = estimate;
  return (
    <div
      className="text-center"
      style={{
        background: "linear-gradient(135deg, #113264 0%, #1a4a8a 100%)",
        borderRadius: 20,
        padding: "32px 24px",
      }}
    >
      <p
        className="uppercase tracking-widest font-semibold mb-4"
        style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}
      >
        Estimare preț
      </p>
      <div className="flex items-baseline justify-center gap-3 flex-wrap">
        <span className="font-bold" style={{ color: "#fff", fontSize: "clamp(2.5rem, 10vw, 3.5rem)", lineHeight: 1 }}>
          {minPrice.toLocaleString("ro-RO")}
        </span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.5rem" }}>—</span>
        <span className="font-bold" style={{ color: "#fff", fontSize: "clamp(2.5rem, 10vw, 3.5rem)", lineHeight: 1 }}>
          {maxPrice.toLocaleString("ro-RO")}
        </span>
        <span className="font-semibold" style={{ color: "#60b4ff", fontSize: "1.4rem" }}>{currency}</span>
      </div>
      <p className="mt-4" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
        ~{estimatedHours}h lucru estimat
      </p>
    </div>
  );
}
