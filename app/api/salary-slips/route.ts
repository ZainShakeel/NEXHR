import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const companyId  = req.nextUrl.searchParams.get("companyId");
    const employeeId = req.nextUrl.searchParams.get("employeeId");

    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const where: any = { employee: { companyId } };
    if (employeeId) where.employeeId = employeeId;

    const slips = await prisma.salarySlip.findMany({
      where,
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeId: true, designation: true, department: { select: { name: true } } },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(slips);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
