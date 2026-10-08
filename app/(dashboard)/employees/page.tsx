"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Download, Building2, ChevronRight, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/hooks/useCompany";

type Employee = {
  id: string; employeeId: string; firstName: string; lastName: string;
  email: string; designation: string; status: string; joiningDate: string; basicSalary: number;
  department?: { name: string };
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#071A10,#16A34A)",
  "linear-gradient(135deg,#1e3a5f,#3B82F6)",
  "linear-gradient(135deg,#2d1f5e,#7C3AED)",
  "linear-gradient(135deg,#451a03,#d97706)",
  "linear-gradient(135deg,#1a1a2e,#0891B2)",
  "linear-gradient(135deg,#3b0a0a,#DC2626)",
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:     { bg: "rgba(22,163,74,0.12)",  color: "#16A34A" },
  INACTIVE:   { bg: "rgba(107,114,128,0.12)", color: "#6B7280" },
  ON_LEAVE:   { bg: "rgba(245,158,11,0.12)", color: "#D97706" },
  TERMINATED: { bg: "rgba(239,68,68,0.12)",  color: "#EF4444" },
};

export default function EmployeesPage() {
  const { companyId, status: authStatus } = useCompany();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/employees?companyId=${companyId}`)
      .then(r => r.json())
      .then(d => { setEmployees(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const depts = ["All", ...Array.from(new Set(employees.map(e => e.department?.name).filter(Boolean) as string[]))];
  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchQ = `${e.firstName} ${e.lastName} ${e.email} ${e.employeeId}`.toLowerCase().includes(q);
    return matchQ && (deptFilter === "All" || e.department?.name === deptFilter);
  });

  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(e => e.id));
  const toggleOne = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full" style={{ background: "#F0F4F2" }}>
        <Loader2 size={24} className="animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#F0F4F2" }}>
      {/* Page Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0D1F15]">Employees</h1>
            <p className="text-sm text-[#6B8C7A] mt-0.5">{employees.length} total employees</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all hover:shadow"
              style={{ background: "white", border: "1px solid #E2ECE7", color: "#0D1F15" }}>
              <Download size={13} className="text-[#6B8C7A]" /> Export
            </button>
            <Link href="/employees/new"
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
              <Plus size={14} /> Add Employee
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: employees.length, gradient: "linear-gradient(135deg,#071A10,#16A34A)" },
            { label: "Active", value: employees.filter(e => e.status === "ACTIVE").length, gradient: "linear-gradient(135deg,#1e3a5f,#3B82F6)" },
            { label: "On Leave", value: employees.filter(e => e.status === "ON_LEAVE").length, gradient: "linear-gradient(135deg,#451a03,#d97706)" },
            { label: "Departments", value: depts.length - 1, gradient: "linear-gradient(135deg,#2d1f5e,#7C3AED)" },
          ].map(k => (
            <div key={k.label} className="rounded-2xl p-4 relative overflow-hidden" style={{ background: k.gradient, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
              <p className="text-2xl font-black text-white">{k.value}</p>
              <p className="text-[11px] text-white/60 font-semibold mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl px-4 py-3" style={{ border: "1px solid #E2ECE7", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BB8A8]" />
            <input type="text" placeholder="Search by name, email or ID…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none transition-all"
              style={{ background: "#F5F9F6", border: "1px solid #E2ECE7" }} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {depts.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={deptFilter === d
                  ? { background: "linear-gradient(135deg,#071A10,#16A34A)", color: "white" }
                  : { background: "#F5F9F6", color: "#6B8C7A", border: "1px solid #E2ECE7" }}>
                {d}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <span className="text-xs font-bold text-green-600 ml-auto">{selected.length} selected</span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #E2ECE7" }}>
          {/* Table header — dark */}
          <div className="px-5 py-3 flex items-center gap-3" style={{ background: "linear-gradient(90deg,#071A10,#0A2A1A)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
              onChange={toggleAll} className="w-4 h-4 rounded accent-green-500" />
            <div className="flex items-center gap-2">
              <Users size={13} className="text-green-400" />
              <span className="text-sm font-bold text-white">All Employees</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}>
                {filtered.length}
              </span>
            </div>
            <Link href="/employees/new" className="ml-auto text-[10px] font-bold text-green-400 hover:text-green-300 flex items-center gap-1">
              Add New <ChevronRight size={10} />
            </Link>
          </div>

          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(22,163,74,0.08)" }}>
                <Building2 size={24} className="text-[#16A34A]" />
              </div>
              <p className="text-sm font-bold text-[#0D1F15]">No employees yet</p>
              <p className="text-xs text-[#9BB8A8] mt-1 mb-4">Add your first employee to get started</p>
              <Link href="/employees/new" className="px-4 py-2 text-white text-sm font-bold rounded-xl"
                style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>Add Employee</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#F8FAF9", borderBottom: "1px solid #EEF5F1" }}>
                      <th className="pl-5 pr-3 py-3 w-8" />
                      {["Employee", "ID", "Department", "Designation", "Joining Date", "Status", ""].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp, i) => {
                      const st = STATUS_STYLE[emp.status] ?? { bg: "rgba(107,114,128,0.1)", color: "#6B7280" };
                      return (
                        <tr key={emp.id} className="border-b last:border-0 hover:bg-[#F8FAF9] transition-colors group" style={{ borderColor: "#EEF5F1" }}>
                          <td className="pl-5 pr-3 py-3.5">
                            <input type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggleOne(emp.id)}
                              className="w-4 h-4 rounded accent-green-500" />
                          </td>
                          <td className="px-3 py-3.5">
                            <Link href={`/employees/${emp.id}`} className="flex items-center gap-3 group/link">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
                                style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>
                                {emp.firstName[0]}{emp.lastName[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#0D1F15] group-hover/link:text-[#16A34A] transition-colors">{emp.firstName} {emp.lastName}</p>
                                <p className="text-[10px] text-[#9BB8A8]">{emp.email}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="font-mono text-xs font-semibold text-[#6B8C7A]">{emp.employeeId}</span>
                          </td>
                          <td className="px-3 py-3.5 text-xs text-[#4A5E55]">{emp.department?.name ?? "—"}</td>
                          <td className="px-3 py-3.5 text-xs text-[#4A5E55]">{emp.designation}</td>
                          <td className="px-3 py-3.5 text-xs text-[#6B8C7A]">
                            {new Date(emp.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: st.bg, color: st.color }}>
                              {emp.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-3 py-3.5">
                            <Link href={`/employees/${emp.id}`}
                              className="opacity-0 group-hover:opacity-100 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                              style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3" style={{ background: "#F8FAF9", borderTop: "1px solid #EEF5F1" }}>
                <p className="text-xs text-[#9BB8A8]">
                  Showing <span className="font-bold text-[#0D1F15]">{filtered.length}</span> of <span className="font-bold text-[#0D1F15]">{employees.length}</span> employees
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
