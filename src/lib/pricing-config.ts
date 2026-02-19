import type { TattooStyle, ColorType, BodyPlacement } from "./types";

export const pricingConfig = {
  currency: "RON",
  baseRatePerHour: 300,
  minimumPrice: 200,

  sizeTiers: [
    { name: "Foarte mic",  maxCm: 5,        baseHours: 0.75 },
    { name: "Mic",         maxCm: 10,       baseHours: 1.5  },
    { name: "Mediu",       maxCm: 20,       baseHours: 3    },
    { name: "Mare",        maxCm: 35,       baseHours: 5    },
    { name: "Foarte mare", maxCm: 50,       baseHours: 8    },
    { name: "Extra mare",  maxCm: Infinity, baseHours: 12   },
  ],

  complexityMultiplier: (complexity: number) => 0.6 + complexity * 0.08,

  styleMultipliers: {
    realism:           1.4,
    japanese:          1.2,
    "neo-traditional": 1.1,
    watercolor:        1.15,
    "trash-polka":     1.2,
    geometric:         1.1,
    dotwork:           1.25,
    traditional:       1.0,
    linework:          0.9,
    tribal:            0.95,
    lettering:         0.85,
    blackwork:         1.05,
    mixed:             1.1,
  } as Record<TattooStyle, number>,

  colorMultiplier: {
    black_grey: 1.0,
    color:      1.2,
    mixed:      1.15,
  } as Record<ColorType, number>,

  placementMultipliers: {
    forearm:    1.0,  upper_arm:  1.0,  shoulder:   1.0,
    back_upper: 1.0,  back_full:  1.05, chest:      1.1,
    ribs:       1.25, neck:       1.3,  hand:       1.3,
    fingers:    1.35, foot:       1.2,  ankle:      1.1,
    thigh:      1.0,  calf:       1.05, hip:        1.15,
    face:       1.5,  head:       1.4,  inner_arm:  1.1,
    behind_ear: 1.2,  wrist:      1.1,  sternum:    1.2,
  } as Record<BodyPlacement, number>,

  rangePercentage: 15,
} as const;
