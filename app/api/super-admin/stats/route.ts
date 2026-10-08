import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("super_admin_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [companies, totalEmployees, subscriptions] = await Promise.all([
      prisma.company.findMany({
        include: {
          _count: { select: { employees: true } },
          subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count(),
      prisma.subscription.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const now = new Date();
    const activeCompanies = companies.filter((c) => c.isActive).length;
    const pausedCompanies = companies.filter((c) => !c.isActive).length;
    const expiredCompanies = companies.filter(
      (c) => c.planExpiresAt && new Date(c.planExpiresAt) < now
    ).length;

    // MRR from active subscriptions this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const mrr = subscriptions
      .filter((s) => s.status === "ACTIVE" && new Date(s.startDate) >= startOfMonth)
      .reduce((sum, s) => sum + s.amount, 0);

    const totalRevenue = subscriptions
      .filter((s) => s.status === "ACTIVE" || s.status === "EXPIRED")
      .reduce((sum, s) => sum + s.amount, 0);

    // Monthly growth
    const monthMap: Record<string, number> = {};
    companies.forEach((c) => {
      const key = new Date(c.createdAt).toLocaleDateString("en-PK", { month: "short", year: "2-digit" });
      monthMap[key] = (monthMap[key] ?? 0) + 1;
    });
    const monthlyGrowth = Object.entries(monthMap)
      .slice(-6)
      .map(([month, count]) => ({ month, companies: count }));

    // Plan distribution
    const planCount: Record<string, number> = { FREE: 0, STARTER: 0, BUSINESS: 0, ENTERPRISE: 0 };
    companies.forEach((c) => { planCount[c.plan] = (planCount[c.plan] ?? 0) + 1; });
    const planDist = Object.entries(planCount)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    // Revenue by month (last 6)
    const revenueMap: Record<string, number> = {};
    subscriptions.forEach((s) => {
      const key = new Date(s.startDate).toLocaleDateString("en-PK", { month: "short", year: "2-digit" });
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
      recentTransactions: subscriptions.slice(0, 20),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
