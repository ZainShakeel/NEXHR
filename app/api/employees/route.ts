import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/employees?companyId=xxx
export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get("companyId");
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const employees = await prisma.employee.findMany({
      where: { companyId },
      include: { department: true, shift: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(employees);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/employees — create new employee
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId, email, password, firstName, lastName, designation,
      departmentId, shiftId, basicSalary, joiningDate, phone,
      cnic, gender, dateOfBirth, employmentType,
    } = body;

    if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

    const bcrypt = await import("bcryptjs");
    const hashedPw = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPw, role: "EMPLOYEE", companyId },
    });

    const count = await prisma.employee.count({ where: { companyId } });
    const employeeId = `EMP-${String(count + 1).padStart(3, "0")}`;

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        cnic: cnic || null,
        gender: gender || "MALE",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        designation,
        employmentType: employmentType || "FULL_TIME",
        basicSalary: basicSalary ?? 0,
        joiningDate: new Date(joiningDate),
        userId: user.id,
        companyId,
        departmentId: departmentId || null,
        shiftId: shiftId || null,
        status: "ACTIVE",
      },
      include: { department: true },
    });

    const leaveTypes = await prisma.leaveType.findMany({ where: { companyId, isActive: true } });
    if (leaveTypes.length > 0) {
      await prisma.leaveBalance.createMany({
        data: leaveTypes.map((lt) => ({
          employeeId: employee.id,
          leaveTypeId: lt.id,
          allocated: lt.daysAllowed,
          remaining: lt.daysAllowed,
          used: 0,
          year: new Date().getFullYear(),
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(employee, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Email already exists. Use a different email address." }, { status: 409 });
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
