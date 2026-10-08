"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, UserCheck, UserMinus, Clock, ArrowUpRight, CheckCircle2,
  XCircle, AlertTriangle, TrendingUp, DollarSign, Plus, Search,
  Bell, Calendar, Loader2, Activity, ChevronRight, Star,
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type AttendanceTrend = { day: string; present: number; late: number; absent: number };
type LeaveDetail = {
  id: string;
  employee: { firstName: string; lastName: string; designation: string };
  leaveType: { name: string; color: string };
  startDate: string; endDate: string; reason: string;
};
type Joiner = { firstName: string; lastName: string; designation: string; joiningDate: string; department?: { name: string } };
type Stats = {
  totalEmployees: number; presentToday: number; onLeave: number; pendingRequests: number;
  lateToday: number; absentToday: number; attendanceRate: number;
  departments: { id: string; name: string; _count: { employees: number } }[];
  recentAttendance: any[];
  pendingLeaveDetails: LeaveDetail[];
  totalPayroll: number;
  recentJoiners: Joiner[];
  attendanceTrend: AttendanceTrend[];
  leaveDistribution: { name: string; value: number; color: string }[];
};

function AttendanceBar({ data }: { data: AttendanceTrend[] }) {
  const max = Math.max(...data.map(d => d.present + d.late + d.absent), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => {
        const total = d.present + d.late + d.absent;
        const h = Math.max((total / max) * 96, 4);
        const pPct = total > 0 ? (d.present / total) * 100 : 0;
        const lPct = total > 0 ? (d.late / total) * 100 : 0;
        const aPct = total > 0 ? (d.absent / total) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="relative w-full flex flex-col-reverse rounded-t-md overflow-hidden" style={{ height: h }}>
              {d.present > 0 && (
                <div style={{ height: `${pPct}%`, background: "linear-gradient(180deg,#22c55e,#16A34A)" }} />
              )}
              {d.late > 0 && (
                <div style={{ height: `${lPct}%`, background: "#F59E0B" }} />
              )}
              {d.absent > 0 && (
                <div style={{ height: `${aPct}%`, background: "#EF4444", opacity: 0.7 }} />
              )}
              {total === 0 && <div className="h-full" style={{ background: "#E5EDE9" }} />}
            </div>
            <span className="text-[9px] font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function MiniDonut({ pct, color }: { pct: number; color: string }) {
  const r = 18; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" className="flex-shrink-0">
      <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      <text x={22} y={22} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={9} fontWeight={700}>{pct}%</text>
    </svg>
  );
}

function DeptBar({ depts, total }: { depts: Stats["departments"]; total: number }) {
  const colors = ["#22c55e", "#3B82F6", "#F59E0B", "#7C3AED", "#EF4444", "#06b6d4"];
  return (
    <div className="space-y-3">
      {depts.slice(0, 6).map((d, i) => {
        const pct = total > 0 ? Math.round((d._count.employees / total) * 100) : 0;
        return (
          <div key={d.id}>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-white/70">{d.name}</span>
              <span className="text-xs font-bold text-white">{d._count.employees}</span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { companyId, companyName, userName, status } = useCompany();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeLeaveTab, setActiveLeaveTab] = useState<"pending" | "approved">("pending");

  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/dashboard-stats?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); setTimeout(() => setMounted(true), 60); })
      .catch(() => setLoading(false));
  }, [companyId]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col h-full" style={{ background: "#F0F4F2" }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#16A34A]" />
            <p className="text-sm text-[#6B8C7A]">Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  const s = stats;
  const absent = s ? Math.max(0, s.totalEmployees - s.presentToday - s.onLeave - s.lateToday) : 0;

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#F0F4F2", opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease" }}
    >
      {/* ── Top Header ── */}
      <header
        className="h-[64px] flex items-center px-5 gap-4 flex-shrink-0"
        style={{ background: "white", borderBottom: "1px solid #E2ECE7", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
      >
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BB8A8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search employees, departments…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:border-[#16A34A] transition-all"
            style={{ background: "#F5F9F6", borderColor: "#E2ECE7" }}
          />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <button className="relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors hover:bg-[#F5F9F6]"
            style={{ borderColor: "#E2ECE7" }}>
            <Bell size={15} className="text-[#6B8C7A]" />
            {(s?.pendingRequests ?? 0) > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          <Link href="/employees/new"
            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
            <Plus size={14} /> Add Employee
          </Link>
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Welcome + Date */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0D1F15]">
              {greeting()}, {userName?.split(" ")[0] || "Admin"} 👋
            </h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">
              {companyName} • {new Date().toLocaleDateString("en-PK", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <Link href="/leave"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-md"
            style={{ background: "white", border: "1px solid #E2ECE7", color: "#0D1F15" }}>
            <Calendar size={13} className="text-[#16A34A]" />
            Leave Requests
            {(s?.pendingRequests ?? 0) > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {s?.pendingRequests}
              </span>
            )}
          </Link>
        </div>

        {/* ── KPI Cards (4 — dark gradient) ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Total Employees", value: s?.totalEmployees ?? 0,
              sub: "Active headcount", icon: Users,
              gradient: "linear-gradient(135deg,#071A10 0%,#16A34A 100%)",
            },
            {
              label: "Present Today", value: s?.presentToday ?? 0,
              sub: `${s?.attendanceRate ?? 0}% attendance rate`, icon: UserCheck,
              gradient: "linear-gradient(135deg,#1a3a5f 0%,#3B82F6 100%)",
            },
            {
              label: "On Leave", value: s?.onLeave ?? 0,
              sub: "Approved leaves today", icon: UserMinus,
              gradient: "linear-gradient(135deg,#451a03 0%,#d97706 100%)",
            },
            {
              label: "Pending Approvals", value: s?.pendingRequests ?? 0,
              sub: "Leave requests awaiting", icon: Clock,
              gradient: "linear-gradient(135deg,#2d1f5e 0%,#7C3AED 100%)",
            },
          ].map((k, i) => (
            <div
              key={k.label}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: k.gradient, boxShadow: "0 4px 20px rgba(0,0,0,0.18)", animationDelay: `${i * 70}ms`, animation: "fadeUp 0.45s ease both" }}
            >
              <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <k.icon size={17} className="text-white" />
                </div>
                <p className="text-3xl font-black text-white leading-none">{k.value}</p>
                <p className="text-xs font-bold text-white/70 mt-1.5">{k.label}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 2: Attendance Trend (dark) + Today Summary + Dept ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Attendance Trend — dark card */}
          <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#071A10 0%,#0A2A1A 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "fadeUp 0.45s ease both", animationDelay: "120ms" }}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold text-white">Attendance Trend</h3>
                <p className="text-[11px] text-white/40">Last 7 days</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-semibold">
                <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Present</span>
                <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Late</span>
                <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Absent</span>
              </div>
            </div>
            {s?.attendanceTrend && s.attendanceTrend.length > 0 ? (
              <AttendanceBar data={s.attendanceTrend} />
            ) : (
              <div className="h-28 flex items-center justify-center text-white/30 text-xs">No attendance recorded yet</div>
            )}
            <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { label: "On-Time", value: s?.presentToday ?? 0, color: "text-green-400" },
                { label: "Late", value: s?.lateToday ?? 0, color: "text-amber-400" },
                { label: "Absent", value: absent, color: "text-red-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
                  <span className="text-[10px] text-white/40 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Summary (donut-like) */}
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.18)", animation: "fadeUp 0.45s ease both", animationDelay: "180ms" }}>
            <h3 className="text-sm font-bold text-white mb-0.5">Today's Overview</h3>
            <p className="text-[11px] text-white/40 mb-5">Real-time attendance</p>
            <div className="flex flex-col gap-4">
              {[
                { label: "Present", value: s?.presentToday ?? 0, total: s?.totalEmployees ?? 1, color: "#22c55e" },
                { label: "On Leave", value: s?.onLeave ?? 0, total: s?.totalEmployees ?? 1, color: "#F59E0B" },
                { label: "Late", value: s?.lateToday ?? 0, total: s?.totalEmployees ?? 1, color: "#f97316" },
                { label: "Absent", value: absent, total: s?.totalEmployees ?? 1, color: "#EF4444" },
              ].map(item => {
                const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <MiniDonut pct={pct} color={item.color} />
                    <div>
                      <p className="text-xs font-bold text-white">{item.label}</p>
                      <p className="text-[10px] text-white/40">{item.value} employees</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Row 3: Dept + Leave Distribution + Payroll ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Department Headcount */}
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#2d1f5e 0%,#4c1d95 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.18)", animation: "fadeUp 0.45s ease both", animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Departments</h3>
                <p className="text-[11px] text-white/40">Headcount by team</p>
              </div>
              <Link href="/departments" className="text-[10px] font-bold text-purple-300 hover:text-white flex items-center gap-1">
                View All <ChevronRight size={10} />
              </Link>
            </div>
            {s?.departments && s.departments.length > 0 ? (
              <DeptBar depts={s.departments} total={s.totalEmployees} />
            ) : (
              <div className="h-24 flex items-center justify-center text-white/30 text-xs">No departments yet</div>
            )}
          </div>

          {/* Leave Distribution */}
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#451a03 0%,#92400e 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.18)", animation: "fadeUp 0.45s ease both", animationDelay: "140ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Leave Distribution</h3>
                <p className="text-[11px] text-white/40">By leave type</p>
              </div>
              <Link href="/leave-types" className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1">
                Manage <ChevronRight size={10} />
              </Link>
            </div>
            {s?.leaveDistribution && s.leaveDistribution.length > 0 ? (
              <div className="space-y-3">
                {s.leaveDistribution.map((ld, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ld.color || "#F59E0B" }} />
                        <span className="text-xs text-white/70 font-medium">{ld.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{ld.value}</span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${Math.min(ld.value * 8, 100)}%`, background: ld.color || "#F59E0B" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-white/30 text-xs">No leave requests yet</div>
            )}
          </div>

          {/* Payroll Summary */}
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#071A10 0%,#064E3B 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.18)", animation: "fadeUp 0.45s ease both", animationDelay: "180ms" }}>
            <h3 className="text-sm font-bold text-white mb-0.5">Payroll Overview</h3>
            <p className="text-[11px] text-white/40 mb-5">Monthly cost estimate</p>
            <div className="flex items-end gap-3 mb-5">
              <div>
                <p className="text-2xl font-black text-white">
                  PKR {((s?.totalPayroll ?? 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] text-white/40 mt-0.5">Total monthly salary</p>
              </div>
              <div className="mb-1 flex items-center gap-1 text-green-400 text-xs font-bold">
                <TrendingUp size={12} />
                Active
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Employees", value: s?.totalEmployees ?? 0, sub: "On payroll" },
                { label: "Avg Salary", value: s?.totalEmployees ? `PKR ${Math.round((s.totalPayroll / s.totalEmployees) / 1000)}K` : "N/A", sub: "Per employee" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div>
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-white/40">{item.sub}</p>
                  </div>
                  <p className="text-sm font-black text-green-400">{item.value}</p>
                </div>
              ))}
              <Link href="/payroll"
                className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: "rgba(22,163,74,0.25)", border: "1px solid rgba(22,163,74,0.4)" }}>
                <DollarSign size={12} /> View Payroll <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Row 4: Pending Leaves + Recent Check-ins + New Joiners ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Pending Leave Approvals */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7", animation: "fadeUp 0.45s ease both", animationDelay: "80ms" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#071A10,#0A2A1A)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-green-400" />
                <span className="text-sm font-bold text-white">Pending Leaves</span>
                {(s?.pendingRequests ?? 0) > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                    {s?.pendingRequests}
                  </span>
                )}
              </div>
              <Link href="/leave" className="text-[10px] font-bold text-green-400 hover:text-green-300 flex items-center gap-0.5">
                All <ChevronRight size={10} />
              </Link>
            </div>
            <div className="divide-y divide-[#F0F4F2]">
              {s?.pendingLeaveDetails && s.pendingLeaveDetails.length > 0 ? (
                s.pendingLeaveDetails.map((lr) => (
                  <div key={lr.id} className="px-4 py-3 hover:bg-[#F5F9F6] transition-colors">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}
                      >
                        {lr.employee.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0D1F15] truncate">
                          {lr.employee.firstName} {lr.employee.lastName}
                        </p>
                        <p className="text-[10px] text-[#9BB8A8] truncate">{lr.employee.designation}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ background: lr.leaveType.color || "#16A34A" }}>
                            {lr.leaveType.name}
                          </span>
                          <span className="text-[9px] text-[#9BB8A8]">
                            {new Date(lr.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}
                            {lr.endDate !== lr.startDate && ` – ${new Date(lr.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Link href="/leave"
                          className="text-[9px] font-bold px-2 py-1 rounded-lg text-white"
                          style={{ background: "#16A34A" }}>
                          Approve
                        </Link>
                        <Link href="/leave"
                          className="text-[9px] font-bold px-2 py-1 rounded-lg text-center"
                          style={{ background: "#FEF2F2", color: "#EF4444" }}>
                          Reject
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-[#9BB8A8]">No pending requests</div>
              )}
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7", animation: "fadeUp 0.45s ease both", animationDelay: "140ms" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#1e3a5f,#1e40af)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-blue-300" />
                <span className="text-sm font-bold text-white">Today's Check-ins</span>
              </div>
              <Link href="/attendance" className="text-[10px] font-bold text-blue-300 hover:text-blue-200 flex items-center gap-0.5">
                All <ChevronRight size={10} />
              </Link>
            </div>
            <div className="divide-y divide-[#F0F4F2]">
              {s?.recentAttendance && s.recentAttendance.length > 0 ? (
                s.recentAttendance.map((a: any) => {
                  const statusStyle = a.status === "PRESENT"
                    ? { bg: "rgba(22,163,74,0.1)", color: "#16A34A" }
                    : a.status === "LATE"
                    ? { bg: "rgba(245,158,11,0.1)", color: "#F59E0B" }
                    : { bg: "rgba(239,68,68,0.1)", color: "#EF4444" };
                  return (
                    <div key={a.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[#F5F9F6] transition-colors">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#1e40af,#3B82F6)" }}
                      >
                        {a.employee.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0D1F15] truncate">
                          {a.employee.firstName} {a.employee.lastName}
                        </p>
                        <p className="text-[10px] text-[#9BB8A8] truncate">{a.employee.department?.name ?? "—"}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono font-bold text-[#0D1F15]">
                          {a.checkIn ? new Date(a.checkIn).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-xs text-[#9BB8A8]">No check-ins today yet</div>
              )}
            </div>
          </div>

          {/* New Joiners */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7", animation: "fadeUp 0.45s ease both", animationDelay: "200ms" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#2d1f5e,#4c1d95)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-purple-300" />
                <span className="text-sm font-bold text-white">Recent Joiners</span>
              </div>
              <Link href="/employees" className="text-[10px] font-bold text-purple-300 hover:text-purple-200 flex items-center gap-0.5">
                All <ChevronRight size={10} />
              </Link>
            </div>
            <div className="divide-y divide-[#F0F4F2]">
              {s?.recentJoiners && s.recentJoiners.length > 0 ? (
                s.recentJoiners.map((j, i) => (
                  <div key={i} className="px-4 py-3.5 flex items-center gap-3 hover:bg-[#F5F9F6] transition-colors">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#4c1d95,#7C3AED)" }}
                    >
                      {j.firstName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0D1F15] truncate">{j.firstName} {j.lastName}</p>
                      <p className="text-[10px] text-[#9BB8A8] truncate">{j.designation}</p>
                      {j.department && <p className="text-[9px] text-[#C5D9CE] truncate">{j.department.name}</p>}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[9px] text-[#9BB8A8]">Joined</p>
                      <p className="text-[10px] font-bold text-[#0D1F15]">
                        {new Date(j.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-[#9BB8A8]">No recent joiners</div>
              )}
              <div className="px-4 py-3">
                <Link href="/employees/new"
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-white w-full transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#4c1d95,#7C3AED)" }}>
                  <Plus size={12} /> Add New Employee
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 5: Quick Actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Mark Attendance", href: "/attendance", icon: CheckCircle2, color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
            { label: "Leave Approvals", href: "/leave", icon: Calendar, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
            { label: "Run Payroll", href: "/payroll", icon: DollarSign, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
            { label: "Add Department", href: "/departments", icon: Users, color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
          ].map(q => (
            <Link key={q.label} href={q.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ border: "1px solid #E2ECE7", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: q.bg }}>
                <q.icon size={16} style={{ color: q.color }} />
              </div>
              <span className="text-xs font-bold text-[#0D1F15]">{q.label}</span>
              <ArrowUpRight size={12} className="ml-auto text-[#C5D9CE]" />
            </Link>
          ))}
        </div>

      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
