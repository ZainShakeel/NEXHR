import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const employeeId = searchParams.get("employeeId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const where: Record<string, string> = {};
  if (employeeId) {
    where.employeeId = employeeId;
  } else {
    return NextResponse.json({ error: "employeeId required" }, { status: 400 });
  }

  const balances = await prisma.leaveBalance.findMany({
    where,
    include: { leaveType: true },
    orderBy: { leaveType: { name: "asc" } },
  });

  return NextResponse.json(balances);
}
