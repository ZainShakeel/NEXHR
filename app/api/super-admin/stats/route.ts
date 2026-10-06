import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("super_admin_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [companies, totalEmployees] = await Promise.all([
      prisma.company.findMany({
        include: { _count: { select: { employees: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count(),
    ]);

    const activeCompanies = companies.filter((c) => c.isActive).length;

    // Group companies by month for growth chart
    const monthMap: Record<string, number> = {};
    companies.forEach((c) => {
      const key = new Date(c.createdAt).toLocaleDateString("en-PK", { month: "short", year: "2-digit" });
      monthMap[key] = (monthMap[key] ?? 0) + 1;
    });
    const monthlyGrowth = Object.entries(monthMap)
      .slice(-6)
      .map(([month, count]) => ({ month, companies: count }));

    // Plan distribution (all companies currently on "Free" unless plan field added)
    const planDist = [{ name: "Free", value: companies.length }];

    return NextResponse.json({
      totalCompanies: companies.length,
      activeCompanies,
      totalEmployees,
      mrr: 0,
      recentCompanies: companies.slice(0, 10),
      monthlyGrowth,
      planDist,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
