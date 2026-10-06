import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(_req.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const slip = await prisma.salarySlip.findFirst({
    where: { id, employee: { companyId } },
    include: {
      employee: {
        select: {
          firstName: true, lastName: true, employeeId: true, designation: true,
          joiningDate: true, cnic: true,
          department: { select: { name: true } },
          user: { select: { email: true } },
        },
      },
      payrollRun: { select: { status: true } },
    },
  });

  if (!slip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(slip);
}
