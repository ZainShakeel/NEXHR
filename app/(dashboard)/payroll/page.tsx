"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, DollarSign, Loader2, CheckCircle2, Clock, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type PayrollRun = {
  id: string; month: number; year: number; totalAmount: number;
  employeeCount: number; status: string; processedAt?: string;
  salarySlips: { id: string; netSalary: number; employee: { firstName: string; lastName: string; employeeId: string; designation: string; department?: { name: string } } }[];
};

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const statusCls: Record<string, string> = {
  DRAFT:      "bg-gray-100 text-gray-600",
  PROCESSING: "bg-amber-50 text-amber-700",
  PROCESSED:  "bg-blue-50 text-blue-700",
  PAID:       "bg-green-50 text-green-700",
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
      .then((r) => r.json())
      .then((d) => { setRuns(Array.isArray(d) ? d : []); setLoading(false); })
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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#17211C]">Payroll</h1>
            <p className="text-[#4A5E55] text-sm mt-1">Generate and manage monthly payroll runs</p>
          </div>

          {/* Generate form */}
          <div className="flex items-center gap-2">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] bg-white">
              {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2024} max={2030}
              className="w-20 px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] bg-white" />
            <button onClick={generatePayroll} disabled={generating}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B] disabled:opacity-50">
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />} Generate
            </button>
          </div>
        </div>

        {runs.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-12 flex flex-col items-center text-center shadow-sm">
            <DollarSign size={32} className="text-[#8AA398] mb-3" />
            <p className="text-sm font-semibold text-[#17211C]">No payroll runs yet</p>
            <p className="text-xs text-[#8AA398] mt-1">Select a month and year, then click Generate</p>
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <div key={run.id} className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#F7F9F8]"
                  onClick={() => setExpanded(expanded === run.id ? null : run.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
                      <DollarSign size={18} className="text-[#16A34A]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#17211C]">{MONTHS[run.month]} {run.year}</p>
                      <p className="text-[10px] text-[#8AA398]">{run.employeeCount} employees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#064E3B]">PKR {Number(run.totalAmount).toLocaleString()}</p>
                      <p className="text-[10px] text-[#8AA398]">Total payout</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCls[run.status]}`}>{run.status}</span>
                    {run.status === "DRAFT" && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(run.id, "PROCESSED"); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg hover:bg-blue-100">
                        <CheckCircle2 size={10} /> Process
                      </button>
                    )}
                    {run.status === "PROCESSED" && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(run.id, "PAID"); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg hover:bg-green-100">
                        <Check size={10} /> Mark Paid
                      </button>
                    )}
                  </div>
                </div>

                {expanded === run.id && run.salarySlips.length > 0 && (
                  <div className="border-t border-[#F7F9F8]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F7F9F8]">
                          {["Employee", "Department", "Designation", "Net Salary"].map((h) => (
                            <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {run.salarySlips.map((s) => (
                          <tr key={s.id} className="border-t border-[#F0F4F2] hover:bg-[#F7F9F8]">
                            <td className="px-5 py-3">
                              <p className="text-xs font-medium text-[#17211C]">{s.employee.firstName} {s.employee.lastName}</p>
                              <p className="text-[10px] text-[#8AA398]">{s.employee.employeeId}</p>
                            </td>
                            <td className="px-5 py-3 text-xs text-[#4A5E55]">{s.employee.department?.name ?? "—"}</td>
                            <td className="px-5 py-3 text-xs text-[#4A5E55]">{s.employee.designation}</td>
                            <td className="px-5 py-3 text-xs font-bold text-[#064E3B]">PKR {Number(s.netSalary).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
