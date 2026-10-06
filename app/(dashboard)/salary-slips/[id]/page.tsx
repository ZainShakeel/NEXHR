"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, FileText, Building2 } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type Slip = {
  id: string; month: number; year: number;
  basicSalary: number; allowances: number; grossSalary: number;
  otherDeductions: number; netSalary: number;
  workingDays: number; presentDays: number; isPaid: boolean; paidAt?: string;
  employee: {
    firstName: string; lastName: string; employeeId: string; designation: string; joiningDate: string;
    cnic?: string; department?: { name: string };
    user: { email: string };
  };
  payrollRun: { status: string };
};

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SalarySlipDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { companyId, companyName, status: authStatus } = useCompany();
  const [slip, setSlip] = useState<Slip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId || !id) return;
    fetch(`/api/salary-slips/${id}?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => { setSlip(d?.id ? d : null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, id]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>
      </div>
    );
  }

  if (!slip) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <FileText size={28} className="text-[#8AA398]" />
          <p className="text-sm text-[#4A5E55]">Salary slip not found.</p>
          <button onClick={() => router.back()} className="text-xs text-[#16A34A]">Go back</button>
        </div>
      </div>
    );
  }

  const earnings = [
    { label: "Basic Salary", amount: slip.basicSalary },
    { label: "Allowances", amount: slip.allowances },
  ];
  const deductions = [
    { label: "EOBI", amount: 468 },
    { label: "Other Deductions", amount: Math.max(0, Number(slip.otherDeductions) - 468) },
  ].filter((d) => d.amount > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 bg-white border-b border-[#E5EAE7] flex items-center px-6 gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F7F9F8]">
          <ArrowLeft size={18} className="text-[#4A5E55]" />
        </button>
        <h1 className="text-sm font-bold text-[#17211C]">Salary Slip — {MONTHS[slip.month]} {slip.year}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#F7F9F8]">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E5EAE7] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#064E3B] px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={16} className="opacity-70" />
                  <span className="text-sm font-bold">{companyName}</span>
                </div>
                <p className="text-xs opacity-60">Salary Slip for {MONTHS[slip.month]} {slip.year}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${slip.isPaid ? "bg-green-400/20 text-green-300" : "bg-amber-400/20 text-amber-300"}`}>
                {slip.isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>

          {/* Employee Info */}
          <div className="px-6 py-4 border-b border-[#F0F4F2] bg-[#F7F9F8]">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ["Employee Name", `${slip.employee.firstName} ${slip.employee.lastName}`],
                ["Employee ID", slip.employee.employeeId],
                ["Designation", slip.employee.designation],
                ["Department", slip.employee.department?.name ?? "—"],
                ["Email", slip.employee.user.email],
                ["Joining Date", new Date(slip.employee.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" })],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] text-[#8AA398]">{k}</p>
                  <p className="font-semibold text-[#17211C]">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance */}
          <div className="px-6 py-4 border-b border-[#F0F4F2]">
            <h3 className="text-xs font-bold text-[#8AA398] uppercase tracking-wide mb-3">Attendance</h3>
            <div className="flex gap-6 text-xs">
              <div><p className="text-[#8AA398]">Working Days</p><p className="font-bold text-[#17211C] text-base">{slip.workingDays}</p></div>
              <div><p className="text-[#8AA398]">Present Days</p><p className="font-bold text-[#17211C] text-base">{slip.presentDays}</p></div>
            </div>
          </div>

          {/* Earnings + Deductions */}
          <div className="px-6 py-4 border-b border-[#F0F4F2]">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-[#8AA398] uppercase tracking-wide mb-3">Earnings</h3>
                <div className="space-y-2">
                  {earnings.map((e) => (
                    <div key={e.label} className="flex justify-between text-xs">
                      <span className="text-[#4A5E55]">{e.label}</span>
                      <span className="text-[#17211C]">PKR {Number(e.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-bold border-t border-[#F0F4F2] pt-2">
                    <span className="text-[#17211C]">Gross</span>
                    <span className="text-[#064E3B]">PKR {Number(slip.grossSalary).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#8AA398] uppercase tracking-wide mb-3">Deductions</h3>
                <div className="space-y-2">
                  {deductions.map((d) => (
                    <div key={d.label} className="flex justify-between text-xs">
                      <span className="text-[#4A5E55]">{d.label}</span>
                      <span className="text-red-600">- PKR {Number(d.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-bold border-t border-[#F0F4F2] pt-2">
                    <span className="text-[#17211C]">Total</span>
                    <span className="text-red-600">- PKR {Number(slip.otherDeductions).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="px-6 py-5 bg-[#064E3B] text-white flex items-center justify-between">
            <div>
              <p className="text-xs opacity-70">Net Salary</p>
              <p className="text-2xl font-bold mt-0.5">PKR {Number(slip.netSalary).toLocaleString()}</p>
            </div>
            {slip.isPaid && slip.paidAt && (
              <div className="text-right">
                <p className="text-[10px] opacity-60">Paid on</p>
                <p className="text-xs font-semibold">{new Date(slip.paidAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
