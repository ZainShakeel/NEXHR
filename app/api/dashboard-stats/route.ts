import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get("companyId");
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      presentToday,
      pendingLeaves,
      departments,
      recentAttendance,
    ] = await Promise.all([
      prisma.employee.count({ where: { companyId, status: "ACTIVE" } }),
      prisma.attendance.count({ where: { companyId, date: today, status: { in: ["PRESENT", "LATE"] } } }),
      prisma.leaveRequest.count({ where: { employee: { companyId }, status: "PENDING" } }),
      prisma.department.findMany({
        where: { companyId },
        include: { _count: { select: { employees: true } } },
      }),
      prisma.attendance.findMany({
        where: { companyId, date: today },
        include: { employee: { select: { firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } } },
        orderBy: { checkIn: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      totalEmployees,
      presentToday,
      onLeave: await prisma.attendance.count({ where: { companyId, date: today, status: "ON_LEAVE" } }),
      pendingRequests: pendingLeaves,
      attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
      departments,
      recentAttendance,
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
