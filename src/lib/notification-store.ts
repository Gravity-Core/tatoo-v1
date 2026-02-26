// src/lib/notification-store.ts
import type { NotificationConfig } from "./types";

const KV_KEY = "notification_config";

const defaultConfig: NotificationConfig = {
  recipientEmail: "",
  whatsappNumber: "",
};

function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function loadNotificationConfig(): Promise<NotificationConfig> {
  if (!isKvConfigured()) return defaultConfig;
  try {
    const { kv } = await import("@vercel/kv");
    const stored = await kv.get<NotificationConfig>(KV_KEY);
    return stored ?? defaultConfig;
  } catch {
    return defaultConfig;
  }
}

export async function saveNotificationConfig(config: NotificationConfig): Promise<void> {
  if (!isKvConfigured()) {
    throw new Error(
      "Vercel KV nu este configurat. Adaugă KV_REST_API_URL și KV_REST_API_TOKEN în variabilele de mediu."
    );
  }
  const { kv } = await import("@vercel/kv");
  await kv.set(KV_KEY, config);
}
