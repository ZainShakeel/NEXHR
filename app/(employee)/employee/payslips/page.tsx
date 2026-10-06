"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, FileText, Download } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type Slip = {
  id: string; month: number; year: number; basicSalary: number; allowances: number;
  grossSalary: number; otherDeductions: number; netSalary: number;
  workingDays: number; presentDays: number; isPaid: boolean;
};

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function EmployeePayslipsPage() {
  const { companyId, employeeId, status: authStatus } = useCompany();
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Slip | null>(null);

  const load = useCallback(() => {
    if (!companyId || !employeeId) return;
    fetch(`/api/salary-slips?companyId=${companyId}&employeeId=${employeeId}`)
      .then((r) => r.json())
      .then((d) => { setSlips(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, employeeId]);

  useEffect(() => { load(); }, [load]);

  if (authStatus === "loading" || loading) {
    return <div className="flex-1 flex items-center justify-center bg-[#F7F9F8]"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9F8] p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#17211C]">My Payslips</h1>
        <p className="text-sm text-[#4A5E55]">View and download salary slips</p>
      </div>

      {selected && (
        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#17211C]">{MONTHS[selected.month]} {selected.year} — Salary Slip</h2>
            <button onClick={() => setSelected(null)} className="text-xs text-[#8AA398] hover:text-[#4A5E55]">Close</button>
          </div>
          <div className="space-y-2.5">
            {[
              ["Basic Salary", `PKR ${Number(selected.basicSalary).toLocaleString()}`],
              ["Allowances", `PKR ${Number(selected.allowances).toLocaleString()}`],
              ["Gross Salary", `PKR ${Number(selected.grossSalary).toLocaleString()}`],
              ["Deductions", `- PKR ${Number(selected.otherDeductions).toLocaleString()}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-[#8AA398]">{k}</span>
                <span className="text-[#4A5E55]">{v}</span>
              </div>
            ))}
            <div className="border-t border-[#E5EAE7] pt-2.5 flex justify-between">
              <span className="text-sm font-bold text-[#17211C]">Net Salary</span>
              <span className="text-sm font-bold text-[#064E3B]">PKR {Number(selected.netSalary).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-[#8AA398]">Working Days</span>
              <span className="text-[#4A5E55]">{selected.presentDays} / {selected.workingDays}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F7F9F8]">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${selected.isPaid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              {selected.isPaid ? "Paid" : "Pending"}
            </span>
          </div>
        </div>
      )}

      {slips.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-12 flex flex-col items-center text-center shadow-sm">
          <FileText size={28} className="text-[#8AA398] mb-3" />
          <p className="text-sm font-semibold text-[#17211C]">No payslips available yet</p>
          <p className="text-xs text-[#8AA398] mt-1">Payslips appear here once payroll is processed by HR</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slips.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-[#E5EAE7] p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={17} className="text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#17211C]">{MONTHS[s.month]} {s.year}</p>
                  <p className="text-xs text-[#8AA398]">PKR {Number(s.netSalary).toLocaleString()} net</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.isPaid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {s.isPaid ? "Paid" : "Pending"}
                </span>
                <button onClick={() => setSelected(s)} className="text-xs font-semibold text-[#16A34A] hover:underline flex items-center gap-1">
                  <Download size={11} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
