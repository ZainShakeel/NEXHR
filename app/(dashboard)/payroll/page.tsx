"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, DollarSign, Loader2, CheckCircle2, Check,
  ChevronDown, ChevronUp, Users, TrendingUp, Clock,
} from "lucide-react";
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

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:      { label: "Draft",      color: "#64748B", bg: "#F1F5F9" },
  PROCESSING: { label: "Processing", color: "#F59E0B", bg: "#FEF3C7" },
  PROCESSED:  { label: "Processed",  color: "#3B82F6", bg: "#DBEAFE" },
  PAID:       { label: "Paid",       color: "#07845A", bg: "#E3F6EB" },
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
    if (!res.ok) { alert(data.error || "Failed to generate payroll"); setGenerating(false); return; }
    setGenerating(false);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/payroll", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const totalPaid = runs.filter(r => r.status === "PAID").reduce((s, r) => s + Number(r.totalAmount), 0);
  const totalPending = runs.filter(r => r.status !== "PAID").reduce((s, r) => s + Number(r.totalAmount), 0);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#07845A" }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Payroll</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Generate and manage monthly payroll runs</p>
        </div>
        {/* Generate form */}
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#172B24" }}>
            {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2024} max={2030}
            className="w-20 px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#172B24" }} />
          <button onClick={generatePayroll} disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "#07845A" }}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Generate Payroll
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Runs", value: runs.length, icon: TrendingUp, color: "#8B5CF6", bg: "#EDE9FE" },
          { label: "Total Paid", value: `PKR ${(totalPaid / 1000).toFixed(0)}K`, icon: DollarSign, color: "#07845A", bg: "#E3F6EB" },
          { label: "Pending", value: `PKR ${(totalPending / 1000).toFixed(0)}K`, icon: Clock, color: "#F59E0B", bg: "#FEF3C7" },
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

      {/* Runs */}
      {runs.length === 0 ? (
        <div className="bg-white rounded-xl p-16 flex flex-col items-center text-center" style={{ border: "1px solid #E2E8F0" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#E3F6EB" }}>
            <DollarSign size={26} style={{ color: "#07845A" }} />
          </div>
          <p className="text-sm font-semibold text-[#475569]">No payroll runs yet</p>
          <p className="text-xs text-[#94A3B8] mt-1">Select a month and year above, then click Generate Payroll</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map(run => {
            const st = STATUS_STYLE[run.status] ?? { label: run.status, color: "#64748B", bg: "#F1F5F9" };
            const isOpen = expanded === run.id;
            return (
              <div key={run.id} className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
                {/* Run header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : run.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E3F6EB" }}>
                      <DollarSign size={18} style={{ color: "#07845A" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#172B24]">{MONTHS[run.month]} {run.year}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Users size={11} style={{ color: "#94A3B8" }} />
                        <span className="text-[11px] text-[#94A3B8]">{run.employeeCount} employees</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#172B24]">PKR {Number(run.totalAmount).toLocaleString()}</p>
                      <p className="text-[11px] text-[#94A3B8]">Total payout</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    {run.status === "DRAFT" && (
                      <button onClick={e => { e.stopPropagation(); updateStatus(run.id, "PROCESSED"); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                        style={{ background: "#DBEAFE", color: "#3B82F6", border: "1px solid #BFDBFE" }}>
                        <CheckCircle2 size={11} /> Process
                      </button>
                    )}
                    {run.status === "PROCESSED" && (
                      <button onClick={e => { e.stopPropagation(); updateStatus(run.id, "PAID"); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:opacity-90"
                        style={{ background: "#07845A" }}>
                        <Check size={11} /> Mark as Paid
                      </button>
                    )}
                    {isOpen ? <ChevronUp size={16} style={{ color: "#94A3B8" }} /> : <ChevronDown size={16} style={{ color: "#94A3B8" }} />}
                  </div>
                </div>

                {/* Expanded salary table */}
                {isOpen && run.salarySlips.length > 0 && (
                  <div style={{ borderTop: "1px solid #F1F5F9" }}>
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: "#FAFAFA" }}>
                          {["Employee", "Department", "Designation", "Net Salary"].map(h => (
                            <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "#F8FAFC" }}>
                        {run.salarySlips.map(s => (
                          <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                            <td className="px-5 py-3">
                              <p className="text-sm font-semibold text-[#172B24]">{s.employee.firstName} {s.employee.lastName}</p>
                              <p className="text-[10px] text-[#94A3B8] font-mono">{s.employee.employeeId}</p>
                            </td>
                            <td className="px-5 py-3 text-sm text-[#475569]">{s.employee.department?.name ?? "—"}</td>
                            <td className="px-5 py-3 text-sm text-[#475569]">{s.employee.designation}</td>
                            <td className="px-5 py-3">
                              <span className="text-sm font-bold" style={{ color: "#07845A" }}>PKR {Number(s.netSalary).toLocaleString()}</span>
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
  );
}
