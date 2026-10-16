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
        employee: {
          select: {
            firstName: true, lastName: true, employeeId: true,
            designation: true, department: { select: { name: true } },
          },
        },
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

    const leaveReq = await prisma.leaveRequest.findUnique({
      where: { id },
      select: { employeeId: true, leaveTypeId: true, days: true, status: true },
    });

    if (!leaveReq) return NextResponse.json({ error: "Leave request not found" }, { status: 404 });

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status, reviewNote, reviewedAt: new Date() },
    });

    // Update LeaveBalance when approving a previously PENDING request
    if (status === "APPROVED" && leaveReq.status === "PENDING") {
      const currentYear = new Date().getFullYear();
      await prisma.leaveBalance.updateMany({
        where: {
          employeeId: leaveReq.employeeId,
          leaveTypeId: leaveReq.leaveTypeId,
          year: currentYear,
        },
        data: {
          used: { increment: leaveReq.days },
          remaining: { decrement: leaveReq.days },
        },
      });
    }

    // Restore balance if previously APPROVED and now being REJECTED or CANCELLED
    if ((status === "REJECTED" || status === "CANCELLED") && leaveReq.status === "APPROVED") {
      const currentYear = new Date().getFullYear();
      await prisma.leaveBalance.updateMany({
        where: {
          employeeId: leaveReq.employeeId,
          leaveTypeId: leaveReq.leaveTypeId,
          year: currentYear,
        },
        data: {
          used: { decrement: leaveReq.days },
          remaining: { increment: leaveReq.days },
        },
      });
    }

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
