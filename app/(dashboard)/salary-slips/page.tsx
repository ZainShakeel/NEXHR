"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, FileText, Loader2, Download } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Slip = {
  id: string; month: number; year: number; basicSalary: number; allowances: number;
  grossSalary: number; otherDeductions: number; netSalary: number;
  workingDays: number; presentDays: number; isPaid: boolean; paidAt?: string;
  employee: { firstName: string; lastName: string; employeeId: string; designation: string; department?: { name: string } };
};

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
      .then((r) => r.json())
      .then((d) => { setSlips(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const filtered = slips.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = `${s.employee.firstName} ${s.employee.lastName} ${s.employee.employeeId}`.toLowerCase().includes(q);
    const matchMonth = !monthFilter || `${s.year}-${String(s.month).padStart(2, "0")}` === monthFilter;
    return matchSearch && matchMonth;
  });

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
          <h1 className="text-2xl font-bold text-[#17211C]">Salary Slips</h1>
          <p className="text-[#4A5E55] text-sm mt-1">{slips.length} salary slips generated</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 mb-4 shadow-sm flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA398]" />
            <input type="text" placeholder="Search employee…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F7F9F8] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
          </div>
          <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[#F7F9F8] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-12 flex flex-col items-center text-center shadow-sm">
            <FileText size={32} className="text-[#8AA398] mb-3" />
            <p className="text-sm font-semibold text-[#17211C]">No salary slips found</p>
            <p className="text-xs text-[#8AA398] mt-1">Generate payroll from the Payroll section first</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9F8] border-b border-[#E5EAE7]">
                    {["Employee", "Month", "Basic", "Allowances", "Deductions", "Net Salary", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t border-[#F0F4F2] hover:bg-[#F7F9F8]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#064E3B] text-white text-[10px] font-bold flex items-center justify-center">
                            {s.employee.firstName[0]}{s.employee.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#17211C]">{s.employee.firstName} {s.employee.lastName}</p>
                            <p className="text-[10px] text-[#8AA398]">{s.employee.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#4A5E55]">{MONTHS[s.month]} {s.year}</td>
                      <td className="px-4 py-3 text-xs text-[#4A5E55]">PKR {Number(s.basicSalary).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-[#4A5E55]">PKR {Number(s.allowances).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-red-600">- PKR {Number(s.otherDeductions).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#064E3B]">PKR {Number(s.netSalary).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.isPaid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                          {s.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/salary-slips/${s.id}`} className="flex items-center gap-1 text-[10px] font-semibold text-[#16A34A] hover:underline">
                          <Download size={11} /> View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
