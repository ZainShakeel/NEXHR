"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2, Save, Loader2, Check, Shield, Globe, Clock, CreditCard,
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type CompanyProfile = {
  name: string; email: string; phone: string; website: string;
  timezone: string; currency: string; address: string;
  id?: string; domain?: string; status?: string; plan?: string;
};

const TIMEZONES = [
  { value: "Asia/Karachi", label: "Asia/Karachi (PKT, UTC+5)" },
  { value: "Asia/Lahore", label: "Asia/Lahore (PKT, UTC+5)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
];

const CURRENCIES = [
  { value: "PKR", label: "PKR — Pakistani Rupee" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "EUR", label: "EUR — Euro" },
];

function SettingSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E3F6EB" }}>
          <Icon size={15} style={{ color: "#07845A" }} />
        </div>
        <h2 className="text-sm font-bold text-[#172B24]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#475569] mb-1.5">
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  border: "1px solid #E2E8F0",
  background: "#F8FAFC",
  color: "#172B24",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 14,
  width: "100%",
  outline: "none",
};

export default function SettingsPage() {
  const { companyId, status: authStatus } = useCompany();
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
          name: d.name ?? "", email: d.email ?? "", phone: d.phone ?? "",
          website: d.website ?? "", timezone: d.timezone ?? "Asia/Karachi",
          currency: d.currency ?? "PKR", address: d.address ?? "",
          id: d.id, domain: d.domain, status: d.status, plan: d.plan,
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
        companyId, name: profile.name, email: profile.email, phone: profile.phone,
        website: profile.website, timezone: profile.timezone, currency: profile.currency, address: profile.address,
      }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#07845A" }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>
      <div>
        <h1 className="text-xl font-bold text-[#172B24]">Settings</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Manage your company profile and account preferences</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium max-w-2xl"
          style={{ background: "#E3F6EB", border: "1px solid #A7F3D0", color: "#07845A" }}>
          <Check size={14} /> Settings saved successfully.
        </div>
      )}

      <div className="max-w-2xl space-y-4">
        {/* Company Profile */}
        <SettingSection icon={Building2} title="Company Profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name" required>
              <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Your company name" style={inputStyle} />
            </Field>
            <Field label="Business Email">
              <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="company@example.com" style={inputStyle} />
            </Field>
            <Field label="Phone">
              <input type="text" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+92 300 0000000" style={inputStyle} />
            </Field>
            <Field label="Website">
              <input type="url" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                placeholder="https://yourcompany.com" style={inputStyle} />
            </Field>
            <Field label="Timezone">
              <select value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                style={inputStyle}>
                {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Currency">
              <select value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}
                style={inputStyle}>
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <div className="col-span-full">
              <Field label="Address">
                <textarea value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                  placeholder="Full company address" rows={3}
                  style={{ ...inputStyle, resize: "none" }} />
              </Field>
            </div>
          </div>
          <div className="pt-4">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: "#07845A" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </SettingSection>

        {/* Account Info */}
        <SettingSection icon={Shield} title="Account Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Company ID", value: profile.id ?? companyId ?? "—" },
              { label: "Domain", value: profile.domain ?? "—" },
              { label: "Plan", value: profile.plan ?? "—" },
              { label: "Status", value: profile.status ?? "ACTIVE" },
              { label: "Timezone", value: profile.timezone },
              { label: "Currency", value: profile.currency },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{row.label}</span>
                <span className="text-xs font-medium text-[#475569] font-mono">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-3">Contact your Super Admin to change account-level settings.</p>
        </SettingSection>

        {/* Coming Soon sections */}
        {[
          { icon: Clock, title: "Working Hours & Schedule", desc: "Configure working days, shift hours, and holiday calendar" },
          { icon: Globe, title: "Notification Preferences", desc: "Email and in-app notification settings" },
          { icon: CreditCard, title: "Subscription & Billing", desc: "View your current plan and billing history" },
        ].map(s => (
          <div key={s.title} className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0", opacity: 0.6 }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F1F5F9" }}>
                <s.icon size={15} style={{ color: "#94A3B8" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#475569]">{s.title}</p>
                <p className="text-xs text-[#94A3B8]">{s.desc}</p>
              </div>
              <span className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "#F1F5F9", color: "#94A3B8" }}>
                Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
