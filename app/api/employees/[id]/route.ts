import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const emp = await prisma.employee.findFirst({
    where: { id, companyId },
    include: {
      department: true,
      shift: true,
      user: { select: { email: true, role: true, isActive: true } },
    },
  });

  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(emp);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { companyId, ...data } = body;
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const emp = await prisma.employee.findFirst({ where: { id, companyId } });
  if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      designation: data.designation || undefined,
      phone: data.phone || undefined,
      cnic: data.cnic || undefined,
      employmentType: data.employmentType || undefined,
      status: data.status || undefined,
      basicSalary: data.basicSalary !== undefined ? parseFloat(data.basicSalary) : undefined,
      departmentId: data.departmentId || undefined,
      shiftId: data.shiftId || undefined,
    },
  });

  return NextResponse.json(updated);
}
