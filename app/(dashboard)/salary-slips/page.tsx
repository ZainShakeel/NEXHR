"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, FileText, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/hooks/useCompany";

type Slip = {
  id: string; month: number; year: number; basicSalary: number; allowances: number;
  grossSalary: number; otherDeductions: number; netSalary: number;
  workingDays: number; presentDays: number; isPaid: boolean;
  employee: { firstName: string; lastName: string; employeeId: string; designation: string; department?: { name: string } };
};

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#071A10,#16A34A)",
  "linear-gradient(135deg,#1e3a5f,#3B82F6)",
  "linear-gradient(135deg,#2d1f5e,#7C3AED)",
  "linear-gradient(135deg,#451a03,#d97706)",
];

export default function SalarySlipsPage() {
  const { companyId, status: authStatus } = useCompany();
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/salary-slips?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setSlips(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const filtered = slips.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = `${s.employee.firstName} ${s.employee.lastName} ${s.employee.employeeId}`.toLowerCase().includes(q);
    const matchMonth = !monthFilter || `${s.year}-${String(s.month).padStart(2, "0")}` === monthFilter;
    return matchSearch && matchMonth;
  });

  const totalPaid = slips.filter(s => s.isPaid).reduce((sum, s) => sum + Number(s.netSalary), 0);
  const totalPending = slips.filter(s => !s.isPaid).reduce((sum, s) => sum + Number(s.netSalary), 0);

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
        <h1 className="text-xl font-black text-[#0D1F15]">Salary Slips</h1>
        <p className="text-sm text-[#6B8C7A] mt-0.5">{slips.length} salary slips generated</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">

        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Slips", value: slips.length, gradient: "linear-gradient(135deg,#2d1f5e,#7C3AED)" },
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

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white rounded-2xl px-4 py-3" style={{ border: "1px solid #E2ECE7", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BB8A8]" />
            <input type="text" placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none"
              style={{ background: "#F5F9F6", border: "1px solid #E2ECE7" }} />
          </div>
          <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl focus:outline-none font-medium"
            style={{ background: "#F5F9F6", border: "1px solid #E2ECE7", color: "#0D1F15" }} />
          {monthFilter && (
            <button onClick={() => setMonthFilter("")}
              className="px-3 py-2 text-xs font-bold rounded-xl transition-all"
              style={{ background: "#F5F9F6", color: "#9BB8A8", border: "1px solid #E2ECE7" }}>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
          <div className="px-5 py-3.5 flex items-center gap-3" style={{ background: "linear-gradient(90deg,#2d1f5e,#4c1d95)" }}>
            <FileText size={14} className="text-purple-300" />
            <span className="text-sm font-bold text-white">Salary Slips</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa" }}>
              {filtered.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(124,58,237,0.08)" }}>
                <FileText size={24} className="text-[#7C3AED]" />
              </div>
              <p className="text-sm font-bold text-[#0D1F15]">No salary slips found</p>
              <p className="text-xs text-[#9BB8A8] mt-1">Generate payroll from the Payroll section first</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAF9", borderBottom: "1px solid #EEF5F1" }}>
                    {["Employee", "Month", "Basic", "Allowances", "Deductions", "Net Salary", "Status", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-[#F8FAF9] transition-colors" style={{ borderColor: "#EEF5F1" }}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                            style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>
                            {s.employee.firstName[0]}{s.employee.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0D1F15]">{s.employee.firstName} {s.employee.lastName}</p>
                            <p className="text-[10px] text-[#9BB8A8] font-mono">{s.employee.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-[#6B8C7A]">{MONTHS[s.month]} {s.year}</td>
                      <td className="px-4 py-3.5 text-xs text-[#6B8C7A]">PKR {Number(s.basicSalary).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-xs text-[#16A34A] font-semibold">+PKR {Number(s.allowances).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-xs text-red-500 font-semibold">−PKR {Number(s.otherDeductions).toLocaleString()}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-black" style={{ color: "#16A34A" }}>PKR {Number(s.netSalary).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                          style={s.isPaid
                            ? { background: "rgba(22,163,74,0.1)", color: "#16A34A" }
                            : { background: "rgba(245,158,11,0.1)", color: "#D97706" }}>
                          {s.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/salary-slips/${s.id}`}
                          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:shadow"
                          style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>
                          <ExternalLink size={10} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
