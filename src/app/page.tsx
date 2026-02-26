"use client";
import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import BookingModal from "@/components/BookingModal";
import { useWordPressBridge } from "./useWordPressBridge";
import type { AnalyzeResponse, BodyPlacement } from "@/lib/types";

type Step = "input" | "loading" | "results";
type SizePreset = "" | "mic" | "mediu" | "mare" | "custom";

const SIZE_OPTIONS = [
  { value: "mic"    as SizePreset, label: "Mic",          sublabel: "până la 2 cm²", w: "1.4", h: "1.4" },
  { value: "mediu"  as SizePreset, label: "Mediu",        sublabel: "2 – 10 cm²",    w: "3",   h: "3"   },
  { value: "mare"   as SizePreset, label: "Mare",         sublabel: "10 – 20 cm²",   w: "4",   h: "5"   },
  { value: "custom" as SizePreset, label: "Personalizat", sublabel: "introduc exact", w: null,  h: null  },
] as const;

const ZONE_OPTIONS: { value: BodyPlacement; label: string }[] = [
  { value: "upper_arm",  label: "Braț"      },
  { value: "thigh",      label: "Picior"    },
  { value: "back_upper", label: "Spate"     },
  { value: "chest",      label: "Piept"     },
  { value: "ribs",       label: "Altă zonă" },
];

const styleLabels: Record<string, string> = {
  realism: "Realism", traditional: "Tradițional", "neo-traditional": "Neo-tradițional",
  geometric: "Geometric", watercolor: "Acuarelă", linework: "Linii",
  dotwork: "Puncte", tribal: "Tribal", japanese: "Japonez",
  lettering: "Litere", blackwork: "Blackwork", "trash-polka": "Trash Polka", mixed: "Mixt",
};

