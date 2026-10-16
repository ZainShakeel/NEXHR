"use client";

import { useState } from "react";
import { Globe, Shield, CheckCircle2, Copy, ExternalLink } from "lucide-react";

export default function DomainPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const DNS_RECORDS = [
    { type: "A", name: "@", value: "76.76.21.21", ttl: "Auto" },
    { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "Auto" },
  ];

  return (
    <div className="p-6 min-h-full bg-[#F5F8F6]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#172B24]">Domain Management</h1>
        <p className="text-[#64748B] text-sm mt-0.5">Platform domain configuration and DNS settings</p>
      </div>

      {/* Current Domain */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E3F6EB] flex items-center justify-center">
            <Globe size={18} className="text-[#07845A]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#172B24]">Production Domain</h2>
            <p className="text-xs text-[#64748B]">Your live platform URL</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <CheckCircle2 size={11} className="text-green-600" />
            <span className="text-[10px] font-bold text-green-700">Active</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-[#F5F8F6] border border-[#E2E8F0] rounded-xl px-4 py-3">
          <span className="text-sm font-mono font-semibold text-[#172B24] flex-1">nexhr-indol.vercel.app</span>
          <button onClick={() => copy("https://nexhr-indol.vercel.app", "domain")}
            className="text-[#64748B] hover:text-[#172B24] transition-colors">
            {copied === "domain" ? <CheckCircle2 size={14} className="text-[#07845A]" /> : <Copy size={14} />}
          </button>
          <a href="https://nexhr-indol.vercel.app" target="_blank" rel="noopener noreferrer"
            className="text-[#64748B] hover:text-[#07845A] transition-colors">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Portal URLs */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-[#172B24] mb-4">Portal URLs</h2>
        <div className="space-y-3">
          {[
            { label: "HR Login", url: "https://nexhr-indol.vercel.app/login", badge: "HR" },
            { label: "Employee Login", url: "https://nexhr-indol.vercel.app/employee/login", badge: "EMP" },
            { label: "Super Admin", url: "https://nexhr-indol.vercel.app/super-admin/login", badge: "SA" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 bg-[#F5F8F6] border border-[#E2E8F0] rounded-xl px-4 py-3">
              <span className="text-[10px] font-bold bg-[#064E3B] text-white px-2 py-0.5 rounded-md">{item.badge}</span>
              <span className="text-xs font-medium text-[#64748B] flex-1">{item.label}</span>
              <span className="text-xs font-mono text-[#172B24] truncate max-w-[260px]">{item.url}</span>
              <button onClick={() => copy(item.url, item.badge)}
                className="text-[#64748B] hover:text-[#172B24] flex-shrink-0">
                {copied === item.badge ? <CheckCircle2 size={13} className="text-[#07845A]" /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DNS Records */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-[#172B24] mb-1">DNS Records</h2>
        <p className="text-xs text-[#94A3B8] mb-4">Add these records to your domain registrar to use a custom domain</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                {["Type", "Name", "Value", "TTL"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 font-bold text-[#64748B] uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {DNS_RECORDS.map((r, i) => (
                <tr key={i} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">{r.type}</span></td>
                  <td className="px-4 py-3 font-mono text-[#172B24]">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <span>{r.value}</span>
                      <button onClick={() => copy(r.value, `dns-${i}`)} className="text-[#94A3B8] hover:text-[#172B24]">
                        {copied === `dns-${i}` ? <CheckCircle2 size={11} className="text-[#07845A]" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{r.ttl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SSL */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F6EB] flex items-center justify-center">
            <Shield size={18} className="text-[#07845A]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#172B24]">SSL Certificate</h2>
            <p className="text-xs text-[#64748B]">Managed automatically by Vercel â€” HTTPS enforced</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <CheckCircle2 size={11} className="text-green-600" />
            <span className="text-[10px] font-bold text-green-700">Valid</span>
          </div>
        </div>
      </div>
    </div>
  );
}

