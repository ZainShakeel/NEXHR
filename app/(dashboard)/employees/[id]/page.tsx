"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Mail, Phone, Building2, Calendar, DollarSign, BadgeCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Employee = {
  id: string; employeeId: string; firstName: string; lastName: string; designation: string;
  employmentType: string; status: string; joiningDate: string; basicSalary: number; gender: string;
  cnic?: string; phone?: string; dateOfBirth?: string;
  department?: { name: string };
  shift?: { name: string; startTime: string; endTime: string };
  user: { email: string; role: string; isActive: boolean };
};

export default function EmployeeDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { companyId, status: authStatus } = useCompany();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId || !id) return;
    fetch(`/api/employees/${id}?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => { setEmp(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, id]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col h-full"><Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="flex flex-col h-full"><Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <User size={28} className="text-[#8AA398]" />
          <p className="text-sm text-[#4A5E55]">Employee not found.</p>
          <button onClick={() => router.back()} className="text-xs font-semibold text-[#16A34A]">Go back</button>
        </div>
      </div>
    );
  }

  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;

  const info = [
    { icon: Mail, label: "Email", value: emp.user.email },
    { icon: Phone, label: "Phone", value: emp.phone ?? "—" },
    { icon: BadgeCheck, label: "CNIC", value: emp.cnic ?? "—" },
    { icon: Building2, label: "Department", value: emp.department?.name ?? "—" },
    { icon: Calendar, label: "Joining Date", value: new Date(emp.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" }) },
    { icon: DollarSign, label: "Basic Salary", value: `PKR ${Number(emp.basicSalary).toLocaleString()}` },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F7F9F8]">
            <ArrowLeft size={18} className="text-[#4A5E55]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#17211C]">{emp.firstName} {emp.lastName}</h1>
            <p className="text-[#4A5E55] text-sm mt-0.5">{emp.designation}</p>
          </div>
        </div>

        <div className="max-w-3xl space-y-5">
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#064E3B] text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-[#17211C]">{emp.firstName} {emp.lastName}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${emp.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {emp.status}
                </span>
              </div>
              <p className="text-sm text-[#4A5E55]">{emp.designation}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8AA398]">
                <span>{emp.employeeId}</span>
                <span>·</span>
                <span>{emp.employmentType.replace("_", " ")}</span>
                <span>·</span>
                <span>{emp.gender}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8AA398]">Role</p>
              <p className="text-xs font-bold text-[#17211C]">{emp.user.role.replace("_", " ")}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#17211C] mb-4">Contact & Job Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#F7F9F8] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={14} className="text-[#4A5E55]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8AA398]">{label}</p>
                    <p className="text-xs font-semibold text-[#17211C]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {emp.shift && (
            <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#17211C] mb-3">Assigned Shift</h2>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
                  <Calendar size={16} className="text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#17211C]">{emp.shift.name}</p>
                  <p className="text-xs text-[#8AA398] font-mono">{emp.shift.startTime} — {emp.shift.endTime}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
