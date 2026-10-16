"use client";

import { useState } from "react";
import { Save, Shield, Bell, Globe, CreditCard, Check, KeyRound, Eye, EyeOff, Loader2, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdminSettings() {
  const router = useRouter();
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

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChange = async () => {
    setPwError(""); setPwSuccess("");
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwError("All fields required."); return; }
    if (pwForm.next.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    setPwSaving(true);
    const res = await fetch("/api/super-admin/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    const data = await res.json();
    setPwSaving(false);
    if (!res.ok) { setPwError(data.error ?? "Failed to update password."); return; }
    setPwSuccess("Password verified. Update SUPER_ADMIN_PASSWORD in Vercel environment variables to persist.");
    setPwForm({ current: "", next: "", confirm: "" });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/super-admin/auth", { method: "DELETE" });
    router.push("/super-admin/login");
  };

  return (
    <div className="p-6 min-h-full bg-[#F5F8F6]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Settings</h1>
          <p className="text-[#64748B] text-sm mt-0.5">Global NexHR platform configuration</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
            saved ? "bg-green-50 text-green-600 border border-green-200" : "bg-[#07845A] text-white hover:bg-[#05603F]"
          }`}
        >
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* General */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#E3F6EB] border border-[#C6EFDA] flex items-center justify-center">
              <Globe size={14} className="text-[#07845A]" />
            </div>
            <h3 className="text-sm font-bold text-[#172B24]">General</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Platform Name</label>
              <input type="text" value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2E8F0] rounded-xl text-[#172B24] focus:outline-none focus:border-[#07845A] focus:ring-2 focus:ring-[#07845A]/10 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Support Email</label>
              <input type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2E8F0] rounded-xl text-[#172B24] focus:outline-none focus:border-[#07845A] focus:ring-2 focus:ring-[#07845A]/10 transition-all" />
            </div>
          </div>
        </div>

        {/* Trial */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#E3F6EB] border border-[#C6EFDA] flex items-center justify-center">
              <Shield size={14} className="text-[#07845A]" />
            </div>
            <h3 className="text-sm font-bold text-[#172B24]">Trial Configuration</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Trial Duration (days)</label>
              <input type="number" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2E8F0] rounded-xl text-[#172B24] focus:outline-none focus:border-[#07845A] focus:ring-2 focus:ring-[#07845A]/10 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Max Trial Employees</label>
              <input type="number" value={form.maxTrialEmployees} onChange={(e) => setForm({ ...form, maxTrialEmployees: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2E8F0] rounded-xl text-[#172B24] focus:outline-none focus:border-[#07845A] focus:ring-2 focus:ring-[#07845A]/10 transition-all" />
            </div>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-3">
            Current: {form.trialDays}-day free trial with max {form.maxTrialEmployees} employees.
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#E3F6EB] border border-[#C6EFDA] flex items-center justify-center">
              <CreditCard size={14} className="text-[#07845A]" />
            </div>
            <h3 className="text-sm font-bold text-[#172B24]">Pricing</h3>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Starter Plan Price (PKR/month)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#64748B] bg-[#F5F8F6] border border-[#E2E8F0] rounded-xl px-3 py-2.5">PKR</span>
              <input type="number" value={form.growthPrice} onChange={(e) => setForm({ ...form, growthPrice: e.target.value })}
                className="w-40 px-3.5 py-2.5 text-sm border border-[#E2E8F0] rounded-xl text-[#172B24] focus:outline-none focus:border-[#07845A] focus:ring-2 focus:ring-[#07845A]/10 transition-all" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#E3F6EB] border border-[#C6EFDA] flex items-center justify-center">
              <Bell size={14} className="text-[#07845A]" />
            </div>
            <h3 className="text-sm font-bold text-[#172B24]">Notifications</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {[
              { key: "notifyOnSignup", label: "Email alert on new company signup", field: "notifyOnSignup" as const },
              { key: "notifyOnExpiry", label: "Email alert on trial expiry", field: "notifyOnExpiry" as const },
              { key: "maintenanceMode", label: "Enable maintenance mode", field: "maintenanceMode" as const },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3.5">
                <span className="text-sm text-[#475569]">{item.label}</span>
                <button onClick={() => setForm({ ...form, [item.field]: !form[item.field] })}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form[item.field] ? "bg-[#07845A]" : "bg-[#E2E8F0]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form[item.field] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#E3F6EB] border border-[#C6EFDA] flex items-center justify-center">
              <KeyRound size={14} className="text-[#07845A]" />
            </div>
            <h3 className="text-sm font-bold text-[#172B24]">Super Admin Account</h3>
          </div>

          <div className="bg-[#F5F8F6] border border-[#E2E8F0] rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E3F6EB] flex items-center justify-center">
              <User size={14} className="text-[#07845A]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#172B24]">superadmin@nexhr.com</p>
              <p className="text-[10px] text-[#64748B]">Super Admin · Full platform access</p>
            </div>
          </div>

          {pwError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 mb-4">{pwError}</div>}
          {pwSuccess && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 mb-4">{pwSuccess}</div>}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A] focus:ring-2 focus:ring-[#07845A]/10" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">New Password</label>
              <div className="relative">
                <input type={showNext ? "text" : "password"} value={pwForm.next}
                  onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A] focus:ring-2 focus:ring-[#07845A]/10" />
                <button type="button" onClick={() => setShowNext(!showNext)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                  {showNext ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Confirm New Password</label>
              <input type="password" value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A] focus:ring-2 focus:ring-[#07845A]/10" />
            </div>
            <button onClick={handlePasswordChange} disabled={pwSaving}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#07845A] text-white text-sm font-semibold rounded-xl hover:bg-[#05603F] disabled:opacity-50 transition-colors">
              {pwSaving ? <><Loader2 size={14} className="animate-spin" /> Verifying...</> : <><KeyRound size={14} /> Change Password</>}
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172B24]">Sign Out</h3>
              <p className="text-xs text-[#64748B] mt-0.5">End your current super admin session</p>
            </div>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors">
              {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
