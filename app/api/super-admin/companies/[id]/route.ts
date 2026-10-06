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

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Delete in dependency order
    await prisma.$transaction(async (tx) => {
      await tx.leaveBalance.deleteMany({ where: { employee: { companyId: id } } });
      await tx.leaveRequest.deleteMany({ where: { employee: { companyId: id } } });
      await tx.attendance.deleteMany({ where: { companyId: id } });
      await tx.salarySlip.deleteMany({ where: { payrollRun: { companyId: id } } });
      await tx.payrollRun.deleteMany({ where: { companyId: id } });
      await tx.leaveType.deleteMany({ where: { companyId: id } });
      await tx.employee.deleteMany({ where: { companyId: id } });
      await tx.user.deleteMany({ where: { companyId: id } });
      await tx.department.deleteMany({ where: { companyId: id } });
      await tx.shift.deleteMany({ where: { companyId: id } });
      await tx.officeLocation.deleteMany({ where: { companyId: id } });
      await tx.company.delete({ where: { id } });
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
