import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const companyId  = req.nextUrl.searchParams.get("companyId");
    const employeeId = req.nextUrl.searchParams.get("employeeId");

    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const where: any = { employee: { companyId } };
    if (employeeId) where.employeeId = employeeId;

    const requests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee:  { select: { firstName: true, lastName: true, employeeId: true } },
        leaveType: { select: { name: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, leaveTypeId, startDate, endDate, reason } = body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        days: body.days ?? diffDays,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, reviewNote } = await req.json();

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data:  { status, reviewNote, reviewedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
