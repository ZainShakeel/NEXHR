"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, Clock } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type TSRecord = {
  id: string; date: string; checkIn?: string; checkOut?: string;
  workingMinutes?: number; lateMinutes?: number; status: string;
  employee: { firstName: string; lastName: string; employeeId: string; department?: { name: string } };
};

function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}
function fmtMins(m?: number) {
  if (!m) return "—";
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function TimesheetsPage() {
  const { companyId, status: authStatus } = useCompany();
  const [records, setRecords] = useState<TSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    const [y, m] = monthFilter.split("-");
    fetch(`/api/attendance?companyId=${companyId}&month=${m}&year=${y}`)
      .then((r) => r.json())
      .then((d) => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, monthFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return `${r.employee.firstName} ${r.employee.lastName} ${r.employee.employeeId}`.toLowerCase().includes(q);
  });

  const totalHours = records.reduce((s, r) => s + (r.workingMinutes ?? 0), 0);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col h-full"><Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#17211C]">Timesheets</h1>
          <p className="text-[#4A5E55] text-sm mt-1">Employee working hours log</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm">
            <p className="text-xs text-[#8AA398]">Total Records</p>
            <p className="text-2xl font-bold text-[#17211C]">{records.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm">
            <p className="text-xs text-[#8AA398]">Total Hours Worked</p>
            <p className="text-2xl font-bold text-[#17211C]">{fmtMins(totalHours)}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm">
            <p className="text-xs text-[#8AA398]">Avg Hours / Employee</p>
            <p className="text-2xl font-bold text-[#17211C]">{records.length > 0 ? fmtMins(Math.round(totalHours / records.length)) : "—"}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 mb-4 shadow-sm flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA398]" />
            <input type="text" placeholder="Search employee…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F7F9F8] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
          </div>
          <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[#F7F9F8] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
        </div>

        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#8AA398] text-sm">
              <Clock size={28} className="mb-3" />
              No timesheet data for this period.
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
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-[#F0F4F2] hover:bg-[#F7F9F8]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
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
                      <td className="px-4 py-3 text-xs font-mono">{fmtTime(r.checkIn)}</td>
                      <td className="px-4 py-3 text-xs font-mono">{fmtTime(r.checkOut)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#064E3B]">{fmtMins(r.workingMinutes)}</td>
                      <td className="px-4 py-3 text-xs text-amber-600">{r.lateMinutes ? `${r.lateMinutes}m` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          r.status === "PRESENT" ? "bg-green-50 text-green-700" :
                          r.status === "LATE"    ? "bg-amber-50 text-amber-700" :
                          r.status === "ABSENT"  ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                        }`}>{r.status.replace("_", " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
