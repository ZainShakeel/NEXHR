"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, X, Check } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type Tab = "leave" | "punch" | "wfh";
type LeaveRequest = { id: string; startDate: string; endDate: string; reason: string; status: string; days: number; leaveType: { name: string } };
type LeaveBalance = { id: string; remaining: number; leaveType: { id: string; name: string } };

const statusCls: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

export default function EmployeeRequestsPage() {
  const { companyId, employeeId, status: authStatus } = useCompany();
  const [tab, setTab] = useState<Tab>("leave");
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

  const handleSubmitLeave = async () => {
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
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#17211C]">My Requests</h1>
        <p className="text-sm text-[#4A5E55]">Submit and track your requests</p>
      </div>

      <div className="flex gap-1 mb-5 bg-[#E5EAE7] p-1 rounded-xl w-fit">
        {(["leave", "punch", "wfh"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${tab === t ? "bg-white text-[#17211C] shadow-sm" : "text-[#4A5E55]"}`}>
            {t === "leave" ? "Leave" : t === "punch" ? "Punch" : "WFH"}
          </button>
        ))}
      </div>

      {tab === "leave" && (
        <>
          <div className="flex justify-end mb-3">
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#064E3B]">
              <Plus size={13} /> New Leave Request
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#17211C]">Leave Request</h3>
                <button onClick={() => setShowForm(false)}><X size={15} className="text-[#8AA398]" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1">Leave Type *</label>
                  <select value={form.leaveTypeId} onChange={(e) => setForm((p) => ({ ...p, leaveTypeId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]">
                    <option value="">Select type</option>
                    {balances.map((b) => <option key={b.leaveType.id} value={b.leaveType.id}>{b.leaveType.name} ({b.remaining} left)</option>)}
                  </select>
                </div>
                <div />
                <div>
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1">From *</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1">To *</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1">Reason *</label>
                  <textarea value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                    rows={2} className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={handleSubmitLeave} disabled={submitting || !form.leaveTypeId || !form.startDate || !form.endDate || !form.reason}
                  className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl disabled:opacity-50">
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Submit
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold text-[#4A5E55] bg-[#F7F9F8] rounded-xl">Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
            {requests.length === 0 ? (
              <div className="py-10 flex flex-col items-center text-[#8AA398] text-xs">No leave requests submitted.</div>
            ) : (
              <div className="divide-y divide-[#F0F4F2]">
                {requests.map((r) => (
                  <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#17211C]">{r.leaveType.name}</p>
                      <p className="text-[11px] text-[#8AA398]">
                        {new Date(r.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })} — {new Date(r.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusCls[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "punch" && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
          <p className="text-sm text-[#8AA398]">Punch correction requests — Coming soon. Contact HR directly for punch corrections.</p>
        </div>
      )}

      {tab === "wfh" && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
          <p className="text-sm text-[#8AA398]">Work from home requests — Coming soon.</p>
        </div>
      )}
    </div>
  );
}
