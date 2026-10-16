"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Building2, Users, Activity, AlertTriangle, DollarSign } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line
} from "recharts";

type StatsData = {
  totalCompanies: number; activeCompanies: number; pausedCompanies: number;
  expiredCompanies: number; totalEmployees: number; mrr: number; totalRevenue: number;
  recentCompanies: {
    id: string; name: string; domain: string; isActive: boolean;
    plan: string; planExpiresAt?: string; createdAt: string; _count: { employees: number };
  }[];
  monthlyGrowth: { month: string; companies: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  planDist: { name: string; value: number }[];
};

const COLORS = ["#07845A", "#2563EB", "#D97706", "#7C3AED"];
const PLAN_LABELS: Record<string, string> = { FREE: "Free", STARTER: "Starter", BUSINESS: "Business", ENTERPRISE: "Enterprise" };

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
        <Loader2 size={22} className="animate-spin text-[#07845A]" />
      </div>
    );
  }

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 86400000);
  const expiringSoon = (data?.recentCompanies ?? []).filter((c) =>
    c.planExpiresAt && new Date(c.planExpiresAt) > now && new Date(c.planExpiresAt) < in7Days
  );

  const topCompanies = [...(data?.recentCompanies ?? [])]
    .sort((a, b) => b._count.employees - a._count.employees)
    .slice(0, 5);

  const activeRate = data?.totalCompanies
    ? Math.round(((data.activeCompanies ?? 0) / data.totalCompanies) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6 min-h-full bg-[#F5F8F6]">
      <div>
        <h1 className="text-xl font-bold text-[#172B24]">Analytics</h1>
        <p className="text-[#64748B] text-sm mt-0.5">Platform growth and usage statistics</p>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              {expiringSoon.length} subscription{expiringSoon.length > 1 ? "s" : ""} expiring within 7 days
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {expiringSoon.map((c) => c.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Companies", value: data?.totalCompanies ?? 0, icon: Building2, accent: "#07845A", bg: "bg-[#E3F6EB]", border: "border-[#C6EFDA]" },
          { label: "Active Companies", value: data?.activeCompanies ?? 0, icon: Activity, accent: "#07845A", bg: "bg-[#E3F6EB]", border: "border-[#C6EFDA]" },
          { label: "Total Employees", value: data?.totalEmployees ?? 0, icon: Users, accent: "#2563EB", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Active Rate", value: `${activeRate}%`, icon: TrendingUp, accent: "#D97706", bg: "bg-amber-50", border: "border-amber-200" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-3`}>
              <s.icon size={16} style={{ color: s.accent }} />
            </div>
            <p className="text-2xl font-black text-[#172B24]">{s.value}</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={15} className="text-[#07845A]" />
            <span className="text-xs font-semibold text-[#64748B]">Total Revenue Collected</span>
          </div>
          <p className="text-2xl font-black text-[#172B24]">PKR {(data?.totalRevenue ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-[#94A3B8] mt-0.5">All active + expired subscriptions</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-[#3B82F6]" />
            <span className="text-xs font-semibold text-[#64748B]">Monthly Recurring Revenue</span>
          </div>
          <p className="text-2xl font-black text-[#172B24]">PKR {(data?.mrr ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-[#94A3B8] mt-0.5">Active subscriptions started this month</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#172B24] mb-1">Company Registrations</h2>
          <p className="text-[11px] text-[#64748B] mb-5">Monthly new company signups</p>
          {(data?.monthlyGrowth ?? []).length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#94A3B8]">
              <TrendingUp size={28} className="mb-2 opacity-30" />
              <p className="text-xs text-[#64748B]">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data!.monthlyGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="agGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#07845A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#07845A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F2" />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} labelStyle={{ color: "#172B24", fontWeight: 600 }} itemStyle={{ color: "#07845A" }} />
                <Area type="monotone" dataKey="companies" stroke="#07845A" fill="url(#agGrad)" strokeWidth={2.5} dot={{ fill: "#07845A", r: 3.5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#172B24] mb-1">Monthly Revenue</h2>
          <p className="text-[11px] text-[#64748B] mb-5">PKR collected per month from subscriptions</p>
          {(data?.monthlyRevenue ?? []).length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#94A3B8]">
              <DollarSign size={28} className="mb-2 opacity-30" />
              <p className="text-xs text-[#64748B]">No revenue data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data!.monthlyRevenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F2" />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} labelStyle={{ color: "#172B24", fontWeight: 600 }} formatter={(v: number | string) => [`PKR ${Number(v).toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: "#3B82F6", r: 3.5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#172B24] mb-1">Plan Distribution</h2>
          <p className="text-[11px] text-[#64748B] mb-5">Companies by subscription plan</p>
          {(data?.planDist ?? []).length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#94A3B8]">
              <Building2 size={28} className="mb-2 opacity-30" />
              <p className="text-xs text-[#64748B]">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data!.planDist.map(d => ({ ...d, name: PLAN_LABELS[d.name] ?? d.name }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                  {data!.planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#172B24] mb-1">Top Companies by Employee Count</h2>
          <p className="text-[11px] text-[#64748B] mb-5">Largest tenants on the platform</p>
          {topCompanies.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#94A3B8]">
              <Building2 size={24} className="mb-2 opacity-30" />
              <p className="text-xs text-[#64748B]">No companies yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topCompanies.map((c) => ({
                  name: c.name.length > 14 ? c.name.slice(0, 14) + "..." : c.name,
                  employees: c._count.employees,
                }))}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F2" />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} labelStyle={{ color: "#172B24", fontWeight: 600 }} itemStyle={{ color: "#07845A" }} />
                <Bar dataKey="employees" fill="#07845A" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Company Status Breakdown */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[#172B24] mb-4">Company Status Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active", value: data?.activeCompanies ?? 0, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
            { label: "Paused / Inactive", value: data?.pausedCompanies ?? 0, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "Plan Expired", value: data?.expiredCompanies ?? 0, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#64748B] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
