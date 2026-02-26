import { signBookingToken, verifyBookingToken } from "../booking-token";

const SECRET = "test-secret-key";
const PRICE = 750;

describe("booking-token", () => {
  it("verifies a freshly signed token", () => {
    const token = signBookingToken(PRICE, SECRET);
    expect(verifyBookingToken(token, PRICE, SECRET)).toBe(true);
  });

  it("rejects a token for a different price", () => {
    const token = signBookingToken(PRICE, SECRET);
    expect(verifyBookingToken(token, PRICE + 1, SECRET)).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    const token = signBookingToken(PRICE, SECRET);
    expect(verifyBookingToken(token, PRICE, "other-secret")).toBe(false);
  });

  it("rejects a tampered token", () => {
    const token = signBookingToken(PRICE, SECRET);
    const tampered = Buffer.from(token, "base64url").toString("utf8").replace(/.$/, "X");
    const retampered = Buffer.from(tampered).toString("base64url");
    expect(verifyBookingToken(retampered, PRICE, SECRET)).toBe(false);
  });

  it("rejects an expired token", () => {
    const past = Date.now() - 31 * 60 * 1000; // 31 minutes ago
    const payload = JSON.stringify({ price: PRICE, exp: past + 30 * 60 * 1000, iat: past });
    const { createHmac } = require("crypto");
    const hash = createHmac("sha256", SECRET).update(payload).digest("hex");
    const token = Buffer.from(JSON.stringify({ payload, hash })).toString("base64url");
    expect(verifyBookingToken(token, PRICE, SECRET)).toBe(false);
  });
});
