"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Clock, Users, Check, X, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Shift = { id: string; name: string; startTime: string; endTime: string; breakMinutes: number; gracePeriod: number; workingDays: string[]; isActive: boolean; _count: { employees: number } };

const DAY_LABELS: Record<string, string> = { MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat", SUN: "Sun" };

export default function ShiftsPage() {
  const { companyId, status: authStatus } = useCompany();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", startTime: "09:00", endTime: "18:00", breakMinutes: 60, gracePeriod: 15, workingDays: ["MON","TUE","WED","THU","FRI"] });

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/shifts?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => { setShifts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const toggleDay = (d: string) =>
    setForm((p) => ({ ...p, workingDays: p.workingDays.includes(d) ? p.workingDays.filter((x) => x !== d) : [...p.workingDays, d] }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch("/api/shifts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, companyId }) });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", startTime: "09:00", endTime: "18:00", breakMinutes: 60, gracePeriod: 15, workingDays: ["MON","TUE","WED","THU","FRI"] });
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
            <h1 className="text-2xl font-bold text-[#17211C]">Shifts</h1>
            <p className="text-[#4A5E55] text-sm mt-1">Manage work shifts for your employees</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B]">
            <Plus size={15} /> Add Shift
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#17211C]">New Shift</h3>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-[#8AA398]" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Shift Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Morning Shift" className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Start Time</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">End Time</label>
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Break (minutes)</label>
                <input type="number" value={form.breakMinutes} onChange={(e) => setForm({ ...form, breakMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Grace Period (minutes)</label>
                <input type="number" value={form.gracePeriod} onChange={(e) => setForm({ ...form, gracePeriod: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#4A5E55] mb-2">Working Days</label>
                <div className="flex gap-2 flex-wrap">
                  {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d) => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.workingDays.includes(d) ? "bg-[#064E3B] text-white" : "bg-[#F7F9F8] text-[#4A5E55] border border-[#E5EAE7]"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B] disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Shift
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-[#F7F9F8] text-[#4A5E55] text-sm font-semibold rounded-xl">Cancel</button>
            </div>
          </div>
        )}

        {shifts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-12 flex flex-col items-center text-center shadow-sm">
            <Clock size={32} className="text-[#8AA398] mb-3" />
            <p className="text-sm font-semibold text-[#17211C]">No shifts configured</p>
            <p className="text-xs text-[#8AA398] mt-1">Add work shifts to assign to employees</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {shifts.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
                      <Clock size={18} className="text-[#16A34A]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#17211C]">{s.name}</h3>
                      <p className="text-xs font-mono text-[#4A5E55]">{s.startTime} — {s.endTime}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d) => (
                    <span key={d} className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.workingDays.includes(d) ? "bg-[#064E3B] text-white" : "bg-[#F7F9F8] text-[#8AA398]"}`}>
                      {DAY_LABELS[d]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#F7F9F8] text-[11px] text-[#8AA398]">
                  <span>Break: {s.breakMinutes}m · Grace: {s.gracePeriod}m</span>
                  <div className="flex items-center gap-1">
                    <Users size={11} />
                    <span>{s._count.employees} employees</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
