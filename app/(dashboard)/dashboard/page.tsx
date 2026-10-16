"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users, UserCheck, UserX, Clock, TrendingUp, DollarSign,
  Calendar, CheckCircle2, XCircle, AlertTriangle, Plus,
  ArrowUpRight, ChevronRight, Loader2, BarChart3, Activity,
  UserPlus, Building2,
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";

type Stats = {
  totalEmployees: number; presentToday: number; onLeave: number;
  pendingRequests: number; lateToday: number; absentToday: number;
  attendanceRate: number; totalPayroll: number;
  departments: { id: string; name: string; _count: { employees: number } }[];
  recentAttendance: { status: string; checkIn?: string; checkOut?: string; employee: { firstName: string; lastName: string; employeeId: string; designation: string; department?: { name: string } } }[];
  pendingLeaveDetails: {
    id: string;
    employee: { firstName: string; lastName: string; designation: string };
    leaveType: { name: string; color: string };
    startDate: string; endDate: string; reason: string;
  }[];
  recentJoiners: { firstName: string; lastName: string; designation: string; joiningDate: string; department?: { name: string } }[];
  attendanceTrend: { day: string; present: number; late: number; absent: number }[];
  leaveDistribution: { name: string; value: number; color: string }[];
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "#07845A", LATE: "#F59E0B", ABSENT: "#EF4444", ON_LEAVE: "#3B82F6",
  WORK_FROM_HOME: "#8B5CF6", HALF_DAY: "#F97316",
};

const STATUS_BG: Record<string, string> = {
  PRESENT: "#E3F6EB", LATE: "#FEF3C7", ABSENT: "#FEE2E2", ON_LEAVE: "#DBEAFE",
  WORK_FROM_HOME: "#EDE9FE", HALF_DAY: "#FFEDD5",
};

