"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, X, Check, Trash2, Calendar, Tag } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type LeaveType = { id: string; name: string; daysAllowed: number; color: string; isActive: boolean };

const PRESET_COLORS = ["#07845A", "#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4", "#64748B"];

export default function LeaveTypesPage() {
  const { companyId, status: authStatus } = useCompany();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", daysAllowed: "15", color: "#07845A" });

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/leave-types?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setTypes(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch("/api/leave-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, ...form, daysAllowed: Number(form.daysAllowed) }),
    });
    setSaving(false); setShowForm(false);
    setForm({ name: "", daysAllowed: "15", color: "#07845A" });
    load();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/leave-types?id=${id}`, { method: "DELETE" });
    setDeleting(null); load();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Leave Types</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{types.length} leave types configured</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90"
          style={{ background: "#07845A" }}>
          <Plus size={15} /> Add Leave Type
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#E3F6EB" }}>
                <Calendar size={13} style={{ color: "#07845A" }} />
              </div>
              <span className="text-sm font-semibold text-[#172B24]">New Leave Type</span>
            </div>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <X size={14} style={{ color: "#94A3B8" }} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Type Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Annual Leave"
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
                style={{ border: "1px solid #E2E8F0", background: "#F8FAFC" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Days Allowed / Year</label>
              <input type="number" value={form.daysAllowed} onChange={e => setForm({ ...form, daysAllowed: e.target.value })}
                min={1} max={365} placeholder="15"
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
                style={{ border: "1px solid #E2E8F0", background: "#F8FAFC" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    className="w-6 h-6 rounded-full transition-all"
                    style={{
                      background: c,
                      outline: form.color === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50"
              style={{ background: "#07845A" }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: "#F1F5F9", color: "#64748B" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Leave types list */}
      {types.length === 0 ? (
        <div className="bg-white rounded-xl p-16 flex flex-col items-center text-center" style={{ border: "1px solid #E2E8F0" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#E3F6EB" }}>
            <Tag size={26} style={{ color: "#07845A" }} />
          </div>
          <p className="text-sm font-semibold text-[#475569]">No leave types configured</p>
          <p className="text-xs text-[#94A3B8] mt-1">Add leave types to allow employees to apply for leave</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {types.map(t => (
            <div key={t.id} className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
              <div className="h-1.5" style={{ background: t.color }} />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${t.color}15` }}>
                      <Calendar size={16} style={{ color: t.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#172B24]">{t.name}</p>
                      <p className="text-xs text-[#64748B]">{t.daysAllowed} days/year</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete">
                    {deleting === t.id
                      ? <Loader2 size={13} className="animate-spin text-red-400" />
                      : <Trash2 size={13} style={{ color: "#EF4444" }} />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ background: t.color }}>
                    {t.daysAllowed} days
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#E3F6EB", color: "#07845A" }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
