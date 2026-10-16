"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, TrendingUp, DollarSign, Calendar, Search, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Sub = {
  id: string; plan: string; amount: number; currency: string;
  startDate: string; endDate: string; status: string; notes?: string; createdAt: string;
  company: { name: string; domain: string };
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  EXPIRED: "bg-gray-50 text-gray-500 border-gray-200",
  CANCELLED: "bg-red-50 text-red-500 border-red-200",
  PAUSED: "bg-amber-50 text-amber-600 border-amber-200",
};
const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600", STARTER: "bg-blue-50 text-blue-600",
  BUSINESS: "bg-green-50 text-green-700", ENTERPRISE: "bg-purple-50 text-purple-700",
};

export default function TransactionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const load = useCallback(async () => {
    const data = await fetch("/api/super-admin/subscriptions").then(r => r.json());
    setSubs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = subs.filter(s => {
    const matchSearch = !search || s.company.name.toLowerCase().includes(search.toLowerCase()) || s.company.domain.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = subs.filter(s => ["ACTIVE","EXPIRED"].includes(s.status)).reduce((sum, s) => sum + s.amount, 0);
  const activeRevenue = subs.filter(s => s.status === "ACTIVE").reduce((sum, s) => sum + s.amount, 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const mrr = subs.filter(s => s.status === "ACTIVE" && new Date(s.startDate) >= startOfMonth).reduce((sum, s) => sum + s.amount, 0);

  // Build monthly revenue chart data
  const monthMap: Record<string, number> = {};
  subs.filter(s => ["ACTIVE","EXPIRED"].includes(s.status)).forEach(s => {
    const key = new Date(s.startDate).toLocaleDateString("en-US", { month: "short" });
    monthMap[key] = (monthMap[key] ?? 0) + s.amount;
  });
  const revenueChart = Object.entries(monthMap).slice(-6).map(([month, amount]) => ({ month, amount }));

  const exportCSV = () => {
    const rows = [
      ["#", "Company", "Domain", "Plan", "Amount (PKR)", "Start Date", "End Date", "Status", "Created"],
      ...filtered.map((s, i) => [
        String(i + 1),
        s.company.name,
        s.company.domain,
        s.plan,
        String(s.amount),
        new Date(s.startDate).toLocaleDateString("en-PK"),
        new Date(s.endDate).toLocaleDateString("en-PK"),
        s.status,
        new Date(s.createdAt).toLocaleDateString("en-PK"),
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `nexhr-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin text-[#07845A]" /></div>;

  return (
    <div className="p-6 min-h-full bg-[#F5F8F6]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Purchase Transactions</h1>
          <p className="text-[#64748B] text-sm mt-0.5">All subscription payments and revenue</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-sm font-semibold text-[#172B24] rounded-xl hover:bg-[#F5F8F6] shadow-sm transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#07845A" },
          { label: "Active Revenue", value: `PKR ${activeRevenue.toLocaleString()}`, icon: TrendingUp, color: "#3B82F6" },
          { label: "This Month (MRR)", value: `PKR ${mrr.toLocaleString()}`, icon: Calendar, color: "#7C3AED" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: k.color + "18" }}>
              <k.icon size={18} style={{ color: k.color }} />
            </div>
            <p className="text-xl font-bold text-[#172B24]">{k.value}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {revenueChart.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm mb-6">
          <h2 className="text-sm font-bold text-[#172B24] mb-1">Revenue Trend</h2>
          <p className="text-[11px] text-[#64748B] mb-4">Monthly subscription revenue (PKR)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueChart} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F2" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 11 }} formatter={(v: any) => [`PKR ${Number(v).toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="amount" fill="#07845A" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A] shadow-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#07845A] shadow-sm">
          {["ALL","ACTIVE","EXPIRED","PAUSED","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                {["#", "Company", "Plan", "Amount", "Period", "Status", "Date"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#94A3B8]">No transactions found</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4 text-xs text-[#94A3B8] font-mono">#{String(i + 1).padStart(4, "0")}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-[#172B24]">{s.company.name}</p>
                    <p className="text-[10px] text-[#94A3B8] font-mono">{s.company.domain}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_BADGE[s.plan]}`}>{s.plan}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#172B24]">PKR {s.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-[#64748B]">
                    {new Date(s.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })} -{" "}
                    {new Date(s.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status] ?? ""}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#64748B]">
                    {new Date(s.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
