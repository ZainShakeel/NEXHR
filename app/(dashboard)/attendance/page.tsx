"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Record_ = {
  id: string; date: string; checkIn?: string; checkOut?: string;
  status: string; workingMinutes?: number; lateMinutes?: number;
  employee: { firstName: string; lastName: string; employeeId: string; department?: { name: string } };
};

const statusCls: Record<string, { bg: string; text: string }> = {
  PRESENT:        { bg: "bg-green-50",  text: "text-green-700" },
  LATE:           { bg: "bg-amber-50",  text: "text-amber-700" },
  ABSENT:         { bg: "bg-red-50",    text: "text-red-700" },
  ON_LEAVE:       { bg: "bg-blue-50",   text: "text-blue-700" },
  HALF_DAY:       { bg: "bg-purple-50", text: "text-purple-700" },
  WORK_FROM_HOME: { bg: "bg-teal-50",   text: "text-teal-700" },
};

function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}
function fmtMins(m?: number) {
  if (!m) return "—";
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function AttendancePage() {
  const { companyId, status: authStatus } = useCompany();
  const [records, setRecords] = useState<Record_[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split("T")[0]);

  const load = useCallback(() => {
    if (!companyId) return;
    const d = new Date(dateFilter);
    setLoading(true);
    fetch(`/api/attendance?companyId=${companyId}&month=${d.getMonth() + 1}&year=${d.getFullYear()}`)
      .then((r) => r.json())
      .then((d) => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, dateFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return `${r.employee.firstName} ${r.employee.lastName} ${r.employee.employeeId}`.toLowerCase().includes(q);
  });

  const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const absent  = records.filter((r) => r.status === "ABSENT").length;
  const onLeave = records.filter((r) => r.status === "ON_LEAVE").length;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#17211C]">Attendance</h1>
          <p className="text-[#4A5E55] text-sm mt-1">Track employee attendance records</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Present / Late", value: present, icon: CheckCircle2, bg: "bg-green-50",  text: "text-green-700" },
            { label: "Absent",         value: absent,  icon: XCircle,      bg: "bg-red-50",    text: "text-red-700"   },
            { label: "On Leave",       value: onLeave, icon: Clock,        bg: "bg-blue-50",   text: "text-blue-700"  },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E5EAE7] p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={18} className={s.text} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#17211C]">{s.value}</p>
                <p className="text-xs text-[#8AA398]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 mb-4 shadow-sm flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA398]" />
            <input type="text" placeholder="Search employee…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F7F9F8] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
          </div>
          <input type="month" value={dateFilter.substring(0, 7)}
            onChange={(e) => setDateFilter(e.target.value + "-01")}
            className="px-3 py-2 text-sm bg-[#F7F9F8] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#8AA398] text-sm">
              No attendance records found for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9F8] border-b border-[#E5EAE7]">
                    {["Employee", "Date", "Check In", "Check Out", "Hours", "Late", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const st = statusCls[r.status] ?? { bg: "bg-gray-50", text: "text-gray-600" };
                    return (
                      <tr key={r.id} className="border-t border-[#F0F4F2] hover:bg-[#F7F9F8]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#064E3B] text-white text-[10px] font-bold flex items-center justify-center">
                              {r.employee.firstName[0]}{r.employee.lastName[0]}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#17211C]">{r.employee.firstName} {r.employee.lastName}</p>
                              <p className="text-[10px] text-[#8AA398]">{r.employee.department?.name ?? "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#4A5E55]">{new Date(r.date).toLocaleDateString("en-PK", { weekday: "short", day: "2-digit", month: "short" })}</td>
                        <td className="px-4 py-3 text-xs font-mono text-[#17211C]">{fmtTime(r.checkIn)}</td>
                        <td className="px-4 py-3 text-xs font-mono text-[#17211C]">{fmtTime(r.checkOut)}</td>
                        <td className="px-4 py-3 text-xs text-[#4A5E55]">{fmtMins(r.workingMinutes)}</td>
                        <td className="px-4 py-3 text-xs text-[#4A5E55]">{r.lateMinutes ? `${r.lateMinutes}m` : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.text}`}>
                            {r.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
