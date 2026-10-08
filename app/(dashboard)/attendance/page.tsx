"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, CheckCircle2, Clock, XCircle, Loader2, ClipboardList } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type Record_ = {
  id: string; date: string; checkIn?: string; checkOut?: string;
  status: string; workingMinutes?: number; lateMinutes?: number;
  employee: { firstName: string; lastName: string; employeeId: string; department?: { name: string } };
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PRESENT:        { bg: "rgba(22,163,74,0.12)",  color: "#16A34A" },
  LATE:           { bg: "rgba(245,158,11,0.12)",  color: "#D97706" },
  ABSENT:         { bg: "rgba(239,68,68,0.12)",   color: "#EF4444" },
  ON_LEAVE:       { bg: "rgba(59,130,246,0.12)",  color: "#3B82F6" },
  HALF_DAY:       { bg: "rgba(124,58,237,0.12)",  color: "#7C3AED" },
  WORK_FROM_HOME: { bg: "rgba(6,182,212,0.12)",   color: "#0891B2" },
};

const fmt = (iso?: string) => iso ? new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMins = (m?: number) => m ? `${Math.floor(m / 60)}h ${m % 60}m` : "—";

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
      .then(r => r.json())
      .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, dateFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return `${r.employee.firstName} ${r.employee.lastName} ${r.employee.employeeId}`.toLowerCase().includes(q);
  });

  const present = records.filter(r => ["PRESENT", "LATE"].includes(r.status)).length;
  const absent  = records.filter(r => r.status === "ABSENT").length;
  const onLeave = records.filter(r => r.status === "ON_LEAVE").length;
  const wfh     = records.filter(r => r.status === "WORK_FROM_HOME").length;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full" style={{ background: "#F0F4F2" }}>
        <Loader2 size={24} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#F0F4F2" }}>
      {/* Page header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4">
        <h1 className="text-xl font-black text-[#0D1F15]">Attendance</h1>
        <p className="text-sm text-[#6B8C7A] mt-0.5">Track employee attendance records</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Present / Late", value: present, icon: CheckCircle2, gradient: "linear-gradient(135deg,#071A10,#16A34A)" },
            { label: "Absent",         value: absent,  icon: XCircle,      gradient: "linear-gradient(135deg,#3b0a0a,#DC2626)" },
            { label: "On Leave",       value: onLeave, icon: Clock,        gradient: "linear-gradient(135deg,#1e3a5f,#3B82F6)" },
            { label: "Work From Home", value: wfh,     icon: ClipboardList,gradient: "linear-gradient(135deg,#2d1f5e,#7C3AED)" },
          ].map(k => (
            <div key={k.label} className="rounded-2xl p-4 relative overflow-hidden" style={{ background: k.gradient, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.12)" }}>
                <k.icon size={15} className="text-white" />
              </div>
              <p className="text-2xl font-black text-white">{k.value}</p>
              <p className="text-[11px] text-white/60 font-semibold mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white rounded-2xl px-4 py-3" style={{ border: "1px solid #E2ECE7", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BB8A8]" />
            <input type="text" placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none"
              style={{ background: "#F5F9F6", border: "1px solid #E2ECE7" }} />
          </div>
          <input type="month" value={dateFilter.substring(0, 7)} onChange={e => setDateFilter(e.target.value + "-01")}
            className="px-3 py-2 text-sm rounded-xl focus:outline-none font-medium"
            style={{ background: "#F5F9F6", border: "1px solid #E2ECE7", color: "#0D1F15" }} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
          <div className="px-5 py-3.5 flex items-center gap-3" style={{ background: "linear-gradient(90deg,#071A10,#0A2A1A)" }}>
            <ClipboardList size={14} className="text-green-400" />
            <span className="text-sm font-bold text-white">Attendance Records</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}>
              {filtered.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList size={28} className="text-[#C5D9CE] mb-3" />
              <p className="text-sm font-bold text-[#0D1F15]">No records found</p>
              <p className="text-xs text-[#9BB8A8] mt-1">Try a different month or search term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAF9", borderBottom: "1px solid #EEF5F1" }}>
                    {["Employee", "Date", "Check In", "Check Out", "Hours", "Late", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const st = STATUS_STYLE[r.status] ?? { bg: "rgba(107,114,128,0.1)", color: "#6B7280" };
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-[#F8FAF9] transition-colors" style={{ borderColor: "#EEF5F1" }}>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                              style={{ background: "linear-gradient(135deg,#071A10,#16A34A)" }}>
                              {r.employee.firstName[0]}{r.employee.lastName[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0D1F15]">{r.employee.firstName} {r.employee.lastName}</p>
                              <p className="text-[10px] text-[#9BB8A8]">{r.employee.department?.name ?? "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-[#6B8C7A]">
                          {new Date(r.date).toLocaleDateString("en-PK", { weekday: "short", day: "2-digit", month: "short" })}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-mono font-bold text-[#0D1F15]">{fmt(r.checkIn)}</td>
                        <td className="px-4 py-3.5 text-xs font-mono font-bold text-[#0D1F15]">{fmt(r.checkOut)}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-[#6B8C7A]">{fmtMins(r.workingMinutes)}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-[#6B8C7A]">
                          {r.lateMinutes ? <span className="text-amber-600 font-bold">{r.lateMinutes}m</span> : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: st.bg, color: st.color }}>
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
