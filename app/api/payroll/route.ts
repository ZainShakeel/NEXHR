import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get("companyId");
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const runs = await prisma.payrollRun.findMany({
      where: { companyId },
      include: {
        salarySlips: {
          include: { employee: { select: { firstName: true, lastName: true, employeeId: true, designation: true, department: { select: { name: true } } } } },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(runs);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, month, year } = await req.json();

    const employees = await prisma.employee.findMany({
      where: { companyId, status: "ACTIVE" },
    });

    if (employees.length === 0) {
      return NextResponse.json({ error: "No active employees" }, { status: 400 });
    }

    const totalAmount = employees.reduce((sum, e) => sum + Number(e.basicSalary) * 1.25, 0);

    const run = await prisma.payrollRun.create({
      data: {
        companyId,
        month,
        year,
        totalAmount,
        employeeCount: employees.length,
        status: "DRAFT",
        salarySlips: {
          create: employees.map((emp) => {
            const basic      = Number(emp.basicSalary);
            const allowances = basic * 0.25;
            const gross      = basic + allowances;
            const eobi       = 468;
            const net        = gross - eobi;
            return {
              employeeId:     emp.id,
              month,
              year,
              basicSalary:    basic,
              allowances,
              grossSalary:    gross,
              taxDeduction:   0,
              otherDeductions: eobi,
              netSalary:      net,
              workingDays:    26,
              presentDays:    24,
              leaveDays:      2,
            };
          }),
        },
      },
    });

    return NextResponse.json(run, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Payroll already exists for this month" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    const run = await prisma.payrollRun.update({
      where: { id },
      data: { status, processedAt: status === "PROCESSED" ? new Date() : undefined },
    });
    return NextResponse.json(run);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
