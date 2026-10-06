import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get("companyId");
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const departments = await prisma.department.findMany({
      where: { companyId },
      include: { _count: { select: { employees: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(departments);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, name, description } = await req.json();
    const dept = await prisma.department.create({ data: { companyId, name, description } });
    return NextResponse.json(dept, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
