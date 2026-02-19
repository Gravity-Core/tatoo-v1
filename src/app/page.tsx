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
    <main className="min-h-screen" style={{ backgroundColor: "#0d0d0d" }}>
      {/* Hero */}
      <div
        style={{
          borderBottom: "1px solid rgba(39,39,42,0.6)",
          background: "linear-gradient(to bottom, rgba(24,24,27,0.4), transparent)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Estimare Preț{" "}
            <span className="text-yellow-400">Tatuaj</span>
          </h1>
          <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
            Încarcă o imagine, selectează zona și dimensiunile — AI-ul analizează și îți oferă
            o estimare de preț instantanee.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Loading state */}
        {step === "loading" && (
          <div className="text-center py-20 space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid rgba(234,179,8,0.2)" }}
              />
              <div
                className="absolute inset-0 rounded-full animate-tattoo-spin"
                style={{
                  borderTop: "2px solid #facc15",
                  borderRight: "2px solid transparent",
                  borderBottom: "2px solid transparent",
                  borderLeft: "2px solid transparent",
                }}
              />
            </div>
            <div className="space-y-2">
              <p className="text-zinc-300 font-medium">Analizăm tatuajul...</p>
              <p className="text-zinc-600 text-sm">Procesare imagine cu AI, câteva secunde</p>
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              {[80, 60, 70, 50].map((w, i) => (
                <div
                  key={i}
                  className="h-3 bg-zinc-800 rounded animate-pulse"
                  style={{ width: `${w}%` }}
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
              className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-sm transition-colors"
            >
              Estimează alt tatuaj
            </button>
          </>
        )}

        {/* Input form */}
        {step === "input" && (
          <div className="space-y-8">
            {/* Step 1: Image */}
            <section className="space-y-4">
              <SectionHeader number={1} title="Imaginea tatuajului" />
              <ImageUpload images={images} onChange={setImages} />
            </section>

            {/* Step 2: Details */}
            <section className="space-y-4">
              <SectionHeader number={2} title="Detalii" />
              <BodyPlacementSelector value={placement} onChange={setPlacement} />
              <DimensionInput
                width={width}
                height={height}
                onWidthChange={setWidth}
                onHeightChange={setHeight}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-400">
                  Note suplimentare{" "}
                  <span className="text-zinc-600 font-normal">(opțional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex. cover-up, culori specifice, detalii importante..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-yellow-500/60 resize-none text-sm placeholder:text-zinc-600"
                />
              </div>
            </section>

            {/* Error message */}
            {error && (
              <div
                className="rounded-lg p-3 text-red-400 text-sm"
                style={{
                  background: "rgba(127,29,29,0.2)",
                  border: "1px solid rgba(185,28,28,0.4)",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-200"
              style={{
                backgroundColor: canSubmit ? "#eab308" : "#27272a",
                color: canSubmit ? "#000" : "#52525b",
              }}
            >
              Estimează Prețul
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-10">
        <span className="text-zinc-700 text-xs">Powered by AI ✦ Anthropic Claude</span>
      </div>
    </main>
  );
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-6 h-6 rounded-full text-yellow-400 text-xs font-bold flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(234,179,8,0.15)" }}
      >
        {number}
      </span>
      <h2 className="text-zinc-200 font-semibold">{title}</h2>
    </div>
  );
}
