"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Building2, Users, Plus, Loader2, X, CheckCircle2, XCircle,
  ToggleLeft, ToggleRight, Search, Eye, EyeOff, ArrowUpRight, Globe, Trash2, AlertTriangle, Pencil
} from "lucide-react";

type Company = {
  id: string; name: string; domain: string; isActive: boolean; createdAt: string;
  _count: { employees: number; users: number };
  users: { email: string }[];
};

function Field({
  label, name, type = "text", placeholder, value, onChange, required,
}: {
  label: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPass && show ? "text" : type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4E6DC] rounded-xl text-[#0D1F15] placeholder:text-[#9BB8A8] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8C7A] hover:text-[#0D1F15]"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState({ name: "", domain: "", newAdminPassword: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [showEditPass, setShowEditPass] = useState(false);
  const [form, setForm] = useState({
    name: "", domain: "", adminEmail: "", adminPassword: "", adminName: "", plan: "FREE",
  });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/super-admin/companies")
      .then((r) => r.json())
      .then((d) => { setCompanies(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name || !form.domain || !form.adminEmail || !form.adminPassword) {
      setError("Company name, domain, admin email and password are required."); return;
    }
    setSaving(true); setError(""); setSuccess("");
    const res = await fetch("/api/super-admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Failed to create company."); return; }
    setSuccess(`${form.name} onboarded successfully. Welcome email sent to ${form.adminEmail}.`);
    setForm({ name: "", domain: "", adminEmail: "", adminPassword: "", adminName: "", plan: "FREE" });
    load();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/super-admin/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    load();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    await fetch(`/api/super-admin/companies/${deleteConfirm.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteConfirm(null);
    load();
  };

  const startEdit = (c: Company) => {
    setEditTarget(c);
    setEditForm({ name: c.name, domain: c.domain, newAdminPassword: "" });
    setEditError(""); setShowEditPass(false);
  };

  const handleEdit = async () => {
    if (!editTarget || !editForm.name || !editForm.domain) {
      setEditError("Name and domain are required."); return;
    }
    setEditSaving(true); setEditError("");
    const res = await fetch(`/api/super-admin/companies/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        domain: editForm.domain.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        newAdminPassword: editForm.newAdminPassword || undefined,
      }),
    });
    const data = await res.json();
    setEditSaving(false);
    if (!res.ok) { setEditError(data.error ?? "Failed to save."); return; }
    setEditTarget(null);
    load();
  };

  const filtered = companies.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 min-h-full bg-[#F4F8F6]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1F15]">Companies</h1>
          <p className="text-[#6B8C7A] text-sm mt-0.5">
            {companies.length} {companies.length === 1 ? "company" : "companies"} on the platform
          </p>
        </div>
        <button
          onClick={() => { setShowPanel(true); setError(""); setSuccess(""); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#15803D] transition-colors shadow-sm"
        >
          <Plus size={14} /> Onboard Company
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B8C7A]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or domain…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D4E6DC] rounded-xl text-[#0D1F15] placeholder:text-[#9BB8A8] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-[#16A34A]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5EDE9] rounded-2xl p-16 flex flex-col items-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F0F9F3] border border-[#C6E9D3] flex items-center justify-center mb-4">
            <Building2 size={24} className="text-[#16A34A] opacity-60" />
          </div>
          <p className="text-base font-semibold text-[#0D1F15]">
            {search ? "No companies match your search" : "No companies onboarded yet"}
          </p>
          <p className="text-sm text-[#6B8C7A] mt-1">
            {search ? "Try a different search term" : "Click the button below to add your first company"}
          </p>
          {!search && (
            <button
              onClick={() => setShowPanel(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#15803D] transition-colors"
            >
              <Plus size={14} /> Onboard Company
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#E5EDE9] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#EEF5F1]">
                  {["Company", "Domain", "Admin Email", "Employees", "Joined", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5F1]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAF9] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F0F9F3] border border-[#C6E9D3] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#16A34A] font-bold text-sm">{c.name[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0D1F15]">{c.name}</p>
                          <p className="text-[10px] text-[#9BB8A8]">ID: {c.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-[#16A34A] bg-[#F0F9F3] px-2.5 py-1 rounded-lg border border-[#C6E9D3]">
                        {c.domain}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6B8C7A] max-w-[180px] truncate">
                      {c.users[0]?.email ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-[#0D1F15] font-medium">
                        <Users size={12} className="text-[#6B8C7A]" />
                        {c._count.employees}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6B8C7A]">
                      {new Date(c.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                          <CheckCircle2 size={9} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-200">
                          <XCircle size={9} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/super-admin/companies/${c.id}`}
                          className="flex items-center gap-1 text-[11px] text-[#16A34A] hover:text-[#15803D] font-semibold transition-colors"
                        >
                          <ArrowUpRight size={12} /> View
                        </Link>
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1.5 rounded-lg text-[#6B8C7A] hover:text-[#16A34A] hover:bg-[#F0F9F3] transition-colors"
                          title="Edit company"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive(c.id, c.isActive)}
                          className="text-[#6B8C7A] hover:text-[#0D1F15] transition-colors"
                          title={c.isActive ? "Deactivate" : "Activate"}
                        >
                          {c.isActive
                            ? <ToggleRight size={20} className="text-[#16A34A]" />
                            : <ToggleLeft size={20} className="text-[#9BB8A8]" />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(c)}
                          className="p-1.5 rounded-lg text-[#9BB8A8] hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete company"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Company Panel */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-[2px]" onClick={() => !editSaving && setEditTarget(null)} />
          <div className="w-full max-w-md bg-white border-l border-[#E5EDE9] h-full overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#EEF5F1]">
              <div>
                <h2 className="text-base font-bold text-[#0D1F15]">Edit Company</h2>
                <p className="text-xs text-[#6B8C7A] mt-0.5">{editTarget.name}</p>
              </div>
              <button onClick={() => !editSaving && setEditTarget(null)}
                className="w-8 h-8 rounded-xl bg-[#F4F8F6] border border-[#E5EDE9] flex items-center justify-center text-[#6B8C7A] hover:text-[#0D1F15]">
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 px-6 py-6 space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">{editError}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Company Name <span className="text-red-500">*</span></label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4E6DC] rounded-xl focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Domain <span className="text-red-500">*</span></label>
                <div className="relative flex items-center border border-[#D4E6DC] rounded-xl overflow-hidden focus-within:border-[#16A34A]">
                  <input type="text" value={editForm.domain}
                    onChange={e => setEditForm(f => ({ ...f, domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                    className="flex-1 px-3.5 py-2.5 text-sm bg-white focus:outline-none" />
                  <span className="px-3 py-2.5 text-xs text-[#6B8C7A] bg-[#F4F8F6] border-l border-[#D4E6DC]">.nexhr.app</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Reset Admin Password <span className="text-[#9BB8A8] font-normal">(leave blank to keep current)</span></label>
                <div className="relative">
                  <input type={showEditPass ? "text" : "password"} value={editForm.newAdminPassword}
                    onChange={e => setEditForm(f => ({ ...f, newAdminPassword: e.target.value }))}
                    placeholder="New password…"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#D4E6DC] rounded-xl focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10" />
                  <button type="button" onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8C7A]">
                    {showEditPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="bg-[#F4F8F6] border border-[#E5EDE9] rounded-xl p-3">
                <p className="text-xs text-[#6B8C7A]">Admin email: <span className="font-semibold text-[#0D1F15]">{editTarget.users[0]?.email ?? "—"}</span></p>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-[#EEF5F1] flex gap-3 bg-[#F8FAF9]">
              <button onClick={handleEdit} disabled={editSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#15803D] disabled:opacity-50">
                {editSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={14} /> Save Changes</>}
              </button>
              <button onClick={() => setEditTarget(null)} disabled={editSaving}
                className="px-5 py-3 text-sm text-[#6B8C7A] bg-white border border-[#E5EDE9] rounded-xl hover:bg-[#F4F8F6] disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#0D1F15] text-center mb-1">Delete Company?</h3>
            <p className="text-xs text-[#6B8C7A] text-center mb-1">
              You are about to permanently delete
            </p>
            <p className="text-sm font-bold text-[#0D1F15] text-center mb-2">{deleteConfirm.name}</p>
            <p className="text-xs text-red-600 text-center mb-5 bg-red-50 rounded-xl px-3 py-2">
              This will delete all employees, attendance, payroll, and data for this company. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-[#F4F8F6] text-[#0D1F15] text-sm font-semibold rounded-xl hover:bg-[#E5EDE9] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30 backdrop-blur-[2px]"
            onClick={() => !saving && setShowPanel(false)}
          />
          <div className="w-full max-w-md bg-white border-l border-[#E5EDE9] h-full overflow-y-auto flex flex-col shadow-2xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#EEF5F1]">
              <div>
                <h2 className="text-base font-bold text-[#0D1F15]">Onboard New Company</h2>
                <p className="text-xs text-[#6B8C7A] mt-0.5">Set up a new tenant on NexHR</p>
              </div>
              <button
                onClick={() => !saving && setShowPanel(false)}
                className="w-8 h-8 rounded-xl bg-[#F4F8F6] border border-[#E5EDE9] flex items-center justify-center text-[#6B8C7A] hover:text-[#0D1F15] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 px-6 py-6 space-y-4">
              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-green-500" />
                  </div>
                  <p className="text-base font-bold text-[#0D1F15] mb-1">Company Onboarded!</p>
                  <p className="text-xs text-[#6B8C7A] leading-relaxed">{success}</p>
                  <button
                    onClick={() => setSuccess("")}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-[#16A34A] bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    Onboard Another Company
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-[#F4F8F6] border border-[#E5EDE9] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#3D5A47] mb-2">What happens when you onboard:</p>
                    <ul className="space-y-1.5 text-xs text-[#6B8C7A]">
                      <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#16A34A] flex-shrink-0" /> Company account is created</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#16A34A] flex-shrink-0" /> Admin user is set up with the given credentials</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#16A34A] flex-shrink-0" /> Default leave types are configured (Annual, Sick, Casual)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-[#16A34A] flex-shrink-0" /> A welcome email is sent to the admin</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <Field label="Company Name" name="name" placeholder="e.g. TechCorp Pvt Ltd" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
                    <div>
                      <Field
                        label="Domain / Subdomain" name="domain" placeholder="e.g. techcorp"
                        value={form.domain}
                        onChange={(v) => setForm((p) => ({ ...p, domain: v.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                        required
                      />
                      {form.domain && (
                        <div className="flex items-center gap-1.5 mt-1.5 ml-0.5 text-[11px] text-[#6B8C7A]">
                          <Globe size={10} className="text-[#16A34A]" />
                          Login URL will be: <span className="text-[#16A34A] font-semibold ml-1">nexhr.com/{form.domain}</span>
                        </div>
                      )}
                    </div>
                    <Field label="Admin Full Name" name="adminName" placeholder="e.g. Ahmed Khan" value={form.adminName} onChange={(v) => setForm((p) => ({ ...p, adminName: v }))} />
                    <Field label="Admin Email" name="adminEmail" type="email" placeholder="admin@company.com" value={form.adminEmail} onChange={(v) => setForm((p) => ({ ...p, adminEmail: v }))} required />
                    <Field label="Admin Password" name="adminPassword" type="password" placeholder="Min. 8 characters" value={form.adminPassword} onChange={(v) => setForm((p) => ({ ...p, adminPassword: v }))} required />
                    <div>
                      <label className="block text-xs font-semibold text-[#3D5A47] mb-1.5">Plan</label>
                      <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4E6DC] rounded-xl focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10">
                        <option value="FREE">Free — PKR 0 (up to 5 employees)</option>
                        <option value="STARTER">Starter — PKR 4,999/mo (up to 25)</option>
                        <option value="BUSINESS">Business — PKR 9,999/mo (up to 100)</option>
                        <option value="ENTERPRISE">Enterprise — Custom (unlimited)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Panel Footer */}
            {!success && (
              <div className="px-6 py-5 border-t border-[#EEF5F1] flex gap-3 bg-[#F8FAF9]">
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#15803D] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {saving ? (
                    <><Loader2 size={14} className="animate-spin" /> Creating…</>
                  ) : (
                    <><Building2 size={14} /> Create Company</>
                  )}
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  disabled={saving}
                  className="px-5 py-3 text-sm text-[#6B8C7A] bg-white border border-[#E5EDE9] rounded-xl hover:bg-[#F4F8F6] hover:text-[#0D1F15] disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
