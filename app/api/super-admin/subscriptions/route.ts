import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("super_admin_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subs = await prisma.subscription.findMany({
    include: { company: { select: { id: true, name: true, domain: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(subs);
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("super_admin_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { companyId, plan, amount, startDate, endDate, notes } = await req.json();
    if (!companyId || !plan || !amount || !startDate || !endDate)
      return NextResponse.json({ error: "All fields required" }, { status: 400 });

    const PLAN_LIMITS: Record<string, number> = {
      FREE: 5, STARTER: 25, BUSINESS: 100, ENTERPRISE: 99999,
    };

    const [sub] = await prisma.$transaction([
      prisma.subscription.create({
        data: {
          companyId, plan, amount: parseFloat(amount),
          startDate: new Date(startDate), endDate: new Date(endDate),
          notes: notes || null, status: "ACTIVE",
        },
      }),
      prisma.company.update({
        where: { id: companyId },
        data: {
          plan, planExpiresAt: new Date(endDate), isActive: true,
          maxEmployees: PLAN_LIMITS[plan] ?? 5,
        },
      }),
    ]);
    return NextResponse.json(sub, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = req.cookies.get("super_admin_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, status } = await req.json();
    const sub = await prisma.subscription.update({ where: { id }, data: { status } });
    return NextResponse.json(sub);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
