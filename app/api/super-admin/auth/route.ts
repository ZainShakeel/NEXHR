import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "superadmin@nexhr.com";
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? "NexHR@SuperAdmin2026";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("super_admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("super_admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
