"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, User, Mail, Phone, Building2, Calendar,
  DollarSign, BadgeCheck, Pencil, Trash2, X, AlertTriangle, Save,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Department = { id: string; name: string };
type Shift = { id: string; name: string; startTime: string; endTime: string };
type Employee = {
  id: string; employeeId: string; firstName: string; lastName: string; designation: string;
  employmentType: string; status: string; joiningDate: string; basicSalary: number; gender: string;
  cnic?: string; phone?: string; dateOfBirth?: string;
  department?: { id: string; name: string };
  shift?: { id: string; name: string; startTime: string; endTime: string };
  user: { email: string; role: string; isActive: boolean };
};

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"];
const STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"];

export default function EmployeeDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { companyId, status: authStatus } = useCompany();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!companyId || !id) return;
    Promise.all([
      fetch(`/api/employees/${id}?companyId=${companyId}`).then(r => r.json()),
      fetch(`/api/departments?companyId=${companyId}`).then(r => r.json()),
      fetch(`/api/shifts?companyId=${companyId}`).then(r => r.json()),
    ]).then(([e, d, s]) => {
      setEmp(e);
      setDepartments(Array.isArray(d) ? d : []);
      setShifts(Array.isArray(s) ? s : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [companyId, id]);

  const startEdit = () => {
    if (!emp) return;
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      designation: emp.designation,
      phone: emp.phone ?? "",
      cnic: emp.cnic ?? "",
      employmentType: emp.employmentType,
      status: emp.status,
      basicSalary: String(emp.basicSalary),
      departmentId: emp.department?.id ?? "",
      shiftId: emp.shift?.id ?? "",
    });
    setError("");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    const res = await fetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, companyId }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
    // refresh employee data
    const updated = await fetch(`/api/employees/${id}?companyId=${companyId}`).then(r => r.json());
    setEmp(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/employees/${id}?companyId=${companyId}`, { method: "DELETE" });
    setDeleting(false);
    router.push("/employees");
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col h-full"><Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="flex flex-col h-full"><Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <User size={28} className="text-[#8AA398]" />
          <p className="text-sm text-[#4A5E55]">Employee not found.</p>
          <button onClick={() => router.back()} className="text-xs font-semibold text-[#16A34A]">Go back</button>
        </div>
      </div>
    );
  }

  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F7F9F8]">
              <ArrowLeft size={18} className="text-[#4A5E55]" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#17211C]">{emp.firstName} {emp.lastName}</h1>
              <p className="text-[#4A5E55] text-sm">{emp.designation}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <>
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#064E3B] bg-[#F0F9F3] border border-[#C6E9D3] rounded-xl hover:bg-[#E6F4EB] transition-colors"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
            {editing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#16A34A] rounded-xl hover:bg-[#15803d] disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#4A5E55] bg-white border border-[#E5EAE7] rounded-xl hover:bg-[#F7F9F8] transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div className="max-w-3xl space-y-5">
          {/* Profile card */}
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#064E3B] text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-[#17211C]">{emp.firstName} {emp.lastName}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${emp.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {emp.status}
                </span>
              </div>
              <p className="text-sm text-[#4A5E55]">{emp.designation}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8AA398]">
                <span>{emp.employeeId}</span>
                <span>·</span>
                <span>{emp.employmentType.replace("_", " ")}</span>
                <span>·</span>
                <span>{emp.gender}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8AA398]">Email</p>
              <p className="text-xs font-bold text-[#17211C]">{emp.user.email}</p>
            </div>
          </div>

          {/* Edit form or detail view */}
          {editing ? (
            <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#17211C] mb-4">Edit Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "First Name", key: "firstName" },
                  { label: "Last Name", key: "lastName" },
                  { label: "Designation", key: "designation" },
                  { label: "Phone", key: "phone" },
                  { label: "CNIC", key: "cnic" },
                  { label: "Basic Salary (PKR)", key: "basicSalary", type: "number" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-[#4A5E55] mb-1">{label}</label>
                    <input
                      type={type ?? "text"}
                      value={form[key] ?? ""}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1">Employment Type</label>
                  <select value={form.employmentType} onChange={e => setForm(f => ({ ...f, employmentType: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] bg-white">
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] bg-white">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1">Department</label>
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] bg-white">
                    <option value="">— No Department —</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1">Shift</label>
                  <select value={form.shiftId} onChange={e => setForm(f => ({ ...f, shiftId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A] bg-white">
                    <option value="">— No Shift —</option>
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[#17211C] mb-4">Contact & Job Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Mail, label: "Email", value: emp.user.email },
                    { icon: Phone, label: "Phone", value: emp.phone ?? "—" },
                    { icon: BadgeCheck, label: "CNIC", value: emp.cnic ?? "—" },
                    { icon: Building2, label: "Department", value: emp.department?.name ?? "—" },
                    { icon: Calendar, label: "Joining Date", value: new Date(emp.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" }) },
                    { icon: DollarSign, label: "Basic Salary", value: `PKR ${Number(emp.basicSalary).toLocaleString()}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#F7F9F8] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-[#4A5E55]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8AA398]">{label}</p>
                        <p className="text-xs font-semibold text-[#17211C]">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {emp.shift && (
                <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-[#17211C] mb-3">Assigned Shift</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
                      <Calendar size={16} className="text-[#16A34A]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#17211C]">{emp.shift.name}</p>
                      <p className="text-xs text-[#8AA398] font-mono">{emp.shift.startTime} — {emp.shift.endTime}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#17211C] text-center mb-1">Delete Employee?</h3>
            <p className="text-sm font-semibold text-[#17211C] text-center mb-2">{emp.firstName} {emp.lastName}</p>
            <p className="text-xs text-red-600 text-center mb-5 bg-red-50 rounded-xl px-3 py-2">
              This will permanently delete this employee along with all their attendance, leave requests, and salary records.
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
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-[#F7F9F8] text-[#17211C] text-sm font-semibold rounded-xl hover:bg-[#E5EAE7] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
