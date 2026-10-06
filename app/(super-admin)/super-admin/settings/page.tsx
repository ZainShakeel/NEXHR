"use client";

import { useState } from "react";
import { Save, Shield, Bell, Globe, CreditCard, Check } from "lucide-react";

export default function SuperAdminSettings() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    appName: "NexHR",
    supportEmail: "support@nexhr.com",
    trialDays: "30",
    maxTrialEmployees: "5",
    growthPrice: "4999",
    notifyOnSignup: true,
    notifyOnExpiry: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 min-h-full bg-[#F4F8F6]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1F15]">Settings</h1>
          <p className="text-[#6B8C7A] text-sm mt-0.5">Global NexHR platform configuration</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
            saved
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-[#16A34A] text-white hover:bg-[#15803D]"
          }`}
        >
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* General */}
        <div className="bg-white rounded-2xl border border-[#E5EDE9] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#F0F9F3] border border-[#C6E9D3] flex items-center justify-center">
              <Globe size={14} className="text-[#16A34A]" />
            </div>
            <h3 className="text-sm font-bold text-[#0D1F15]">General</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Platform Name</label>
              <input
                type="text"
                value={form.appName}
                onChange={(e) => setForm({ ...form, appName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#D4E6DC] rounded-xl text-[#0D1F15] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Support Email</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#D4E6DC] rounded-xl text-[#0D1F15] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Trial */}
        <div className="bg-white rounded-2xl border border-[#E5EDE9] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#F0F9F3] border border-[#C6E9D3] flex items-center justify-center">
              <Shield size={14} className="text-[#16A34A]" />
            </div>
            <h3 className="text-sm font-bold text-[#0D1F15]">Trial Configuration</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Trial Duration (days)</label>
              <input
                type="number"
                value={form.trialDays}
                onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#D4E6DC] rounded-xl text-[#0D1F15] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Max Trial Employees</label>
              <input
                type="number"
                value={form.maxTrialEmployees}
                onChange={(e) => setForm({ ...form, maxTrialEmployees: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#D4E6DC] rounded-xl text-[#0D1F15] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#9BB8A8] mt-3">
            Current: {form.trialDays}-day free trial with max {form.maxTrialEmployees} employees.
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-[#E5EDE9] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#F0F9F3] border border-[#C6E9D3] flex items-center justify-center">
              <CreditCard size={14} className="text-[#16A34A]" />
            </div>
            <h3 className="text-sm font-bold text-[#0D1F15]">Pricing</h3>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Growth Plan Price (PKR/month)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#6B8C7A] bg-[#F4F8F6] border border-[#D4E6DC] rounded-xl px-3 py-2.5">PKR</span>
              <input
                type="number"
                value={form.growthPrice}
                onChange={(e) => setForm({ ...form, growthPrice: e.target.value })}
                className="w-40 px-3.5 py-2.5 text-sm border border-[#D4E6DC] rounded-xl text-[#0D1F15] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-[#E5EDE9] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#F0F9F3] border border-[#C6E9D3] flex items-center justify-center">
              <Bell size={14} className="text-[#16A34A]" />
            </div>
            <h3 className="text-sm font-bold text-[#0D1F15]">Notifications</h3>
          </div>
          <div className="divide-y divide-[#EEF5F1]">
            {[
              { key: "notifyOnSignup", label: "Email alert on new company signup", field: "notifyOnSignup" as const },
              { key: "notifyOnExpiry", label: "Email alert on trial expiry", field: "notifyOnExpiry" as const },
              { key: "maintenanceMode", label: "Enable maintenance mode", field: "maintenanceMode" as const },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3.5">
                <span className="text-sm text-[#3D5A47]">{item.label}</span>
                <button
                  onClick={() => setForm({ ...form, [item.field]: !form[item.field] })}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    form[item.field] ? "bg-[#16A34A]" : "bg-[#D4E6DC]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      form[item.field] ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
