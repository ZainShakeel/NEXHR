import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });
  const types = await prisma.leaveType.findMany({ where: { companyId }, orderBy: { name: "asc" } });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { companyId, name, daysAllowed, color, description } = body;
  if (!companyId || !name) return NextResponse.json({ error: "companyId and name required" }, { status: 400 });
  const type = await prisma.leaveType.create({
    data: { companyId, name, daysAllowed: parseInt(daysAllowed) || 0, color: color || "#16A34A" },
  });
  return NextResponse.json(type, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.leaveType.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
