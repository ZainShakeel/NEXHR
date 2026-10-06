"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Building2, Users, Loader2, X, Check, Pencil, Trash2, AlertTriangle } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Dept = { id: string; name: string; description?: string; createdAt: string; _count: { employees: number } };

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
      .then((r) => r.json())
      .then((d) => { setDepts(Array.isArray(d) ? d : []); setLoading(false); })
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
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const startEdit = (d: Dept) => {
    setEditTarget(d);
    setEditForm({ name: d.name, description: d.description ?? "" });
  };

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
            <h1 className="text-2xl font-bold text-[#17211C]">Departments</h1>
            <p className="text-[#4A5E55] text-sm mt-1">{depts.length} departments configured</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B]">
            <Plus size={15} /> Add Department
          </button>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-[#ECFDF5] border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-[#064E3B]">
            <Check size={14} className="text-[#16A34A]" /> Department added successfully.
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#17211C]">New Department</h3>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-[#8AA398]" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Department Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Information Technology"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B] disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-[#F7F9F8] text-[#4A5E55] text-sm font-semibold rounded-xl">Cancel</button>
            </div>
          </div>
        )}

        {depts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-12 flex flex-col items-center text-center shadow-sm">
            <Building2 size={32} className="text-[#8AA398] mb-3" />
            <p className="text-sm font-semibold text-[#17211C]">No departments yet</p>
            <p className="text-xs text-[#8AA398] mt-1">Add your first department to organise employees</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {depts.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm hover:border-[#16A34A]/40 transition-colors">
                {editTarget?.id === d.id ? (
                  <div className="space-y-3">
                    <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-[#16A34A] rounded-xl focus:outline-none" />
                    <input type="text" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
                    <div className="flex gap-2">
                      <button onClick={handleEdit} disabled={editSaving || !editForm.name.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] text-white text-xs font-semibold rounded-lg disabled:opacity-50">
                        {editSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                      </button>
                      <button onClick={() => setEditTarget(null)} className="px-3 py-1.5 text-xs text-[#4A5E55] bg-[#F7F9F8] rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-[#16A34A]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-[#17211C] truncate">{d.name}</h3>
                        {d.description && <p className="text-[11px] text-[#8AA398] mt-0.5">{d.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#F7F9F8]">
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-[#8AA398]" />
                        <span className="text-xs text-[#4A5E55]"><span className="font-bold text-[#17211C]">{d._count.employees}</span> employees</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(d)}
                          className="p-1.5 rounded-lg text-[#8AA398] hover:text-[#16A34A] hover:bg-[#ECFDF5] transition-colors" title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(d)}
                          className="p-1.5 rounded-lg text-[#8AA398] hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#17211C] text-center mb-1">Delete Department?</h3>
            <p className="text-sm font-semibold text-[#17211C] text-center mb-2">{deleteTarget.name}</p>
            <p className="text-xs text-[#4A5E55] text-center mb-5 bg-[#F7F9F8] rounded-xl px-3 py-2">
              Employees in this department will be unassigned. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors">
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 bg-[#F7F9F8] text-[#17211C] text-sm font-semibold rounded-xl hover:bg-[#E5EAE7] disabled:opacity-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