const AVATAR_COLORS = ["#07845A", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

function Avatar({ name, index, size = 32 }: { name: string; index: number; size?: number }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold"
      style={{ width: size, height: size, background: AVATAR_COLORS[index % AVATAR_COLORS.length], fontSize: size * 0.3 }}
    >
      {initials}
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, color, bg, sub, trend,
}: {
  label: string; value: string | number; icon: any; color: string; bg: string;
  sub?: string; trend?: { value: number; label: string };
}) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
            style={trend.value >= 0
              ? { background: "#E3F6EB", color: "#07845A" }
              : { background: "#FEE2E2", color: "#EF4444" }}
          >
            <TrendingUp size={10} />
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#172B24]">{value}</p>
      <p className="text-sm text-[#64748B] mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-[#94A3B8] mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { companyId, companyName, userName, status: authStatus } = useCompany();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/dashboard-stats?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleLeave = async (id: string, status: "APPROVED" | "REJECTED") => {
    setApprovingId(id);
    await fetch("/api/leave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
    setApprovingId(null);
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const firstName = userName?.split(" ")[0] || "there";

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin" style={{ color: "#07845A" }} />
          <p className="text-sm text-[#64748B]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const deptChartData = (stats?.departments ?? []).map(d => ({ name: d.name.length > 10 ? d.name.slice(0, 10) + "…" : d.name, employees: d._count.employees }));
  const leaveData = (stats?.leaveDistribution ?? []).filter(d => d.value > 0);
  const trendData = (stats?.attendanceTrend ?? []).map(d => ({
    day: d.day, Present: d.present, Late: d.late, Absent: d.absent,
  }));
  const totalEmp = stats?.totalEmployees ?? 0;
  const attendancePct = stats?.attendanceRate ?? 0;

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>

      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #07845A 0%, #0ca870 60%, #10c87a 100%)" }}
      >
        <div>
          <p className="text-green-100 text-sm font-medium">{dateStr}</p>
          <h1 className="text-2xl font-bold text-white mt-1">{greeting}, {firstName}! 👋</h1>
          <p className="text-green-100 text-sm mt-1">Here&apos;s what&apos;s happening at {companyName} today.</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/employees/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <Plus size={15} /> Add Employee
          </Link>
          <Link
            href="/leave"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white transition-all"
            style={{ color: "#07845A" }}
          >
            <Calendar size={15} /> Leave Requests
            {(stats?.pendingRequests ?? 0) > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: "#EF4444" }}>
                {stats!.pendingRequests}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees" value={totalEmp}
          icon={Users} color="#07845A" bg="#E3F6EB"
          trend={{ value: 8, label: "vs last month" }}
        />
        <StatCard
          label="Present Today" value={stats?.presentToday ?? 0}
          icon={UserCheck} color="#3B82F6" bg="#DBEAFE"
          sub={`${attendancePct}% attendance rate`}
        />
        <StatCard
          label="On Leave" value={stats?.onLeave ?? 0}
          icon={Calendar} color="#F59E0B" bg="#FEF3C7"
          sub={`${stats?.pendingRequests ?? 0} pending requests`}
        />
        <StatCard
          label="Absent Today" value={stats?.absentToday ?? 0}
          icon={UserX} color="#EF4444" bg="#FEE2E2"
          sub={`${stats?.lateToday ?? 0} arrived late`}
        />
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Late Arrivals" value={stats?.lateToday ?? 0}
          icon={Clock} color="#F97316" bg="#FFEDD5"
        />
        <StatCard
          label="Pending Approvals" value={stats?.pendingRequests ?? 0}
          icon={AlertTriangle} color="#EF4444" bg="#FEE2E2"
        />
        <StatCard
          label="Departments" value={stats?.departments?.length ?? 0}
          icon={Building2} color="#8B5CF6" bg="#EDE9FE"
        />
        <StatCard
          label="Monthly Payroll" value={`PKR ${((stats?.totalPayroll ?? 0) / 1000).toFixed(0)}K`}
          icon={DollarSign} color="#06B6D4" bg="#CFFAFE"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Attendance Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B24]">Attendance Trend</h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Last 7 days overview</p>
            </div>
            <Link href="/attendance" className="text-xs font-semibold flex items-center gap-1" style={{ color: "#07845A" }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {trendData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-[#94A3B8]">No attendance data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Bar dataKey="Present" fill="#07845A" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Late" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Absent" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2">
            {[{ label: "Present", color: "#07845A" }, { label: "Late", color: "#F59E0B" }, { label: "Absent", color: "#EF4444" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-[11px] text-[#64748B]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B24]">By Department</h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Employee distribution</p>
            </div>
            <Link href="/departments" className="text-xs font-semibold flex items-center gap-1" style={{ color: "#07845A" }}>
              View <ArrowUpRight size={12} />
            </Link>
          </div>
          {deptChartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-[#94A3B8]">No departments yet</div>
          ) : (
            <div className="space-y-3">
              {(stats?.departments ?? []).slice(0, 6).map((d, i) => {
                const pct = totalEmp > 0 ? Math.round((d._count.employees / totalEmp) * 100) : 0;
                return (
                  <div key={d.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#475569] truncate max-w-[120px]">{d.name}</span>
                      <span className="text-xs font-semibold text-[#172B24]">{d._count.employees}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: "#F1F5F9" }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Leave Distribution Pie */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B24]">Leave Utilization</h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">By leave type</p>
            </div>
          </div>
          {leaveData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-[#94A3B8]">No leave data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={leaveData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {leaveData.map((entry, i) => (
                      <Cell key={i} fill={entry.color || AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {leaveData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color || AVATAR_COLORS[i % AVATAR_COLORS.length] }} />
                      <span className="text-[11px] text-[#64748B]">{d.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#172B24]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B24]">Today&apos;s Check-ins</h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Recent attendance activity</p>
            </div>
            <Link href="/attendance" className="text-xs font-semibold flex items-center gap-1" style={{ color: "#07845A" }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {(stats?.recentAttendance ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Activity size={24} className="text-[#CBD5E1] mb-2" />
              <p className="text-xs text-[#94A3B8]">No check-ins recorded yet today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentAttendance ?? []).slice(0, 5).map((a, i) => {
                const statusColor = STATUS_COLORS[a.status] ?? "#64748B";
                const statusBg = STATUS_BG[a.status] ?? "#F1F5F9";
                const checkInTime = a.checkIn ? new Date(a.checkIn).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—";
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar name={`${a.employee.firstName} ${a.employee.lastName}`} index={i} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#172B24] truncate">
                        {a.employee.firstName} {a.employee.lastName}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">{checkInTime}</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: statusBg, color: statusColor }}
                    >
                      {a.status === "PRESENT" ? "Present" : a.status === "LATE" ? "Late" : a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <h2 className="text-sm font-bold text-[#172B24] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: "/employees/new", label: "Add Employee", icon: UserPlus, color: "#07845A", bg: "#E3F6EB" },
              { href: "/leave", label: "Leave Requests", icon: Calendar, color: "#F59E0B", bg: "#FEF3C7" },
              { href: "/payroll", label: "Run Payroll", icon: DollarSign, color: "#3B82F6", bg: "#DBEAFE" },
              { href: "/attendance", label: "Attendance", icon: UserCheck, color: "#8B5CF6", bg: "#EDE9FE" },
              { href: "/reports", label: "Reports", icon: BarChart3, color: "#06B6D4", bg: "#CFFAFE" },
              { href: "/settings", label: "Settings", icon: Building2, color: "#64748B", bg: "#F1F5F9" },
            ].map(q => (
              <Link
                key={q.href}
                href={q.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all hover:scale-[1.02]"
                style={{ background: q.bg }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm">
                  <q.icon size={16} style={{ color: q.color }} />
                </div>
                <span className="text-[11px] font-semibold" style={{ color: q.color }}>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Fourth row: Pending Leaves + Recent Joiners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pending Leave Requests */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <h2 className="text-sm font-bold text-[#172B24]">Pending Leave Requests</h2>
              <p className="text-[11px] text-[#64748B]">{stats?.pendingRequests ?? 0} awaiting approval</p>
            </div>
            <Link href="/leave" className="text-xs font-semibold flex items-center gap-1" style={{ color: "#07845A" }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {(stats?.pendingLeaveDetails ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <CheckCircle2 size={28} className="text-[#CBD5E1] mb-2" />
              <p className="text-xs text-[#94A3B8]">All leave requests have been processed</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
              {(stats?.pendingLeaveDetails ?? []).slice(0, 4).map((req, i) => (
                <div key={req.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAFA] transition-colors">
                  <Avatar name={`${req.employee.firstName} ${req.employee.lastName}`} index={i} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#172B24]">{req.employee.firstName} {req.employee.lastName}</p>
                    <p className="text-[10px] text-[#64748B]">{req.employee.designation}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: req.leaveType.color || "#07845A" }}>
                        {req.leaveType.name}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {new Date(req.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}
                        {req.endDate !== req.startDate && ` – ${new Date(req.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleLeave(req.id, "APPROVED")}
                      disabled={approvingId === req.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: "#E3F6EB" }}
                      title="Approve"
                    >
                      {approvingId === req.id
                        ? <Loader2 size={12} className="animate-spin text-[#07845A]" />
                        : <CheckCircle2 size={13} style={{ color: "#07845A" }} />
                      }
                    </button>
                    <button
                      onClick={() => handleLeave(req.id, "REJECTED")}
                      disabled={approvingId === req.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: "#FEE2E2" }}
                      title="Reject"
                    >
                      <XCircle size={13} style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Joiners */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <h2 className="text-sm font-bold text-[#172B24]">Recent Employees</h2>
              <p className="text-[11px] text-[#64748B]">Latest additions to your team</p>
            </div>
            <Link href="/employees" className="text-xs font-semibold flex items-center gap-1" style={{ color: "#07845A" }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {(stats?.recentJoiners ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <Users size={28} className="text-[#CBD5E1] mb-2" />
              <p className="text-xs text-[#94A3B8]">No employees added yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
              {(stats?.recentJoiners ?? []).map((e, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAFA] transition-colors">
                  <Avatar name={`${e.firstName} ${e.lastName}`} index={i} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#172B24]">{e.firstName} {e.lastName}</p>
                    <p className="text-[10px] text-[#64748B]">{e.designation}</p>
                    {e.department && (
                      <p className="text-[10px] text-[#94A3B8]">{e.department.name}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "#E3F6EB", color: "#07845A" }}>
                      New
                    </span>
                    <p className="text-[10px] text-[#94A3B8] mt-1">
                      {e.joiningDate ? new Date(e.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Companies", value: "—", sub: "Super Admin only", icon: Building2, color: "#8B5CF6" },
          { label: "Departments", value: stats?.departments?.length ?? 0, sub: "In your company", icon: Building2, color: "#07845A" },
          { label: "Attendance Rate", value: `${attendancePct}%`, sub: "Today", icon: UserCheck, color: "#3B82F6" },
          { label: "Open Positions", value: "—", sub: "Recruitment module soon", icon: TrendingUp, color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3" style={{ border: "1px solid #E2E8F0" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#F8FAFC" }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#172B24]">{s.value}</p>
              <p className="text-[10px] text-[#94A3B8] truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
