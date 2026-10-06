"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Download, MoreHorizontal, Building2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Employee = {
  id: string; employeeId: string; firstName: string; lastName: string;
  email: string; phone?: string; designation: string; status: string;
  joiningDate: string; basicSalary: number;
  department?: { name: string };
};

const avatarColors = ["bg-[#064E3B]", "bg-[#1D4ED8]", "bg-[#7C3AED]", "bg-[#DC2626]", "bg-[#D97706]", "bg-[#0891B2]"];

const statusCls: Record<string, string> = {
  ACTIVE:     "bg-green-50 text-green-700",
  INACTIVE:   "bg-gray-100 text-gray-600",
  ON_LEAVE:   "bg-amber-50 text-amber-700",
  TERMINATED: "bg-red-50 text-red-700",
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
      .then((r) => r.json())
      .then((d) => { setEmployees(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const depts = ["All", ...Array.from(new Set(employees.map((e) => e.department?.name).filter(Boolean) as string[]))];

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = `${e.firstName} ${e.lastName} ${e.email} ${e.employeeId}`.toLowerCase().includes(q);
    const matchDept = deptFilter === "All" || e.department?.name === deptFilter;
    return matchSearch && matchDept;
  });

  const toggleSelect = (id: string) =>
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((e) => e.id));

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col h-full">
        <Header action={{ label: "Add Employee", href: "/employees/new" }} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#16A34A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header action={{ label: "Add Employee", href: "/employees/new" }} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#17211C] tracking-tight">Employees</h1>
            <p className="text-[#4A5E55] text-sm mt-1">{employees.length} total employees</p>
          </div>
          <Link href="/employees/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B] transition-colors shadow-sm">
            <Plus size={14} /> Add Employee
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA398]" />
              <input type="text" placeholder="Search by name, email or ID…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#F7F9F8] border border-[#E5EAE7] rounded-lg placeholder:text-[#8AA398] focus:outline-none focus:border-[#16A34A]" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {depts.map((d) => (
                <button key={d} onClick={() => setDeptFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    deptFilter === d ? "bg-[#064E3B] text-white" : "bg-[#F7F9F8] text-[#4A5E55] border border-[#E5EAE7] hover:border-[#16A34A]"
                  }`}>{d}</button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4A5E55] border border-[#E5EAE7] rounded-lg bg-white hover:bg-[#F7F9F8] ml-auto">
              <Download size={13} /> Export
            </button>
          </div>
          {selected.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#E5EAE7] flex items-center gap-3">
              <span className="text-xs font-semibold text-[#16A34A]">{selected.length} selected</span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm overflow-hidden">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-[#F7F9F8] rounded-xl flex items-center justify-center mb-3">
                <Building2 size={20} className="text-[#8AA398]" />
              </div>
              <p className="text-sm font-semibold text-[#17211C]">No employees yet</p>
              <p className="text-xs text-[#8AA398] mt-1 mb-4">Add your first employee to get started</p>
              <Link href="/employees/new" className="px-4 py-2 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B]">
                Add Employee
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F7F9F8] border-b border-[#E5EAE7]">
                      <th className="pl-5 pr-3 py-3">
                        <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                          onChange={toggleAll} className="w-4 h-4 rounded border-[#C8D5CF] accent-[#16A34A] cursor-pointer" />
                      </th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Employee</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">ID</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Department</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Designation</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Joining</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold text-[#8AA398] uppercase tracking-wide">Status</th>
                      <th className="px-3 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp, i) => (
                      <tr key={emp.id} className="border-t border-[#F0F4F2] hover:bg-[#F7F9F8] transition-colors group">
                        <td className="pl-5 pr-3 py-3">
                          <input type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggleSelect(emp.id)}
                            className="w-4 h-4 rounded border-[#C8D5CF] accent-[#16A34A] cursor-pointer" />
                        </td>
                        <td className="px-3 py-3">
                          <Link href={`/employees/${emp.id}`} className="flex items-center gap-3 group/link">
                            <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-[#17211C] text-xs group-hover/link:text-[#16A34A]">{emp.firstName} {emp.lastName}</p>
                              <p className="text-[10px] text-[#8AA398]">{emp.email}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 py-3"><span className="font-mono text-xs text-[#4A5E55]">{emp.employeeId}</span></td>
                        <td className="px-3 py-3 text-xs text-[#4A5E55]">{emp.department?.name ?? "—"}</td>
                        <td className="px-3 py-3 text-xs text-[#4A5E55]">{emp.designation}</td>
                        <td className="px-3 py-3 text-xs text-[#4A5E55]">{new Date(emp.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusCls[emp.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {emp.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8AA398] hover:bg-[#E5EAE7] opacity-0 group-hover:opacity-100">
                            <MoreHorizontal size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5EAE7] bg-[#F7F9F8]">
                <p className="text-xs text-[#8AA398]">
                  Showing <span className="font-semibold text-[#4A5E55]">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-[#4A5E55]">{employees.length}</span> employees
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
