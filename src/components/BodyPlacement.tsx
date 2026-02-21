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
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: "#211f26" }}>
        Zonă corp
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BodyPlacement)}
        className="w-full rounded-lg px-4 py-3 text-sm appearance-none cursor-pointer"
        style={{
          backgroundColor: "#fdfcfd",
          border: "1px solid #eae7ec",
          color: "#211f26",
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
      >
        <option value="" disabled style={{ color: "#65636d" }}>
          Selectează zona corpului...
        </option>
        {placementGroups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
