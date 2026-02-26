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
    const realNow = Date.now();
    // Sign a token 31 minutes in the future from the past perspective
    jest.spyOn(Date, "now").mockReturnValue(realNow - 31 * 60 * 1000);
    const token = signBookingToken(PRICE, SECRET);
    jest.spyOn(Date, "now").mockReturnValue(realNow); // restore
    expect(verifyBookingToken(token, PRICE, SECRET)).toBe(false);
  });

  it("throws when secret is missing", () => {
    const originalEnv = process.env.BOOKING_TOKEN_SECRET;
    delete process.env.BOOKING_TOKEN_SECRET;
    expect(() => signBookingToken(PRICE)).toThrow("BOOKING_TOKEN_SECRET is not set");
    process.env.BOOKING_TOKEN_SECRET = originalEnv;
  });
});
