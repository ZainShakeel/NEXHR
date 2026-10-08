"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, TrendingUp, Users, CalendarCheck, BarChart2, Activity } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type Stats = {
  totalEmployees: number; presentToday: number; onLeave: number;
  pendingRequests: number; attendanceRate: number; lateToday?: number;
  departments: { name: string; _count: { employees: number } }[];
  recentAttendance: { status: string; employee: { firstName: string; lastName: string } }[];
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "#22c55e", LATE: "#F59E0B", ABSENT: "#EF4444", ON_LEAVE: "#3B82F6",
};

const CustomBar = (props: any) => {
  const { x, y, width, height } = props;
  return <rect x={x} y={y} width={width} height={height} rx={4} fill="url(#barGrad)" />;
};

export default function ReportsPage() {
  const { companyId, status: authStatus } = useCompany();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/dashboard-stats?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full" style={{ background: "#F0F4F2" }}>
        <Loader2 size={24} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  const deptData = (stats?.departments ?? []).map(d => ({ name: d.name, employees: d._count.employees }));
  const statusCounts = (stats?.recentAttendance ?? []).reduce((acc: Record<string, number>, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1; return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const kpis = [
    { label: "Total Employees",  value: stats?.totalEmployees ?? 0,   icon: Users,         gradient: "linear-gradient(135deg,#071A10,#16A34A)" },
    { label: "Present Today",    value: stats?.presentToday ?? 0,      icon: CalendarCheck, gradient: "linear-gradient(135deg,#1e3a5f,#3B82F6)" },
    { label: "On Leave",         value: stats?.onLeave ?? 0,           icon: TrendingUp,    gradient: "linear-gradient(135deg,#451a03,#d97706)" },
    { label: "Attendance Rate",  value: `${stats?.attendanceRate ?? 0}%`, icon: BarChart2,  gradient: "linear-gradient(135deg,#2d1f5e,#7C3AED)" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "#F0F4F2" }}>
      <div className="flex-shrink-0 px-5 pt-5 pb-4">
        <h1 className="text-xl font-black text-[#0D1F15]">Reports & Analytics</h1>
        <p className="text-sm text-[#6B8C7A] mt-0.5">Workforce metrics and attendance insights</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <div key={k.label} className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: k.gradient, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", animationDelay: `${i * 60}ms`, animation: "fadeUp 0.4s ease both" }}>
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.14)" }}>
                <k.icon size={17} className="text-white" />
              </div>
              <p className="text-2xl font-black text-white">{k.value}</p>
              <p className="text-[11px] text-white/60 font-semibold mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Department bar chart */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
            <div className="px-5 py-4" style={{ background: "linear-gradient(90deg,#071A10,#0A2A1A)" }}>
              <h2 className="text-sm font-bold text-white">Employees by Department</h2>
              <p className="text-[11px] text-white/40">Headcount distribution</p>
            </div>
            <div className="p-5">
              {deptData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-[#9BB8A8] text-xs">No department data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16A34A" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9BB8A8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#9BB8A8" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid #E2ECE7" }} />
                    <Bar dataKey="employees" shape={<CustomBar />} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Attendance pie chart */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
            <div className="px-5 py-4" style={{ background: "linear-gradient(90deg,#1e3a5f,#1e40af)" }}>
              <h2 className="text-sm font-bold text-white">Today's Attendance</h2>
              <p className="text-[11px] text-white/40">Breakdown by status</p>
            </div>
            <div className="p-5">
              {pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-[#9BB8A8] text-xs">No attendance data for today</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={36}>
                        {pieData.map(entry => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#9CA3AF"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-1">
                    {pieData.map(entry => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entry.name] ?? "#9CA3AF" }} />
                        <span className="text-[10px] text-[#6B8C7A] font-medium">{entry.name}: <strong className="text-[#0D1F15]">{entry.value}</strong></span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Attendance Log */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
          <div className="px-5 py-4" style={{ background: "linear-gradient(90deg,#2d1f5e,#4c1d95)" }}>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-purple-300" />
              <h2 className="text-sm font-bold text-white">Recent Attendance Log</h2>
            </div>
          </div>
          {(stats?.recentAttendance ?? []).length === 0 ? (
            <div className="py-12 flex items-center justify-center text-[#9BB8A8] text-xs">No attendance records yet</div>
          ) : (
            <div className="divide-y divide-[#EEF5F1]">
              {stats!.recentAttendance.slice(0, 10).map((r, i) => {
                const color =
                  r.status === "PRESENT" ? "#16A34A" :
                  r.status === "LATE"    ? "#D97706" :
                  r.status === "ABSENT"  ? "#EF4444" : "#3B82F6";
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-[#F8FAF9] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                        style={{ background: "linear-gradient(135deg,#2d1f5e,#7C3AED)" }}>
                        {r.employee.firstName[0]}{r.employee.lastName[0]}
                      </div>
                      <span className="text-xs font-semibold text-[#0D1F15]">{r.employee.firstName} {r.employee.lastName}</span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                      style={{ background: `${color}18`, color }}>
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
