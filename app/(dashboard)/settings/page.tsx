"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Loader2, Building2, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Company = { id: string; name: string; domain: string; email?: string; phone?: string; address?: string; website?: string; timezone: string; currency: string; isActive: boolean };

export default function SettingsPage() {
  const { companyId, companyName, status: authStatus } = useCompany();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", website: "", timezone: "Asia/Karachi", currency: "PKR" });

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/company?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.id) {
          setCompany(d);
          setForm({
            name: d.name ?? "",
            email: d.email ?? "",
            phone: d.phone ?? "",
            address: d.address ?? "",
            website: d.website ?? "",
            timezone: d.timezone ?? "Asia/Karachi",
            currency: d.currency ?? "PKR",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    await fetch("/api/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, ...form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    load();
  };

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">{label}</label>
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] bg-white" />
    </div>
  );

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
          <h1 className="text-2xl font-bold text-[#17211C]">Company Settings</h1>
          <p className="text-[#4A5E55] text-sm mt-1">Manage your company profile and preferences</p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-[#ECFDF5] border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-[#064E3B]">
            <Check size={14} /> Settings saved successfully.
          </div>
        )}

        <div className="max-w-2xl space-y-5">
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
                <Building2 size={22} className="text-[#16A34A]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#17211C]">{company?.name ?? companyName}</p>
                <p className="text-xs text-[#8AA398]">Domain: {company?.domain}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field("Company Name *", "name")}
              {field("Business Email", "email", "email", "contact@company.com")}
              {field("Phone Number", "phone", "tel", "+92 XXX XXXXXXX")}
              {field("Website", "website", "url", "https://company.com")}
              {field("Timezone", "timezone")}
              {field("Currency", "currency")}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Address</label>
                <textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  rows={2} placeholder="Office address"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] resize-none" />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#F7F9F8]">
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B] disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#17211C] mb-1">Account Info</h2>
            <p className="text-xs text-[#8AA398] mb-4">Read-only system information</p>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8AA398]">Company ID</span>
                <span className="font-mono text-[#4A5E55] text-[10px]">{companyId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8AA398]">Domain</span>
                <span className="text-[#4A5E55]">{company?.domain}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8AA398]">Timezone</span>
                <span className="text-[#4A5E55]">{company?.timezone}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8AA398]">Currency</span>
                <span className="text-[#4A5E55]">{company?.currency}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8AA398]">Status</span>
                <span className={`font-bold ${company?.isActive ? "text-green-700" : "text-red-600"}`}>
                  {company?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
