"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, UserCheck, UserX, Clock, Calendar, Loader2,
  Filter, ChevronDown, ChevronUp, Download,
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type AttendanceRecord = {
  id: string; date: string; checkIn?: string; checkOut?: string;
  status: string; workingMinutes?: number; lateMinutes?: number; overtimeMinutes?: number;
  isManualEntry?: boolean;
  employee: { firstName: string; lastName: string; employeeId: string; designation: string; department?: { name: string } };
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  PRESENT:         { label: "Present",       color: "#07845A", bg: "#E3F6EB" },
  LATE:            { label: "Late",          color: "#F59E0B", bg: "#FEF3C7" },
  ABSENT:          { label: "Absent",        color: "#EF4444", bg: "#FEE2E2" },
  ON_LEAVE:        { label: "On Leave",      color: "#3B82F6", bg: "#DBEAFE" },
  WORK_FROM_HOME:  { label: "WFH",           color: "#8B5CF6", bg: "#EDE9FE" },
  HALF_DAY:        { label: "Half Day",      color: "#F97316", bg: "#FFEDD5" },
  HOLIDAY:         { label: "Holiday",       color: "#06B6D4", bg: "#CFFAFE" },
  WEEKEND:         { label: "Weekend",       color: "#94A3B8", bg: "#F1F5F9" },
};

const AVATAR_COLORS = ["#07845A", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
      style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
      {initials}
    </div>
  );
}

function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}

function fmtMinutes(m?: number) {
  if (!m || m === 0) return "—";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

export default function AttendancePage() {
  const { companyId, status: authStatus } = useCompany();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/attendance?companyId=${companyId}&month=${month}&year=${year}`)
      .then(r => r.json())
      .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, month, year]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = `${r.employee.firstName} ${r.employee.lastName} ${r.employee.employeeId}`.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const present = records.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
  const absent = records.filter(r => r.status === "ABSENT").length;
  const late = records.filter(r => r.status === "LATE").length;
  const onLeave = records.filter(r => r.status === "ON_LEAVE").length;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#07845A" }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Attendance</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{records.length} records for {new Date(year, month - 1).toLocaleString("en-PK", { month: "long", year: "numeric" })}</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#475569" }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Present", value: present, icon: UserCheck, color: "#07845A", bg: "#E3F6EB" },
          { label: "Absent", value: absent, icon: UserX, color: "#EF4444", bg: "#FEE2E2" },
          { label: "Late Arrivals", value: late, icon: Clock, color: "#F59E0B", bg: "#FEF3C7" },
          { label: "On Leave", value: onLeave, icon: Calendar, color: "#3B82F6", bg: "#DBEAFE" },
        ].map(k => (
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

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center" style={{ border: "1px solid #E2E8F0" }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
          <input type="text" placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }} />
        </div>
        <select value={`${year}-${String(month).padStart(2, "0")}`}
          onChange={e => { const [y, m] = e.target.value.split("-"); setYear(Number(y)); setMonth(Number(m)); }}
          className="px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
          {Array.from({ length: 12 }, (_, i) => {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            return <option key={val} value={val}>{d.toLocaleString("en-PK", { month: "long", year: "numeric" })}</option>;
          })}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); }}
            className="px-3 py-2 text-xs font-medium rounded-lg"
            style={{ background: "#FEE2E2", color: "#EF4444" }}>
            Clear
          </button>
        )}
        <span className="ml-auto text-sm text-[#64748B]">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar size={32} className="text-[#CBD5E1] mb-3" />
            <p className="text-sm font-semibold text-[#475569]">No attendance records found</p>
            <p className="text-xs text-[#94A3B8] mt-1">Records appear as employees check in</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
                  {["Employee", "Date", "Check In", "Check Out", "Working Hours", "Late", "Status", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F8FAFC" }}>
                {filtered.map((r, i) => {
                  const st = STATUS_STYLE[r.status] ?? { label: r.status, color: "#64748B", bg: "#F1F5F9" };
                  return (
                    <tr key={r.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${r.employee.firstName} ${r.employee.lastName}`} index={i} />
                          <div>
                            <p className="text-sm font-semibold text-[#172B24]">{r.employee.firstName} {r.employee.lastName}</p>
                            <p className="text-[10px] text-[#94A3B8]">{r.employee.department?.name ?? r.employee.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#475569]">
                        {new Date(r.date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-[#172B24]">{fmtTime(r.checkIn)}</td>
                      <td className="px-5 py-3.5 text-sm text-[#475569]">{fmtTime(r.checkOut)}</td>
                      <td className="px-5 py-3.5 text-sm text-[#475569]">{fmtMinutes(r.workingMinutes)}</td>
                      <td className="px-5 py-3.5">
                        {(r.lateMinutes ?? 0) > 0
                          ? <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>{fmtMinutes(r.lateMinutes)}</span>
                          : <span className="text-[#CBD5E1]">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                          {r.isManualEntry && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#94A3B8" }}>
                              Manual
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          style={{ background: "#F1F5F9", color: "#475569" }}>
                          Edit
                        </button>
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
  );
}
