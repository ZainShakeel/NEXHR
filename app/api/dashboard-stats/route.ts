import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get("companyId");
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    // Last 7 days for attendance trend
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i)); return d;
    });

    const [
      totalEmployees,
      presentToday,
      onLeave,
      pendingLeaves,
      departments,
      recentAttendance,
      pendingLeaveDetails,
      totalPayroll,
      recentJoiners,
    ] = await Promise.all([
      prisma.employee.count({ where: { companyId, status: "ACTIVE" } }),
      prisma.attendance.count({ where: { companyId, date: today, status: { in: ["PRESENT", "LATE"] } } }),
      prisma.attendance.count({ where: { companyId, date: today, status: "ON_LEAVE" } }),
      prisma.leaveRequest.count({ where: { employee: { companyId }, status: "PENDING" } }),
      prisma.department.findMany({
        where: { companyId },
        include: { _count: { select: { employees: true } } },
      }),
      prisma.attendance.findMany({
        where: { companyId, date: today },
        include: { employee: { select: { firstName: true, lastName: true, employeeId: true, designation: true, department: { select: { name: true } } } } },
        orderBy: { checkIn: "desc" },
        take: 8,
      }),
      prisma.leaveRequest.findMany({
        where: { employee: { companyId }, status: "PENDING" },
        include: {
          employee: { select: { firstName: true, lastName: true, designation: true } },
          leaveType: { select: { name: true, color: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.employee.aggregate({
        where: { companyId, status: "ACTIVE" },
        _sum: { basicSalary: true },
      }),
      prisma.employee.findMany({
        where: { companyId, status: "ACTIVE" },
        orderBy: { joiningDate: "desc" },
        take: 4,
        select: { firstName: true, lastName: true, designation: true, joiningDate: true, department: { select: { name: true } } },
      }),
    ]);

    // Attendance trend for last 7 days
    const attendanceTrend = await Promise.all(
      last7.map(async (d) => {
        const next = new Date(d); next.setDate(d.getDate() + 1);
        const present = await prisma.attendance.count({ where: { companyId, date: d, status: { in: ["PRESENT", "LATE"] } } });
        const late    = await prisma.attendance.count({ where: { companyId, date: d, status: "LATE" } });
        const absent  = await prisma.attendance.count({ where: { companyId, date: d, status: "ABSENT" } });
        return {
          day: d.toLocaleDateString("en-PK", { weekday: "short" }),
          present,
          late,
          absent,
        };
      })
    );

    // Leave type distribution
    const leaveTypes = await prisma.leaveType.findMany({ where: { companyId } });
    const leaveDistribution = await Promise.all(
      leaveTypes.slice(0, 4).map(async (lt) => {
        const count = await prisma.leaveRequest.count({
          where: { employee: { companyId }, leaveTypeId: lt.id, status: { in: ["PENDING", "APPROVED"] } },
        });
        return { name: lt.name, value: count, color: lt.color };
      })
    );

    const lateToday = await prisma.attendance.count({ where: { companyId, date: today, status: "LATE" } });
    const absentToday = await prisma.attendance.count({ where: { companyId, date: today, status: "ABSENT" } });

    return NextResponse.json({
      totalEmployees,
      presentToday,
      onLeave,
      pendingRequests: pendingLeaves,
      lateToday,
      absentToday,
      attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
      departments,
      recentAttendance,
      pendingLeaveDetails,
      totalPayroll: totalPayroll._sum.basicSalary ?? 0,
      recentJoiners,
      attendanceTrend,
      leaveDistribution,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
