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
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: "#211f26" }}>
        Dimensiuni dorite
      </label>

      <div className="flex gap-4">
        {[
          { label: "Lățime (cm)", value: width, onChange: onWidthChange },
          { label: "Înălțime (cm)", value: height, onChange: onHeightChange },
        ].map(({ label, value, onChange }) => (
          <div key={label} className="flex-1 space-y-1">
            <label className="text-xs" style={{ color: "#65636d" }}>{label}</label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="cm"
              className="w-full rounded-lg px-4 py-3 text-sm"
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
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sizeHints.map((hint) => (
          <div
            key={hint.label}
            className="text-xs rounded px-2 py-1.5"
            style={{ color: "#65636d", backgroundColor: "#f4f2f7" }}
          >
            {hint.label}
          </div>
        ))}
      </div>
    </div>
  );
}
