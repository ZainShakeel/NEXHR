"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, Check, Eye, EyeOff, Copy, CheckCircle2,
  User, Briefcase, DollarSign, KeyRound, RefreshCw
} from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Dept = { id: string; name: string };
type Shift = { id: string; name: string };

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function Field({
  label, value, onChange, type = "text", placeholder, required, children,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children ?? (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl text-[#17211C] placeholder:text-[#8AA398] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all"
        />
      )}
    </div>
  );
}

export default function NewEmployeePage() {
  const router = useRouter();
  const { companyId, status: authStatus } = useCompany();
  const [depts, setDepts] = useState<Dept[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; email: string; password: string; employeeId: string } | null>(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", cnic: "",
    designation: "", departmentId: "", shiftId: "", employmentType: "FULL_TIME",
    basicSalary: "", joiningDate: new Date().toISOString().split("T")[0],
    gender: "MALE", dateOfBirth: "", password: generatePassword(),
  });

  const set = (key: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [key]: v }));

  useEffect(() => {
    if (!companyId) return;
    Promise.all([
      fetch(`/api/departments?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/shifts?companyId=${companyId}`).then((r) => r.json()),
    ]).then(([d, s]) => {
      setDepts(Array.isArray(d) ? d : []);
      setShifts(Array.isArray(s) ? s : []);
    });
  }, [companyId]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.designation || !form.departmentId || !form.password) {
      setError("Please fill all required fields."); return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId, ...form,
        basicSalary: form.basicSalary ? parseFloat(form.basicSalary) : 0,
        shiftId: form.shiftId || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Failed to add employee."); return; }
    setCreated({
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      password: form.password,
      employeeId: data.employeeId,
    });
  };

  if (authStatus === "loading") {
    return (
      <div className="flex flex-col h-full"><Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>
      </div>
    );
  }

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (created) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
          <div className="max-w-md w-full mt-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-[#17211C]">Employee Added!</h2>
              <p className="text-sm text-[#4A5E55] mt-1">
                <span className="font-semibold">{created.name}</span> has been successfully onboarded.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-white rounded-2xl border border-[#E5EAE7] shadow-sm overflow-hidden mb-5">
              <div className="bg-[#064E3B] px-5 py-4">
                <div className="flex items-center gap-2">
                  <KeyRound size={15} className="text-[#4ADE80]" />
                  <p className="text-sm font-bold text-white">Employee Login Credentials</p>
                </div>
                <p className="text-xs text-white/60 mt-0.5">Share these with the employee so they can log in</p>
              </div>

              <div className="p-5 space-y-3">
                {[
                  { label: "Employee ID", value: created.employeeId, key: "empId" },
                  { label: "Login Email", value: created.email, key: "email" },
                  { label: "Password", value: created.password, key: "password" },
                  { label: "Login URL", value: `${window.location.origin}/employee/login`, key: "url" },
                ].map((row) => (
                  <div key={row.key} className="flex items-center justify-between py-2.5 border-b border-[#F0F4F2] last:border-0">
                    <div>
                      <p className="text-[10px] text-[#8AA398] font-semibold uppercase tracking-wide">{row.label}</p>
                      <p className="text-sm font-mono text-[#17211C] font-semibold mt-0.5">{row.value}</p>
                    </div>
                    <button
                      onClick={() => copy(row.value, row.key)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-[#F7F9F8] border border-[#E5EAE7] text-[#4A5E55] hover:bg-[#ECFDF5] hover:text-[#16A34A] hover:border-green-200 transition-all"
                    >
                      {copied === row.key ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={() => {
                    const text = `NexHR Login Credentials\n\nEmployee: ${created.name}\nEmployee ID: ${created.employeeId}\nEmail: ${created.email}\nPassword: ${created.password}\nLogin URL: ${window.location.origin}/employee/login\n\nPlease change your password after first login.`;
                    copy(text, "all");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#ECFDF5] text-[#16A34A] text-sm font-semibold rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
                >
                  {copied === "all" ? <><Check size={14} /> Copied All!</> : <><Copy size={14} /> Copy All Credentials</>}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCreated(null);
                  setForm({
                    firstName: "", lastName: "", email: "", phone: "", cnic: "",
                    designation: "", departmentId: "", shiftId: "", employmentType: "FULL_TIME",
                    basicSalary: "", joiningDate: new Date().toISOString().split("T")[0],
                    gender: "MALE", dateOfBirth: "", password: generatePassword(),
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B] transition-colors"
              >
                <User size={14} /> Add Another Employee
              </button>
              <button
                onClick={() => router.push("/employees")}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F7F9F8] text-[#4A5E55] text-sm font-semibold rounded-xl border border-[#E5EAE7] hover:bg-[#E5EAE7] transition-colors"
              >
                View All Employees
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl border border-[#E5EAE7] bg-white flex items-center justify-center text-[#4A5E55] hover:bg-[#F7F9F8] transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#17211C]">Add New Employee</h1>
            <p className="text-[#4A5E55] text-sm mt-0.5">Fill in the details to onboard a new employee</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">{error}</div>
        )}

        <div className="max-w-3xl space-y-5">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
                <User size={13} className="text-[#16A34A]" />
              </div>
              <h2 className="text-sm font-bold text-[#17211C]">Personal Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" value={form.firstName} onChange={set("firstName")} required placeholder="e.g. Ahmed" />
              <Field label="Last Name" value={form.lastName} onChange={set("lastName")} required placeholder="e.g. Khan" />
              <Field label="Email Address" value={form.email} onChange={set("email")} type="email" required placeholder="ahmed@company.com" />
              <Field label="Phone Number" value={form.phone} onChange={set("phone")} type="tel" placeholder="+92 300 1234567" />
              <Field label="CNIC" value={form.cnic} onChange={set("cnic")} placeholder="XXXXX-XXXXXXX-X" />
              <Field label="Gender" value={form.gender} onChange={() => {}}>
                <select value={form.gender} onChange={(e) => set("gender")(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl text-[#17211C] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Date of Birth" value={form.dateOfBirth} onChange={set("dateOfBirth")} type="date" />
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
                <Briefcase size={13} className="text-[#16A34A]" />
              </div>
              <h2 className="text-sm font-bold text-[#17211C]">Job Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Designation / Job Title" value={form.designation} onChange={set("designation")} required placeholder="e.g. Software Engineer" />
              <Field label="Department" value={form.departmentId} onChange={() => {}} required>
                <select value={form.departmentId} onChange={(e) => set("departmentId")(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl text-[#17211C] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10">
                  <option value="">Select department</option>
                  {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <Field label="Shift" value={form.shiftId} onChange={() => {}}>
                <select value={form.shiftId} onChange={(e) => set("shiftId")(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl text-[#17211C] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10">
                  <option value="">Select shift (optional)</option>
                  {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Employment Type" value={form.employmentType} onChange={() => {}}>
                <select value={form.employmentType} onChange={(e) => set("employmentType")(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl text-[#17211C] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10">
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </Field>
              <Field label="Joining Date" value={form.joiningDate} onChange={set("joiningDate")} type="date" />
              <Field label="Basic Salary (PKR)" value={form.basicSalary} onChange={set("basicSalary")} type="number" placeholder="e.g. 50000" />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
                <KeyRound size={13} className="text-[#16A34A]" />
              </div>
              <h2 className="text-sm font-bold text-[#17211C]">Login Credentials</h2>
            </div>
            <p className="text-xs text-[#8AA398] mb-4 ml-9">
              The employee will use their email + this password to log in to the employee portal.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">
                  Email (same as above) <span className="text-[#8AA398] font-normal">— auto-filled</span>
                </label>
                <input
                  type="email" value={form.email} readOnly
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl text-[#8AA398] bg-[#F7F9F8] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => set("password")(e.target.value)}
                    className="w-full px-3 py-2.5 pr-20 text-sm border border-[#E5EAE7] rounded-xl text-[#17211C] font-mono focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="p-1.5 rounded-lg text-[#8AA398] hover:text-[#4A5E55] hover:bg-[#F7F9F8]">
                      {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button type="button" onClick={() => set("password")(generatePassword())}
                      title="Generate new password"
                      className="p-1.5 rounded-lg text-[#8AA398] hover:text-[#16A34A] hover:bg-[#ECFDF5]">
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-[#8AA398] mt-1">Auto-generated — you can change it or use the refresh icon to regenerate.</p>
              </div>
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700">
                <span className="font-bold">Important:</span> Save these credentials before submitting. After adding the employee, a credentials screen will appear for you to copy and share.
              </p>
            </div>
          </div>

          {/* Salary Info (optional) */}
          <div className="flex gap-3 pb-4">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B] disabled:opacity-50 transition-colors shadow-sm">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? "Adding Employee…" : "Add Employee"}
            </button>
            <button onClick={() => router.back()}
              className="px-6 py-3 bg-white border border-[#E5EAE7] text-[#4A5E55] text-sm font-semibold rounded-xl hover:bg-[#F7F9F8] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
