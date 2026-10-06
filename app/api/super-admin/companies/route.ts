import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendCompanyWelcomeEmail } from "@/lib/email";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: { select: { employees: true, users: true } },
        users: {
          where: { role: "COMPANY_OWNER" },
          select: { email: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(companies);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, domain, adminEmail, adminPassword, adminName } = await req.json();
    if (!name || !domain || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "name, domain, adminEmail, adminPassword required" }, { status: 400 });
    }

    const existing = await prisma.company.findUnique({ where: { domain } });
    if (existing) return NextResponse.json({ error: "Domain already taken" }, { status: 409 });

    const hashed = await bcrypt.hash(adminPassword, 10);

    const company = await prisma.$transaction(async (tx) => {
      const c = await tx.company.create({ data: { name, domain } });

      const user = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashed,
          role: "COMPANY_OWNER",
          companyId: c.id,
          isActive: true,
        },
      });

      const firstName = adminName ? adminName.split(" ")[0] : "Admin";
      const lastName = adminName ? (adminName.split(" ").slice(1).join(" ") || "User") : "User";

      await tx.employee.create({
        data: {
          employeeId: "EMP-001",
          firstName,
          lastName,
          email: adminEmail,
          designation: "HR Manager",
          employmentType: "FULL_TIME",
          status: "ACTIVE",
          joiningDate: new Date(),
          basicSalary: 0,
          companyId: c.id,
          userId: user.id,
        },
      });

      // Default leave types
      await tx.leaveType.createMany({
        data: [
          { name: "Annual Leave", daysAllowed: 18, color: "#16A34A", companyId: c.id },
          { name: "Sick Leave", daysAllowed: 10, color: "#EF4444", companyId: c.id },
          { name: "Casual Leave", daysAllowed: 10, color: "#F59E0B", companyId: c.id },
        ],
      });

      return c;
    });

    // Send welcome email (non-blocking — don't fail if email fails)
    sendCompanyWelcomeEmail({
      to: adminEmail,
      companyName: name,
      domain,
      password: adminPassword,
    }).catch(() => {});

    return NextResponse.json(company, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json();
    const company = await prisma.company.update({ where: { id }, data: { isActive } });
    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
