"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, DollarSign, Loader2, CheckCircle2, Check, ChevronDown, ChevronUp, Users } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type PayrollRun = {
  id: string; month: number; year: number; totalAmount: number;
  employeeCount: number; status: string; processedAt?: string;
  salarySlips: {
    id: string; netSalary: number;
    employee: { firstName: string; lastName: string; employeeId: string; designation: string; department?: { name: string } };
  }[];
};

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:      { bg: "rgba(107,114,128,0.1)", color: "#6B7280", label: "Draft" },
  PROCESSING: { bg: "rgba(245,158,11,0.1)",  color: "#D97706", label: "Processing" },
  PROCESSED:  { bg: "rgba(59,130,246,0.1)",  color: "#3B82F6", label: "Processed" },
  PAID:       { bg: "rgba(22,163,74,0.1)",   color: "#16A34A", label: "Paid" },
};

export default function PayrollPage() {
  const { companyId, status: authStatus } = useCompany();
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/payroll?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setRuns(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const generatePayroll = async () => {
    setGenerating(true);
    const res = await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, month, year }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Failed"); setGenerating(false); return; }
    setGenerating(false);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/payroll", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  };

  const totalPaid = runs.filter(r => r.status === "PAID").reduce((s, r) => s + Number(r.totalAmount), 0);
  const totalPending = runs.filter(r => r.status !== "PAID").reduce((s, r) => s + Number(r.totalAmount), 0);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0D1F15]">Payroll</h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">Generate and manage monthly payroll runs</p>
          </div>
          {/* Generate form */}
          <div className="flex items-center gap-2">
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="px-3 py-2 text-sm font-semibold rounded-xl focus:outline-none"
              style={{ background: "white", border: "1px solid #E2ECE7", color: "#0D1F15" }}>
              {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2024} max={2030}
              className="w-20 px-3 py-2 text-sm font-semibold rounded-xl focus:outline-none"
              style={{ background: "white", border: "1px solid #E2ECE7", color: "#0D1F15" }} />
            <button onClick={generatePayroll} disabled={generating}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 hover:shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
              {generating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />} Generate
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Runs", value: runs.length, gradient: "linear-gradient(135deg,#2d1f5e,#7C3AED)" },
            { label: "Total Paid", value: `PKR ${(totalPaid / 1000).toFixed(0)}K`, gradient: "linear-gradient(135deg,#071A10,#16A34A)" },
            { label: "Pending", value: `PKR ${(totalPending / 1000).toFixed(0)}K`, gradient: "linear-gradient(135deg,#451a03,#d97706)" },
          ].map(k => (
            <div key={k.label} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: k.gradient, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
              <p className="text-2xl font-black text-white">{k.value}</p>
              <p className="text-[11px] text-white/60 font-semibold mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {runs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center" style={{ border: "1px solid #E2ECE7" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(22,163,74,0.08)" }}>
              <DollarSign size={26} className="text-[#16A34A]" />
            </div>
            <p className="text-sm font-bold text-[#0D1F15]">No payroll runs yet</p>
            <p className="text-xs text-[#9BB8A8] mt-1">Select a month and year, then click Generate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map(run => {
              const st = STATUS_STYLE[run.status] ?? { bg: "rgba(107,114,128,0.1)", color: "#6B7280", label: run.status };
              return (
                <div key={run.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
                  {/* Run header */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#F8FAF9] transition-colors"
                    onClick={() => setExpanded(expanded === run.id ? null : run.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#071A10,#16A34A)" }}>
                        <DollarSign size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0D1F15]">{MONTHS[run.month]} {run.year}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Users size={11} className="text-[#9BB8A8]" />
                          <span className="text-[10px] text-[#9BB8A8] font-semibold">{run.employeeCount} employees</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-black text-[#0D1F15]">PKR {Number(run.totalAmount).toLocaleString()}</p>
                        <p className="text-[10px] text-[#9BB8A8]">Total payout</p>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      {run.status === "DRAFT" && (
                        <button onClick={e => { e.stopPropagation(); updateStatus(run.id, "PROCESSED"); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all hover:shadow"
                          style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}>
                          <CheckCircle2 size={10} /> Process
                        </button>
                      )}
                      {run.status === "PROCESSED" && (
                        <button onClick={e => { e.stopPropagation(); updateStatus(run.id, "PAID"); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white rounded-xl transition-all hover:shadow"
                          style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
                          <Check size={10} /> Mark Paid
                        </button>
                      )}
                      {expanded === run.id ? <ChevronUp size={15} className="text-[#9BB8A8]" /> : <ChevronDown size={15} className="text-[#9BB8A8]" />}
                    </div>
                  </div>

                  {/* Expanded salary table */}
                  {expanded === run.id && run.salarySlips.length > 0 && (
                    <div style={{ borderTop: "1px solid #EEF5F1" }}>
                      <table className="w-full">
                        <thead>
                          <tr style={{ background: "#F8FAF9" }}>
                            {["Employee", "Department", "Designation", "Net Salary"].map(h => (
                              <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {run.salarySlips.map(s => (
                            <tr key={s.id} className="border-t hover:bg-[#F8FAF9] transition-colors" style={{ borderColor: "#EEF5F1" }}>
                              <td className="px-5 py-3">
                                <p className="text-xs font-bold text-[#0D1F15]">{s.employee.firstName} {s.employee.lastName}</p>
                                <p className="text-[10px] text-[#9BB8A8] font-mono">{s.employee.employeeId}</p>
                              </td>
                              <td className="px-5 py-3 text-xs text-[#6B8C7A]">{s.employee.department?.name ?? "—"}</td>
                              <td className="px-5 py-3 text-xs text-[#6B8C7A]">{s.employee.designation}</td>
                              <td className="px-5 py-3">
                                <span className="text-sm font-black" style={{ color: "#16A34A" }}>PKR {Number(s.netSalary).toLocaleString()}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
