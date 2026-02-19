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
      <label className="block text-sm font-medium text-zinc-400">Zonă corp</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BodyPlacement)}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-yellow-500/60 appearance-none cursor-pointer"
        style={{ colorScheme: "dark" }}
      >
        <option value="" disabled>
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
