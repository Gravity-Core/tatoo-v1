// lib/types.ts

export type TattooStyle =
  | "realism"
  | "traditional"
  | "neo-traditional"
  | "geometric"
  | "watercolor"
  | "linework"
  | "dotwork"
  | "tribal"
  | "japanese"
  | "lettering"
  | "blackwork"
  | "trash-polka"
  | "mixed";

export type ColorType = "black_grey" | "color" | "mixed";
export type DetailDensity = "low" | "medium" | "high" | "very_high";

export interface AIAnalysis {
  style: TattooStyle;
  complexity: number; // 1–10
  color_type: ColorType;
  estimated_colors: number;
  detail_density: DetailDensity;
  fill_percentage: number; // 0–100
  contains_text: boolean;
  description: string;
  special_notes: string;
}

export type BodyPlacement =
  | "forearm"
  | "upper_arm"
  | "shoulder"
  | "back_upper"
  | "back_full"
  | "chest"
  | "ribs"
  | "neck"
  | "hand"
  | "fingers"
  | "foot"
  | "ankle"
  | "thigh"
  | "calf"
  | "hip"
  | "face"
  | "head"
  | "inner_arm"
  | "behind_ear"
  | "wrist"
  | "sternum";

export interface PriceEstimate {
  minPrice: number;
  maxPrice: number;
  estimatedPrice: number;
  estimatedHours: number;
  sizeTier: string;
  currency: string;
}

export interface AnalyzeRequest {
  images: string[]; // base64 data URLs
  placement: BodyPlacement;
  widthCm: number;
  heightCm: number;
  notes?: string;
}

export interface AnalyzeResponse {
  analysis: AIAnalysis;
  estimate: PriceEstimate;
  bookingToken: string;
}

export interface NotificationConfig {
  recipientEmail: string;
  whatsappNumber: string; // e.g. "+40721123456"
}

export interface BookingRequest {
  bookingToken: string;
  name: string;
  phone: string;
  estimate: PriceEstimate;
  analysis: AIAnalysis;
  placement: BodyPlacement;
  widthCm: number;
  heightCm: number;
}

export interface BookingResponse {
  success: boolean;
  emailSent: boolean;
  whatsappSent: boolean;
}
