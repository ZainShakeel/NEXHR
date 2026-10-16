"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, CheckCircle2, XCircle, Clock, Loader2, Calendar, Filter,
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type LeaveReq = {
  id: string; days: number; reason: string; status: string;
  startDate: string; endDate: string; createdAt: string;
  employee: { firstName: string; lastName: string; employeeId: string; designation: string; department?: { name: string } };
  leaveType: { name: string; color: string };
};

const FILTER_TABS = [
  { key: "ALL", label: "All Requests" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "Pending",  color: "#F59E0B", bg: "#FEF3C7" },
  APPROVED: { label: "Approved", color: "#07845A", bg: "#E3F6EB" },
  REJECTED: { label: "Rejected", color: "#EF4444", bg: "#FEE2E2" },
  CANCELLED:{ label: "Cancelled",color: "#64748B", bg: "#F1F5F9" },
};

const AVATAR_COLORS = ["#07845A", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
      style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
      {initials}
    </div>
  );
}

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
    await fetch("/api/leave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
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
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#07845A" }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>
      <div>
        <h1 className="text-xl font-bold text-[#172B24]">Leave Management</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Review and manage employee leave requests</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Approval", value: pending,  icon: Clock,        color: "#F59E0B", bg: "#FEF3C7" },
          { label: "Approved",         value: approved, icon: CheckCircle2, color: "#07845A", bg: "#E3F6EB" },
          { label: "Rejected",         value: rejected, icon: XCircle,      color: "#EF4444", bg: "#FEE2E2" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl p-5 flex items-center gap-4" style={{ border: "1px solid #E2E8F0" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
              <k.icon size={20} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#172B24]">{k.value}</p>
              <p className="text-sm text-[#64748B]">{k.label}</p>
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
        <div className="flex gap-1.5">
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={filter === t.key
                ? { background: "#07845A", color: "#fff" }
                : { background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" }}>
              {t.label}
              {t.key === "PENDING" && pending > 0 && (
                <span className="ml-1.5 w-4 h-4 rounded-full text-[9px] font-bold inline-flex items-center justify-center"
                  style={{ background: filter === "PENDING" ? "rgba(255,255,255,0.25)" : "#EF4444", color: "#fff" }}>
                  {pending}
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-[#64748B]">{filtered.length} requests</span>
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar size={32} className="text-[#CBD5E1] mb-3" />
            <p className="text-sm font-semibold text-[#475569]">No leave requests found</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              {requests.length === 0 ? "Leave requests from employees will appear here" : "Try a different filter"}
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3" style={{ borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                <span>Employee</span>
                <span>Leave Type</span>
                <span>Duration</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
              {filtered.map((r, i) => {
                const st = STATUS_STYLE[r.status] ?? { label: r.status, color: "#64748B", bg: "#F1F5F9" };
                const daysText = `${r.days} day${r.days > 1 ? "s" : ""}`;
                const dateRange = r.startDate === r.endDate
                  ? new Date(r.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })
                  : `${new Date(r.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })} – ${new Date(r.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}`;

                return (
                  <div key={r.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                    {/* Employee */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={`${r.employee.firstName} ${r.employee.lastName}`} index={i} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#172B24] truncate">{r.employee.firstName} {r.employee.lastName}</p>
                        <p className="text-[11px] text-[#94A3B8]">{r.employee.designation}</p>
                        {r.reason && <p className="text-[10px] text-[#94A3B8] italic truncate">"{r.reason}"</p>}
                      </div>
                    </div>

                    {/* Leave Type */}
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                        style={{ background: r.leaveType.color || "#07845A" }}>
                        {r.leaveType.name}
                      </span>
                    </div>

                    {/* Duration */}
                    <div>
                      <p className="text-sm font-semibold text-[#172B24]">{daysText}</p>
                      <p className="text-[10px] text-[#94A3B8]">{dateRange}</p>
                    </div>

                    {/* Status */}
                    <div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div>
                      {r.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(r.id, "APPROVED")} disabled={acting === r.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all disabled:opacity-50 hover:opacity-90"
                            style={{ background: "#07845A" }}>
                            {acting === r.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={11} />}
                            Approve
                          </button>
                          <button onClick={() => handleAction(r.id, "REJECTED")} disabled={acting === r.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                            style={{ background: "#FEE2E2", color: "#EF4444", border: "1px solid #FECACA" }}>
                            <XCircle size={11} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">
                          {new Date(r.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
