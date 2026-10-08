"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2, Users, TrendingUp, DollarSign, Loader2, ArrowUpRight,
  CheckCircle2, XCircle, AlertTriangle, Activity, Zap, Crown,
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
  FREE: "#6B8C7A", STARTER: "#3B82F6", BUSINESS: "#16A34A", ENTERPRISE: "#7C3AED",
};
const PLAN_BADGE: Record<string, { bg: string; text: string }> = {
  FREE:       { bg: "rgba(107,140,122,0.12)", text: "#6B8C7A" },
  STARTER:    { bg: "rgba(59,130,246,0.12)",  text: "#3B82F6" },
  BUSINESS:   { bg: "rgba(22,163,74,0.12)",   text: "#16A34A" },
  ENTERPRISE: { bg: "rgba(124,58,237,0.12)",  text: "#7C3AED" },
};

function RevenueBar({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-1.5 h-24 pt-2">
      {data.map((d, i) => (
        <div
          key={d.month}
          className="flex-1 flex flex-col items-center gap-1.5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div
            className="w-full rounded-t-md transition-all duration-500 relative overflow-hidden"
            style={{
              height: `${Math.max((d.amount / max) * 72, 4)}px`,
              background: d.amount > 0
                ? "linear-gradient(180deg, #22c55e 0%, #16A34A 100%)"
                : "#E5EDE9",
            }}
          >
            {d.amount > 0 && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s infinite",
                }}
              />
            )}
          </div>
          <span className="text-[9px] text-[#9BB8A8] truncate w-full text-center font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function GrowthBar({ data }: { data: { month: string; companies: number }[] }) {
  const max = Math.max(...data.map((d) => d.companies), 1);
  return (
    <div className="flex items-end gap-1.5 h-24 pt-2">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${Math.max((d.companies / max) * 72, 4)}px`,
              background: d.companies > 0
                ? "linear-gradient(180deg, #60a5fa 0%, #3B82F6 100%)"
                : "#E5EDE9",
              animationDelay: `${i * 60}ms`,
            }}
          />
          <span className="text-[9px] text-[#9BB8A8] truncate w-full text-center font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return (
    <div className="w-28 h-28 rounded-full mx-auto" style={{ background: "rgba(22,163,74,0.08)", border: "3px solid #E5EDE9" }} />
  );
  let offset = 0;
  const r = 40; const cx = 48; const cy = 48; const circ = 2 * Math.PI * r;
  const colors = ["#16A34A", "#3B82F6", "#7C3AED", "#6B8C7A"];
  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F4F2" strokeWidth={14} />
      {data.map((d, i) => {
        const dash = (d.value / total) * circ;
        const el = (
          <circle key={d.name} cx={cx} cy={cy} r={r} fill="none"
            stroke={colors[i % colors.length]} strokeWidth={14}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
        fill="#0D1F15" fontSize={16} fontWeight={800}>
        {total}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" dominantBaseline="middle"
        fill="#9BB8A8" fontSize={8} fontWeight={600}>
        TOTAL
      </text>
    </svg>
  );
}

function statusInfo(c: Company) {
  if (!c.isActive) return { label: "Paused", color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: XCircle };
  if (c.planExpiresAt && new Date(c.planExpiresAt) < new Date())
    return { label: "Expired", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle };
  return { label: "Active", color: "#16A34A", bg: "rgba(22,163,74,0.1)", icon: CheckCircle2 };
}

function daysLeft(date?: string) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch("/api/super-admin/stats").then(r => r.json()).then(d => {
      setStats(d);
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0A2A1A, #16A34A)" }}>
            <Image src="/nexhr-logo.png" alt="NexHR" width={44} height={22} className="object-contain" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md">
            <Loader2 size={12} className="animate-spin text-[#16A34A]" />
          </div>
        </div>
        <p className="text-sm text-[#6B8C7A] font-medium">Loading dashboard…</p>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Companies", value: stats.totalCompanies, icon: Building2,
      gradient: "linear-gradient(135deg, #0A2A1A 0%, #16A34A 100%)",
      iconBg: "rgba(255,255,255,0.15)", sub: `${stats.activeCompanies} active`,
      badge: stats.activeCompanies, badgeColor: "#22c55e",
    },
    {
      label: "Total Employees", value: stats.totalEmployees, icon: Users,
      gradient: "linear-gradient(135deg, #1e3a5f 0%, #3B82F6 100%)",
      iconBg: "rgba(255,255,255,0.15)", sub: "across all tenants",
      badge: null, badgeColor: "#60a5fa",
    },
    {
      label: "Monthly Revenue", value: `PKR ${stats.mrr.toLocaleString()}`, icon: DollarSign,
      gradient: "linear-gradient(135deg, #2d1f5e 0%, #7C3AED 100%)",
      iconBg: "rgba(255,255,255,0.15)", sub: "this month (MRR)",
      badge: null, badgeColor: "#a78bfa",
    },
    {
      label: "Total Revenue", value: `PKR ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp,
      gradient: "linear-gradient(135deg, #451a03 0%, #d97706 100%)",
      iconBg: "rgba(255,255,255,0.15)", sub: "all time",
      badge: null, badgeColor: "#fbbf24",
    },
  ];

  const statusCards = [
    { label: "Active",   value: stats.activeCompanies,   color: "#16A34A", bg: "rgba(22,163,74,0.08)",   border: "rgba(22,163,74,0.2)",  icon: CheckCircle2 },
    { label: "Paused",   value: stats.pausedCompanies,   color: "#EF4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",  icon: XCircle },
    { label: "Expired",  value: stats.expiredCompanies,  color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)", icon: AlertTriangle },
    { label: "Free Plan",value: stats.planDist.find(p => p.name === "FREE")?.value ?? 0, color: "#6B8C7A", bg: "rgba(107,140,122,0.08)", border: "rgba(107,140,122,0.2)", icon: Activity },
  ];

  const expiringSoon = stats.recentCompanies.filter(c => {
    const d = daysLeft(c.planExpiresAt);
    return d !== null && d >= 0 && d <= 7;
  });

  return (
    <div className="p-6 space-y-5" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease" }}>

      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0A2A1A 0%, #0D3520 50%, #16A34A 100%)",
          boxShadow: "0 8px 32px rgba(10,42,26,0.3)",
        }}
      >
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="absolute -bottom-12 -right-4 w-56 h-56 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />

        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={14} className="text-yellow-400" />
            <span className="text-xs text-green-300 font-bold uppercase tracking-widest">Super Admin Panel</span>
          </div>
          <h1 className="text-xl font-black text-white mb-1">Platform Overview</h1>
          <p className="text-sm text-green-200/70">Monitor all companies, revenue, and subscriptions in real-time.</p>
        </div>

        <div className="relative z-10 flex-shrink-0 hidden sm:flex items-center gap-2">
          <div
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <Zap size={12} className="text-yellow-400" />
            {stats.totalCompanies} companies onboarded
          </div>
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
            <Image src="/nexhr-logo.png" alt="NexHR" width={64} height={64} className="object-contain p-2" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: k.gradient,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              animationDelay: `${i * 80}ms`,
              animation: "fadeUp 0.5s ease both",
            }}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="relative z-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: k.iconBg, backdropFilter: "blur(4px)" }}
              >
                <k.icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-black text-white leading-tight">{k.value}</p>
              <p className="text-xs font-bold text-white/70 mt-1">{k.label}</p>
              <p className="text-[10px] text-white/45 mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-4 gap-3">
        {statusCards.map((s, i) => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              animationDelay: `${i * 60}ms`,
              animation: "fadeUp 0.5s ease both",
            }}
          >
            <s.icon size={16} className="mx-auto mb-2" style={{ color: s.color }} />
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-[#6B8C7A] mt-0.5 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #E5EDE9", animation: "fadeUp 0.5s ease both", animationDelay: "160ms" }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-[#0D1F15]">Monthly Revenue</h3>
              <p className="text-xs text-[#9BB8A8]">PKR earned per month</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(22,163,74,0.1)" }}>
              <TrendingUp size={13} className="text-[#16A34A]" />
            </div>
          </div>
          {stats.monthlyRevenue.length > 0
            ? <RevenueBar data={stats.monthlyRevenue} />
            : <div className="h-24 flex items-center justify-center text-xs text-[#9BB8A8]">No revenue yet</div>
          }
        </div>

        {/* Growth Chart */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #E5EDE9", animation: "fadeUp 0.5s ease both", animationDelay: "220ms" }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-[#0D1F15]">Company Growth</h3>
              <p className="text-xs text-[#9BB8A8]">New onboardings per month</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
              <Building2 size={13} className="text-[#3B82F6]" />
            </div>
          </div>
          {stats.monthlyGrowth.length > 0
            ? <GrowthBar data={stats.monthlyGrowth} />
            : <div className="h-24 flex items-center justify-center text-xs text-[#9BB8A8]">No data yet</div>
          }
        </div>

        {/* Plan Distribution */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #E5EDE9", animation: "fadeUp 0.5s ease both", animationDelay: "280ms" }}
        >
          <h3 className="text-sm font-bold text-[#0D1F15] mb-0.5">Plan Distribution</h3>
          <p className="text-xs text-[#9BB8A8] mb-4">Companies by plan</p>
          <div className="flex flex-col items-center gap-3">
            <DonutChart data={stats.planDist} />
            <div className="w-full space-y-2">
              {stats.planDist.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[p.name] ?? "#8AA398" }} />
                    <span className="text-xs text-[#6B8C7A] font-medium">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.max((p.value / Math.max(stats.totalCompanies, 1)) * 64, 4)}px`,
                        background: PLAN_COLORS[p.name] ?? "#8AA398",
                        opacity: 0.5,
                      }}
                    />
                    <span className="text-xs font-bold text-[#0D1F15] w-4 text-right">{p.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Alert */}
      {expiringSoon.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(251,191,36,0.05) 100%)",
            border: "1px solid rgba(245,158,11,0.25)",
            animation: "fadeUp 0.5s ease both",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
              <AlertTriangle size={13} className="text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-amber-700">
              {expiringSoon.length} subscription{expiringSoon.length > 1 ? "s" : ""} expiring within 7 days
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiringSoon.map(c => (
              <Link
                key={c.id}
                href={`/super-admin/companies`}
                className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 text-xs hover:shadow-md transition-all"
                style={{ border: "1px solid rgba(245,158,11,0.3)" }}
              >
                <span className="font-bold text-[#0D1F15]">{c.name}</span>
                <span className="font-semibold text-amber-600">{daysLeft(c.planExpiresAt)}d left</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Companies Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          border: "1px solid #E5EDE9",
          animation: "fadeUp 0.5s ease both",
          animationDelay: "200ms",
        }}
      >
        {/* Table Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background: "linear-gradient(90deg, #0A2A1A 0%, #0D3520 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Building2 size={13} className="text-green-400" />
            </div>
            <h3 className="text-sm font-bold text-white">All Companies</h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}
            >
              {stats.totalCompanies}
            </span>
          </div>
          <Link
            href="/super-admin/companies"
            className="flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
          >
            Manage All <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAF9", borderBottom: "1px solid #EEF5F1" }}>
                {["Company", "Domain", "Plan", "Employees", "Expiry", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#9BB8A8]">
                    No companies onboarded yet
                  </td>
                </tr>
              ) : stats.recentCompanies.map((c) => {
                const st = statusInfo(c);
                const StatusIcon = st.icon;
                const days = daysLeft(c.planExpiresAt);
                const badge = PLAN_BADGE[c.plan] ?? { bg: "rgba(107,140,122,0.1)", text: "#6B8C7A" };
                return (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-[#F8FAF9] transition-colors"
                    style={{ borderColor: "#EEF5F1" }}
                  >
                    <td className="px-5 py-3.5">
                      <Link href="/super-admin/companies" className="flex items-center gap-2.5 group">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm text-white"
                          style={{ background: "linear-gradient(135deg, #0A2A1A, #16A34A)" }}
                        >
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-[#0D1F15] group-hover:text-[#16A34A] transition-colors">{c.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A" }}
                      >
                        {c.domain}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-[#9BB8A8]" />
                        <span className="text-sm font-semibold text-[#0D1F15]">{c._count.employees}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.planExpiresAt ? (
                        <span className={`text-xs font-medium ${days !== null && days <= 7 ? "text-amber-600 font-bold" : "text-[#6B8C7A]"}`}>
                          {new Date(c.planExpiresAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                          {days !== null && days >= 0 && days <= 7 && (
                            <span className="ml-1 text-amber-500">({days}d)</span>
                          )}
                        </span>
                      ) : <span className="text-xs text-[#C5D9CE]">No expiry</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: st.bg, color: st.color }}
                      >
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
