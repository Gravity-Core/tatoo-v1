"use client";
import type { BodyPlacement } from "@/lib/types";

interface Props {
  value: BodyPlacement | "";
  onChange: (v: BodyPlacement) => void;
}

const placementGroups: {
  label: string;
  options: { value: BodyPlacement; label: string }[];
}[] = [
  {
    label: "Braț",
    options: [
      { value: "forearm", label: "Antebraț" },
      { value: "upper_arm", label: "Braț superior" },
      { value: "inner_arm", label: "Braț interior" },
      { value: "shoulder", label: "Umăr" },
      { value: "wrist", label: "Încheietură" },
      { value: "hand", label: "Mână" },
      { value: "fingers", label: "Degete" },
    ],
  },
  {
    label: "Trunchi",
    options: [
      { value: "chest", label: "Piept" },
      { value: "sternum", label: "Stern" },
      { value: "back_upper", label: "Spate superior" },
      { value: "back_full", label: "Spate complet" },
      { value: "ribs", label: "Coaste" },
      { value: "hip", label: "Șold" },
    ],
  },
  {
    label: "Picior",
    options: [
      { value: "thigh", label: "Coapsă" },
      { value: "calf", label: "Gambă" },
      { value: "ankle", label: "Gleznă" },
      { value: "foot", label: "Picior (labă)" },
    ],
  },
  {
    label: "Cap & Gât",
    options: [
      { value: "neck", label: "Gât" },
      { value: "behind_ear", label: "După ureche" },
      { value: "face", label: "Față" },
      { value: "head", label: "Cap" },
    ],
  },
];

export const placementLabels: Record<BodyPlacement, string> = Object.fromEntries(
  placementGroups.flatMap((g) => g.options.map((o) => [o.value, o.label]))
) as Record<BodyPlacement, string>;

export default function BodyPlacementSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="block font-medium" style={{ color: "#211f26", fontSize: "0.95rem" }}>
        Zonă corp
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as BodyPlacement)}
          className="w-full appearance-none cursor-pointer"
          style={{
            height: 54,
            borderRadius: 12,
            border: `1.5px solid ${value ? "#0090ff" : "#eae7ec"}`,
            backgroundColor: "#fdfcfd",
            color: value ? "#211f26" : "#a09fa6",
            fontSize: "1rem",
            padding: "0 44px 0 16px",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
          onBlur={(e) => (e.currentTarget.style.borderColor = value ? "#0090ff" : "#eae7ec")}
        >
          <option value="" disabled>Selectează zona corpului...</option>
          {placementGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ color: "#211f26" }}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {/* Custom arrow */}
        <div
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={value ? "#0090ff" : "#a09fa6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
