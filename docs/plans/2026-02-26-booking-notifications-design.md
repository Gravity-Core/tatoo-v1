# Booking Popup + Notifications Design

**Date:** 2026-02-26
**Goal:** When a user receives an estimation and clicks "PROGRAMEAZĂ CONSULTAȚIA", a popup collects their name and phone number, then sends the full estimation details to the clinic via email and WhatsApp.

---

## Booking Flow

1. User completes estimation → results panel shown
2. User clicks "PROGRAMEAZĂ CONSULTAȚIA" → `BookingModal` opens
3. Modal collects: name (required), phone number (required)
4. On submit → POST `/api/book` with name, phone, estimation data, and booking token
5. Success: modal shows confirmation message ("Cerere trimisă! Vă vom contacta în curând.")
6. Error: inline error shown, modal stays open

---

## Security: Booking Token

`/api/analyze` includes a `bookingToken` in its response.

- HMAC-SHA256 of `estimatedPrice + issuedAt` using `BOOKING_TOKEN_SECRET` env var
- Encoded as base64 JSON: `{ hash, exp }` (exp = issuedAt + 30 minutes)
- `/api/book` verifies token before processing — no valid token → 400 rejected
- Combined with existing 5 req/min/IP rate limiter on `/api/analyze`, spam is effectively prevented

---

## Notifications

### Email — Resend
- Free tier: 3,000 emails/month
- From: configured sender (e.g. `noreply@clinic.ro`)
- To: `notification_config.recipientEmail` (stored in KV)
- Subject: `Cerere nouă de programare — [Name]`
- Body includes: name, phone, price range, style, size, placement, complexity, timestamp

### WhatsApp — Twilio
- Pay-per-message (~$0.005/msg)
- From: `TWILIO_WHATSAPP_FROM` env var (Twilio sandbox or approved number)
- To: `notification_config.whatsappNumber` (stored in KV)
- Short message with key booking + estimation details

### Graceful degradation
Both sends are independent. If one fails, the other still fires. Response indicates which succeeded.

---

## Configuration

### Env vars (set once by developer on Vercel)
| Var | Purpose |
|-----|---------|
| `RESEND_API_KEY` | Resend API key |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | Sender number, e.g. `whatsapp:+14155238886` |
| `BOOKING_TOKEN_SECRET` | Random string for HMAC signing |

### KV-stored (configurable by clinic via `/admin`)
| Key | Value |
|-----|-------|
| `notification_config` | `{ recipientEmail: string, whatsappNumber: string }` |

---

## Files

| File | Change |
|------|--------|
| `lib/booking-token.ts` | Sign + verify HMAC token |
| `lib/notify.ts` | Resend email + Twilio WhatsApp send functions |
| `lib/notification-store.ts` | Load/save notification config from Vercel KV |
| `lib/types.ts` | Add `BookingRequest`, `NotificationConfig`, extend `AnalyzeResponse` with `bookingToken` |
| `components/BookingModal.tsx` | Modal with name + phone form, confirmation state |
| `app/api/analyze/route.ts` | Add `bookingToken` to response |
| `app/api/book/route.ts` | Verify token, send notifications, return result |
| `app/api/admin/notifications/route.ts` | GET/POST notification config (password-protected) |
| `app/page.tsx` | CTA button opens modal instead of `href="#contact"` |
| `app/admin/page.tsx` | Add "Notificări" section with email + WhatsApp fields |
