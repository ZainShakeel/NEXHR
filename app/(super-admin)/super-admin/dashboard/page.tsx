"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2, Users, TrendingUp, DollarSign, Loader2, ArrowUpRight,
  CheckCircle2, XCircle, AlertTriangle, Activity, Crown,
} from "lucide-react";

type Company = {
  id: string; name: string; domain: string; isActive: boolean; plan: string;
  planExpiresAt?: string; createdAt: string; _count: { employees: number };
};
type Stats = {
  totalCompanies: number; activeCompanies: number; pausedCompanies: number;
  expiredCompanies: number; totalEmployees: number; mrr: number; totalRevenue: number;
  recentCompanies: Company[];
  monthlyGrowth: { month: string; companies: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  planDist: { name: string; value: number }[];
};

const PLAN_COLORS: Record<string, string> = {
  FREE: "#64748B", STARTER: "#3B82F6", BUSINESS: "#07845A", ENTERPRISE: "#7C3AED",
};

function MiniBar({ data, colorKey }: { data: { month: string; value: number }[]; colorKey: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-sm transition-all"
            style={{
              height: `${Math.max((d.value / max) * 48, 3)}px`,
              background: d.value > 0 ? colorKey : "#E2E8F0",
            }} />
          <span className="text-[8px] text-[#94A3B8] truncate w-full text-center">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function statusInfo(c: Company) {
  if (!c.isActive) return { label: "Paused", color: "#EF4444", bg: "#FEE2E2", icon: XCircle };
  if (c.planExpiresAt && new Date(c.planExpiresAt) < new Date())
    return { label: "Expired", color: "#F59E0B", bg: "#FEF3C7", icon: AlertTriangle };
  return { label: "Active", color: "#07845A", bg: "#E3F6EB", icon: CheckCircle2 };
}

function daysLeft(date?: string) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/super-admin/stats").then(async r => {
      if (!r.ok) {
        if (r.status === 401) { window.location.href = "/super-admin/login"; return; }
        setError(true); setLoading(false); return;
      }
      const d = await r.json();
      setStats(d); setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#07845A" }} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2" style={{ background: "#F5F8F6" }}>
        <p className="text-sm font-semibold text-[#475569]">Could not load dashboard data.</p>
        <button onClick={() => window.location.reload()}
          className="text-sm font-medium" style={{ color: "#07845A" }}>
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    { label: "Total Companies", value: stats.totalCompanies, sub: `${stats.activeCompanies} active`, icon: Building2, color: "#07845A", bg: "#E3F6EB" },
    { label: "Total Employees", value: stats.totalEmployees, sub: "across all companies", icon: Users, color: "#3B82F6", bg: "#DBEAFE" },
    { label: "Monthly Revenue", value: `PKR ${stats.mrr.toLocaleString()}`, sub: "this month", icon: DollarSign, color: "#7C3AED", bg: "#EDE9FE" },
    { label: "Total Revenue", value: `PKR ${stats.totalRevenue.toLocaleString()}`, sub: "all time", icon: TrendingUp, color: "#F59E0B", bg: "#FEF3C7" },
  ];

  const statusCards = [
    { label: "Active",   value: stats.activeCompanies,  color: "#07845A", bg: "#E3F6EB", icon: CheckCircle2 },
    { label: "Paused",   value: stats.pausedCompanies,  color: "#EF4444", bg: "#FEE2E2", icon: XCircle },
    { label: "Expired",  value: stats.expiredCompanies, color: "#F59E0B", bg: "#FEF3C7", icon: AlertTriangle },
    { label: "Free Plan", value: stats.planDist.find(p => p.name === "FREE")?.value ?? 0, color: "#64748B", bg: "#F1F5F9", icon: Activity },
  ];

  const expiringSoon = stats.recentCompanies.filter(c => {
    const d = daysLeft(c.planExpiresAt);
    return d !== null && d >= 0 && d <= 7;
  });

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>

      {/* Welcome Banner */}
      <div className="rounded-xl p-5 flex items-center gap-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #07845A 0%, #05603F 100%)" }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="absolute -bottom-10 right-20 w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={13} className="text-yellow-300" />
            <span className="text-[11px] font-bold text-green-100 uppercase tracking-widest">Super Admin Panel</span>
          </div>
          <h1 className="text-xl font-black text-white mb-0.5">Platform Overview</h1>
          <p className="text-sm text-green-100/70">Manage all companies, revenue and subscriptions.</p>
        </div>
        <div className="relative z-10 hidden sm:flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            {stats.totalCompanies} companies onboarded
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                <k.icon size={18} style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#172B24]">{k.value}</p>
            <p className="text-xs font-semibold text-[#475569] mt-0.5">{k.label}</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statusCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 flex items-center gap-3"
            style={{ border: "1px solid #E2E8F0" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: s.bg }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-black text-[#172B24]">{s.value}</p>
              <p className="text-[11px] text-[#64748B] font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#172B24]">Monthly Revenue</h3>
              <p className="text-xs text-[#94A3B8]">PKR earned per month</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#E3F6EB" }}>
              <TrendingUp size={13} style={{ color: "#07845A" }} />
            </div>
          </div>
          {stats.monthlyRevenue.length > 0
            ? <MiniBar data={stats.monthlyRevenue.map(d => ({ month: d.month, value: d.amount }))} colorKey="#07845A" />
            : <div className="h-16 flex items-center justify-center text-xs text-[#94A3B8]">No revenue yet</div>}
        </div>

        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#172B24]">Company Growth</h3>
              <p className="text-xs text-[#94A3B8]">New companies per month</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#DBEAFE" }}>
              <Building2 size={13} style={{ color: "#3B82F6" }} />
            </div>
          </div>
          {stats.monthlyGrowth.length > 0
            ? <MiniBar data={stats.monthlyGrowth.map(d => ({ month: d.month, value: d.companies }))} colorKey="#3B82F6" />
            : <div className="h-16 flex items-center justify-center text-xs text-[#94A3B8]">No data yet</div>}
        </div>

        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <h3 className="text-sm font-bold text-[#172B24] mb-1">Plan Distribution</h3>
          <p className="text-xs text-[#94A3B8] mb-4">Companies by plan tier</p>
          <div className="space-y-3">
            {stats.planDist.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-4">No data</p>
            ) : stats.planDist.map((p) => {
              const total = Math.max(stats.totalCompanies, 1);
              const pct = Math.round((p.value / total) * 100);
              const col = PLAN_COLORS[p.name] ?? "#94A3B8";
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: col }} />
                      <span className="text-xs font-semibold text-[#475569]">{p.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#172B24]">{p.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "#F1F5F9" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: col }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expiry Alert */}
      {expiringSoon.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-500" />
            <h3 className="text-sm font-bold text-amber-800">
              {expiringSoon.length} subscription{expiringSoon.length > 1 ? "s" : ""} expiring within 7 days
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiringSoon.map(c => (
              <Link key={c.id} href="/super-admin/companies"
                className="inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:shadow transition-all"
                style={{ border: "1px solid #FDE68A" }}>
                {c.name}
                <span className="text-amber-600">{daysLeft(c.planExpiresAt)}d left</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Companies Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#E3F6EB" }}>
              <Building2 size={13} style={{ color: "#07845A" }} />
            </div>
            <h3 className="text-sm font-bold text-[#172B24]">All Companies</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#E3F6EB", color: "#07845A" }}>
              {stats.totalCompanies}
            </span>
          </div>
          <Link href="/super-admin/companies"
            className="flex items-center gap-1 text-xs font-semibold transition-colors"
            style={{ color: "#07845A" }}>
            Manage All <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["Company", "Domain", "Plan", "Employees", "Expiry", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#94A3B8]">
                    No companies onboarded yet
                  </td>
                </tr>
              ) : stats.recentCompanies.map((c) => {
                const st = statusInfo(c);
                const StatusIcon = st.icon;
                const days = daysLeft(c.planExpiresAt);
                const planColor = PLAN_COLORS[c.plan] ?? "#64748B";
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-[#FAFAFA] transition-colors"
                    style={{ borderColor: "#F1F5F9" }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
                          style={{ background: "#07845A" }}>
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-[#172B24]">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                        style={{ background: "#E3F6EB", color: "#07845A" }}>
                        {c.domain}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ background: planColor }}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-[#94A3B8]" />
                        <span className="text-sm font-semibold text-[#172B24]">{c._count.employees}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.planExpiresAt ? (
                        <span className={`text-xs font-medium ${days !== null && days <= 7 ? "text-amber-600 font-bold" : "text-[#64748B]"}`}>
                          {new Date(c.planExpiresAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                          {days !== null && days >= 0 && days <= 7 && <span className="ml-1 text-amber-500">({days}d)</span>}
                        </span>
                      ) : <span className="text-xs text-[#CBD5E1]">No expiry</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: st.bg, color: st.color }}>
                        <StatusIcon size={9} /> {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
