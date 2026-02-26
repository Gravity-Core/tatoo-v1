// src/lib/notify.ts
import type { AIAnalysis, BodyPlacement, PriceEstimate } from "./types";

const placementLabelsRo: Record<string, string> = {
  forearm: "Antebraț", upper_arm: "Braț superior", inner_arm: "Braț interior",
  shoulder: "Umăr", wrist: "Încheietură", hand: "Mână", fingers: "Degete",
  chest: "Piept", sternum: "Stern", back_upper: "Spate superior",
  back_full: "Spate complet", ribs: "Coaste", hip: "Șold",
  thigh: "Coapsă", calf: "Gambă", ankle: "Gleznă", foot: "Picior",
  neck: "Gât", behind_ear: "După ureche", face: "Față", head: "Cap",
};

const styleLabelsRo: Record<string, string> = {
  realism: "Realism", traditional: "Tradițional", "neo-traditional": "Neo-tradițional",
  geometric: "Geometric", watercolor: "Acuarelă", linework: "Linii",
  dotwork: "Puncte", tribal: "Tribal", japanese: "Japonez",
  lettering: "Litere", blackwork: "Blackwork", "trash-polka": "Trash Polka", mixed: "Mixt",
};

interface NotifyParams {
  name: string;
  phone: string;
  estimate: PriceEstimate;
  analysis: AIAnalysis;
  placement: BodyPlacement;
  widthCm: number;
  heightCm: number;
}

export function buildEmailHtml(p: NotifyParams): string {
  const ts = new Date().toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" });
  return `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#211f26">
  <h2 style="color:#0090ff;margin-bottom:4px">Cerere nouă de programare</h2>
  <p style="color:#65636d;font-size:0.9rem;margin-top:0">${ts}</p>
  <hr style="border:none;border-top:1px solid #eae7ec;margin:16px 0"/>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:6px 0;color:#65636d;width:40%">Nume</td><td style="font-weight:600">${p.name}</td></tr>
    <tr><td style="padding:6px 0;color:#65636d">Telefon</td><td style="font-weight:600">${p.phone}</td></tr>
    <tr><td style="padding:6px 0;color:#65636d">Estimare</td><td style="font-weight:600;color:#0090ff">${p.estimate.minPrice.toLocaleString("ro-RO")} – ${p.estimate.maxPrice.toLocaleString("ro-RO")} ${p.estimate.currency}</td></tr>
    <tr><td style="padding:6px 0;color:#65636d">Categorie</td><td>${p.estimate.sizeTier}</td></tr>
    <tr><td style="padding:6px 0;color:#65636d">Dimensiune</td><td>${p.widthCm} × ${p.heightCm} cm</td></tr>
    <tr><td style="padding:6px 0;color:#65636d">Zonă corp</td><td>${placementLabelsRo[p.placement] ?? p.placement}</td></tr>
    <tr><td style="padding:6px 0;color:#65636d">Stil</td><td>${styleLabelsRo[p.analysis.style] ?? p.analysis.style}</td></tr>
    <tr><td style="padding:6px 0;color:#65636d">Complexitate</td><td>${p.analysis.complexity}/10</td></tr>
    <tr><td style="padding:6px 0;color:#65636d">Culori</td><td>${p.analysis.color_type === "black_grey" ? "Negru & Gri" : p.analysis.color_type === "color" ? "Color" : "Mixt"}</td></tr>
  </table>
</div>`;
}

export function buildWhatsAppMessage(p: NotifyParams): string {
  return [
    `*Rezervare nouă - Estimator Tatuaj*`,
    ``,
    `*Nume:* ${p.name}`,
    `*Telefon:* ${p.phone}`,
    ``,
    `*Estimare:* ${p.estimate.minPrice.toLocaleString("ro-RO")} – ${p.estimate.maxPrice.toLocaleString("ro-RO")} ${p.estimate.currency}`,
    `*Dimensiune:* ${p.widthCm} × ${p.heightCm} cm (${p.estimate.sizeTier})`,
    `*Zonă:* ${placementLabelsRo[p.placement] ?? p.placement}`,
    `*Stil:* ${styleLabelsRo[p.analysis.style] ?? p.analysis.style}`,
    `*Complexitate:* ${p.analysis.complexity}/10`,
  ].join("\n");
}

export async function sendEmail(
  to: string,
  params: NotifyParams
): Promise<boolean> {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@resend.dev",
      to,
      subject: `Cerere nouă de programare — ${params.name}`,
      html: buildEmailHtml(params),
    });
    if (error) { console.error("Resend error:", error); return false; }
    return true;
  } catch (err) {
    console.error("sendEmail failed:", err);
    return false;
  }
}

export async function sendWhatsApp(
  to: string,
  params: NotifyParams
): Promise<boolean> {
  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886",
      to: `whatsapp:${to}`,
      body: buildWhatsAppMessage(params),
    });
    return true;
  } catch (err) {
    console.error("sendWhatsApp failed:", err);
    return false;
  }
}
