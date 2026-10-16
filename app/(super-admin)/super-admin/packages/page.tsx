"use client";

import { useState } from "react";
import { Check, Zap, Building2, Crown, Gift } from "lucide-react";

const PLANS = [
  {
    key: "FREE", name: "Free", price: 0, icon: Gift, color: "#8AA398", bg: "#F5F8F6",
    maxEmployees: 5, description: "Perfect for small teams getting started",
    features: ["Up to 5 employees", "Basic attendance", "Leave management", "Employee self-service", "Email support"],
    notIncluded: ["Payroll generation", "GPS geofencing", "Advanced reports", "Custom integrations", "Priority support"],
  },
  {
    key: "STARTER", name: "Starter", price: 4999, icon: Zap, color: "#3B82F6", bg: "#EFF6FF",
    maxEmployees: 25, description: "For growing businesses with more needs",
    features: ["Up to 25 employees", "Attendance + GPS", "Leave management", "Payroll generation", "Basic reports", "Email support"],
    notIncluded: ["Advanced analytics", "Custom integrations", "Dedicated support"],
  },
  {
    key: "BUSINESS", name: "Business", price: 9999, icon: Building2, color: "#07845A", bg: "#E3F6EB",
    maxEmployees: 100, description: "Full-featured HR for established companies",
    popular: true,
    features: ["Up to 100 employees", "All Starter features", "Advanced analytics", "Geofencing", "Custom departments", "Shift management", "Priority support"],
    notIncluded: ["Custom integrations", "Dedicated account manager"],
  },
  {
    key: "ENTERPRISE", name: "Enterprise", price: 24999, icon: Crown, color: "#7C3AED", bg: "#F5F3FF",
    maxEmployees: 99999, description: "Unlimited scale with dedicated support",
    features: ["Unlimited employees", "All Business features", "Custom integrations", "Dedicated account manager", "SLA guarantee", "Custom onboarding", "24/7 phone support"],
    notIncluded: [],
  },
];

export default function PackagesPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="p-6 min-h-full bg-[#F5F8F6]">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#172B24]">Packages & Pricing</h1>
        <p className="text-[#64748B] text-sm mt-0.5">Platform plans offered to companies</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-semibold ${billing === "monthly" ? "text-[#172B24]" : "text-[#94A3B8]"}`}>Monthly</span>
        <button
          onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
          className={`w-12 h-6 rounded-full transition-colors relative ${billing === "yearly" ? "bg-[#07845A]" : "bg-[#E2E8F0]"}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing === "yearly" ? "translate-x-7" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-semibold ${billing === "yearly" ? "text-[#172B24]" : "text-[#94A3B8]"}`}>
          Yearly <span className="text-[10px] text-[#07845A] font-bold bg-green-50 px-1.5 py-0.5 rounded-full ml-1">20% off</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map((plan) => {
          const displayPrice = billing === "yearly" ? Math.round(plan.price * 12 * 0.8) : plan.price;
          const Icon = plan.icon;
          return (
            <div key={plan.key}
              className={`bg-white rounded-2xl border-2 p-5 flex flex-col shadow-sm transition-all ${plan.popular ? "border-[#07845A] shadow-lg" : "border-[#E2E8F0]"}`}>
              {plan.popular && (
                <div className="text-center mb-3">
                  <span className="text-[10px] font-bold text-white bg-[#07845A] px-3 py-1 rounded-full">MOST POPULAR</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: plan.bg }}>
                  <Icon size={18} style={{ color: plan.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172B24]">{plan.name}</h3>
                  <p className="text-[10px] text-[#94A3B8]">Up to {plan.maxEmployees === 99999 ? "???" : plan.maxEmployees} employees</p>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B] mb-4">{plan.description}</p>
              <div className="mb-5">
                {plan.price === 0 ? (
                  <p className="text-2xl font-bold text-[#172B24]">Free</p>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-[#172B24]">PKR {displayPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-[#94A3B8]">per {billing === "yearly" ? "year" : "month"}</p>
                  </>
                )}
              </div>
              <div className="flex-1 space-y-2 mb-5">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-xs text-[#172B24]">
                    <Check size={12} className="text-[#07845A] flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map(f => (
                  <div key={f} className="flex items-start gap-2 text-xs text-[#94A3B8]">
                    <span className="w-3 flex-shrink-0 text-center mt-0.5 text-[#CBD5E1]">x</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-[#64748B] bg-[#F5F8F6] rounded-xl px-3 py-2 text-center">
                Assign via <span className="font-semibold text-[#172B24]">Subscriptions</span> page
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#172B24] mb-4">Plan Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                <th className="text-left py-2 pr-4 text-[#64748B] font-semibold w-1/3">Feature</th>
                {PLANS.map(p => (
                  <th key={p.key} className="text-center py-2 px-2 font-bold" style={{ color: p.color }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F8F6]">
              {[
                ["Max Employees", "5", "25", "100", "Unlimited"],
                ["Attendance Tracking", "Yes", "Yes", "Yes", "Yes"],
                ["GPS Geofencing", "No", "Yes", "Yes", "Yes"],
                ["Leave Management", "Yes", "Yes", "Yes", "Yes"],
                ["Payroll Generation", "No", "Yes", "Yes", "Yes"],
                ["Advanced Reports", "No", "No", "Yes", "Yes"],
                ["Custom Integrations", "No", "No", "No", "Yes"],
                ["Dedicated Support", "No", "No", "No", "Yes"],
              ].map(([feature, ...vals]) => (
                <tr key={feature}>
                  <td className="py-2 pr-4 text-[#64748B]">{feature}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`text-center py-2 px-2 font-semibold ${v === "Yes" ? "text-[#07845A]" : v === "No" ? "text-[#CBD5E1]" : "text-[#172B24]"}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

