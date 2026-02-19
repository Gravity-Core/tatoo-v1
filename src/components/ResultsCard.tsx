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
    <div className="space-y-6 animate-fade-in">
      <PriceDisplay estimate={estimate} />

      {/* Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-widest text-zinc-400 font-medium">
          Detalii analiză
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
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
                className="h-full rounded-full"
                style={{
                  width: `${analysis.complexity * 10}%`,
                  background: "linear-gradient(to right, #a16207, #facc15)",
                  transition: "width 0.7s ease-out",
                }}
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
          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(234,179,8,0.05)",
              border: "1px solid rgba(234,179,8,0.2)",
            }}
          >
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
        className="block w-full text-center py-3 rounded-xl text-yellow-400 font-medium transition-colors hover:bg-yellow-500/10"
        style={{ border: "1px solid rgba(201,168,76,0.4)" }}
      >
        Programează o consultație
      </a>
    </div>
  );
}
