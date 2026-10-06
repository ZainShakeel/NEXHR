import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: { select: { employees: true, users: true, departments: true } },
        users: {
          where: { role: "COMPANY_OWNER" },
          select: { email: true, createdAt: true },
          take: 1,
        },
        departments: { select: { id: true, name: true, _count: { select: { employees: true } } } },
      },
    });
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
