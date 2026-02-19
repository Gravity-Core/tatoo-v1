"use client";

interface Props {
  width: string;
  height: string;
  onWidthChange: (v: string) => void;
  onHeightChange: (v: string) => void;
}

const sizeHints = [
  { label: "5cm ≈ card de credit (lățime)" },
  { label: "10cm ≈ palma ta" },
  { label: "20cm ≈ coală A5" },
  { label: "35cm ≈ coală A4" },
];

export default function DimensionInput({
  width,
  height,
  onWidthChange,
  onHeightChange,
}: Props) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-400">Dimensiuni dorite</label>

      <div className="flex gap-4">
        {[
          { label: "Lățime (cm)", value: width, onChange: onWidthChange },
          { label: "Înălțime (cm)", value: height, onChange: onHeightChange },
        ].map(({ label, value, onChange }) => (
          <div key={label} className="flex-1 space-y-1">
            <label className="text-xs text-zinc-500">{label}</label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="cm"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-yellow-500/60"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sizeHints.map((hint) => (
          <div
            key={hint.label}
            className="text-xs text-zinc-600 bg-zinc-900/50 rounded px-2 py-1"
          >
            {hint.label}
          </div>
        ))}
      </div>
    </div>
  );
}
