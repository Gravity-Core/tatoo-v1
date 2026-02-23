"use client";
import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import BodyPlacementSelector from "@/components/BodyPlacement";
import DimensionInput from "@/components/DimensionInput";
import ResultsCard from "@/components/ResultsCard";
import { useWordPressBridge } from "./useWordPressBridge";
import type { AnalyzeResponse, BodyPlacement } from "@/lib/types";

type Step = "input" | "loading" | "results";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [placement, setPlacement] = useState<BodyPlacement | "">("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");

  const { scrollToTop, sendEvent } = useWordPressBridge();

  const canSubmit =
    images.length > 0 && placement !== "" && width !== "" && height !== "" && confirmed && step === "input";

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
      scrollToTop();
      sendEvent("estimation_complete", {
        style: data.analysis.style,
        complexity: data.analysis.complexity,
        color_type: data.analysis.color_type,
        placement,
        widthCm: parseFloat(width),
        heightCm: parseFloat(height),
        estimatedPrice: data.estimate.estimatedPrice,
        minPrice: data.estimate.minPrice,
        maxPrice: data.estimate.maxPrice,
        currency: data.estimate.currency,
      });
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
    setConfirmed(false);
    setError("");
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#fdfcfd" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #e6f4fe 0%, #fdfcfd 60%)" }}>
        <div className="max-w-lg mx-auto px-5 pt-10 pb-8 text-center">
          {/* <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: "#e6f4fe", color: "#0090ff" }}
          >
            Estimator AI
          </div> */}
          <h1
            className="font-bold mb-3"
            style={{ color: "#113264", fontSize: "clamp(1.75rem, 6vw, 2.5rem)", lineHeight: 1.2 }}
          >
            Estimare Preț Tatuaj
          </h1>
          <p style={{ color: "#65636d", fontSize: "1rem", lineHeight: 1.7 }}>
            Încarcă o imagine, selectează zona și dimensiunile — AI-ul analizează și îți oferă o estimare instantanee.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pb-12 space-y-4">

        {/* Loading */}
        {step === "loading" && (
          <div className="text-center py-20 space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full" style={{ border: "3px solid #e6f4fe" }} />
              <div
                className="absolute inset-0 rounded-full animate-columna-spin"
                style={{
                  borderTop: "3px solid #0090ff",
                  borderRight: "3px solid transparent",
                  borderBottom: "3px solid transparent",
                  borderLeft: "3px solid transparent",
                }}
              />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-lg" style={{ color: "#113264" }}>Analizăm tatuajul...</p>
              <p className="text-sm" style={{ color: "#65636d" }}>Procesare imagine cu AI, câteva secunde</p>
            </div>
            <div className="space-y-2.5 max-w-xs mx-auto">
              {[70, 50, 62, 40].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full animate-pulse"
                  style={{ width: `${w}%`, backgroundColor: "#e6f4fe" }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {step === "results" && result && (
          <div className="space-y-4 pt-2">
            <ResultsCard
              result={result}
              placement={placement as BodyPlacement}
              widthCm={parseFloat(width)}
              heightCm={parseFloat(height)}
            />
            <button
              onClick={reset}
              className="w-full font-medium transition-colors mt-4"
              style={{
                height: 52,
                borderRadius: 14,
                border: "1.5px solid #eae7ec",
                color: "#65636d",
                backgroundColor: "#fff",
                fontSize: "0.95rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdfcfd")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              Estimează alt tatuaj
            </button>
          </div>
        )}

        {/* Input form */}
        {step === "input" && (
          <div className="space-y-4">

            {/* Step 1 — Image */}
            <section
              className="mt-4"
              style={{
                backgroundColor: "#fff",
                border: "1.5px solid #eae7ec",
                borderRadius: 20,
                padding: "24px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <StepHeader number={1} title="Imaginea tatuajului" />
              <div style={{ marginTop: 16 }}>
                <ImageUpload images={images} onChange={setImages} />
              </div>
            </section>

            {/* Step 2 — Placement */}
            <section
              className="mt-4"
              style={{
                backgroundColor: "#fff",
                border: "1.5px solid #eae7ec",
                borderRadius: 20,
                padding: "24px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <StepHeader number={2} title="Zonă & dimensiuni" />
              <div className="space-y-4" style={{ marginTop: 16 }}>
                <BodyPlacementSelector value={placement} onChange={setPlacement} />
                <DimensionInput
                  width={width}
                  height={height}
                  onWidthChange={setWidth}
                  onHeightChange={setHeight}
                />
              </div>
            </section>

            {/* Step 3 — Notes */}
            <section
              className="mt-4"
              style={{
                backgroundColor: "#fff",
                border: "1.5px solid #eae7ec",
                borderRadius: 20,
                padding: "24px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <StepHeader number={3} title="Note suplimentare" optional />
              <div style={{ marginTop: 16 }}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex. cover-up, culori specifice, detalii importante..."
                  rows={4}
                  className="w-full resize-none"
                  style={{
                    backgroundColor: "#fdfcfd",
                    border: "1.5px solid #eae7ec",
                    borderRadius: 12,
                    padding: "14px 16px",
                    color: "#211f26",
                    fontSize: "1rem",
                    outline: "none",
                    lineHeight: 1.6,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
                />
              </div>
            </section>

            {/* Confirmation checkbox */}
            <label
              className="flex items-center gap-3 cursor-pointer"
              style={{
                backgroundColor: confirmed ? "#e6f4fe" : "#fff",
                border: `1.5px solid ${confirmed ? "#0090ff" : "#eae7ec"}`,
                borderRadius: 14,
                padding: "16px 18px",
                transition: "border-color 0.15s, background-color 0.15s",
              }}
            >
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `2px solid ${confirmed ? "#0090ff" : "#c8c6ce"}`,
                    backgroundColor: confirmed ? "#0090ff" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border-color 0.15s, background-color 0.15s",
                  }}
                >
                  {confirmed && (
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span style={{ color: "#211f26", fontSize: "0.95rem", lineHeight: 1.5 }}>
                Tatuajul nu este mai recent de 6 luni
              </span>
            </label>

            {/* Error */}
            {error && (
              <div
                style={{
                  backgroundColor: "#fff0f0",
                  border: "1px solid #fca5a5",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "#dc2626",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full font-semibold transition-colors mt-4"
              style={{
                height: 58,
                borderRadius: 16,
                backgroundColor: canSubmit ? "#0090ff" : "#eae7ec",
                color: canSubmit ? "#fff" : "#a09fa6",
                cursor: canSubmit ? "pointer" : "not-allowed",
                fontSize: "1.05rem",
                letterSpacing: "0.01em",
                border: "none",
              }}
              onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = "#0070d4"; }}
              onMouseLeave={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = "#0090ff"; }}
            >
              Estimează Prețul
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function StepHeader({ number, title, optional }: { number: number; title: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex items-center justify-center flex-shrink-0 font-bold text-sm"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: "#e6f4fe",
          color: "#0090ff",
        }}
      >
        {number}
      </span>
      <h2 className="font-semibold" style={{ color: "#113264", fontSize: "1rem" }}>
        {title}
        {optional && (
          <span className="font-normal ml-1.5" style={{ color: "#a09fa6", fontSize: "0.85rem" }}>
            (opțional)
          </span>
        )}
      </h2>
    </div>
  );
}
