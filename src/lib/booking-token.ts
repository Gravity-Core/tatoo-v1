import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 30 * 60 * 1000; // 30 minutes

function resolveSecret(provided?: string): string {
  const s = provided ?? process.env.BOOKING_TOKEN_SECRET;
  if (!s) throw new Error("BOOKING_TOKEN_SECRET is not set");
  return s;
}

export function signBookingToken(
  estimatedPrice: number,
  secret?: string
): string {
  const s = resolveSecret(secret);
  const exp = Date.now() + TTL_MS;
  const payload = JSON.stringify({ price: estimatedPrice, exp });
  const hash = createHmac("sha256", s).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, hash })).toString("base64url");
}

export function verifyBookingToken(
  token: string,
  estimatedPrice: number,
  secret?: string
): boolean {
  try {
    const s = resolveSecret(secret);
    const { payload, hash } = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));

    // Verify HMAC FIRST — before trusting any payload data
    const expected = createHmac("sha256", s).update(payload).digest("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;

    // Only trust payload data after signature is confirmed
    const { price, exp } = JSON.parse(payload);
    if (Date.now() > exp) return false;
    if (price !== estimatedPrice) return false;

    return true;
  } catch {
    return false;
  }
}
