"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart2, Loader2, TrendingUp, Users, CalendarCheck, DollarSign } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type Stats = {
  totalEmployees: number; presentToday: number; onLeave: number; pendingRequests: number; attendanceRate: number;
  departments: { name: string; _count: { employees: number } }[];
  recentAttendance: { status: string; employee: { firstName: string; lastName: string } }[];
};

const STATUS_COLORS: Record<string, string> = { PRESENT: "#16A34A", LATE: "#F59E0B", ABSENT: "#EF4444", ON_LEAVE: "#3B82F6" };

export default function ReportsPage() {
  const { companyId, status: authStatus } = useCompany();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/dashboard-stats?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col h-full"><Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>
      </div>
    );
  }

  const deptData = (stats?.departments ?? []).map((d) => ({ name: d.name, employees: d._count.employees }));

  const statusCounts = (stats?.recentAttendance ?? []).reduce((acc: Record<string, number>, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const kpis = [
    { label: "Total Employees", value: stats?.totalEmployees ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Present Today", value: stats?.presentToday ?? 0, icon: CalendarCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "On Leave", value: stats?.onLeave ?? 0, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Attendance Rate", value: `${stats?.attendanceRate ?? 0}%`, icon: BarChart2, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#17211C]">Reports & Analytics</h1>
          <p className="text-[#4A5E55] text-sm mt-1">Overview of your workforce metrics</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 ${k.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <k.icon size={20} className={k.color} />
              </div>
              <div>
                <p className="text-[11px] text-[#8AA398]">{k.label}</p>
                <p className="text-2xl font-bold text-[#17211C]">{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#17211C] mb-4">Employees by Department</h2>
            {deptData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-[#8AA398] text-xs">No department data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="employees" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#17211C] mb-4">Today&apos;s Attendance Breakdown</h2>
            {pieData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-[#8AA398] text-xs">No attendance data for today</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#9CA3AF"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#17211C] mb-4">Recent Attendance Log</h2>
          {(stats?.recentAttendance ?? []).length === 0 ? (
            <div className="py-8 flex items-center justify-center text-[#8AA398] text-xs">No attendance records yet</div>
          ) : (
            <div className="space-y-2">
              {stats!.recentAttendance.slice(0, 10).map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F7F9F8] last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#064E3B] text-white text-[10px] font-bold flex items-center justify-center">
                      {r.employee.firstName[0]}{r.employee.lastName[0]}
                    </div>
                    <span className="text-xs text-[#17211C]">{r.employee.firstName} {r.employee.lastName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    r.status === "PRESENT" ? "bg-green-50 text-green-700" :
                    r.status === "LATE"    ? "bg-amber-50 text-amber-700" :
                    r.status === "ABSENT"  ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
