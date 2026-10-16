"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search, Plus, Users, UserCheck, UserX, Building2,
  Filter, Loader2, ChevronRight, MoreHorizontal,
  Download, Upload,
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type Employee = {
  id: string; employeeId: string; firstName: string; lastName: string;
  email: string; designation: string; status: string; joiningDate: string;
  department?: { name: string }; basicSalary?: number;
};

type Department = { id: string; name: string };

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:     { label: "Active",     color: "#07845A", bg: "#E3F6EB" },
  INACTIVE:   { label: "Inactive",  color: "#64748B", bg: "#F1F5F9" },
  ON_LEAVE:   { label: "On Leave",  color: "#F59E0B", bg: "#FEF3C7" },
  TERMINATED: { label: "Terminated", color: "#EF4444", bg: "#FEE2E2" },
};

const AVATAR_COLORS = ["#07845A", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#F97316"];

function Avatar({ name, index, size = 36 }: { name: string; index: number; size?: number }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold"
      style={{ width: size, height: size, background: AVATAR_COLORS[index % AVATAR_COLORS.length], fontSize: size * 0.3 }}
    >
      {initials}
    </div>
  );
}

export default function EmployeesPage() {
  const { companyId, status: authStatus } = useCompany();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/employees?companyId=${companyId}`).then(r => r.json()),
      fetch(`/api/departments?companyId=${companyId}`).then(r => r.json()),
    ]).then(([emps, depts]) => {
      setEmployees(Array.isArray(emps) ? emps : []);
      setDepartments(Array.isArray(depts) ? depts : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = `${e.firstName} ${e.lastName} ${e.employeeId} ${e.email}`.toLowerCase().includes(q);
    const matchDept = !deptFilter || e.department?.name === deptFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const active = employees.filter(e => e.status === "ACTIVE").length;
  const onLeave = employees.filter(e => e.status === "ON_LEAVE").length;
  const inactive = employees.filter(e => e.status !== "ACTIVE" && e.status !== "ON_LEAVE").length;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "#F5F8F6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#07845A" }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Employees</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{employees.length} total employees</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-[#E2E8F0]"
            style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#475569" }}>
            <Upload size={14} /> Import
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-[#E2E8F0]"
            style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#475569" }}>
            <Download size={14} /> Export
          </button>
          <Link
            href="/employees/new"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90"
            style={{ background: "#07845A" }}
          >
            <Plus size={15} /> Add Employee
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: employees.length, icon: Users, color: "#07845A", bg: "#E3F6EB" },
          { label: "Active", value: active, icon: UserCheck, color: "#3B82F6", bg: "#DBEAFE" },
          { label: "On Leave", value: onLeave, icon: Building2, color: "#F59E0B", bg: "#FEF3C7" },
          { label: "Inactive / Terminated", value: inactive, icon: UserX, color: "#EF4444", bg: "#FEE2E2" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-4 flex items-center gap-3" style={{ border: "1px solid #E2E8F0" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#172B24]">{c.value}</p>
              <p className="text-xs text-[#64748B]">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center" style={{ border: "1px solid #E2E8F0" }}>
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
          <input
            type="text" placeholder="Search by name, ID, email…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none transition-all"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "#94A3B8" }} />
          <select
            value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <select
            value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        {(search || deptFilter || statusFilter) && (
          <button
            onClick={() => { setSearch(""); setDeptFilter(""); setStatusFilter(""); setPage(1); }}
            className="px-3 py-2 text-xs font-medium rounded-lg transition-colors"
            style={{ background: "#FEE2E2", color: "#EF4444" }}
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-[#64748B]">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={32} className="text-[#CBD5E1] mb-3" />
            <p className="text-sm font-semibold text-[#475569]">No employees found</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              {employees.length === 0 ? "Add your first employee to get started" : "Try adjusting your filters"}
            </p>
            {employees.length === 0 && (
              <Link href="/employees/new"
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white"
                style={{ background: "#07845A" }}>
                <Plus size={14} /> Add Employee
              </Link>
            )}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
                  {["Employee", "Employee ID", "Department", "Designation", "Join Date", "Status", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#F8FAFC" }}>
                {paginated.map((e, i) => {
                  const st = STATUS_STYLE[e.status] ?? { label: e.status, color: "#64748B", bg: "#F1F5F9" };
                  const globalIndex = (page - 1) * PER_PAGE + i;
                  return (
                    <tr key={e.id} className="hover:bg-[#FAFAFA] transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${e.firstName} ${e.lastName}`} index={globalIndex} size={34} />
                          <div>
                            <p className="text-sm font-semibold text-[#172B24]">{e.firstName} {e.lastName}</p>
                            <p className="text-[11px] text-[#94A3B8]">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-medium text-[#475569] px-2 py-1 rounded" style={{ background: "#F8FAFC" }}>
                          {e.employeeId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#475569]">{e.department?.name ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-[#475569]">{e.designation}</td>
                      <td className="px-5 py-3.5 text-sm text-[#475569]">
                        {e.joiningDate ? new Date(e.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/employees/${e.id}`}
                            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                            style={{ background: "#E3F6EB", color: "#07845A" }}
                          >
                            View <ChevronRight size={11} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #F1F5F9" }}>
                <p className="text-xs text-[#64748B]">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
                    style={{ border: "1px solid #E2E8F0", color: "#475569" }}>
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pg = i + Math.max(1, page - 2);
                    if (pg > totalPages) return null;
                    return (
                      <button key={pg} onClick={() => setPage(pg)}
                        className="w-8 h-8 text-xs font-medium rounded-lg transition-colors"
                        style={pg === page
                          ? { background: "#07845A", color: "#fff" }
                          : { border: "1px solid #E2E8F0", color: "#475569" }}>
                        {pg}
                      </button>
                    );
                  })}
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
                    style={{ border: "1px solid #E2E8F0", color: "#475569" }}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
