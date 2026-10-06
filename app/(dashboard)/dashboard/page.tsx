"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, UserMinus, Clock, MapPin, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Stats = {
  totalEmployees: number; presentToday: number; onLeave: number;
  pendingRequests: number; attendanceRate: number;
  departments: { id: string; name: string; _count: { employees: number } }[];
  recentAttendance: any[];
};

const COLORS = ["#16A34A", "#EF4444", "#F59E0B", "#3B82F6"];

export default function DashboardPage() {
  const { companyId, companyName, userName, status } = useCompany();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/dashboard-stats?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const pieData = stats ? [
    { name: "Present",  value: stats.presentToday },
    { name: "Absent",   value: Math.max(0, stats.totalEmployees - stats.presentToday - stats.onLeave) },
    { name: "On Leave", value: stats.onLeave },
  ].filter((d) => d.value > 0) : [];

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col h-full">
        <Header action={{ label: "Add Employee" }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#16A34A]/30 border-t-[#16A34A] rounded-full animate-spin" />
            <p className="text-sm text-[#8AA398]">Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header action={{ label: "Add Employee", href: "/employees/new" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-[#17211C] tracking-tight">
            {greeting()}, {userName?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-[#4A5E55] text-sm mt-1">{companyName} — Here's your workforce overview.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Employees",   value: stats?.totalEmployees ?? 0,   sub: "Active employees",              icon: Users,     bg: "bg-[#064E3B]" },
            { label: "Present Today",     value: stats?.presentToday ?? 0,      sub: `${stats?.attendanceRate ?? 0}% attendance rate`, icon: UserCheck, bg: "bg-[#16A34A]" },
            { label: "On Leave",          value: stats?.onLeave ?? 0,           sub: "Today",                         icon: UserMinus, bg: "bg-amber-500" },
            { label: "Pending Requests",  value: stats?.pendingRequests ?? 0,   sub: "Leave requests",                icon: Clock,     bg: "bg-blue-500" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${k.bg}`}>
                <k.icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#8AA398] uppercase tracking-wide">{k.label}</p>
                <p className="text-2xl font-bold text-[#17211C] mt-0.5">{k.value}</p>
                <p className="text-xs text-[#8AA398] mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Department breakdown as bar chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#17211C] mb-1">Department Headcount</h2>
            <p className="text-xs text-[#8AA398] mb-4">Employees per department</p>
            {stats?.departments && stats.departments.length > 0 ? (
              <div className="space-y-3">
                {stats.departments.map((d) => {
                  const pct = stats.totalEmployees > 0 ? (d._count.employees / stats.totalEmployees) * 100 : 0;
                  return (
                    <div key={d.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-[#4A5E55]">{d.name}</span>
                        <span className="text-xs font-bold text-[#17211C]">{d._count.employees} employees</span>
                      </div>
                      <div className="w-full bg-[#F7F9F8] rounded-full h-2">
                        <div className="bg-[#16A34A] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-[#8AA398] text-sm">No department data yet</div>
            )}
          </div>

          {/* Attendance Breakdown Pie */}
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#17211C] mb-1">Today's Attendance</h2>
            <p className="text-xs text-[#8AA398] mb-2">Live breakdown</p>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-2 mb-3">
                  <p className="text-2xl font-bold text-[#17211C]">{stats?.attendanceRate ?? 0}%</p>
                  <p className="text-xs text-[#8AA398]">Present rate</p>
                </div>
                <div className="space-y-1.5">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                        <span className="text-xs text-[#4A5E55]">{d.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#17211C]">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-[#8AA398] text-sm">No attendance recorded today</div>
            )}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5EAE7]">
            <h2 className="text-base font-bold text-[#17211C]">Today's Check-ins</h2>
            <a href="/attendance" className="text-xs text-[#16A34A] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          {stats?.recentAttendance && stats.recentAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9F8]">
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Employee</th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Department</th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Check-in</th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttendance.map((a: any) => (
                    <tr key={a.id} className="border-t border-[#F0F4F2] hover:bg-[#F7F9F8]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#064E3B] text-white text-xs font-bold flex items-center justify-center">
                            {a.employee.firstName[0]}
                          </div>
                          <span className="text-xs font-medium text-[#17211C]">{a.employee.firstName} {a.employee.lastName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-[#4A5E55]">{a.employee.department?.name ?? "—"}</td>
                      <td className="px-3 py-3 text-xs font-mono text-[#17211C]">
                        {a.checkIn ? new Date(a.checkIn).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          a.status === "PRESENT" ? "bg-green-50 text-green-700" :
                          a.status === "LATE"    ? "bg-amber-50 text-amber-700" :
                                                   "bg-red-50 text-red-700"
                        }`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-[#8AA398] text-sm">
              No check-ins recorded for today yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
