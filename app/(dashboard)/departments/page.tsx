"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Building2, Users, Loader2, X, Check, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type Dept = { id: string; name: string; description?: string; createdAt: string; _count: { employees: number } };

const CARD_GRADIENTS = [
  "linear-gradient(135deg,#071A10,#16A34A)",
  "linear-gradient(135deg,#1e3a5f,#3B82F6)",
  "linear-gradient(135deg,#2d1f5e,#7C3AED)",
  "linear-gradient(135deg,#451a03,#d97706)",
  "linear-gradient(135deg,#1a1a2e,#0891B2)",
  "linear-gradient(135deg,#3b0a0a,#DC2626)",
];

export default function DepartmentsPage() {
  const { companyId, status: authStatus } = useCompany();
  const [depts, setDepts] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editTarget, setEditTarget] = useState<Dept | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Dept | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/departments?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setDepts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, name: form.name.trim(), description: form.description.trim() || null }),
    });
    setSaving(false); setSaved(true);
    setForm({ name: "", description: "" }); setShowForm(false);
    setTimeout(() => setSaved(false), 2500);
    load();
  };

  const startEdit = (d: Dept) => { setEditTarget(d); setEditForm({ name: d.name, description: d.description ?? "" }); };

  const handleEdit = async () => {
    if (!editTarget || !editForm.name.trim()) return;
    setEditSaving(true);
    await fetch("/api/departments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editTarget.id, name: editForm.name.trim(), description: editForm.description.trim() || null }),
    });
    setEditSaving(false); setEditTarget(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/departments?id=${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false); setDeleteTarget(null);
    load();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0D1F15]">Departments</h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">{depts.length} departments configured</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
            <Plus size={14} /> Add Department
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">

        {/* Success banner */}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)", color: "#16A34A" }}>
            <Check size={14} /> Department added successfully.
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
                  <Building2 size={13} className="text-white" />
                </div>
                <span className="text-sm font-bold text-[#0D1F15]">New Department</span>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-[#F0F4F2] transition-colors">
                <X size={15} className="text-[#9BB8A8]" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Department Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Information Technology"
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none"
                  style={{ border: "1.5px solid #E2ECE7", background: "#F8FAF9" }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B8C7A] mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none"
                  style={{ border: "1.5px solid #E2ECE7", background: "#F8FAF9" }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all hover:shadow"
                style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save Department
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "#F5F9F6", color: "#6B8C7A", border: "1px solid #E2ECE7" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {depts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center" style={{ border: "1px solid #E2ECE7" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(22,163,74,0.08)" }}>
              <Building2 size={26} className="text-[#16A34A]" />
            </div>
            <p className="text-sm font-bold text-[#0D1F15]">No departments yet</p>
            <p className="text-xs text-[#9BB8A8] mt-1">Add your first department to organise employees</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {depts.map((d, i) => (
              <div key={d.id} className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-lg"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>

                {/* Card header — gradient */}
                <div className="px-5 py-4 relative overflow-hidden" style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                  {editTarget?.id === d.id ? (
                    <div className="space-y-2 relative z-10">
                      <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:outline-none font-bold"
                        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "white" }}
                        placeholder="Department name" />
                      <input type="text" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:outline-none"
                        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
                        placeholder="Description (optional)" />
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleEdit} disabled={editSaving || !editForm.name.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl disabled:opacity-50"
                          style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
                          {editSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
                        </button>
                        <button onClick={() => setEditTarget(null)}
                          className="px-3 py-1.5 text-xs rounded-xl"
                          style={{ background: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.7)" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: "rgba(255,255,255,0.15)" }}>
                          <Building2 size={16} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white">{d.name}</h3>
                        {d.description && <p className="text-[11px] text-white/55 mt-0.5">{d.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(d)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/20" title="Edit">
                          <Pencil size={13} className="text-white/70" />
                        </button>
                        <button onClick={() => setDeleteTarget(d)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/30" title="Delete">
                          <Trash2 size={13} className="text-white/70" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid #EEF5F1" }}>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-[#9BB8A8]" />
                    <span className="text-xs text-[#6B8C7A]">
                      <span className="font-black text-[#0D1F15]">{d._count.employees}</span> employees
                    </span>
                  </div>
                  <p className="text-[10px] text-[#C5D9CE]">
                    {new Date(d.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-black text-[#0D1F15] text-center mb-1">Delete Department?</h3>
            <p className="text-sm font-bold text-[#0D1F15] text-center mb-2">{deleteTarget.name}</p>
            <p className="text-xs text-[#6B8C7A] text-center mb-5 px-3 py-2 rounded-xl" style={{ background: "#F5F9F6" }}>
              Employees will be unassigned. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg,#DC2626,#EF4444)" }}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{ background: "#F5F9F6", color: "#0D1F15", border: "1px solid #E2ECE7" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
