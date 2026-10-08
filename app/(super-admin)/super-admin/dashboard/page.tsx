"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2, Users, TrendingUp, DollarSign, Loader2, ArrowUpRight,
  CheckCircle2, XCircle, Clock, AlertTriangle, Activity,
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
  FREE: "#8AA398", STARTER: "#3B82F6", BUSINESS: "#16A34A", ENTERPRISE: "#7C3AED",
};
const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  STARTER: "bg-blue-50 text-blue-600",
  BUSINESS: "bg-green-50 text-green-700",
  ENTERPRISE: "bg-purple-50 text-purple-700",
};

function MiniBar({ data, color = "#16A34A" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all"
            style={{ height: `${Math.max((d.value / max) * 52, 4)}px`, backgroundColor: color, opacity: 0.85 }}
          />
          <span className="text-[9px] text-[#9BB8A8] truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="w-24 h-24 rounded-full bg-[#F4F8F6] mx-auto" />;
  let offset = 0;
  const r = 36; const cx = 44; const cy = 44; const circ = 2 * Math.PI * r;
  const colors = ["#16A34A", "#3B82F6", "#7C3AED", "#F59E0B"];
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F9F3" strokeWidth={14} />
      {data.map((d, i) => {
        const dash = (d.value / total) * circ;
        const el = (
          <circle key={d.name} cx={cx} cy={cy} r={r} fill="none"
            stroke={colors[i % colors.length]} strokeWidth={14}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset} transform={`rotate(-90 ${cx} ${cy})`} />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        className="text-xs font-bold" fill="#0D1F15" fontSize={13} fontWeight={700}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
        fill="#9BB8A8" fontSize={8}>
        total
      </text>
    </svg>
  );
}

function statusInfo(c: Company) {
  if (!c.isActive) return { label: "Paused", cls: "bg-red-50 text-red-500 border-red-200", icon: XCircle };
  if (c.planExpiresAt && new Date(c.planExpiresAt) < new Date())
    return { label: "Expired", cls: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertTriangle };
  return { label: "Active", cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 };
}

function daysLeft(date?: string) {
  if (!date) return null;
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/stats").then(r => r.json()).then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={28} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  const kpis = [
    { label: "Total Companies", value: stats.totalCompanies, icon: Building2, color: "#16A34A", sub: `${stats.activeCompanies} active` },
    { label: "Total Employees", value: stats.totalEmployees, icon: Users, color: "#3B82F6", sub: "across all tenants" },
    { label: "Monthly Revenue", value: `PKR ${stats.mrr.toLocaleString()}`, icon: DollarSign, color: "#7C3AED", sub: "this month" },
    { label: "Total Revenue", value: `PKR ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "#F59E0B", sub: "all time" },
  ];

  const statusCards = [
    { label: "Active", value: stats.activeCompanies, color: "#16A34A", bg: "#F0F9F3" },
    { label: "Paused", value: stats.pausedCompanies, color: "#EF4444", bg: "#FFF5F5" },
    { label: "Expired", value: stats.expiredCompanies, color: "#F59E0B", bg: "#FFFBEB" },
    { label: "Free Plan", value: stats.planDist.find(p => p.name === "FREE")?.value ?? 0, color: "#8AA398", bg: "#F4F8F6" },
  ];

  // Expiring soon (within 7 days)
  const expiringSoon = stats.recentCompanies.filter(c => {
    const d = daysLeft(c.planExpiresAt);
    return d !== null && d >= 0 && d <= 7;
  });

  return (
    <div className="p-6 space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#E5EDE9] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: k.color + "18" }}>
                <k.icon size={18} style={{ color: k.color }} />
              </div>
              <Activity size={12} className="text-[#9BB8A8]" />
            </div>
            <p className="text-2xl font-bold text-[#0D1F15]">{k.value}</p>
            <p className="text-xs font-semibold text-[#6B8C7A] mt-0.5">{k.label}</p>
            <p className="text-[10px] text-[#9BB8A8] mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-3">
        {statusCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#E5EDE9] p-4 text-center" style={{ backgroundColor: s.bg }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#6B8C7A] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Monthly Company Growth */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5EDE9] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0D1F15]">Company Growth</h3>
              <p className="text-xs text-[#9BB8A8]">New onboardings per month</p>
            </div>
          </div>
          {stats.monthlyGrowth.length > 0 ? (
            <MiniBar data={stats.monthlyGrowth.map(m => ({ label: m.month, value: m.companies }))} color="#16A34A" />
          ) : (
            <div className="h-16 flex items-center justify-center text-xs text-[#9BB8A8]">No data yet</div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0D1F15] mb-1">Plan Distribution</h3>
          <p className="text-xs text-[#9BB8A8] mb-4">Companies by plan</p>
          <div className="flex flex-col items-center gap-3">
            <DonutChart data={stats.planDist} />
            <div className="w-full space-y-1.5">
              {stats.planDist.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[p.name] ?? "#8AA398" }} />
                    <span className="text-[#6B8C7A]">{p.name}</span>
                  </div>
                  <span className="font-bold text-[#0D1F15]">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-amber-700">{expiringSoon.length} subscription{expiringSoon.length > 1 ? "s" : ""} expiring within 7 days</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiringSoon.map(c => (
              <Link key={c.id} href={`/super-admin/companies/${c.id}`}
                className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs hover:border-amber-400 transition-colors">
                <span className="font-semibold text-[#0D1F15]">{c.name}</span>
                <span className="text-amber-600">{daysLeft(c.planExpiresAt)}d left</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Companies Table */}
      <div className="bg-white rounded-2xl border border-[#E5EDE9] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF5F1]">
          <h3 className="text-sm font-bold text-[#0D1F15]">All Companies</h3>
          <Link href="/super-admin/companies"
            className="flex items-center gap-1 text-xs font-semibold text-[#16A34A] hover:text-[#15803D]">
            Manage <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#EEF5F1]">
                {["Company", "Domain", "Plan", "Employees", "Expiry", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF5F1]">
              {stats.recentCompanies.map((c) => {
                const st = statusInfo(c);
                const StatusIcon = st.icon;
                const days = daysLeft(c.planExpiresAt);
                return (
                  <tr key={c.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/super-admin/companies/${c.id}`} className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 rounded-lg bg-[#F0F9F3] border border-[#C6E9D3] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#16A34A] font-bold text-xs">{c.name[0]?.toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#0D1F15] group-hover:text-[#16A34A] transition-colors">{c.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-[#16A34A] bg-[#F0F9F3] px-2 py-0.5 rounded-md">{c.domain}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_BADGE[c.plan] ?? "bg-gray-100 text-gray-600"}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#0D1F15]">{c._count.employees}</td>
                    <td className="px-5 py-3.5">
                      {c.planExpiresAt ? (
                        <span className={`text-xs ${days !== null && days <= 7 ? "text-amber-600 font-semibold" : "text-[#6B8C7A]"}`}>
                          {new Date(c.planExpiresAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                          {days !== null && days >= 0 && days <= 7 && ` (${days}d)`}
                        </span>
                      ) : <span className="text-xs text-[#9BB8A8]">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.cls}`}>
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
