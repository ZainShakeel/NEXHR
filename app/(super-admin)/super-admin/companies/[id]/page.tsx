"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Building2, Users, Mail, Globe, Calendar, CheckCircle2, XCircle } from "lucide-react";

type Company = {
  id: string; name: string; domain: string; email?: string; phone?: string;
  address?: string; website?: string; timezone: string; currency: string;
  isActive: boolean; createdAt: string;
  _count: { employees: number; users: number; departments: number };
  users: { email: string; createdAt: string }[];
  departments: { id: string; name: string; _count: { employees: number } }[];
};

export default function CompanyDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/super-admin/companies/${id}`)
      .then((r) => r.json())
      .then((d) => { setCompany(d?.id ? d : null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={22} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-[#6B8C7A]">
        <Building2 size={32} className="mb-3 opacity-40" />
        <p className="text-sm text-[#0D1F15] font-semibold">Company not found</p>
        <button onClick={() => router.back()} className="mt-3 text-xs text-[#16A34A] hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full bg-[#F4F8F6] space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-[#E5EDE9] flex items-center justify-center text-[#6B8C7A] hover:text-[#0D1F15] hover:bg-[#F0F9F3] transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#0D1F15]">{company.name}</h1>
          <p className="text-[#6B8C7A] text-sm font-mono">{company.domain}</p>
        </div>
        {company.isActive ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200">
            <CheckCircle2 size={11} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-500 border border-red-200">
            <XCircle size={11} /> Inactive
          </span>
        )}
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Employees", value: company._count.employees, icon: Users, accent: "#16A34A", bg: "bg-[#F0F9F3]", border: "border-[#C6E9D3]" },
          { label: "Departments", value: company._count.departments, icon: Building2, accent: "#2563EB", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Users", value: company._count.users, icon: Users, accent: "#7C3AED", bg: "bg-violet-50", border: "border-violet-200" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-3`}>
              <s.icon size={16} style={{ color: s.accent }} />
            </div>
            <p className="text-2xl font-black text-[#0D1F15]">{s.value}</p>
            <p className="text-[11px] text-[#6B8C7A] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Details + Owner */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Company Info */}
        <div className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#0D1F15] mb-4">Company Details</h2>
          <div className="space-y-3.5">
            {[
              { icon: Building2, label: "Company Name", value: company.name },
              { icon: Globe, label: "Domain", value: company.domain },
              { icon: Mail, label: "Email", value: company.email ?? "Not set" },
              { icon: Calendar, label: "Joined", value: new Date(company.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" }) },
              { icon: Globe, label: "Timezone", value: company.timezone },
              { icon: Globe, label: "Currency", value: company.currency },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F4F8F6] border border-[#E5EDE9] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-[#6B8C7A]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#9BB8A8] font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-[#0D1F15] font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Owner + Departments */}
        <div className="space-y-5">
          <div className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#0D1F15] mb-4">Owner / Admin</h2>
            {company.users.length === 0 ? (
              <p className="text-sm text-[#6B8C7A]">No admin found</p>
            ) : (
              <div className="space-y-3">
                {company.users.map((u) => (
                  <div key={u.email} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F0F9F3] border border-[#C6E9D3] text-[#16A34A] text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0D1F15]">{u.email}</p>
                      <p className="text-[11px] text-[#6B8C7A]">Company Owner · Joined {new Date(u.createdAt).toLocaleDateString("en-PK", { month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {company.departments.length > 0 && (
            <div className="bg-white border border-[#E5EDE9] rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#0D1F15] mb-4">Departments ({company.departments.length})</h2>
              <div className="space-y-2">
                {company.departments.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-[#EEF5F1] last:border-0">
                    <span className="text-sm text-[#0D1F15] font-medium">{d.name}</span>
                    <span className="text-xs text-[#6B8C7A]">
                      <Users size={11} className="inline mr-1" />{d._count.employees} employees
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
