"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Clock, LogIn, LogOut, CalendarCheck, CalendarX, AlertCircle, TrendingUp } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type AttendanceRecord = {
  id: string; date: string; checkIn?: string; checkOut?: string;
  workingMinutes?: number; lateMinutes?: number; status: string;
};
type LeaveBalance = { leaveType: { name: string }; remaining: number; used: number; allocated: number };
type EmpProfile = { firstName: string; lastName: string; designation: string; department?: { name: string }; employeeId: string };

function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}

export default function EmployeeDashboard() {
  const { companyId, employeeId, userName, status: authStatus } = useCompany();
  const [profile, setProfile] = useState<EmpProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const load = useCallback(async () => {
    if (!companyId || !employeeId) return;
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    try {
      const [empRes, attRes, balRes] = await Promise.all([
        fetch(`/api/employees/${employeeId}?companyId=${companyId}`).then((r) => r.json()),
        fetch(`/api/attendance?companyId=${companyId}&employeeId=${employeeId}&month=${month}&year=${year}`).then((r) => r.json()),
        fetch(`/api/leave-balances?companyId=${companyId}&employeeId=${employeeId}`).then((r) => r.json()),
      ]);
      setProfile(empRes?.id ? empRes : null);
      setAttendance(Array.isArray(attRes) ? attRes : []);
      setLeaveBalances(Array.isArray(balRes) ? balRes : []);
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId, now.getMonth(), now.getFullYear()]);

  useEffect(() => { load(); }, [companyId, employeeId]);

  const today = attendance.find((a) => {
    const d = new Date(a.date);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const handleCheckIn = async () => {
    if (!companyId || !employeeId) return;
    setCheckingIn(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, employeeId, checkIn: new Date().toISOString() }),
    });
    setCheckingIn(false);
    load();
  };

  const handleCheckOut = async () => {
    if (!companyId || !employeeId) return;
    setCheckingIn(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, employeeId, checkOut: new Date().toISOString() }),
    });
    setCheckingIn(false);
    load();
  };

  const present = attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;
  const totalDays = attendance.length || 1;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F7F9F8]">
        <Loader2 size={24} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9F8] p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#17211C]">Welcome back, {profile?.firstName ?? userName?.split(" ")[0] ?? "Employee"}</h1>
        <p className="text-sm text-[#4A5E55]">{profile?.designation} {profile?.department?.name ? `· ${profile.department.name}` : ""}</p>
      </div>

      <div className="bg-[#064E3B] rounded-2xl p-5 text-white mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs opacity-70">{now.toLocaleDateString("en-PK", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
            <p className="text-3xl font-bold font-mono tracking-wide mt-1">
              {now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
          <Clock size={28} className="opacity-50" />
        </div>
        <div className="flex items-center gap-3">
          {!today?.checkIn ? (
            <button onClick={handleCheckIn} disabled={checkingIn}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#064E3B] text-sm font-bold rounded-xl hover:bg-green-50 disabled:opacity-50">
              {checkingIn ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />} Check In
            </button>
          ) : !today?.checkOut ? (
            <button onClick={handleCheckOut} disabled={checkingIn}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/90 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-50">
              {checkingIn ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />} Check Out
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm opacity-80">
              <CalendarCheck size={14} /> Completed for today
            </div>
          )}
          {today?.checkIn && (
            <div className="text-xs opacity-70">
              In: {fmtTime(today.checkIn)}{today.checkOut ? `  ·  Out: ${fmtTime(today.checkOut)}` : ""}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-[#17211C]">{present}</p>
          <p className="text-[11px] text-[#8AA398] mt-0.5">Present</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">{late}</p>
          <p className="text-[11px] text-[#8AA398] mt-0.5">Late</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-600">{absent}</p>
          <p className="text-[11px] text-[#8AA398] mt-0.5">Absent</p>
        </div>
      </div>

      {leaveBalances.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm mb-5">
          <h2 className="text-sm font-bold text-[#17211C] mb-3">Leave Balance</h2>
          <div className="space-y-3">
            {leaveBalances.map((lb) => {
              const pct = lb.allocated > 0 ? Math.round((lb.remaining / lb.allocated) * 100) : 0;
              return (
                <div key={lb.leaveType.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#4A5E55] font-medium">{lb.leaveType.name}</span>
                    <span className="text-[#8AA398]">{lb.remaining} / {lb.allocated} remaining</span>
                  </div>
                  <div className="h-2 bg-[#F7F9F8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#16A34A] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm">
        <h2 className="text-sm font-bold text-[#17211C] mb-3">Recent Attendance</h2>
        {attendance.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-[#8AA398] text-xs">
            <CalendarX size={22} className="mb-2" />
            No attendance records this month.
          </div>
        ) : (
          <div className="space-y-2">
            {attendance.slice(0, 7).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-[#F7F9F8] last:border-0">
                <span className="text-xs text-[#4A5E55]">{new Date(a.date).toLocaleDateString("en-PK", { weekday: "short", day: "2-digit", month: "short" })}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#8AA398]">{fmtTime(a.checkIn)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.status === "PRESENT" ? "bg-green-50 text-green-700" :
                    a.status === "LATE"    ? "bg-amber-50 text-amber-700" :
                    a.status === "ABSENT"  ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                  }`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
