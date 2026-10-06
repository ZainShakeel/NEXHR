import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Super admin not configured." }, { status: 500 });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("super_admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("super_admin_session");
  return NextResponse.json({ success: true });
}
