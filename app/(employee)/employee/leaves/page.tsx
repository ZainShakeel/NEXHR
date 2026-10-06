"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, X, Check, CalendarX } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type LeaveRequest = {
  id: string; startDate: string; endDate: string; reason: string; status: string; days: number;
  leaveType: { name: string }; createdAt: string;
};
type LeaveBalance = { id: string; remaining: number; used: number; allocated: number; leaveType: { id: string; name: string } };

const statusCls: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

export default function EmployeeLeavesPage() {
  const { companyId, employeeId, status: authStatus } = useCompany();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });

  const load = useCallback(async () => {
    if (!companyId || !employeeId) return;
    const [reqRes, balRes] = await Promise.all([
      fetch(`/api/leave?companyId=${companyId}&employeeId=${employeeId}`).then((r) => r.json()),
      fetch(`/api/leave-balances?companyId=${companyId}&employeeId=${employeeId}`).then((r) => r.json()),
    ]);
    setRequests(Array.isArray(reqRes) ? reqRes : []);
    setBalances(Array.isArray(balRes) ? balRes : []);
    setLoading(false);
  }, [companyId, employeeId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason) return;
    setSubmitting(true);
    await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, employeeId, ...form }),
    });
    setSubmitting(false);
    setShowForm(false);
    setForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
    load();
  };

  if (authStatus === "loading" || loading) {
    return <div className="flex-1 flex items-center justify-center bg-[#F7F9F8]"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9F8] p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17211C]">My Leaves</h1>
          <p className="text-sm text-[#4A5E55]">Leave requests and balance</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#064E3B]">
          <Plus size={14} /> Apply Leave
        </button>
      </div>

      {balances.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {balances.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm text-center">
              <p className="text-xl font-bold text-[#17211C]">{b.remaining}</p>
              <p className="text-[11px] text-[#8AA398]">{b.leaveType.name}</p>
              <p className="text-[10px] text-[#8AA398]">{b.used} used / {b.allocated} total</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#17211C]">New Leave Request</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-[#8AA398]" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Leave Type *</label>
              <select value={form.leaveTypeId} onChange={(e) => setForm((p) => ({ ...p, leaveTypeId: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]">
                <option value="">Select type</option>
                {balances.map((b) => <option key={b.leaveType.id} value={b.leaveType.id}>{b.leaveType.name} ({b.remaining} left)</option>)}
              </select>
            </div>
            <div />
            <div>
              <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">End Date *</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Reason *</label>
              <textarea value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                rows={2} placeholder="Reason for leave"
                className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} disabled={submitting || !form.leaveTypeId || !form.startDate || !form.endDate || !form.reason}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#064E3B] disabled:opacity-50">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Submit Request
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-[#F7F9F8] text-[#4A5E55] text-sm font-bold rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-[#F7F9F8] border-b border-[#E5EAE7]">
          <h2 className="text-sm font-bold text-[#17211C]">Leave History</h2>
        </div>
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#8AA398] text-sm">
            <CalendarX size={24} className="mb-3" />
            No leave requests yet.
          </div>
        ) : (
          <div className="divide-y divide-[#F0F4F2]">
            {requests.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#17211C]">{r.leaveType.name}</p>
                  <p className="text-[11px] text-[#8AA398]">
                    {new Date(r.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })} — {new Date(r.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                    {r.days > 1 ? ` (${r.days} days)` : ""}
                  </p>
                  {r.reason && <p className="text-[11px] text-[#4A5E55] mt-0.5 line-clamp-1">{r.reason}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${statusCls[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
