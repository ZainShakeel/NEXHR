"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Clock, CalendarX } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type AttendanceRecord = {
  id: string; date: string; checkIn?: string; checkOut?: string;
  workingMinutes?: number; lateMinutes?: number; status: string;
};

function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}
function fmtMins(m?: number) {
  if (!m) return "—";
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function EmployeeAttendancePage() {
  const { companyId, employeeId, status: authStatus } = useCompany();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const load = useCallback(() => {
    if (!companyId || !employeeId) return;
    setLoading(true);
    const [y, m] = monthFilter.split("-");
    fetch(`/api/attendance?companyId=${companyId}&employeeId=${employeeId}&month=${m}&year=${y}`)
      .then((r) => r.json())
      .then((d) => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, employeeId, monthFilter]);

  useEffect(() => { load(); }, [load]);

  const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F7F9F8]">
        <Loader2 size={24} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9F8] p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17211C]">My Attendance</h1>
          <p className="text-sm text-[#4A5E55]">Your monthly attendance log</p>
        </div>
        <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-[#17211C]">{present}</p>
          <p className="text-[11px] text-[#8AA398] mt-0.5">Present Days</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">{late}</p>
          <p className="text-[11px] text-[#8AA398] mt-0.5">Late Arrivals</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-600">{absent}</p>
          <p className="text-[11px] text-[#8AA398] mt-0.5">Absent Days</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-[#8AA398] text-sm">
            <CalendarX size={26} className="mb-3" />
            No attendance records for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F7F9F8] border-b border-[#E5EAE7]">
                  {["Date", "Check In", "Check Out", "Hours", "Late", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-[#F0F4F2]">
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
                      }`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
