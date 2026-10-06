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
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
      orderBy: { date: "desc" },
      take: 100,
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
      const record = await prisma.attendance.upsert({
        where:  { employeeId_date: { employeeId, date: today } },
        update: { checkOut: checkOut ? new Date(checkOut) : now, checkOutLat: lat, checkOutLng: lng },
        create: { employeeId, companyId, date: today, checkOut: checkOut ? new Date(checkOut) : now, status: "PRESENT" },
      });
      return NextResponse.json(record);
    }

    const checkInTime = checkIn ? new Date(checkIn) : now;

    const record = await prisma.attendance.upsert({
      where:  { employeeId_date: { employeeId, date: today } },
      update: { checkIn: checkInTime, checkInLat: lat, checkInLng: lng, status: "PRESENT" },
      create: { employeeId, companyId, date: today, checkIn: checkInTime, checkInLat: lat, checkInLng: lng, status: "PRESENT" },
    });

    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
