import Anthropic from "@anthropic-ai/sdk";
import type { AIAnalysis } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a tattoo analysis expert. Analyze the provided tattoo image(s) and return ONLY a valid JSON object with these attributes:

{
  "style": one of ["realism", "traditional", "neo-traditional", "geometric", "watercolor", "linework", "dotwork", "tribal", "japanese", "lettering", "blackwork", "trash-polka", "mixed"],
  "complexity": integer 1-10 (1=simple outline, 10=photorealistic portrait with full detail),
  "color_type": one of ["black_grey", "color", "mixed"],
  "estimated_colors": integer (number of distinct colors, 1 for black and grey),
  "detail_density": one of ["low", "medium", "high", "very_high"],
  "fill_percentage": integer 0-100 (how much of the area is filled vs negative space),
  "contains_text": boolean,
  "description": "brief 1-2 sentence description of what the tattoo depicts",
  "special_notes": "any factors that might affect pricing (fine lines, heavy shading, cover-up indicators, etc.)"
}

Return ONLY the JSON, no markdown, no explanation.`;

export async function analyzeTattooImages(base64DataUrls: string[]): Promise<AIAnalysis> {
  const imageContent = base64DataUrls.map((dataUrl) => {
    const [header, data] = dataUrl.split(",");
    const mediaType = (header.match(/data:(image\/\w+);/)?.[1] ?? "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif";

    return {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: mediaType,
        data,
      },
    };
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          { type: "text", text: "Analyze this tattoo and return the JSON." },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text) as AIAnalysis;
  } catch {
    throw new Error(`Failed to parse AI response: ${text}`);
  }
}
