"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, X, CheckCircle2, AlertTriangle, Clock, TrendingUp, DollarSign } from "lucide-react";

type Company = { id: string; name: string; domain: string };
type Sub = {
  id: string; companyId: string; plan: string; amount: number; currency: string;
  startDate: string; endDate: string; status: string; notes?: string; createdAt: string;
  company: { id: string; name: string; domain: string };
};

const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600", STARTER: "bg-blue-50 text-blue-600",
  BUSINESS: "bg-green-50 text-green-700", ENTERPRISE: "bg-purple-50 text-purple-700",
};
const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  EXPIRED: "bg-gray-50 text-gray-500 border-gray-200",
  CANCELLED: "bg-red-50 text-red-500 border-red-200",
  PAUSED: "bg-amber-50 text-amber-600 border-amber-200",
};

const PLAN_PRICES: Record<string, number> = { FREE: 0, STARTER: 4999, BUSINESS: 9999, ENTERPRISE: 24999 };

function daysLeft(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyId: "", plan: "STARTER", amount: "4999",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    notes: "",
  });

  const load = useCallback(async () => {
    const [s, c] = await Promise.all([
      fetch("/api/super-admin/subscriptions").then(r => r.json()),
      fetch("/api/super-admin/companies").then(r => r.json()),
    ]);
    setSubs(Array.isArray(s) ? s : []);
    setCompanies(Array.isArray(c) ? c : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.companyId || !form.plan || !form.amount) { setError("All fields required."); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/super-admin/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Failed."); return; }
    setShowPanel(false);
    setForm({ companyId: "", plan: "STARTER", amount: "4999", startDate: new Date().toISOString().split("T")[0], endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], notes: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/super-admin/subscriptions", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }),
    });
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin text-[#07845A]" /></div>;

  const active = subs.filter(s => s.status === "ACTIVE");
  const totalRevenue = subs.filter(s => ["ACTIVE","EXPIRED"].includes(s.status)).reduce((sum, s) => sum + s.amount, 0);
  const mrr = active.reduce((sum, s) => sum + s.amount, 0);
  const expiringSoon = active.filter(s => {
    const d = daysLeft(s.endDate);
    return d >= 0 && d <= 7;
  });

  return (
    <div className="p-6 min-h-full bg-[#F5F8F6]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Subscriptions</h1>
          <p className="text-[#64748B] text-sm mt-0.5">{subs.length} total · {active.length} active · PKR {totalRevenue.toLocaleString()} collected</p>
        </div>
        <button onClick={() => { setShowPanel(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#07845A] text-white text-sm font-semibold rounded-xl hover:bg-[#05603F] shadow-sm">
          <Plus size={14} /> Assign Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Subscriptions", value: active.length, icon: CheckCircle2, color: "#07845A", bg: "#E3F6EB" },
          { label: "Monthly Recurring", value: `PKR ${mrr.toLocaleString()}`, icon: TrendingUp, color: "#3B82F6", bg: "#EFF6FF" },
          { label: "Total Collected", value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#7C3AED", bg: "#F5F3FF" },
          { label: "Expiring in 7 Days", value: expiringSoon.length, icon: Clock, color: expiringSoon.length > 0 ? "#D97706" : "#64748B", bg: expiringSoon.length > 0 ? "#FFFBEB" : "#F5F8F6" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ backgroundColor: k.bg }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <p className="text-lg font-black text-[#172B24]">{k.value}</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Renewal Alerts */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-500" />
            <span className="text-sm font-bold text-amber-800">Renewal Alerts - expiring within 7 days</span>
          </div>
          <div className="space-y-2">
            {expiringSoon.map(s => {
              const d = daysLeft(s.endDate);
              return (
                <div key={s.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#172B24]">{s.company.name}</p>
                    <p className="text-[10px] text-[#64748B]">{s.plan} plan · PKR {s.amount.toLocaleString()}/mo</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d <= 2 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {d === 0 ? "Expires today" : `${d} day${d > 1 ? "s" : ""} left`}
                    </span>
                    <button onClick={() => updateStatus(s.id, "ACTIVE")}
                      className="text-[11px] font-semibold text-[#07845A] hover:underline">
                      Renew
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                {["Company", "Plan", "Amount", "Start", "End", "Days Left", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {subs.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#94A3B8]">No subscriptions yet</td></tr>
              ) : subs.map(s => {
                const dl = daysLeft(s.endDate);
                return (
                  <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#172B24]">{s.company.name}</p>
                      <p className="text-[10px] text-[#94A3B8] font-mono">{s.company.domain}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_BADGE[s.plan]}`}>{s.plan}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#172B24]">PKR {s.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs text-[#64748B]">{new Date(s.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-5 py-4 text-xs text-[#64748B]">{new Date(s.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-5 py-4">
                      {s.status === "ACTIVE" ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dl <= 7 ? "bg-amber-50 text-amber-600" : "bg-[#F5F8F6] text-[#64748B]"}`}>
                          {dl < 0 ? "Overdue" : dl === 0 ? "Today" : `${dl}d`}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#94A3B8]">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status] ?? ""}`}>{s.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {s.status === "ACTIVE" && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(s.id, "PAUSED")} className="text-[10px] font-semibold text-amber-600 hover:underline">Pause</button>
                          <button onClick={() => updateStatus(s.id, "CANCELLED")} className="text-[10px] font-semibold text-red-500 hover:underline">Cancel</button>
                        </div>
                      )}
                      {s.status === "PAUSED" && (
                        <button onClick={() => updateStatus(s.id, "ACTIVE")} className="text-[10px] font-semibold text-green-600 hover:underline">Resume</button>
                      )}
                      {s.status === "EXPIRED" && (
                        <button onClick={() => updateStatus(s.id, "ACTIVE")} className="text-[10px] font-semibold text-blue-600 hover:underline">Reactivate</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscription Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-[2px]" onClick={() => !saving && setShowPanel(false)} />
          <div className="w-full max-w-md bg-white border-l border-[#E2E8F0] h-full overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
              <h2 className="text-base font-bold text-[#172B24]">Assign Subscription Plan</h2>
              <button onClick={() => setShowPanel(false)} className="w-8 h-8 rounded-xl bg-[#F5F8F6] flex items-center justify-center text-[#64748B]"><X size={15} /></button>
            </div>
            <div className="flex-1 px-6 py-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Company *</label>
                <select value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A]">
                  <option value="">- Select company -</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.domain})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Plan *</label>
                <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value, amount: String(PLAN_PRICES[e.target.value] ?? 0) }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A]">
                  {["FREE","STARTER","BUSINESS","ENTERPRISE"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Amount (PKR) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                  placeholder="Optional notes..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A] resize-none" />
              </div>
            </div>
            <div className="px-6 py-5 border-t border-[#F1F5F9] flex gap-3 bg-[#F8FAFC]">
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 py-3 bg-[#07845A] text-white text-sm font-bold rounded-xl hover:bg-[#05603F] disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Assign Plan"}
              </button>
              <button onClick={() => setShowPanel(false)} className="px-5 py-3 text-sm text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F5F8F6]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
