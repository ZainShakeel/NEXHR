"use client";

import { useEffect, useState } from "react";
import { Loader2, Building2, Users, CheckCircle2, Crown } from "lucide-react";

type StatsData = {
  totalCompanies: number; activeCompanies: number; totalEmployees: number;
  recentCompanies: { id: string; name: string; domain: string; isActive: boolean; createdAt: string; _count: { employees: number } }[];
};

const PLANS = [
  { name: "Free", price: "PKR 0", period: "", employees: "Up to 10 employees", features: ["Attendance Tracking", "Leave Management", "Basic Reports", "Employee Portal"], highlight: false },
  { name: "Starter", price: "PKR 4,999", period: "/mo", employees: "Up to 50 employees", features: ["All Free features", "Payroll Management", "Geofencing", "Shift Management", "Email Notifications"], highlight: false },
  { name: "Business", price: "PKR 9,999", period: "/mo", employees: "Up to 200 employees", features: ["All Starter features", "Custom Reports", "API Access", "Priority Support", "Advanced Analytics"], highlight: true },
  { name: "Enterprise", price: "Custom", period: "", employees: "Unlimited employees", features: ["All Business features", "Dedicated Support", "SLA Agreement", "White-label Option", "On-premise Available"], highlight: false },
];

export default function SuperAdminPlansPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/stats")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={22} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-full bg-[#F8FAF9]">
      <div>
        <h1 className="text-xl font-bold text-[#0D1F15]">Plans & Billing</h1>
        <p className="text-[#6B8C7A] text-sm mt-0.5">Subscription plan overview and company billing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Companies", value: data?.totalCompanies ?? 0, icon: Building2 },
          { label: "Active Companies", value: data?.activeCompanies ?? 0, icon: CheckCircle2 },
          { label: "Total Employees", value: data?.totalEmployees ?? 0, icon: Users },
          { label: "On Free Plan", value: data?.totalCompanies ?? 0, icon: Crown },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E2EDE8] rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-[#F0F9F3] flex items-center justify-center mb-3">
              <s.icon size={16} className="text-[#16A34A]" />
            </div>
            <p className="text-2xl font-black text-[#0D1F15]">{s.value}</p>
            <p className="text-[11px] text-[#6B8C7A] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {PLANS.map((p) => (
          <div key={p.name} className={`rounded-2xl p-5 border-2 ${p.highlight ? "bg-[#064E3B] border-[#064E3B]" : "bg-white border-[#E2EDE8]"}`}>
            {p.highlight && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4ADE80] bg-white/10 px-2 py-0.5 rounded-full mb-3">
                <Crown size={9} /> Most Popular
              </span>
            )}
            <h3 className={`text-base font-bold mb-1 ${p.highlight ? "text-white" : "text-[#0D1F15]"}`}>{p.name}</h3>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className={`text-2xl font-black ${p.highlight ? "text-[#4ADE80]" : "text-[#16A34A]"}`}>{p.price}</span>
              <span className={`text-xs ${p.highlight ? "text-white/50" : "text-[#6B8C7A]"}`}>{p.period}</span>
            </div>
            <p className={`text-[11px] mb-4 ${p.highlight ? "text-white/60" : "text-[#6B8C7A]"}`}>{p.employees}</p>
            <div className="space-y-2">
              {p.features.map((f) => (
                <div key={f} className={`flex items-center gap-2 text-[11px] ${p.highlight ? "text-white/80" : "text-[#6B8C7A]"}`}>
                  <CheckCircle2 size={11} className={p.highlight ? "text-[#4ADE80]" : "text-[#16A34A]"} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Companies Table */}
      <div className="bg-white border border-[#E2EDE8] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2EDE8]">
          <h2 className="text-sm font-bold text-[#0D1F15]">All Companies</h2>
          <p className="text-[11px] text-[#6B8C7A] mt-0.5">Current plan assignment per tenant</p>
        </div>
        {(data?.recentCompanies ?? []).length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#6B8C7A]">
            <Building2 size={28} className="mb-2 opacity-40" />
            <p className="text-sm">No companies yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E2EDE8]">
                {["Company", "Domain", "Employees", "Plan", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF5F1]">
              {data!.recentCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[#0D1F15]">{c.name}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-[#6B8C7A]">{c.domain}</td>
                  <td className="px-5 py-3.5 text-sm text-[#0D1F15]">{c._count.employees}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F0F9F3] text-[#16A34A] border border-[#C6E9D3]">Free</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.isActive ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-500 border border-red-200"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
