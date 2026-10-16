"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, FileText, Loader2, ExternalLink, Download, TrendingUp, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/hooks/useCompany";

type Slip = {
  id: string; month: number; year: number; basicSalary: number; allowances: number;
  grossSalary: number; otherDeductions: number; netSalary: number;
  workingDays: number; presentDays: number; isPaid: boolean;
  employee: { firstName: string; lastName: string; employeeId: string; designation: string; department?: { name: string } };
};

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const AVATAR_COLORS = ["#07845A", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

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
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#07845A" }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Salary Slips</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{slips.length} salary slips generated</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#475569" }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Slips", value: slips.length, icon: FileText, color: "#8B5CF6", bg: "#EDE9FE" },
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

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center" style={{ border: "1px solid #E2E8F0" }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
          <input type="text" placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }} />
        </div>
        <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }} />
        {monthFilter && (
          <button onClick={() => setMonthFilter("")}
            className="px-3 py-2 text-xs font-medium rounded-lg"
            style={{ background: "#FEE2E2", color: "#EF4444" }}>
            Clear
          </button>
        )}
        <span className="ml-auto text-sm text-[#64748B]">{filtered.length} slips</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#EDE9FE" }}>
              <FileText size={24} style={{ color: "#8B5CF6" }} />
            </div>
            <p className="text-sm font-semibold text-[#475569]">No salary slips found</p>
            <p className="text-xs text-[#94A3B8] mt-1">Generate payroll first to create salary slips</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
                  {["Employee", "Month", "Basic Salary", "Allowances", "Deductions", "Net Salary", "Status", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F8FAFC" }}>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                        >
                          {s.employee.firstName[0]}{s.employee.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#172B24]">{s.employee.firstName} {s.employee.lastName}</p>
                          <p className="text-[10px] text-[#94A3B8] font-mono">{s.employee.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#475569]">{MONTHS[s.month]} {s.year}</td>
                    <td className="px-5 py-3.5 text-sm text-[#475569]">PKR {Number(s.basicSalary).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "#07845A" }}>+PKR {Number(s.allowances).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-red-500">−PKR {Number(s.otherDeductions).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold" style={{ color: "#07845A" }}>PKR {Number(s.netSalary).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={s.isPaid
                          ? { background: "#E3F6EB", color: "#07845A" }
                          : { background: "#FEF3C7", color: "#F59E0B" }}>
                        {s.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/salary-slips/${s.id}`}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                        style={{ background: "#EDE9FE", color: "#8B5CF6" }}>
                        <ExternalLink size={11} /> View
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
  );
}
