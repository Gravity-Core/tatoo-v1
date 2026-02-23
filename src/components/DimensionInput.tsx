"use client";

interface Props {
  width: string;
  height: string;
  onWidthChange: (v: string) => void;
  onHeightChange: (v: string) => void;
}

const sizeHints = [
  "5cm ≈ card",
  "10cm ≈ palmă",
  "20cm ≈ A5",
  "35cm ≈ A4",
];

export default function DimensionInput({ width, height, onWidthChange, onHeightChange }: Props) {
  return (
    <div className="space-y-3">
      <label className="block font-medium" style={{ color: "#211f26", fontSize: "0.95rem" }}>
        Dimensiuni dorite
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Lățime", unit: "cm", value: width, onChange: onWidthChange },
          { label: "Înălțime", unit: "cm", value: height, onChange: onHeightChange },
        ].map(({ label, unit, value, onChange }) => (
          <div key={label}>
            <label
              className="block mb-1.5"
              style={{ color: "#65636d", fontSize: "0.8rem", fontWeight: 500 }}
            >
              {label}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0"
                className="w-full"
                style={{
                  height: 54,
                  borderRadius: 12,
                  border: `1.5px solid ${value ? "#0090ff" : "#eae7ec"}`,
                  backgroundColor: "#fdfcfd",
                  color: "#211f26",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  padding: "0 40px 0 16px",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                onBlur={(e) => (e.currentTarget.style.borderColor = value ? "#0090ff" : "#eae7ec")}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 font-medium"
                style={{ color: "#a09fa6", fontSize: "0.85rem", pointerEvents: "none" }}
              >
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Size reference chips */}
      {/* <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sizeHints.map((hint) => (
          <span
            key={hint}
            style={{
              fontSize: "0.75rem",
              color: "#65636d",
              backgroundColor: "#f4f2f7",
              borderRadius: 20,
              padding: "4px 10px",
            }}
          >
            {hint}
          </span>
        ))}
      </div> */}
    </div>
  );
}
