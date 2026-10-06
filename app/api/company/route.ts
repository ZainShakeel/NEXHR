import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(company);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { companyId, name, email, phone, address, website, timezone, currency } = body;
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });
  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      website: website || undefined,
      timezone: timezone || undefined,
      currency: currency || undefined,
    },
  });
  return NextResponse.json(updated);
}
