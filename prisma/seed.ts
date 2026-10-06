import { PrismaClient, Role, EmploymentType, EmployeeStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NexHR database...");

  const pw = await bcrypt.hash("NexHR@18000", 10);

  // ── Company ───────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { domain: "abc" },
    update: {},
    create: {
      name:     "ABC Corporation",
      domain:   "abc",
      address:  "Main Boulevard, Gulberg III, Lahore",
      phone:    "+92 42 1234567",
      email:    "info@abccorp.com",
      timezone: "Asia/Karachi",
      currency: "PKR",
    },
  });
  console.log("✓ Company:", company.name);

  // ── Departments ───────────────────────────────────────
  const depts = await Promise.all([
    prisma.department.upsert({ where: { id: "dept-it" },      update: {}, create: { id: "dept-it",      name: "Information Technology", companyId: company.id } }),
    prisma.department.upsert({ where: { id: "dept-hr" },      update: {}, create: { id: "dept-hr",      name: "Human Resources",        companyId: company.id } }),
    prisma.department.upsert({ where: { id: "dept-finance" }, update: {}, create: { id: "dept-finance", name: "Finance",                 companyId: company.id } }),
    prisma.department.upsert({ where: { id: "dept-sales" },   update: {}, create: { id: "dept-sales",   name: "Sales & Marketing",       companyId: company.id } }),
  ]);
  console.log("✓ Departments:", depts.length);

  // ── Office ────────────────────────────────────────────
  const office = await prisma.office.upsert({
    where: { id: "office-lhr" },
    update: {},
    create: {
      id:        "office-lhr",
      name:      "Lahore HQ",
      address:   "Main Boulevard, Gulberg III, Lahore",
      city:      "Lahore",
      latitude:  31.5204,
      longitude: 74.3587,
      radius:    100,
      workStart: "09:00",
      workEnd:   "18:00",
      companyId: company.id,
    },
  });
  console.log("✓ Office:", office.name);

  // ── Shift ─────────────────────────────────────────────
  const shift = await prisma.shift.upsert({
    where: { id: "shift-morning" },
    update: {},
    create: {
      id:          "shift-morning",
      name:        "Morning Shift",
      startTime:   "09:00",
      endTime:     "18:00",
      breakMinutes: 60,
      gracePeriod: 15,
      workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
      companyId:   company.id,
    },
  });
  console.log("✓ Shift:", shift.name);

  // ── Leave Types ───────────────────────────────────────
  await Promise.all([
    prisma.leaveType.upsert({ where: { id: "lt-annual" },  update: {}, create: { id: "lt-annual",  name: "Annual Leave",  daysAllowed: 15, isCarryForward: true,  maxCarryForward: 5,  color: "#16A34A", companyId: company.id } }),
    prisma.leaveType.upsert({ where: { id: "lt-sick" },    update: {}, create: { id: "lt-sick",    name: "Sick Leave",    daysAllowed: 10, isCarryForward: false, requiresDoc: true,   color: "#EF4444", companyId: company.id } }),
    prisma.leaveType.upsert({ where: { id: "lt-casual" },  update: {}, create: { id: "lt-casual",  name: "Casual Leave",  daysAllowed: 5,  isCarryForward: false,                      color: "#3B82F6", companyId: company.id } }),
  ]);
  console.log("✓ Leave types: 3");

  // ── Users + Employees ─────────────────────────────────
  type EmpData = {
    userId: string; email: string; role: Role;
    empId: string; firstName: string; lastName: string;
    phone: string; designation: string; deptId: string;
    salary: number; joining: Date;
  };

  const employees: EmpData[] = [
    { userId: "user-admin",   email: "admin@abc.com",  role: Role.COMPANY_OWNER, empId: "EMP-001", firstName: "Sarah",  lastName: "Khan",   phone: "+92 300 1111111", designation: "HR Manager",       deptId: "dept-hr",      salary: 120000, joining: new Date("2023-01-01") },
    { userId: "user-emp1",    email: "zain@abc.com",   role: Role.EMPLOYEE,      empId: "EMP-002", firstName: "Zain",   lastName: "Ahmed",  phone: "+92 300 2222222", designation: "IT Engineer",      deptId: "dept-it",      salary: 85000,  joining: new Date("2024-01-01") },
    { userId: "user-emp2",    email: "ayesha@abc.com", role: Role.EMPLOYEE,      empId: "EMP-003", firstName: "Ayesha", lastName: "Malik",  phone: "+92 300 3333333", designation: "Senior Developer", deptId: "dept-it",      salary: 95000,  joining: new Date("2023-06-15") },
    { userId: "user-emp3",    email: "ali@abc.com",    role: Role.MANAGER,       empId: "EMP-004", firstName: "Ali",    lastName: "Raza",   phone: "+92 300 4444444", designation: "Sales Manager",    deptId: "dept-sales",   salary: 100000, joining: new Date("2023-03-01") },
    { userId: "user-emp4",    email: "fatima@abc.com", role: Role.EMPLOYEE,      empId: "EMP-005", firstName: "Fatima", lastName: "Noor",   phone: "+92 300 5555555", designation: "Accountant",       deptId: "dept-finance", salary: 75000,  joining: new Date("2024-03-01") },
  ];

  for (const e of employees) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: { id: e.userId, email: e.email, password: pw, role: e.role, companyId: company.id },
    });

    const empDbId = `${e.empId.toLowerCase().replace("-", "")}-db`;
    await prisma.employee.upsert({
      where: { id: empDbId },
      update: {},
      create: {
        id:             empDbId,
        employeeId:     e.empId,
        firstName:      e.firstName,
        lastName:       e.lastName,
        email:          e.email,
        phone:          e.phone,
        designation:    e.designation,
        employmentType: EmploymentType.FULL_TIME,
        status:         EmployeeStatus.ACTIVE,
        basicSalary:    e.salary,
        joiningDate:    e.joining,
        userId:         user.id,
        companyId:      company.id,
        departmentId:   e.deptId,
        officeId:       office.id,
        shiftId:        shift.id,
      },
    });
  }
  console.log("✓ Users + Employees:", employees.length);

  console.log("\n✅ Seed complete!");
  console.log("───────────────────────────────");
  console.log("HR Login:       admin@abc.com");
  console.log("Employee Login: zain@abc.com");
  console.log("Password:       NexHR@18000");
  console.log("───────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
