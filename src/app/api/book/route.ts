import { NextRequest, NextResponse } from "next/server";
import { verifyBookingToken } from "@/lib/booking-token";
import { loadNotificationConfig } from "@/lib/notification-store";
import { sendEmail, sendWhatsApp } from "@/lib/notify";
import type { BookingRequest, BookingResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  let body: BookingRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const { bookingToken, images, name, phone, estimate, analysis, placement, widthCm, heightCm } = body;

  const sanitizedImages = (Array.isArray(images) ? images : [])
    .slice(0, 5)
    .filter((img): img is string => typeof img === "string" && img.startsWith("data:image/"));

  if (!name?.trim() || !phone?.trim() || !bookingToken) {
    return NextResponse.json({ error: "Lipsesc câmpuri obligatorii." }, { status: 400 });
  }

  // Verify booking token
  if (!verifyBookingToken(bookingToken, estimate.estimatedPrice)) {
    return NextResponse.json(
      { error: "Sesiune expirată. Vă rugăm să reîncepeti estimarea." },
      { status: 400 }
    );
  }

  const config = await loadNotificationConfig();
  const params = { name: name.trim(), phone: phone.trim(), estimate, analysis, placement, widthCm, heightCm, images: sanitizedImages };

  // Send both notifications independently
  const [emailSent, whatsappSent] = await Promise.all([
    config.recipientEmail ? sendEmail(config.recipientEmail, params) : Promise.resolve(false),
    config.whatsappNumber ? sendWhatsApp(config.whatsappNumber, params) : Promise.resolve(false),
  ]);

  const response: BookingResponse = {
    success: emailSent || whatsappSent,
    emailSent,
    whatsappSent,
  };

  return NextResponse.json(response);
}
