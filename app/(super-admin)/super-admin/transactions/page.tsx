"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, TrendingUp, DollarSign, Calendar, Search } from "lucide-react";

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

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>;

  return (
    <div className="p-6 min-h-full bg-[#F4F8F6]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0D1F15]">Purchase Transactions</h1>
        <p className="text-[#6B8C7A] text-sm mt-0.5">All subscription payments and revenue</p>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#16A34A" },
          { label: "Active Revenue", value: `PKR ${activeRevenue.toLocaleString()}`, icon: TrendingUp, color: "#3B82F6" },
          { label: "This Month (MRR)", value: `PKR ${mrr.toLocaleString()}`, icon: Calendar, color: "#7C3AED" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#E5EDE9] p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: k.color + "18" }}>
              <k.icon size={18} style={{ color: k.color }} />
            </div>
            <p className="text-xl font-bold text-[#0D1F15]">{k.value}</p>
            <p className="text-xs text-[#6B8C7A] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B8C7A]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company…"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D4E6DC] rounded-xl focus:outline-none focus:border-[#16A34A] shadow-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-[#D4E6DC] rounded-xl focus:outline-none focus:border-[#16A34A] shadow-sm">
          {["ALL","ACTIVE","EXPIRED","PAUSED","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EDE9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#EEF5F1]">
                {["#", "Company", "Plan", "Amount", "Period", "Status", "Date"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-[#6B8C7A] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF5F1]">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#9BB8A8]">No transactions found</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="px-5 py-4 text-xs text-[#9BB8A8] font-mono">#{String(i + 1).padStart(4, "0")}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-[#0D1F15]">{s.company.name}</p>
                    <p className="text-[10px] text-[#9BB8A8] font-mono">{s.company.domain}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_BADGE[s.plan]}`}>{s.plan}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#0D1F15]">PKR {s.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-[#6B8C7A]">
                    {new Date(s.startDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })} –{" "}
                    {new Date(s.endDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status] ?? ""}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#6B8C7A]">
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
