"use client";
import { useState, useEffect } from "react";

interface PricingTier {
  maxSqCm: number;
  label: string;
  basePrice: number;
}

interface PricingConfig {
  currency: string;
  tiers: PricingTier[];
  overflowPricePerSqCm: number;
  colorMultiplier: number;
  complexityMultiplier: number;
}

interface NotificationConfig {
  recipientEmail: string;
  whatsappNumber: string;
}

const inputStyle: React.CSSProperties = {
  height: 40,
  borderRadius: 8,
  border: "1.5px solid #eae7ec",
  backgroundColor: "#fdfcfd",
  color: "#211f26",
  fontSize: "0.9rem",
  padding: "0 10px",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [authError, setAuthError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>({ recipientEmail: "", whatsappNumber: "" });
  const [notifSaveStatus, setNotifSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      fetchConfig(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchConfig(pw: string) {
    setAuthError("");
    const res = await fetch("/api/admin/pricing", {
      headers: { "x-admin-password": pw },
    });
    if (res.status === 401) {
      setAuthError("Parolă incorectă");
      sessionStorage.removeItem("admin_pw");
      return;
    }
    const data = await res.json();
    setConfig(data);
    setAuthed(true);
    sessionStorage.setItem("admin_pw", pw);
    const notifRes = await fetch("/api/admin/notifications", {
      headers: { "x-admin-password": pw },
    });
    if (notifRes.ok) {
      const notifData = await notifRes.json();
      setNotifConfig(notifData);
    }
  }

  async function handleSave() {
    if (!config) return;
    setSaveStatus("saving");
    const sorted = {
      ...config,
      tiers: [...config.tiers].sort((a, b) => a.maxSqCm - b.maxSqCm),
    };
    const res = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(sorted),
    });
    if (res.ok) {
      setConfig(sorted);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  async function handleNotifSave() {
    setNotifSaveStatus("saving");
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(notifConfig),
    });
    if (res.ok) {
      setNotifSaveStatus("saved");
      setTimeout(() => setNotifSaveStatus("idle"), 2500);
    } else {
      setNotifSaveStatus("error");
      setTimeout(() => setNotifSaveStatus("idle"), 3000);
    }
  }

  function updateTier(idx: number, key: keyof PricingTier, raw: string) {
    if (!config) return;
    const tiers = config.tiers.map((t, i) =>
      i === idx ? { ...t, [key]: key === "label" ? raw : parseFloat(raw) || 0 } : t
    );
    setConfig({ ...config, tiers });
  }

  function addTier() {
    if (!config) return;
    const last = config.tiers[config.tiers.length - 1];
    const newTier: PricingTier = { maxSqCm: (last?.maxSqCm ?? 0) + 10, label: "Nou", basePrice: 0 };
    setConfig({ ...config, tiers: [...config.tiers, newTier] });
  }

  function removeTier(idx: number) {
    if (!config || config.tiers.length <= 1) return;
    setConfig({ ...config, tiers: config.tiers.filter((_, i) => i !== idx) });
  }

  // ─── Login screen ─────────────────────────────────────────────────
  if (!authed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#fdfcfd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div
            style={{
              backgroundColor: "#fff",
              border: "1.5px solid #eae7ec",
              borderRadius: 20,
              padding: "32px 28px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h1 style={{ color: "#113264", fontSize: "1.3rem", fontWeight: 700, marginBottom: 4 }}>
              Configurare Prețuri
            </h1>
            <p style={{ color: "#65636d", fontSize: "0.875rem", marginBottom: 24 }}>
              Autentificare necesară
            </p>

            <label style={{ display: "block", color: "#211f26", fontSize: "0.875rem", fontWeight: 500, marginBottom: 6 }}>
              Parolă
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchConfig(password)}
              placeholder="••••••••"
              style={{ ...inputStyle, marginBottom: 12 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
            />
            {authError && (
              <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: 12 }}>{authError}</p>
            )}
            <button
              onClick={() => fetchConfig(password)}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 12,
                backgroundColor: "#0090ff",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.95rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Autentifică-te
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!config) return null;

  const lastTier = [...config.tiers].sort((a, b) => a.maxSqCm - b.maxSqCm).at(-1);
  const exampleArea = (lastTier?.maxSqCm ?? 0) + 5;
  const examplePrice = (lastTier?.basePrice ?? 0) + ((lastTier?.maxSqCm ?? 0) > 0 ? exampleArea - (lastTier?.maxSqCm ?? 0) : exampleArea) * config.overflowPricePerSqCm;

  const btnBg = saveStatus === "saved" ? "#16a34a" : saveStatus === "error" ? "#dc2626" : "#0090ff";
  const btnLabel = saveStatus === "saving" ? "Salvez..." : saveStatus === "saved" ? "✓ Salvat" : saveStatus === "error" ? "Eroare" : "Salvează";

  // ─── Config editor ─────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#fdfcfd" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #eae7ec" }}>
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={{ color: "#113264", fontSize: "1.1rem", fontWeight: 700 }}>Configurare Prețuri</h1>
            <p style={{ color: "#a09fa6", fontSize: "0.78rem" }}>Estimator tatuaj · Admin</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            style={{
              height: 40,
              padding: "0 20px",
              borderRadius: 10,
              backgroundColor: btnBg,
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {btnLabel}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 20px 60px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Currency */}
        <Card title="Monedă">
          <Field label="Cod monedă (ISO 4217)">
            <input
              value={config.currency}
              onChange={(e) => setConfig({ ...config, currency: e.target.value.toUpperCase() })}
              maxLength={3}
              style={{ ...inputStyle, width: 80, textTransform: "uppercase", fontWeight: 700, textAlign: "center" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
            />
          </Field>
        </Card>

        {/* Price tiers */}
        <Card
          title="Reguli de preț"
          subtitle="Prețul se calculează pe baza suprafeței tatuajului (lățime × înălțime, în cm²)"
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
              <thead>
                <tr>
                  {["Etichetă", `Max suprafață (cm²)`, `Preț de bază (${config.currency})`, ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        color: "#a09fa6",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        paddingBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        paddingRight: 10,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.tiers.map((tier, idx) => (
                  <tr key={idx}>
                    <td style={{ paddingBottom: 10, paddingRight: 10 }}>
                      <input
                        value={tier.label}
                        onChange={(e) => updateTier(idx, "label", e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
                      />
                    </td>
                    <td style={{ paddingBottom: 10, paddingRight: 10 }}>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={tier.maxSqCm}
                        onChange={(e) => updateTier(idx, "maxSqCm", e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
                      />
                    </td>
                    <td style={{ paddingBottom: 10, paddingRight: 10 }}>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={tier.basePrice}
                        onChange={(e) => updateTier(idx, "basePrice", e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
                      />
                    </td>
                    <td style={{ paddingBottom: 10 }}>
                      <button
                        onClick={() => removeTier(idx)}
                        disabled={config.tiers.length <= 1}
                        title="Șterge"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: "1.5px solid #eae7ec",
                          backgroundColor: "#fff",
                          color: "#a09fa6",
                          cursor: config.tiers.length > 1 ? "pointer" : "not-allowed",
                          fontSize: "1.1rem",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addTier}
            style={{
              marginTop: 4,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1.5px dashed #c8c6ce",
              backgroundColor: "transparent",
              color: "#65636d",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            + Adaugă regulă
          </button>
        </Card>

        {/* Overflow pricing */}
        <Card
          title="Suprafețe mari"
          subtitle={`Tatuaje mai mari de ${lastTier?.maxSqCm ?? "?"} cm² — preț per cm² suplimentar`}
        >
          <Field
            label={`${config.currency} per cm² (față de ${lastTier?.maxSqCm ?? "?"} cm²)`}
            hint={`ex. la ${exampleArea} cm²: ${lastTier?.basePrice ?? 0} + (${exampleArea} − ${lastTier?.maxSqCm ?? 0}) × ${config.overflowPricePerSqCm} = ${examplePrice} ${config.currency}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                min="0"
                step="1"
                value={config.overflowPricePerSqCm}
                onChange={(e) => setConfig({ ...config, overflowPricePerSqCm: parseFloat(e.target.value) || 0 })}
                style={{ ...inputStyle, width: 100 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
              />
              <span style={{ color: "#65636d", fontSize: "0.875rem" }}>{config.currency}/cm²</span>
            </div>
          </Field>
        </Card>

        {/* Multipliers */}
        <Card title="Multiplicatori">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Field
              label="Multiplicator culoare"
              hint={`ex. 1.25 = tatuajele color costă cu 25% mai mult față de negru & gri`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  min="1"
                  max="3"
                  step="0.05"
                  value={config.colorMultiplier}
                  onChange={(e) => setConfig({ ...config, colorMultiplier: parseFloat(e.target.value) || 1 })}
                  style={{ ...inputStyle, width: 100 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
                />
                <span style={{ color: "#65636d", fontSize: "0.875rem" }}>
                  × preț de bază
                </span>
              </div>
            </Field>

            <Field
              label="Factor complexitate"
              hint={`ex. 0.08 = fiecare punct de complexitate față de 5/10 modifică prețul cu 8% (complexitate 8 → +24%)`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={config.complexityMultiplier}
                  onChange={(e) => setConfig({ ...config, complexityMultiplier: parseFloat(e.target.value) || 0 })}
                  style={{ ...inputStyle, width: 100 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
                />
                <span style={{ color: "#65636d", fontSize: "0.875rem" }}>per punct</span>
              </div>
            </Field>
          </div>
        </Card>

        <Card
          title="Notificări"
          subtitle="Date de contact pentru trimiterea rezervărilor primite"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Field label="Email destinatar" hint="Adresa la care vor fi trimise cererile de programare">
              <input
                type="email"
                value={notifConfig.recipientEmail}
                onChange={(e) => setNotifConfig({ ...notifConfig, recipientEmail: e.target.value })}
                placeholder="ex. contact@studio.ro"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
              />
            </Field>
            <Field label="Număr WhatsApp" hint="Include prefixul internațional, ex. +40721123456">
              <input
                type="tel"
                value={notifConfig.whatsappNumber}
                onChange={(e) => setNotifConfig({ ...notifConfig, whatsappNumber: e.target.value })}
                placeholder="+40721123456"
                style={{ ...inputStyle, width: 200 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0090ff")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#eae7ec")}
              />
            </Field>
            <button
              onClick={handleNotifSave}
              disabled={notifSaveStatus === "saving"}
              style={{
                alignSelf: "flex-start",
                height: 40, padding: "0 20px", borderRadius: 10,
                backgroundColor:
                  notifSaveStatus === "saved" ? "#16a34a" :
                  notifSaveStatus === "error" ? "#dc2626" : "#0090ff",
                color: "#fff", fontWeight: 600, fontSize: "0.875rem",
                border: "none", cursor: "pointer", transition: "background-color 0.2s",
              }}
            >
              {notifSaveStatus === "saving" ? "Salvez..." :
               notifSaveStatus === "saved" ? "✓ Salvat" :
               notifSaveStatus === "error" ? "Eroare" : "Salvează notificări"}
            </button>
          </div>
        </Card>

        {/* Bottom save */}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          style={{
            height: 52,
            borderRadius: 14,
            backgroundColor: btnBg,
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {btnLabel}
        </button>

      </div>
    </main>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1.5px solid #eae7ec",
        borderRadius: 16,
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <p style={{ color: "#113264", fontSize: "0.95rem", fontWeight: 700, marginBottom: subtitle ? 3 : 16 }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ color: "#a09fa6", fontSize: "0.78rem", marginBottom: 16 }}>{subtitle}</p>
      )}
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", color: "#211f26", fontSize: "0.875rem", fontWeight: 500, marginBottom: 7 }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ color: "#a09fa6", fontSize: "0.75rem", marginTop: 6, lineHeight: 1.5 }}>{hint}</p>
      )}
    </div>
  );
}
