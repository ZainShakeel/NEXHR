import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const companyId  = req.nextUrl.searchParams.get("companyId");
    const employeeId = req.nextUrl.searchParams.get("employeeId");
    const month      = req.nextUrl.searchParams.get("month");
    const year       = req.nextUrl.searchParams.get("year");

    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const where: any = { companyId };
    if (employeeId) where.employeeId = employeeId;

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end   = new Date(Number(year), Number(month), 0);
      where.date  = { gte: start, lte: end };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true, lastName: true, employeeId: true,
            designation: true, department: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
      take: 500,
    });

    return NextResponse.json(records);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { employeeId, companyId, checkIn, checkOut, lat, lng } = await req.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    if (checkOut !== undefined) {
      const checkOutTime = checkOut ? new Date(checkOut) : now;

      // Fetch existing record to compute working minutes
      const existing = await prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId, date: today } },
        select: { checkIn: true },
      });

      let workingMinutes: number | undefined;
      let status = "PRESENT";
      if (existing?.checkIn) {
        const diffMs = checkOutTime.getTime() - existing.checkIn.getTime();
        workingMinutes = Math.max(0, Math.round(diffMs / 60000));
      }

      const record = await prisma.attendance.upsert({
        where:  { employeeId_date: { employeeId, date: today } },
        update: {
          checkOut: checkOutTime,
          checkOutLat: lat,
          checkOutLng: lng,
          ...(workingMinutes !== undefined ? { workingMinutes } : {}),
        },
        create: {
          employeeId, companyId, date: today,
          checkOut: checkOutTime, status: "PRESENT",
        },
      });
      return NextResponse.json(record);
    }

    const checkInTime = checkIn ? new Date(checkIn) : now;

    // Determine late status (compare against 9:00 AM as default; TODO: use shift start time)
    const shiftStart = new Date(today); shiftStart.setHours(9, 0, 0, 0);
    const gracePeriodMs = 15 * 60 * 1000; // 15 min grace
    const lateMinutes = checkInTime > new Date(shiftStart.getTime() + gracePeriodMs)
      ? Math.round((checkInTime.getTime() - shiftStart.getTime()) / 60000)
      : 0;
    const status = lateMinutes > 0 ? "LATE" : "PRESENT";

    const record = await prisma.attendance.upsert({
      where:  { employeeId_date: { employeeId, date: today } },
      update: { checkIn: checkInTime, checkInLat: lat, checkInLng: lng, status, lateMinutes },
      create: {
        employeeId, companyId, date: today,
        checkIn: checkInTime, checkInLat: lat, checkInLng: lng,
        status, lateMinutes,
      },
    });

    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
