"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, X, Check, Trash2, Calendar } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type LeaveType = { id: string; name: string; daysAllowed: number; color: string; description?: string; isActive: boolean };

const PRESET_COLORS = ["#16A34A", "#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4", "#64748B"];

export default function LeaveTypesPage() {
  const { companyId, status: authStatus } = useCompany();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", daysAllowed: "15", color: "#16A34A" });

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/leave-types?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => { setTypes(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch("/api/leave-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, ...form }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", daysAllowed: "15", color: "#16A34A" });
    load();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/leave-types?id=${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#17211C]">Leave Types</h1>
            <p className="text-[#4A5E55] text-sm mt-1">Configure leave categories for your company</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#064E3B]">
            <Plus size={15} /> Add Leave Type
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#17211C]">New Leave Type</h3>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-[#8AA398]" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Annual Leave"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Days Allowed / Year</label>
                <input type="number" value={form.daysAllowed} onChange={(e) => setForm((p) => ({ ...p, daysAllowed: e.target.value }))} min={1}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#4A5E55] mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm((p) => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-[#16A34A]" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#064E3B] disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-[#F7F9F8] text-[#4A5E55] text-sm font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        )}

        {types.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-12 flex flex-col items-center text-center shadow-sm">
            <Calendar size={32} className="text-[#8AA398] mb-3" />
            <p className="text-sm font-semibold text-[#17211C]">No leave types configured</p>
            <p className="text-xs text-[#8AA398] mt-1">Add leave types so employees can submit leave requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {types.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <h3 className="text-sm font-bold text-[#17211C]">{t.name}</h3>
                  </div>
                  <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                    className="text-[#8AA398] hover:text-red-500 transition-colors disabled:opacity-50">
                    {deleting === t.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
                {t.description && <p className="text-[11px] text-[#8AA398] mb-3">{t.description}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-[#F7F9F8]">
                  <span className="text-xs text-[#4A5E55]"><span className="font-bold text-[#17211C]">{t.daysAllowed}</span> days/year</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
