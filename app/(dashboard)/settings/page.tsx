"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Save, Loader2, Check, Shield } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type CompanyProfile = {
  name: string; email: string; phone: string; website: string;
  timezone: string; currency: string; address: string;
  id?: string; domain?: string; status?: string;
};

export default function SettingsPage() {
  const { companyId, companyName, status: authStatus } = useCompany();
  const [profile, setProfile] = useState<CompanyProfile>({
    name: "", email: "", phone: "", website: "", timezone: "Asia/Karachi", currency: "PKR", address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/company?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => {
        setProfile({
          name: d.name ?? "",
          email: d.email ?? "",
          phone: d.phone ?? "",
          website: d.website ?? "",
          timezone: d.timezone ?? "Asia/Karachi",
          currency: d.currency ?? "PKR",
          address: d.address ?? "",
          id: d.id,
          domain: d.domain,
          status: d.status,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        timezone: profile.timezone,
        currency: profile.currency,
        address: profile.address,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full" style={{ background: "#F0F4F2" }}>
        <Loader2 size={24} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#F0F4F2" }}>
      <div className="flex-shrink-0 px-5 pt-5 pb-4">
        <h1 className="text-xl font-black text-[#0D1F15]">Settings</h1>
        <p className="text-sm text-[#6B8C7A] mt-0.5">Manage your company profile and account details</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4 max-w-3xl">

        {/* Success banner */}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)", color: "#16A34A" }}>
            <Check size={14} /> Settings saved successfully.
          </div>
        )}

        {/* Company Profile card */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: "linear-gradient(90deg,#071A10,#0A2A1A)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Building2 size={15} className="text-green-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Company Profile</h2>
              <p className="text-[11px] text-white/40">Update your company information</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Company Name</label>
                <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your company name"
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
                  style={{ background: "#F5F9F6", border: "1.5px solid #E2ECE7", color: "#0D1F15" }} />
              </div>

              {/* Business Email */}
              <div>
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Business Email</label>
                <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  placeholder="company@example.com"
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
                  style={{ background: "#F5F9F6", border: "1.5px solid #E2ECE7", color: "#0D1F15" }} />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Phone</label>
                <input type="text" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+92 300 0000000"
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
                  style={{ background: "#F5F9F6", border: "1.5px solid #E2ECE7", color: "#0D1F15" }} />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Website</label>
                <input type="url" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://yourcompany.com"
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
                  style={{ background: "#F5F9F6", border: "1.5px solid #E2ECE7", color: "#0D1F15" }} />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Timezone</label>
                <select value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
                  style={{ background: "#F5F9F6", border: "1.5px solid #E2ECE7", color: "#0D1F15" }}>
                  <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
                  <option value="Asia/Lahore">Asia/Lahore (PKT, UTC+5)</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Currency</label>
                <select value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
                  style={{ background: "#F5F9F6", border: "1.5px solid #E2ECE7", color: "#0D1F15" }}>
                  <option value="PKR">PKR — Pakistani Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>

              {/* Address — spans full width */}
              <div className="col-span-full">
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Address</label>
                <textarea value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                  placeholder="Full company address"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-all resize-none"
                  style={{ background: "#F5F9F6", border: "1.5px solid #E2ECE7", color: "#0D1F15" }} />
              </div>
            </div>

            <div className="pt-1">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Account Info card */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: "linear-gradient(90deg,#2d1f5e,#4c1d95)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Shield size={15} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Account Info</h2>
              <p className="text-[11px] text-white/40">Read-only account identifiers</p>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Company ID", value: profile.id ?? companyId ?? "—" },
                { label: "Domain", value: profile.domain ?? "—" },
                { label: "Timezone", value: profile.timezone },
                { label: "Currency", value: profile.currency },
                { label: "Status", value: profile.status ?? "ACTIVE" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: "#F8FAF9", border: "1px solid #EEF5F1" }}>
                  <span className="text-[11px] font-bold text-[#9BB8A8] uppercase tracking-wide">{row.label}</span>
                  <span className="text-xs font-semibold text-[#0D1F15] font-mono">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
