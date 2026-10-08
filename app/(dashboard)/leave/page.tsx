"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, CheckCircle2, XCircle, Clock, Loader2, Calendar } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type LeaveReq = {
  id: string; days: number; reason: string; status: string;
  startDate: string; endDate: string; createdAt: string;
  employee: { firstName: string; lastName: string; employeeId: string };
  leaveType: { name: string; color: string };
};

const FILTER_TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

export default function LeavePage() {
  const { companyId, status: authStatus } = useCompany();
  const [requests, setRequests] = useState<LeaveReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/leave?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setRequests(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActing(id);
    await fetch("/api/leave", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    await load();
    setActing(null);
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchQ = `${r.employee.firstName} ${r.employee.lastName} ${r.employee.employeeId}`.toLowerCase().includes(q);
    return matchQ && (filter === "ALL" || r.status === filter);
  });

  const pending  = requests.filter(r => r.status === "PENDING").length;
  const approved = requests.filter(r => r.status === "APPROVED").length;
  const rejected = requests.filter(r => r.status === "REJECTED").length;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full" style={{ background: "#F0F4F2" }}>
        <Loader2 size={24} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#F0F4F2" }}>
      <div className="flex-shrink-0 px-5 pt-5 pb-4">
        <h1 className="text-xl font-black text-[#0D1F15]">Leave Management</h1>
        <p className="text-sm text-[#6B8C7A] mt-0.5">Review and manage employee leave requests</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending Approval", value: pending,  icon: Clock,        gradient: "linear-gradient(135deg,#451a03,#d97706)" },
            { label: "Approved",         value: approved, icon: CheckCircle2, gradient: "linear-gradient(135deg,#071A10,#16A34A)" },
            { label: "Rejected",         value: rejected, icon: XCircle,      gradient: "linear-gradient(135deg,#3b0a0a,#DC2626)" },
          ].map(k => (
            <div key={k.label} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: k.gradient, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.14)" }}>
                  <k.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white leading-none">{k.value}</p>
                  <p className="text-[11px] text-white/60 font-semibold mt-0.5">{k.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl px-4 py-3" style={{ border: "1px solid #E2ECE7", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BB8A8]" />
            <input type="text" placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none"
              style={{ background: "#F5F9F6", border: "1px solid #E2ECE7" }} />
          </div>
          <div className="flex gap-1.5">
            {FILTER_TABS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
                style={filter === f
                  ? { background: "linear-gradient(135deg,#071A10,#16A34A)", color: "white" }
                  : { background: "#F5F9F6", color: "#6B8C7A", border: "1px solid #E2ECE7" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Leave requests list */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
          <div className="px-5 py-3.5 flex items-center gap-3" style={{ background: "linear-gradient(90deg,#071A10,#0A2A1A)" }}>
            <Calendar size={14} className="text-green-400" />
            <span className="text-sm font-bold text-white">Leave Requests</span>
            {pending > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">{pending}</span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar size={28} className="text-[#C5D9CE] mb-3" />
              <p className="text-sm font-bold text-[#0D1F15]">No leave requests found</p>
              <p className="text-xs text-[#9BB8A8] mt-1">Try changing the filter or search</p>
            </div>
          ) : (
            <div className="divide-y divide-[#EEF5F1]">
              {filtered.map(r => {
                const statusStyle =
                  r.status === "APPROVED" ? { bg: "rgba(22,163,74,0.1)", color: "#16A34A" } :
                  r.status === "REJECTED" ? { bg: "rgba(239,68,68,0.1)", color: "#EF4444" } :
                  { bg: "rgba(245,158,11,0.1)", color: "#D97706" };
                return (
                  <div key={r.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[#F8FAF9] transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#071A10,#16A34A)" }}>
                      {r.employee.firstName[0]}{r.employee.lastName[0]}
                    </div>

                    {/* Employee info */}
                    <div className="w-36 flex-shrink-0">
                      <p className="text-xs font-bold text-[#0D1F15] truncate">{r.employee.firstName} {r.employee.lastName}</p>
                      <p className="text-[10px] text-[#9BB8A8]">{r.employee.employeeId}</p>
                    </div>

                    {/* Leave details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                          style={{ background: r.leaveType.color || "#16A34A" }}>
                          {r.leaveType.name}
                        </span>
                        <span className="text-[10px] font-semibold text-[#9BB8A8]">{r.days} day{r.days > 1 ? "s" : ""}</span>
                        <span className="text-[10px] text-[#9BB8A8]">
                          {new Date(r.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}
                          {r.endDate !== r.startDate && ` – ${new Date(r.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}`}
                        </span>
                      </div>
                      {r.reason && <p className="text-[10px] text-[#6B8C7A] italic truncate">"{r.reason}"</p>}
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}>
                        {r.status}
                      </span>
                      {r.status === "PENDING" && (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleAction(r.id, "APPROVED")} disabled={acting === r.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-white text-[10px] font-bold rounded-xl disabled:opacity-50 transition-all hover:shadow"
                            style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
                            {acting === r.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />} Approve
                          </button>
                          <button onClick={() => handleAction(r.id, "REJECTED")} disabled={acting === r.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-xl disabled:opacity-50 transition-all hover:shadow"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <XCircle size={10} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
