import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 30 * 60 * 1000; // 30 minutes

export function signBookingToken(
  estimatedPrice: number,
  secret: string = process.env.BOOKING_TOKEN_SECRET ?? ""
): string {
  const iat = Date.now();
  const exp = iat + TTL_MS;
  const payload = JSON.stringify({ price: estimatedPrice, iat, exp });
  const hash = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, hash })).toString("base64url");
}

export function verifyBookingToken(
  token: string,
  estimatedPrice: number,
  secret: string = process.env.BOOKING_TOKEN_SECRET ?? ""
): boolean {
  try {
    const { payload, hash } = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    const { price, exp } = JSON.parse(payload);

    // Check expiry
    if (Date.now() > exp) return false;

    // Check price matches
    if (price !== estimatedPrice) return false;

    // Verify HMAC (timing-safe)
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
