"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2, Users, TrendingUp, Activity, Plus, ArrowUpRight,
  Loader2, CheckCircle2, XCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

type StatsData = {
  totalCompanies: number;
  activeCompanies: number;
  totalEmployees: number;
  mrr: number;
  recentCompanies: {
    id: string; name: string; domain: string; isActive: boolean;
    createdAt: string; _count: { employees: number };
  }[];
  monthlyGrowth: { month: string; companies: number }[];
  planDist: { name: string; value: number }[];
};

export default function SuperAdminDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/stats")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={22} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  const activeRate = data?.totalCompanies
    ? Math.round(((data.activeCompanies ?? 0) / data.totalCompanies) * 100)
    : 0;

  const topCompanies = [...(data?.recentCompanies ?? [])]
    .sort((a, b) => b._count.employees - a._count.employees)
    .slice(0, 5);

  const kpis = [
    {
      label: "Total Companies",
      value: data?.totalCompanies ?? 0,
      sub: `${data?.activeCompanies ?? 0} active right now`,
      icon: Building2,
      accent: "#16A34A",
      bg: "bg-[#F0F9F3]",
      border: "border-[#C6E9D3]",
    },
    {
      label: "Total Employees",
      value: data?.totalEmployees ?? 0,
      sub: "Across all tenants",
      icon: Users,
      accent: "#2563EB",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Active Rate",
      value: `${activeRate}%`,
      sub: "Companies currently active",
      icon: Activity,
      accent: "#D97706",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "This Month",
      value: data?.monthlyGrowth?.length
        ? (data.monthlyGrowth[data.monthlyGrowth.length - 1]?.companies ?? 0)
        : 0,
      sub: "New companies added",
      icon: TrendingUp,
      accent: "#7C3AED",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
  ];

  return (
    <div className="p-6 space-y-6 min-h-full bg-[#F4F8F6]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0D1F15]">Platform Overview</h1>
          <p className="text-[#6B8C7A] text-sm mt-0.5">
            {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          href="/super-admin/companies"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#15803D] transition-colors shadow-sm"
        >
          <Plus size={14} /> Onboard Company
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center mb-4`}>
              <k.icon size={18} style={{ color: k.accent }} />
            </div>
            <p className="text-3xl font-black text-[#0D1F15] tracking-tight">{k.value}</p>
            <p className="text-[11px] text-[#6B8C7A] mt-1.5">{k.label}</p>
            <p className="text-[10px] text-[#9BB8A8] mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-[#0D1F15]">Company Growth</h2>
              <p className="text-[11px] text-[#6B8C7A] mt-0.5">Monthly registrations</p>
            </div>
            <Link href="/super-admin/analytics" className="text-[11px] text-[#16A34A] flex items-center gap-1 hover:underline font-semibold">
              Full analytics <ArrowUpRight size={11} />
            </Link>
          </div>
          {(data?.monthlyGrowth ?? []).length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#9BB8A8]">
              <TrendingUp size={28} className="mb-2 opacity-30" />
              <p className="text-xs text-[#6B8C7A]">Growth data will appear as companies are onboarded</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data!.monthlyGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F2" />
                <XAxis dataKey="month" tick={{ fill: "#9BB8A8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9BB8A8", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5EDE9", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                  labelStyle={{ color: "#0D1F15", fontWeight: 600 }}
                  itemStyle={{ color: "#16A34A" }}
                />
                <Area type="monotone" dataKey="companies" stroke="#16A34A" fill="url(#gGrad)" strokeWidth={2.5} dot={{ fill: "#16A34A", r: 3.5 }} activeDot={{ r: 5, fill: "#16A34A" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="xl:col-span-2 bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-[#0D1F15]">Top Companies</h2>
            <p className="text-[11px] text-[#6B8C7A] mt-0.5">By employee count</p>
          </div>
          {topCompanies.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#9BB8A8]">
              <Building2 size={28} className="mb-2 opacity-30" />
              <p className="text-xs text-[#6B8C7A]">No companies yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={topCompanies.map((c) => ({
                  name: c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name,
                  employees: c._count.employees,
                }))}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F2" />
                <XAxis dataKey="name" tick={{ fill: "#9BB8A8", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9BB8A8", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5EDE9", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                  labelStyle={{ color: "#0D1F15", fontWeight: 600 }}
                  itemStyle={{ color: "#16A34A" }}
                />
                <Bar dataKey="employees" fill="#16A34A" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Companies Table */}
      <div className="bg-white border border-[#E5EDE9] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF5F1]">
          <div>
            <h2 className="text-sm font-bold text-[#0D1F15]">Recently Onboarded</h2>
            <p className="text-[11px] text-[#6B8C7A] mt-0.5">Last 10 companies added to the platform</p>
          </div>
          <Link href="/super-admin/companies" className="text-[11px] text-[#16A34A] flex items-center gap-1 hover:underline font-semibold">
            View all <ArrowUpRight size={11} />
          </Link>
        </div>

        {(data?.recentCompanies ?? []).length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-[#9BB8A8]">
            <Building2 size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold text-[#6B8C7A]">No companies onboarded yet</p>
            <p className="text-xs mt-1 text-[#9BB8A8]">Click "Onboard Company" to add the first one</p>
            <Link
              href="/super-admin/companies"
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#F0F9F3] text-[#16A34A] text-xs font-semibold rounded-xl hover:bg-[#E0F2E9] transition-colors border border-[#C6E9D3]"
            >
              <Plus size={12} /> Onboard Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#EEF5F1]">
                  {["Company", "Domain", "Employees", "Joined", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5F1]">
                {data!.recentCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAF9] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F0F9F3] border border-[#C6E9D3] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#16A34A] text-sm font-bold">{c.name[0]?.toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#0D1F15]">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-[#16A34A] bg-[#F0F9F3] px-2.5 py-1 rounded-lg border border-[#C6E9D3]">{c.domain}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-[#0D1F15] font-medium">
                        <Users size={12} className="text-[#6B8C7A]" />
                        {c._count.employees}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6B8C7A]">
                      {new Date(c.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                          <CheckCircle2 size={9} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-200">
                          <XCircle size={9} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/super-admin/companies/${c.id}`}
                        className="text-[11px] text-[#16A34A] hover:text-[#15803D] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
