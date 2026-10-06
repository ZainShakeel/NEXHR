"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, MapPin, Loader2, X, Check, Trash2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Office = {
  id: string; name: string; address: string; city: string;
  latitude?: number; longitude?: number; radius?: number;
  isHeadquarters: boolean; isActive: boolean; _count?: { employees: number };
};

export default function GeofencingPage() {
  const { companyId, status: authStatus } = useCompany();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", city: "Lahore", latitude: "", longitude: "", radius: "100", isHeadquarters: false });

  const load = useCallback(() => {
    if (!companyId) return;
    fetch(`/api/offices?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => { setOffices(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) return;
    setSaving(true);
    await fetch("/api/offices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        radius: parseInt(form.radius) || 100,
        isHeadquarters: form.isHeadquarters,
      }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", address: "", city: "Lahore", latitude: "", longitude: "", radius: "100", isHeadquarters: false });
    load();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/offices?id=${id}`, { method: "DELETE" });
    setDeleting(null);
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
            <h1 className="text-2xl font-bold text-[#17211C]">Geofencing & Offices</h1>
            <p className="text-[#4A5E55] text-sm mt-1">Manage office locations for attendance tracking</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B]">
            <Plus size={15} /> Add Office
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#17211C]">New Office Location</h3>
              <button onClick={() => setShowForm(false)}><X size={16} className="text-[#8AA398]" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Office Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Lahore HQ" className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Address *</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street address" className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Latitude</label>
                <input type="number" step="0.000001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  placeholder="e.g. 31.5204" className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Longitude</label>
                <input type="number" step="0.000001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  placeholder="e.g. 74.3587" className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Geofence Radius (meters)</label>
                <input type="number" value={form.radius} onChange={(e) => setForm({ ...form, radius: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="hq" checked={form.isHeadquarters} onChange={(e) => setForm({ ...form, isHeadquarters: e.target.checked })}
                  className="w-4 h-4 accent-[#16A34A]" />
                <label htmlFor="hq" className="text-sm text-[#4A5E55]">Mark as Headquarters</label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.address.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#064E3B] disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Office
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-[#F7F9F8] text-[#4A5E55] text-sm font-semibold rounded-xl">Cancel</button>
            </div>
          </div>
        )}

        {offices.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5EAE7] p-12 flex flex-col items-center text-center shadow-sm">
            <MapPin size={32} className="text-[#8AA398] mb-3" />
            <p className="text-sm font-semibold text-[#17211C]">No office locations added</p>
            <p className="text-xs text-[#8AA398] mt-1">Add office locations to enable geofenced attendance tracking</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {offices.map((o) => (
              <div key={o.id} className="bg-white rounded-xl border border-[#E5EAE7] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-[#16A34A]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#17211C]">{o.name}</h3>
                        {o.isHeadquarters && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#064E3B] text-white rounded">HQ</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8AA398]">{o.city}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(o.id)} disabled={deleting === o.id}
                    className="text-[#8AA398] hover:text-red-500 transition-colors disabled:opacity-50">
                    {deleting === o.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
                <p className="text-xs text-[#4A5E55] mb-3">{o.address}</p>
                <div className="space-y-1.5 pt-3 border-t border-[#F7F9F8]">
                  {o.latitude && o.longitude ? (
                    <p className="text-[11px] text-[#8AA398] font-mono">{o.latitude.toFixed(4)}, {o.longitude.toFixed(4)}</p>
                  ) : (
                    <p className="text-[11px] text-[#8AA398]">No GPS coordinates set</p>
                  )}
                  {o.radius && (
                    <p className="text-[11px] text-[#8AA398]">Radius: {o.radius}m</p>
                  )}
                  <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${o.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {o.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
