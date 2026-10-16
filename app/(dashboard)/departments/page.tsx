"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Building2, Users, Loader2, X, Check,
  Pencil, Trash2, AlertTriangle,
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type Dept = { id: string; name: string; description?: string; createdAt: string; _count: { employees: number } };

const DEPT_COLORS = ["#07845A", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

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

  const totalEmployees = depts.reduce((s, d) => s + d._count.employees, 0);

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
          <h1 className="text-xl font-bold text-[#172B24]">Departments</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{depts.length} departments · {totalEmployees} employees</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90"
          style={{ background: "#07845A" }}
        >
          <Plus size={15} /> Add Department
        </button>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: "#E3F6EB", border: "1px solid #A7F3D0", color: "#07845A" }}>
          <Check size={14} /> Department added successfully.
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#E3F6EB" }}>
                <Building2 size={13} style={{ color: "#07845A" }} />
              </div>
              <span className="text-sm font-semibold text-[#172B24]">New Department</span>
            </div>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <X size={14} style={{ color: "#94A3B8" }} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Department Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Engineering"
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC" }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50 transition-all"
              style={{ background: "#07845A" }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ background: "#F1F5F9", color: "#64748B" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Departments grid */}
      {depts.length === 0 ? (
        <div className="bg-white rounded-xl p-16 flex flex-col items-center text-center" style={{ border: "1px solid #E2E8F0" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#E3F6EB" }}>
            <Building2 size={26} style={{ color: "#07845A" }} />
          </div>
          <p className="text-sm font-semibold text-[#475569]">No departments yet</p>
          <p className="text-xs text-[#94A3B8] mt-1">Add departments to organize your employees</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {depts.map((d, i) => {
            const color = DEPT_COLORS[i % DEPT_COLORS.length];
            const isEditing = editTarget?.id === d.id;
            return (
              <div key={d.id} className="bg-white rounded-xl overflow-hidden transition-all hover:shadow-md"
                style={{ border: "1px solid #E2E8F0" }}>
                {/* Top color bar */}
                <div className="h-1.5" style={{ background: color }} />

                <div className="p-5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none font-semibold"
                        style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC" }}
                        placeholder="Department name" />
                      <input type="text" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
                        style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC" }}
                        placeholder="Description (optional)" />
                      <div className="flex gap-2">
                        <button onClick={handleEdit} disabled={editSaving || !editForm.name.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white disabled:opacity-50"
                          style={{ background: "#07845A" }}>
                          {editSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
                        </button>
                        <button onClick={() => setEditTarget(null)}
                          className="px-3 py-1.5 text-xs rounded-lg"
                          style={{ background: "#F1F5F9", color: "#64748B" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                          <Building2 size={18} style={{ color }} />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(d)}
                            className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors" title="Edit">
                            <Pencil size={13} style={{ color: "#94A3B8" }} />
                          </button>
                          <button onClick={() => setDeleteTarget(d)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={13} style={{ color: "#EF4444" }} />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-[#172B24] mb-0.5">{d.name}</h3>
                      {d.description && <p className="text-xs text-[#64748B] mb-3">{d.description}</p>}
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
                        <div className="flex items-center gap-1.5">
                          <Users size={13} style={{ color: "#94A3B8" }} />
                          <span className="text-xs text-[#64748B]">
                            <span className="font-bold text-[#172B24]">{d._count.employees}</span> employees
                          </span>
                        </div>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(d.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "#FEE2E2" }}>
              <AlertTriangle size={22} style={{ color: "#EF4444" }} />
            </div>
            <h3 className="text-base font-bold text-[#172B24] text-center mb-1">Delete Department?</h3>
            <p className="text-sm font-semibold text-[#475569] text-center mb-2">"{deleteTarget.name}"</p>
            <p className="text-xs text-[#64748B] text-center mb-5 px-2 py-2 rounded-xl" style={{ background: "#FEF3C7" }}>
              {deleteTarget._count.employees > 0
                ? `${deleteTarget._count.employees} employees will be unassigned.`
                : "This department has no employees."} This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50 transition-all"
                style={{ background: "#EF4444" }}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all"
                style={{ background: "#F1F5F9", color: "#475569" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
