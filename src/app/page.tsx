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
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");

  const { scrollToTop, sendEvent } = useWordPressBridge();

  const canSubmit =
    images.length > 0 && placement !== "" && width !== "" && height !== "" && step === "input";

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
    setError("");
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#fdfcfd" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #e6f4fe 0%, #fdfcfd 100%)",
          borderBottom: "1px solid #eae7ec",
        }}
      >
        <div className="max-w-2xl mx-auto px-5 py-10 text-center">
          <h1
            className="font-bold mb-3"
            style={{ color: "#113264", fontSize: "clamp(1.6rem, 4vw, 2.25rem)", lineHeight: 1.25 }}
          >
            Estimare Preț Tatuaj
          </h1>
          <p style={{ color: "#65636d", fontSize: "1rem", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            Încarcă o imagine, selectează zona și dimensiunile — AI-ul analizează și îți oferă
            o estimare de preț instantanee.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        {/* Loading */}
        {step === "loading" && (
          <div className="text-center py-16 space-y-5">
            <div className="relative w-14 h-14 mx-auto">
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: "3px solid #e6f4fe" }}
              />
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
            <div>
              <p className="font-medium" style={{ color: "#113264" }}>Analizăm tatuajul...</p>
              <p className="text-sm mt-1" style={{ color: "#65636d" }}>Procesare imagine cu AI, câteva secunde</p>
            </div>
            <div className="space-y-2 max-w-xs mx-auto">
              {[75, 55, 65, 45].map((w, i) => (
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
          <>
            <ResultsCard
              result={result}
              placement={placement as BodyPlacement}
              widthCm={parseFloat(width)}
              heightCm={parseFloat(height)}
            />
            <button
              onClick={reset}
              className="w-full py-3 rounded-lg text-sm font-medium transition-colors"
              style={{ border: "1px solid #eae7ec", color: "#65636d", backgroundColor: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdfcfd")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              Estimează alt tatuaj
            </button>
          </>
        )}

        {/* Input form */}
        {step === "input" && (
          <div className="space-y-6">
            {/* Step 1 */}
            <section
              className="rounded-xl p-6 space-y-4"
              style={{ backgroundColor: "#fff", border: "1px solid #eae7ec", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <SectionHeader number={1} title="Imaginea tatuajului" />
              <ImageUpload images={images} onChange={setImages} />
            </section>

            {/* Step 2 */}
            <section
              className="rounded-xl p-6 space-y-4"
              style={{ backgroundColor: "#fff", border: "1px solid #eae7ec", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <SectionHeader number={2} title="Detalii" />
              <BodyPlacementSelector value={placement} onChange={setPlacement} />
              <DimensionInput
                width={width}
                height={height}
                onWidthChange={setWidth}
                onHeightChange={setHeight}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: "#211f26" }}>
                  Note suplimentare{" "}
                  <span className="font-normal" style={{ color: "#65636d" }}>(opțional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex. cover-up, culori specifice, detalii importante..."
                  rows={3}
                  className="w-full rounded-lg px-4 py-3 text-sm resize-none"
                  style={{
                    backgroundColor: "#fdfcfd",
                    border: "1px solid #eae7ec",
                    color: "#211f26",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
                />
              </div>
            </section>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg p-3 text-sm"
                style={{ backgroundColor: "#fff0f0", border: "1px solid #fca5a5", color: "#dc2626" }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-lg font-medium text-base transition-colors"
              style={{
                backgroundColor: canSubmit ? "#0090ff" : "#eae7ec",
                color: canSubmit ? "#fff" : "#65636d",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = "#0070d4"; }}
              onMouseLeave={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = "#0090ff"; }}
            >
              Estimează Prețul
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <span className="text-xs" style={{ color: "#a09fa6" }}>Powered by AI · Anthropic Claude</span>
      </div>
    </main>
  );
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#e6f4fe", color: "#0090ff" }}
      >
        {number}
      </span>
      <h2 className="font-medium text-base" style={{ color: "#113264" }}>{title}</h2>
    </div>
  );
}
