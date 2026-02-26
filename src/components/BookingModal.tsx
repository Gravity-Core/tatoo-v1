"use client";
import { useState } from "react";
import type { AnalyzeResponse, BodyPlacement, BookingRequest } from "@/lib/types";

interface Props {
  result: AnalyzeResponse;
  placement: BodyPlacement;
  widthCm: number;
  heightCm: number;
  images?: string[];
  onClose: () => void;
}

export default function BookingModal({ result, placement, widthCm, heightCm, images, onClose }: Props) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]     = useState("");

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 6 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const payload: BookingRequest = {
        bookingToken: result.bookingToken,
        images,
        name: name.trim(),
        phone: phone.trim(),
        estimate: result.estimate,
        analysis: result.analysis,
        placement,
        widthCm,
        heightCm,
      };
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare necunoscută");
      setSubmitted(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: "28px 24px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 32, height: 32, borderRadius: "50%",
            border: "1.5px solid #eae7ec",
            backgroundColor: "transparent",
            cursor: "pointer", color: "#a09fa6", fontSize: "1.1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ×
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✓</div>
            <h3 style={{ color: "#113264", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
              Cerere trimisă!
            </h3>
            <p style={{ color: "#65636d", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 20 }}>
              Vă vom contacta în curând la numărul {phone}.
            </p>
            <button
              onClick={onClose}
              style={{
                width: "100%", height: 46, borderRadius: 12,
                backgroundColor: "#0090ff", color: "#fff",
                border: "none", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer",
              }}
            >
              Închide
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ color: "#113264", fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>
              Programează o consultație
            </h3>
            <p style={{ color: "#65636d", fontSize: "0.85rem", marginBottom: 20, lineHeight: 1.5 }}>
              Lasă-ne datele tale și te contactăm noi.
            </p>

            <div style={{
              backgroundColor: "#f0f8ff", borderRadius: 10,
              padding: "10px 14px", marginBottom: 20,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#65636d", fontSize: "0.8rem" }}>Estimare</span>
              <span style={{ color: "#0090ff", fontWeight: 700 }}>
                {result.estimate.minPrice.toLocaleString("ro-RO")} – {result.estimate.maxPrice.toLocaleString("ro-RO")} {result.estimate.currency}
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#211f26", fontWeight: 500, marginBottom: 6 }}>
                Nume și prenume
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. Ion Popescu"
                autoFocus
                style={{
                  width: "100%", height: 44, borderRadius: 10,
                  border: `1.5px solid ${name ? "#0090ff" : "#eae7ec"}`,
                  backgroundColor: "#fdfcfd", color: "#211f26",
                  fontSize: "0.95rem", padding: "0 12px",
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                onBlur={(e) => (e.currentTarget.style.borderColor = name ? "#0090ff" : "#eae7ec")}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#211f26", fontWeight: 500, marginBottom: 6 }}>
                Număr de telefon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ex. 0721 123 456"
                style={{
                  width: "100%", height: 44, borderRadius: 10,
                  border: `1.5px solid ${phone ? "#0090ff" : "#eae7ec"}`,
                  backgroundColor: "#fdfcfd", color: "#211f26",
                  fontSize: "0.95rem", padding: "0 12px",
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                onBlur={(e) => (e.currentTarget.style.borderColor = phone ? "#0090ff" : "#eae7ec")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: "#fff0f0", border: "1px solid #fca5a5",
                borderRadius: 8, padding: "10px 12px",
                color: "#dc2626", fontSize: "0.85rem", marginBottom: 14,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: "100%", height: 48, borderRadius: 12, border: "none",
                backgroundColor: canSubmit ? "#0090ff" : "#eae7ec",
                color: canSubmit ? "#fff" : "#a09fa6",
                fontWeight: 600, fontSize: "0.95rem",
                cursor: canSubmit ? "pointer" : "not-allowed",
                transition: "background-color 0.15s",
              }}
            >
              {submitting ? "Se trimite..." : "Trimite cererea"}
            </button>

            <p style={{ color: "#c8c6ce", fontSize: "0.72rem", textAlign: "center", marginTop: 10 }}>
              Datele tale sunt folosite exclusiv pentru programare.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
