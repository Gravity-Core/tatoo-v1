"use client";
import type { AnalyzeResponse, BodyPlacement } from "@/lib/types";
import { placementLabels } from "./BodyPlacement";
import PriceDisplay from "./PriceDisplay";

const styleLabels: Record<string, string> = {
  realism: "Realism",
  traditional: "Tradițional",
  "neo-traditional": "Neo-tradițional",
  geometric: "Geometric",
  watercolor: "Acuarelă",
  linework: "Linii",
  dotwork: "Puncte",
  tribal: "Tribal",
  japanese: "Japonez",
  lettering: "Litere",
  blackwork: "Blackwork",
  "trash-polka": "Trash Polka",
  mixed: "Mixt",
};

const colorLabels: Record<string, string> = {
  black_grey: "Negru & Gri",
  color: "Color",
  mixed: "Mixt",
};

interface Props {
  result: AnalyzeResponse;
  placement: BodyPlacement;
  widthCm: number;
  heightCm: number;
}

export default function ResultsCard({ result, placement, widthCm, heightCm }: Props) {
  const { analysis, estimate } = result;

  const details = [
    { label: "Stil detectat", value: styleLabels[analysis.style] ?? analysis.style },
    { label: "Tip culori", value: colorLabels[analysis.color_type] ?? analysis.color_type },
    { label: "Zonă corp", value: placementLabels[placement] },
    { label: "Dimensiune", value: `${widthCm} × ${heightCm} cm` },
    { label: "Categorie", value: estimate.sizeTier },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <PriceDisplay estimate={estimate} />

      {/* Detail grid */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1.5px solid #eae7ec",
          borderRadius: 20,
          padding: "20px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <p
          className="uppercase tracking-widest font-semibold mb-4"
          style={{ color: "#0090ff", fontSize: "0.7rem" }}
        >
          Detalii analiză
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 12px" }}>
          {details.map(({ label, value }) => (
            <div key={label}>
              <p style={{ color: "#a09fa6", fontSize: "0.75rem", marginBottom: 2 }}>{label}</p>
              <p style={{ color: "#211f26", fontSize: "0.95rem", fontWeight: 600 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Complexity bar */}
        <div style={{ marginTop: 16 }}>
          <div className="flex justify-between mb-2">
            <span style={{ color: "#65636d", fontSize: "0.8rem" }}>Complexitate</span>
            <span style={{ color: "#113264", fontSize: "0.8rem", fontWeight: 700 }}>
              {analysis.complexity}/10
            </span>
          </div>
          <div style={{ height: 8, backgroundColor: "#eae7ec", borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${analysis.complexity * 10}%`,
                background: "linear-gradient(to right, #0090ff, #113264)",
                borderRadius: 99,
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
        </div>

        {/* AI description */}
        {analysis.description && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #eae7ec" }}>
            <p style={{ color: "#a09fa6", fontSize: "0.75rem", marginBottom: 4 }}>Descriere AI</p>
            <p style={{ color: "#211f26", fontSize: "0.9rem", lineHeight: 1.6 }}>{analysis.description}</p>
          </div>
        )}

        {/* Special notes */}
        {analysis.special_notes && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 12,
              padding: "12px 14px",
              backgroundColor: "#e6f4fe",
              border: "1px solid #c5e0fc",
            }}
          >
            <p style={{ color: "#0090ff", fontSize: "0.75rem", fontWeight: 600, marginBottom: 4 }}>Note speciale</p>
            <p style={{ color: "#211f26", fontSize: "0.875rem", lineHeight: 1.6 }}>{analysis.special_notes}</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center" style={{ color: "#c8c6ce", fontSize: "0.78rem" }}>
        Estimare orientativă. Prețul final se stabilește la consultație.
      </p>

      {/* CTA */}
      <a
        href="#contact"
        className="flex items-center justify-center font-semibold transition-colors"
        style={{
          height: 58,
          borderRadius: 16,
          backgroundColor: "#0090ff",
          color: "#fff",
          fontSize: "1rem",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0070d4")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0090ff")}
      >
        Programează o consultație
      </a>
    </div>
  );
}
