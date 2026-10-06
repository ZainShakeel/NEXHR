"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type LeaveReq = {
  id: string; days: number; reason: string; status: string;
  startDate: string; endDate: string; createdAt: string;
  employee: { firstName: string; lastName: string; employeeId: string };
  leaveType: { name: string; color: string };
};

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
      .then((r) => r.json())
      .then((d) => { setRequests(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActing(id);
    await fetch("/api/leave", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    await load();
    setActing(null);
  };

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = `${r.employee.firstName} ${r.employee.lastName} ${r.employee.employeeId}`.toLowerCase().includes(q);
    const matchF = filter === "ALL" || r.status === filter;
    return matchQ && matchF;
  });

  const pending  = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  const statusBadge = (s: string) => {
    if (s === "APPROVED") return "bg-green-50 text-green-700";
    if (s === "REJECTED") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

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
          <h1 className="text-2xl font-bold text-[#17211C]">Leave Management</h1>
          <p className="text-[#4A5E55] text-sm mt-1">Review and manage employee leave requests</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Pending",  value: pending,  icon: Clock,        bg: "bg-amber-50", text: "text-amber-700" },
            { label: "Approved", value: approved, icon: CheckCircle2, bg: "bg-green-50", text: "text-green-700" },
            { label: "Rejected", value: rejected, icon: XCircle,      bg: "bg-red-50",   text: "text-red-700"   },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E5EAE7] p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={18} className={s.text} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#17211C]">{s.value}</p>
                <p className="text-xs text-[#8AA398]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 mb-4 shadow-sm flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA398]" />
            <input type="text" placeholder="Search employee…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F7F9F8] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
          </div>
          <div className="flex gap-1">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === f ? "bg-[#064E3B] text-white" : "bg-[#F7F9F8] text-[#4A5E55] border border-[#E5EAE7]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#8AA398] text-sm">
              No leave requests found.
            </div>
          ) : (
            <div className="divide-y divide-[#F0F4F2]">
              {filtered.map((r) => (
                <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#F7F9F8]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#064E3B] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {r.employee.firstName[0]}{r.employee.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#17211C]">{r.employee.firstName} {r.employee.lastName}</p>
                      <p className="text-[10px] text-[#8AA398]">{r.employee.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-[#17211C]" style={{ color: r.leaveType.color }}>{r.leaveType.name}</span>
                      <span className="text-[10px] text-[#8AA398]">· {r.days} day{r.days > 1 ? "s" : ""}</span>
                    </div>
                    <p className="text-[10px] text-[#8AA398]">
                      {new Date(r.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })} — {new Date(r.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-[10px] text-[#4A5E55] italic mt-0.5">"{r.reason}"</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(r.status)}`}>{r.status}</span>
                    {r.status === "PENDING" && (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleAction(r.id, "APPROVED")} disabled={acting === r.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold rounded-lg hover:bg-[#BBF7D0] disabled:opacity-50">
                          {acting === r.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />} Approve
                        </button>
                        <button onClick={() => handleAction(r.id, "REJECTED")} disabled={acting === r.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#FEE2E2] text-[#991B1B] text-[10px] font-bold rounded-lg hover:bg-[#FECACA] disabled:opacity-50">
                          <XCircle size={10} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
