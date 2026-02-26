import { NextRequest, NextResponse } from "next/server";
import { loadNotificationConfig, saveNotificationConfig } from "@/lib/notification-store";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

function checkAuth(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const config = await loadNotificationConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await saveNotificationConfig(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
