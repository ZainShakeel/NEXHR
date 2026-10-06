"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Building2, Users, Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

type StatsData = {
  totalCompanies: number; activeCompanies: number; totalEmployees: number;
  recentCompanies: { id: string; name: string; domain: string; isActive: boolean; createdAt: string; _count: { employees: number } }[];
  monthlyGrowth: { month: string; companies: number }[];
  planDist: { name: string; value: number }[];
};

const COLORS = ["#16A34A", "#2563EB", "#D97706", "#7C3AED"];

export default function SuperAdminAnalyticsPage() {
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

  const topCompanies = [...(data?.recentCompanies ?? [])]
    .sort((a, b) => b._count.employees - a._count.employees)
    .slice(0, 5);

  const activeRate = data?.totalCompanies
    ? Math.round(((data.activeCompanies ?? 0) / data.totalCompanies) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6 min-h-full bg-[#F4F8F6]">
      <div>
        <h1 className="text-xl font-bold text-[#0D1F15]">Analytics</h1>
        <p className="text-[#6B8C7A] text-sm mt-0.5">Platform growth and usage statistics</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Companies", value: data?.totalCompanies ?? 0, icon: Building2, accent: "#16A34A", bg: "bg-[#F0F9F3]", border: "border-[#C6E9D3]" },
          { label: "Active Companies", value: data?.activeCompanies ?? 0, icon: Activity, accent: "#16A34A", bg: "bg-[#F0F9F3]", border: "border-[#C6E9D3]" },
          { label: "Total Employees", value: data?.totalEmployees ?? 0, icon: Users, accent: "#2563EB", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Active Rate", value: `${activeRate}%`, icon: TrendingUp, accent: "#D97706", bg: "bg-amber-50", border: "border-amber-200" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-3`}>
              <s.icon size={16} style={{ color: s.accent }} />
            </div>
            <p className="text-2xl font-black text-[#0D1F15]">{s.value}</p>
            <p className="text-[11px] text-[#6B8C7A] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#0D1F15] mb-1">Company Registrations</h2>
          <p className="text-[11px] text-[#6B8C7A] mb-5">Monthly new company signups</p>
          {(data?.monthlyGrowth ?? []).length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#9BB8A8]">
              <TrendingUp size={28} className="mb-2 opacity-30" />
              <p className="text-xs text-[#6B8C7A]">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data!.monthlyGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="agGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F2" />
                <XAxis dataKey="month" tick={{ fill: "#9BB8A8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9BB8A8", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5EDE9", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} labelStyle={{ color: "#0D1F15", fontWeight: 600 }} itemStyle={{ color: "#16A34A" }} />
                <Area type="monotone" dataKey="companies" stroke="#16A34A" fill="url(#agGrad)" strokeWidth={2.5} dot={{ fill: "#16A34A", r: 3.5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#0D1F15] mb-1">Plan Distribution</h2>
          <p className="text-[11px] text-[#6B8C7A] mb-5">Companies by subscription plan</p>
          {(data?.planDist ?? []).length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#9BB8A8]">
              <Building2 size={28} className="mb-2 opacity-30" />
              <p className="text-xs text-[#6B8C7A]">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data!.planDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                  {data!.planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5EDE9", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6B8C7A" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[#0D1F15] mb-1">Top Companies by Employee Count</h2>
        <p className="text-[11px] text-[#6B8C7A] mb-5">Largest tenants on the platform</p>
        {topCompanies.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-[#9BB8A8]">
            <Building2 size={24} className="mb-2 opacity-30" />
            <p className="text-xs text-[#6B8C7A]">No companies yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={topCompanies.map((c) => ({
                name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name,
                employees: c._count.employees,
              }))}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F2" />
              <XAxis dataKey="name" tick={{ fill: "#9BB8A8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9BB8A8", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5EDE9", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} labelStyle={{ color: "#0D1F15", fontWeight: 600 }} itemStyle={{ color: "#16A34A" }} />
              <Bar dataKey="employees" fill="#16A34A" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
