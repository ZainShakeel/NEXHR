import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("super_admin_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [companies, totalEmployees] = await Promise.all([
      prisma.company.findMany({
        include: {
          _count: { select: { employees: true } },
          users: { where: { role: "COMPANY_OWNER" }, select: { email: true }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count(),
    ]);

    // Try subscriptions separately — table may not be seeded
    let subscriptions: any[] = [];
    try {
      subscriptions = await (prisma as any).subscription.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch { /* subscriptions table empty or unavailable */ }

    const now = new Date();
    const activeCompanies = companies.filter((c) => c.isActive).length;
    const pausedCompanies = companies.filter((c) => !c.isActive).length;
    const expiredCompanies = companies.filter(
      (c) => c.planExpiresAt && new Date(c.planExpiresAt) < now
    ).length;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const mrr = subscriptions
      .filter((s: any) => s.status === "ACTIVE" && new Date(s.startDate) >= startOfMonth)
      .reduce((sum: number, s: any) => sum + s.amount, 0);
    const totalRevenue = subscriptions
      .filter((s: any) => s.status === "ACTIVE" || s.status === "EXPIRED")
      .reduce((sum: number, s: any) => sum + s.amount, 0);

    const monthMap: Record<string, number> = {};
    companies.forEach((c) => {
      const key = new Date(c.createdAt).toLocaleDateString("en-US", { month: "short" });
      monthMap[key] = (monthMap[key] ?? 0) + 1;
    });
    const monthlyGrowth = Object.entries(monthMap)
      .slice(-6)
      .map(([month, count]) => ({ month, companies: count }));

    const planCount: Record<string, number> = {};
    companies.forEach((c) => {
      planCount[c.plan] = (planCount[c.plan] ?? 0) + 1;
    });
    const planDist = Object.entries(planCount).map(([name, value]) => ({ name, value }));

    const revenueMap: Record<string, number> = {};
    subscriptions.forEach((s: any) => {
      const key = new Date(s.startDate).toLocaleDateString("en-US", { month: "short" });
      revenueMap[key] = (revenueMap[key] ?? 0) + s.amount;
    });
    const monthlyRevenue = Object.entries(revenueMap)
      .slice(-6)
      .map(([month, amount]) => ({ month, amount }));

    return NextResponse.json({
      totalCompanies: companies.length,
      activeCompanies,
      pausedCompanies,
      expiredCompanies,
      totalEmployees,
      mrr,
      totalRevenue,
      recentCompanies: companies,
      monthlyGrowth,
      monthlyRevenue,
      planDist,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error", detail: e?.message ?? "" }, { status: 500 });
  }
}
