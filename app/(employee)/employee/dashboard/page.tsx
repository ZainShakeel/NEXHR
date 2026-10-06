"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Clock, LogIn, LogOut, CalendarCheck, CalendarX,
  TrendingUp, Wallet, FileText, ClipboardList, ArrowRight,
  CheckCircle2, AlertCircle, Timer, Calendar,
} from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/hooks/useCompany";

type AttendanceRecord = {
  id: string; date: string; checkIn?: string; checkOut?: string;
  workingMinutes?: number; lateMinutes?: number; status: string;
};
type LeaveBalance = { leaveType: { name: string; color: string }; remaining: number; used: number; allocated: number };
type EmpProfile = {
  firstName: string; lastName: string; designation: string; employeeId: string;
  basicSalary: number; joiningDate: string;
  department?: { name: string };
};
type SalarySlip = { id: string; month: number; year: number; netSalary: number; status: string };

function fmtTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}
function fmtMins(mins?: number) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${m}m`;
}
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function EmployeeDashboard() {
  const { companyId, employeeId, userName, status: authStatus } = useCompany();
  const [profile, setProfile] = useState<EmpProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [latestSlip, setLatestSlip] = useState<SalarySlip | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    if (!companyId || !employeeId) return;
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    try {
      const [empRes, attRes, balRes, slipRes] = await Promise.all([
        fetch(`/api/employees/${employeeId}?companyId=${companyId}`).then(r => r.json()),
        fetch(`/api/attendance?companyId=${companyId}&employeeId=${employeeId}&month=${month}&year=${year}`).then(r => r.json()),
        fetch(`/api/leave-balances?companyId=${companyId}&employeeId=${employeeId}`).then(r => r.json()),
        fetch(`/api/salary-slips?companyId=${companyId}&employeeId=${employeeId}`).then(r => r.json()),
      ]);
      setProfile(empRes?.id ? empRes : null);
      setAttendance(Array.isArray(attRes) ? attRes : []);
      setLeaveBalances(Array.isArray(balRes) ? balRes : []);
      const slips = Array.isArray(slipRes) ? slipRes : [];
      setLatestSlip(slips[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => { load(); }, [companyId, employeeId]);

  const today = attendance.find((a) => {
    const d = new Date(a.date);
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
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

  const present = attendance.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
  const absent  = attendance.filter(a => a.status === "ABSENT").length;
  const late    = attendance.filter(a => a.status === "LATE").length;
  const totalWorkMins = attendance.reduce((s, a) => s + (a.workingMinutes ?? 0), 0);
  const attendancePct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F4F8F6]">
        <Loader2 size={24} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  const firstName = profile?.firstName ?? userName?.split(" ")[0] ?? "Employee";

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F8F6] p-4 lg:p-6 space-y-5">

      {/* Welcome + Check-in card */}
      <div className="bg-[#064E3B] rounded-2xl p-5 lg:p-6 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 right-16 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left: welcome + time */}
          <div>
            <p className="text-white/60 text-xs mb-1">
              {now.toLocaleDateString("en-PK", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <h1 className="text-xl lg:text-2xl font-bold mb-0.5">Welcome back, {firstName}!</h1>
            <p className="text-white/60 text-sm">
              {profile?.designation}{profile?.department?.name ? ` · ${profile.department.name}` : ""}
            </p>
            <p className="text-4xl font-bold font-mono tracking-wider mt-4 tabular-nums">
              {now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>

          {/* Right: check-in/out */}
          <div className="bg-white/10 rounded-2xl p-5 min-w-[220px]">
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-3">Today's Attendance</p>
            {today?.checkIn && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
                  <CheckCircle2 size={13} className="text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">Check In</p>
                  <p className="text-sm font-bold">{fmtTime(today.checkIn)}</p>
                </div>
              </div>
            )}
            {today?.checkOut && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center">
                  <LogOut size={13} className="text-red-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">Check Out</p>
                  <p className="text-sm font-bold">{fmtTime(today.checkOut)}</p>
                </div>
              </div>
            )}
            {today?.workingMinutes && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center">
                  <Timer size={13} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">Hours Worked</p>
                  <p className="text-sm font-bold">{fmtMins(today.workingMinutes)}</p>
                </div>
              </div>
            )}
            <div className="mt-3">
              {!today?.checkIn ? (
                <button onClick={handleCheckIn} disabled={checkingIn}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#15803d] disabled:opacity-50 transition-colors">
                  {checkingIn ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                  Check In Now
                </button>
              ) : !today?.checkOut ? (
                <button onClick={handleCheckOut} disabled={checkingIn}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors">
                  {checkingIn ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                  Check Out
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 text-white/70 text-sm font-semibold rounded-xl">
                  <CalendarCheck size={14} className="text-green-400" />
                  Done for today!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#8AA398] uppercase tracking-wide">Present</p>
            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={15} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17211C]">{present}</p>
          <p className="text-[11px] text-[#8AA398] mt-1">days this month</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#8AA398] uppercase tracking-wide">Late</p>
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertCircle size={15} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{late}</p>
          <p className="text-[11px] text-[#8AA398] mt-1">days this month</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#8AA398] uppercase tracking-wide">Absent</p>
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
              <CalendarX size={15} className="text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{absent}</p>
          <p className="text-[11px] text-[#8AA398] mt-1">days this month</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#8AA398] uppercase tracking-wide">Hours</p>
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Timer size={15} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17211C]">{Math.floor(totalWorkMins / 60)}</p>
          <p className="text-[11px] text-[#8AA398] mt-1">total this month</p>
        </div>
      </div>

      {/* Middle row: Attendance % + Leave Balances + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Attendance rate */}
        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#17211C]">Attendance Rate</h2>
            <span className="text-xs text-[#8AA398]">This Month</span>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0F4F2" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#16A34A" strokeWidth="3"
                  strokeDasharray={`${attendancePct} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#17211C]">{attendancePct}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Present", val: present, color: "bg-green-500" },
              { label: "Late",    val: late,    color: "bg-amber-500" },
              { label: "Absent",  val: absent,  color: "bg-red-500" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${r.color}`} />
                  <span className="text-[#4A5E55]">{r.label}</span>
                </div>
                <span className="font-semibold text-[#17211C]">{r.val} days</span>
              </div>
            ))}
          </div>
          <Link href="/employee/attendance"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#16A34A] hover:text-[#064E3B] transition-colors">
            View Full History <ArrowRight size={12} />
          </Link>
        </div>

        {/* Leave balances */}
        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#17211C]">Leave Balance</h2>
            <Link href="/employee/leaves" className="text-xs text-[#16A34A] font-semibold hover:text-[#064E3B]">
              Apply →
            </Link>
          </div>
          {leaveBalances.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-[#8AA398] text-xs text-center">
              <Calendar size={20} className="mb-2" />
              No leave types assigned yet
            </div>
          ) : (
            <div className="space-y-4">
              {leaveBalances.slice(0, 4).map((lb) => {
                const pct = lb.allocated > 0 ? Math.round((lb.remaining / lb.allocated) * 100) : 0;
                const color = pct > 50 ? "#16A34A" : pct > 25 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={lb.leaveType.name}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#17211C]">{lb.leaveType.name}</span>
                      <span className="text-[#8AA398]">
                        <span className="font-bold text-[#17211C]">{lb.remaining}</span> / {lb.allocated} left
                      </span>
                    </div>
                    <div className="h-2 bg-[#F0F4F2] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <p className="text-[10px] text-[#8AA398] mt-0.5">{lb.used} used</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions + salary */}
        <div className="space-y-3">
          {/* Latest salary */}
          <div className="bg-[#064E3B] rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={16} className="text-[#22c55e]" />
              <p className="text-xs font-semibold text-white/70">Latest Salary</p>
            </div>
            {latestSlip ? (
              <>
                <p className="text-2xl font-bold">PKR {Number(latestSlip.netSalary).toLocaleString("en-PK")}</p>
                <p className="text-xs text-white/50 mt-1">{MONTHS[latestSlip.month - 1]} {latestSlip.year}</p>
                <Link href="/employee/payslips"
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#22c55e] hover:text-white transition-colors">
                  View Payslip <ArrowRight size={11} />
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/50">No payslip yet</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-[#E5EAE7] p-4 shadow-sm">
            <p className="text-xs font-bold text-[#17211C] mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/employee/leaves",    icon: Calendar,     label: "Apply Leave",   bg: "bg-green-50",  color: "text-green-700" },
                { href: "/employee/requests",  icon: ClipboardList, label: "Requests",     bg: "bg-blue-50",   color: "text-blue-700"  },
                { href: "/employee/payslips",  icon: FileText,     label: "Pay Slips",     bg: "bg-purple-50", color: "text-purple-700"},
                { href: "/employee/profile",   icon: TrendingUp,   label: "My Profile",    bg: "bg-amber-50",  color: "text-amber-700" },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${a.bg} hover:opacity-80 transition-opacity`}>
                  <a.icon size={18} className={a.color} />
                  <span className={`text-[11px] font-semibold ${a.color} text-center leading-tight`}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent attendance table */}
      <div className="bg-white rounded-2xl border border-[#E5EAE7] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F2]">
          <h2 className="text-sm font-bold text-[#17211C]">Recent Attendance</h2>
          <Link href="/employee/attendance" className="text-xs text-[#16A34A] font-semibold hover:text-[#064E3B]">
            View All →
          </Link>
        </div>
        {attendance.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-[#8AA398] text-xs">
            <CalendarX size={24} className="mb-2" />
            No attendance records this month.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F7F9F8]">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Check In</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Check Out</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Hours</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 10).map((a) => (
                  <tr key={a.id} className="border-t border-[#F7F9F8] hover:bg-[#FAFCFB] transition-colors">
                    <td className="px-5 py-3 text-xs font-medium text-[#4A5E55]">
                      {new Date(a.date).toLocaleDateString("en-PK", { weekday: "short", day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#17211C]">{fmtTime(a.checkIn)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-[#17211C]">{fmtTime(a.checkOut)}</td>
                    <td className="px-4 py-3 text-xs text-[#4A5E55]">{fmtMins(a.workingMinutes)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === "PRESENT" ? "bg-green-50 text-green-700" :
                        a.status === "LATE"    ? "bg-amber-50 text-amber-700" :
                        a.status === "ABSENT"  ? "bg-red-50 text-red-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>{a.status}</span>
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
