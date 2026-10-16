"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Users, UserCheck, TrendingUp, BarChart3, Download } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from "recharts";

type Stats = {
  totalEmployees: number; presentToday: number; onLeave: number;
  pendingRequests: number; attendanceRate: number; lateToday?: number;
  departments: { name: string; _count: { employees: number } }[];
  recentAttendance: { status: string; employee: { firstName: string; lastName: string } }[];
  attendanceTrend: { day: string; present: number; late: number; absent: number }[];
  leaveDistribution: { name: string; value: number; color: string }[];
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "#07845A", LATE: "#F59E0B", ABSENT: "#EF4444", ON_LEAVE: "#3B82F6",
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
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#07845A" }} />
      </div>
    );
  }

  const deptData = (stats?.departments ?? []).map(d => ({ name: d.name, Employees: d._count.employees }));
  const statusCounts = (stats?.recentAttendance ?? []).reduce((acc: Record<string, number>, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1; return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const trendData = (stats?.attendanceTrend ?? []).map(d => ({
    day: d.day, Present: d.present, Late: d.late, Absent: d.absent,
  }));

  const kpis = [
    { label: "Total Employees",  value: stats?.totalEmployees ?? 0,       icon: Users,        color: "#07845A", bg: "#E3F6EB" },
    { label: "Present Today",    value: stats?.presentToday ?? 0,          icon: UserCheck,    color: "#3B82F6", bg: "#DBEAFE" },
    { label: "On Leave",         value: stats?.onLeave ?? 0,               icon: TrendingUp,   color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Attendance Rate",  value: `${stats?.attendanceRate ?? 0}%`,  icon: BarChart3,    color: "#8B5CF6", bg: "#EDE9FE" },
  ];

  const ReportCard = ({ title, subtitle, children, exportable = false }: {
    title: string; subtitle: string; children: React.ReactNode; exportable?: boolean;
  }) => (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div>
          <h2 className="text-sm font-bold text-[#172B24]">{title}</h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>
        </div>
        {exportable && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
            <Download size={12} /> Export
          </button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Reports & Analytics</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Workforce metrics and insights</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#475569" }}>
          <Download size={14} /> Export All
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl p-4 flex items-center gap-3" style={{ border: "1px solid #E2E8F0" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
              <k.icon size={18} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#172B24]">{k.value}</p>
              <p className="text-xs text-[#64748B]">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReportCard title="7-Day Attendance Trend" subtitle="Daily attendance breakdown" exportable>
          {trendData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-[#94A3B8]">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0" }} cursor={{ fill: "#F8FAFC" }} />
                  <Bar dataKey="Present" fill="#07845A" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Late" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Absent" fill="#EF4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {[{ label: "Present", color: "#07845A" }, { label: "Late", color: "#F59E0B" }, { label: "Absent", color: "#EF4444" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                    <span className="text-[11px] text-[#64748B]">{l.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ReportCard>

        <ReportCard title="Employees by Department" subtitle="Headcount distribution" exportable>
          {deptData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-[#94A3B8]">No departments yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0" }} cursor={{ fill: "#F8FAFC" }} />
                <Bar dataKey="Employees" fill="#07845A" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ReportCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReportCard title="Today's Attendance Breakdown" subtitle="Status distribution" exportable>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-[#94A3B8]">No attendance data for today</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={40}>
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94A3B8"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {pieData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entry.name] ?? "#94A3B8" }} />
                    <span className="text-[11px] text-[#64748B]">
                      {entry.name}: <strong className="text-[#172B24]">{entry.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ReportCard>

        <ReportCard title="Recent Attendance Log" subtitle="Latest activity">
          {(stats?.recentAttendance ?? []).length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-[#94A3B8]">No attendance records</div>
          ) : (
            <div className="space-y-2.5">
              {stats!.recentAttendance.slice(0, 8).map((r, i) => {
                const color = STATUS_COLORS[r.status] ?? "#64748B";
                return (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
                    <span className="text-sm text-[#475569]">{r.employee.firstName} {r.employee.lastName}</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: `${color}15`, color }}>
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ReportCard>
      </div>
    </div>
  );
}
