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

  return (
    <div className="space-y-5 animate-fade-in">
      <PriceDisplay estimate={estimate} />

      {/* Breakdown */}
      <div
        className="rounded-xl p-6 space-y-4"
        style={{ backgroundColor: "#fff", border: "1px solid #eae7ec", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <h3 className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#0090ff" }}>
          Detalii analiză
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            {
              label: "Stil detectat",
              value: styleLabels[analysis.style] ?? analysis.style,
            },
            {
              label: "Tip culori",
              value: colorLabels[analysis.color_type] ?? analysis.color_type,
            },
            {
              label: "Zonă corp",
              value: placementLabels[placement],
            },
            {
              label: "Dimensiune",
              value: `${widthCm} × ${heightCm} cm`,
            },
            {
              label: "Categorie",
              value: estimate.sizeTier,
            },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-0.5">
              <p className="text-xs" style={{ color: "#65636d" }}>{label}</p>
              <p className="font-medium" style={{ color: "#211f26" }}>{value}</p>
            </div>
          ))}

          {/* Complexity bar */}
          <div className="col-span-2 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: "#65636d" }}>Complexitate</span>
              <span className="font-medium" style={{ color: "#113264" }}>{analysis.complexity}/10</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#eae7ec" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${analysis.complexity * 10}%`,
                  background: "linear-gradient(to right, #0090ff, #113264)",
                  transition: "width 0.7s ease-out",
                }}
              />
            </div>
          </div>
        </div>

        {/* AI description */}
        {analysis.description && (
          <div className="pt-3" style={{ borderTop: "1px solid #eae7ec" }}>
            <p className="text-xs mb-1" style={{ color: "#65636d" }}>Descriere AI</p>
            <p className="text-sm" style={{ color: "#211f26" }}>{analysis.description}</p>
          </div>
        )}

        {/* Special notes */}
        {analysis.special_notes && (
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "#e6f4fe", border: "1px solid #c5e0fc" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "#0090ff" }}>Note speciale</p>
            <p className="text-sm" style={{ color: "#211f26" }}>{analysis.special_notes}</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center" style={{ color: "#a09fa6" }}>
        Aceasta este o estimare orientativă. Prețul final va fi stabilit la consultație.
      </p>

      {/* CTA */}
      <a
        href="#contact"
        className="block w-full text-center py-3 rounded-lg font-medium text-sm transition-colors"
        style={{
          backgroundColor: "#0090ff",
          color: "#fff",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0070d4")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0090ff")}
      >
        Programează o consultație
      </a>
    </div>
  );
}
