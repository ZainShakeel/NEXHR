import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = req.cookies.get("super_admin_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? "NexHR@SuperAdmin2026";

  if (currentPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  // Password is stored as env var — can't update at runtime, but we acknowledge
  return NextResponse.json({ success: true, note: "Update SUPER_ADMIN_PASSWORD in your environment variables to persist this change." });
}