export default function Home() {
  const [images, setImages]       = useState<string[]>([]);
  const [sizePreset, setSizePreset] = useState<SizePreset>("");
  const [placement, setPlacement] = useState<BodyPlacement | "">("");
  const [width, setWidth]         = useState("");
  const [height, setHeight]       = useState("");
  const [notes, setNotes]         = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [step, setStep]           = useState<Step>("input");
  const [result, setResult]       = useState<AnalyzeResponse | null>(null);
  const [error, setError]         = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  const { scrollToTop, sendEvent } = useWordPressBridge();

  const canSubmit =
    images.length > 0 && placement !== "" && width !== "" && height !== "" &&
    confirmed && step !== "loading";

  function handleSizePreset(preset: SizePreset) {
    setSizePreset(preset);
    const opt = SIZE_OPTIONS.find((o) => o.value === preset);
    if (opt?.w) { setWidth(opt.w); setHeight(opt.h!); }
    else         { setWidth("");    setHeight("");      }
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setStep("loading");
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images, placement,
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
    setImages([]); setSizePreset(""); setPlacement("");
    setWidth(""); setHeight(""); setNotes("");
    setConfirmed(false); setResult(null); setStep("input"); setError("");
    setBookingOpen(false);
  }

  return (
    <main className="min-h-screen" style={{ background: "transparent" }}>

      {/* Hero */}
      <div className="text-center" style={{ padding: "44px 20px 28px" }}>
        <h1
          className="font-bold mb-2"
          style={{ color: "#113264", fontSize: "clamp(1.5rem, 5vw, 2.25rem)", lineHeight: 1.2 }}
        >
          Estimare Preț Tatuaj
        </h1>
        <p style={{ color: "#65636d", fontSize: "1rem", marginBottom: 20 }}>
          Estimare instant în câteva secunde.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="calc-layout" style={{ maxWidth: 980, margin: "0 auto", padding: "0 16px 48px" }}>

        {/* ── LEFT: Calculator card ── */}
        <div style={card}>
          <h2 className="text-center font-semibold mb-1" style={{ color: "#113264", fontSize: "1.05rem" }}>
            Calculator de Preț
          </h2>
          <div style={{ height: 1, backgroundColor: "#f0eef3", margin: "16px 0 20px" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Pasul 1 — Dimensiune */}
            <StepSection number={1} title="Dimensiune Tatuaj">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SIZE_OPTIONS.map((opt) => {
                  const active = sizePreset === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSizePreset(opt.value)}
                      className="btn-press"
                      style={{
                        padding: "13px 10px",
                        borderRadius: 12,
                        border: `1.5px solid ${active ? "#0090ff" : "#a8d4f8"}`,
                        background: active
                          ? "#0090ff"
                          : "linear-gradient(150deg, #eef6ff 0%, #ffffff 65%)",
                        color: active ? "#fff" : "#211f26",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.72rem", marginTop: 2, opacity: active ? 0.85 : 0.55 }}>
                        {opt.sublabel}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom dimension inputs */}
              {sizePreset === "custom" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                  {[
                    { label: "Lățime (cm)", val: width,  set: setWidth  },
                    { label: "Înălțime (cm)", val: height, set: setHeight },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "#65636d", marginBottom: 5 }}>
                        {label}
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={val}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            if (digits === "") { set(""); return; }
                            const num = parseInt(digits, 10);
                            if (num > 0 && num <= 999) set(String(num));
                          }}
                          placeholder="ex: 10"
                          style={{
                            width: "100%", height: 46, borderRadius: 10, boxSizing: "border-box",
                            border: `1.5px solid ${val ? "#0090ff" : "#eae7ec"}`,
                            backgroundColor: "#fdfcfd", color: "#211f26",
                            fontSize: "1rem", fontWeight: 600, padding: "0 34px 0 12px", outline: "none",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                          onBlur={(e)  => (e.currentTarget.style.borderColor = val ? "#0090ff" : "#eae7ec")}
                        />
                        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#a09fa6", fontSize: "0.8rem", pointerEvents: "none" }}>
                          cm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </StepSection>

            <Divider />

            {/* Pasul 2 — Image */}
            <StepSection number={2} title="Imaginea tatuajului">
              <ImageUpload images={images} onChange={setImages} />
            </StepSection>

            <Divider />

            {/* Pasul 3 — Confirmation */}
            <StepSection number={3} title="Confirmare">
              <label
                className="flex items-center gap-3 cursor-pointer"
                style={{
                  backgroundColor: confirmed ? "#e6f4fe" : "#fdfcfd",
                  border: `1.5px solid ${confirmed ? "#0090ff" : "#eae7ec"}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  transition: "all 0.15s",
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
                      width: 22, height: 22, borderRadius: 6,
                      border: `2px solid ${confirmed ? "#0090ff" : "#c8c6ce"}`,
                      backgroundColor: confirmed ? "#0090ff" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s", flexShrink: 0,
                    }}
                  >
                    {confirmed && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span style={{ color: "#211f26", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  Tatuajul nu este mai recent de 6 luni
                </span>
              </label>
            </StepSection>

            <Divider />

            {/* Pasul 4 — Body zone */}
            <StepSection number={4} title="Zonă Corporală">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {ZONE_OPTIONS.map((zone) => {
                  const active = placement === zone.value;
                  return (
                    <button
                      key={zone.value}
                      onClick={() => setPlacement(zone.value)}
                      className="btn-press"
                      style={{
                        padding: "14px 6px 10px",
                        borderRadius: 12,
                        border: `1.5px solid ${active ? "#0090ff" : "#eae7ec"}`,
                        backgroundColor: active ? "#e6f4fe" : "#fff",
                        cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        transition: "all 0.15s",
                      }}
                    >
                      <ZoneIcon zone={zone.value} active={active} />
                      <span style={{ fontSize: "0.72rem", color: active ? "#0090ff" : "#65636d", fontWeight: active ? 600 : 400 }}>
                        {zone.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </StepSection>

            <Divider />

            {/* Notes — optional */}
            <div>
              <p className="font-medium mb-3" style={{ color: "#65636d", fontSize: "0.875rem" }}>
                Note suplimentare <span style={{ color: "#a09fa6" }}>(opțional)</span>
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex. cover-up, culori specifice, detalii importante..."
                rows={3}
                className="w-full resize-none"
                style={{
                  backgroundColor: "#fdfcfd", border: "1.5px solid #eae7ec",
                  borderRadius: 12, padding: "12px 14px",
                  color: "#211f26", fontSize: "0.95rem", outline: "none", lineHeight: 1.6,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "#eae7ec")}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ backgroundColor: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 14px", color: "#dc2626", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full font-semibold btn-press"
              style={{
                height: 54, borderRadius: 14, border: "none",
                backgroundColor: canSubmit ? "#0090ff" : "#eae7ec",
                color: canSubmit ? "#fff" : "#a09fa6",
                cursor: canSubmit ? "pointer" : "not-allowed",
                fontSize: "0.95rem", letterSpacing: "0.04em",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = "#0070d4"; }}
              onMouseLeave={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = "#0090ff"; }}
            >
              ESTIMEAZĂ PREȚUL
            </button>

          </div>
        </div>

        {/* ── RIGHT: Results card (sticky) ── */}
        <div
          className={step === "input" && !result ? "results-panel-empty" : ""}
          style={{ position: "sticky", top: 20 }}
        >
          <div style={card}>
            <h2 className="text-center font-semibold mb-1" style={{ color: "#113264", fontSize: "1rem" }}>
              Estimare Personalizată
            </h2>
            <div style={{ height: 1, backgroundColor: "#f0eef3", margin: "14px 0 18px" }} />

            {/* Placeholder */}
            {step === "input" && !result && (
              <div className="text-center" style={{ padding: "16px 0 20px" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🖋</div>
                <p style={{ color: "#a09fa6", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  Completează formularul pentru a vedea estimarea de preț
                </p>
              </div>
            )}

            {/* Previous result while form is being refilled */}
            {step === "input" && result && (
              <PricePanel result={result} onReset={reset} onBook={() => setBookingOpen(true)} />
            )}

            {/* Loading */}
            {step === "loading" && (
              <div className="text-center" style={{ padding: "24px 0 28px" }}>
                <div className="relative w-12 h-12 mx-auto mb-4">
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
                <p className="font-semibold" style={{ color: "#113264", fontSize: "0.95rem" }}>Analizăm...</p>
                <p style={{ color: "#65636d", fontSize: "0.8rem", marginTop: 4 }}>câteva secunde</p>
              </div>
            )}

            {/* Results */}
            {step === "results" && result && (
              <PricePanel result={result} onReset={reset} onBook={() => setBookingOpen(true)} />
            )}
          </div>
        </div>

      </div>

      {bookingOpen && result && (
        <BookingModal
          result={result}
          placement={placement as BodyPlacement}
          widthCm={parseFloat(width) || 0}
          heightCm={parseFloat(height) || 0}
          images={images}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </main>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PricePanel({ result, onReset, onBook }: { result: AnalyzeResponse; onReset: () => void; onBook: () => void }) {
  const { estimate, analysis } = result;
  return (
    <div className="animate-fade-in">
      {/* Price */}
      <div className="text-center" style={{ marginBottom: 16 }}>
        <div
          className="font-bold"
          style={{ color: "#0090ff", fontSize: "clamp(1.8rem, 6vw, 2.4rem)", lineHeight: 1.1 }}
        >
          {estimate.minPrice.toLocaleString("ro-RO")} – {estimate.maxPrice.toLocaleString("ro-RO")}
          <span style={{ fontSize: "1.1rem", marginLeft: 6 }}>{estimate.currency}</span>
        </div>
        <p style={{ color: "#65636d", fontSize: "0.8rem", marginTop: 6 }}>
          Categorie: <strong style={{ color: "#211f26" }}>{estimate.sizeTier}</strong>
        </p>
      </div>

      {/* Analysis details */}
      <div style={{ backgroundColor: "#fdfcfd", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <DetailRow label="Stil" value={styleLabels[analysis.style] ?? analysis.style} />
          <DetailRow label="Culori" value={analysis.color_type === "black_grey" ? "Negru & Gri" : analysis.color_type === "color" ? "Color" : "Mixt"} />
          {/* Complexity bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#65636d", marginBottom: 4 }}>
              <span>Complexitate</span>
              <span style={{ fontWeight: 600, color: "#113264" }}>{analysis.complexity}/10</span>
            </div>
            <div style={{ height: 6, backgroundColor: "#eae7ec", borderRadius: 99, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${analysis.complexity * 10}%`,
                  background: "linear-gradient(to right, #0090ff, #113264)",
                  borderRadius: 99,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{ color: "#c8c6ce", fontSize: "0.72rem", textAlign: "center", marginBottom: 14 }}>
        Estimare orientativă. Prețul final se stabilește la consultație.
      </p>

      {/* CTA */}
      <button
        onClick={onBook}
        className="flex items-center justify-center font-bold btn-press"
        style={{
          height: 46, borderRadius: 10, width: "100%",
          backgroundColor: "#0090ff", color: "#fff",
          fontSize: "0.8rem", letterSpacing: "0.05em",
          border: "none", cursor: "pointer",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0070d4")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0090ff")}
      >
        PROGRAMEAZĂ CONSULTAȚIA
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="btn-press"
        style={{
          width: "100%", marginTop: 10, height: 38, borderRadius: 8,
          border: "1px solid #eae7ec", backgroundColor: "transparent",
          color: "#a09fa6", fontSize: "0.8rem", cursor: "pointer",
        }}
      >
        Estimează din nou
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
      <span style={{ color: "#a09fa6" }}>{label}</span>
      <span style={{ color: "#211f26", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function StepSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5" style={{ marginBottom: 14 }}>
        <span
          style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            backgroundColor: "#e6f4fe", color: "#0090ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.8rem",
          }}
        >
          {number}
        </span>
        <h2 style={{ color: "#113264", fontWeight: 600, fontSize: "0.95rem" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: "#f0eef3" }} />;
}

// ── Body zone SVG icons ──────────────────────────────────────────────────────

const ZONE_ICONS: Partial<Record<BodyPlacement, string>> = {
  upper_arm:  "/icons/arm.svg",
  thigh:      "/icons/leg.svg",
  back_upper: "/icons/back.svg",
  chest:      "/icons/chest.svg",
  ribs:       "/icons/other.svg",
};

function ZoneIcon({ zone, active }: { zone: BodyPlacement; active: boolean }) {
  return (
    <img
      src={ZONE_ICONS[zone] ?? "/icons/other.svg"}
      alt={zone}
      style={{
        width: 44,
        height: 44,
        objectFit: "contain",
        objectPosition: "center",
        flexShrink: 0,
        transition: "opacity 0.15s, filter 0.15s",
        opacity: active ? 1 : 0.55,
        filter: active ? "none" : "grayscale(0.3)",
      }}
    />
  );
}

// ── Shared styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1.5px solid #eae7ec",
  borderRadius: 20,
  padding: "24px 20px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
};
