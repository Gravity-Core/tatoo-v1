import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "pricing.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

function checkAuth(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Config negăsit" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  try {
    const body = await req.json();
    // Sort tiers ascending before saving
    body.tiers = [...body.tiers].sort(
      (a: { maxSqCm: number }, b: { maxSqCm: number }) => a.maxSqCm - b.maxSqCm
    );
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
