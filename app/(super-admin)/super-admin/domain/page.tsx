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
    <div className="p-6 min-h-full bg-[#F4F8F6]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0D1F15]">Domain Management</h1>
        <p className="text-[#6B8C7A] text-sm mt-0.5">Platform domain configuration and DNS settings</p>
      </div>

      {/* Current Domain */}
      <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 shadow-sm mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0F9F3] flex items-center justify-center">
            <Globe size={18} className="text-[#16A34A]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0D1F15]">Production Domain</h2>
            <p className="text-xs text-[#6B8C7A]">Your live platform URL</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <CheckCircle2 size={11} className="text-green-600" />
            <span className="text-[10px] font-bold text-green-700">Active</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-[#F4F8F6] border border-[#E5EDE9] rounded-xl px-4 py-3">
          <span className="text-sm font-mono font-semibold text-[#0D1F15] flex-1">nexhr-indol.vercel.app</span>
          <button onClick={() => copy("https://nexhr-indol.vercel.app", "domain")}
            className="text-[#6B8C7A] hover:text-[#0D1F15] transition-colors">
            {copied === "domain" ? <CheckCircle2 size={14} className="text-[#16A34A]" /> : <Copy size={14} />}
          </button>
          <a href="https://nexhr-indol.vercel.app" target="_blank" rel="noopener noreferrer"
            className="text-[#6B8C7A] hover:text-[#16A34A] transition-colors">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Portal URLs */}
      <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-[#0D1F15] mb-4">Portal URLs</h2>
        <div className="space-y-3">
          {[
            { label: "HR Login", url: "https://nexhr-indol.vercel.app/login", badge: "HR" },
            { label: "Employee Login", url: "https://nexhr-indol.vercel.app/employee/login", badge: "EMP" },
            { label: "Super Admin", url: "https://nexhr-indol.vercel.app/super-admin/login", badge: "SA" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 bg-[#F4F8F6] border border-[#E5EDE9] rounded-xl px-4 py-3">
              <span className="text-[10px] font-bold bg-[#064E3B] text-white px-2 py-0.5 rounded-md">{item.badge}</span>
              <span className="text-xs font-medium text-[#6B8C7A] flex-1">{item.label}</span>
              <span className="text-xs font-mono text-[#0D1F15] truncate max-w-[260px]">{item.url}</span>
              <button onClick={() => copy(item.url, item.badge)}
                className="text-[#6B8C7A] hover:text-[#0D1F15] flex-shrink-0">
                {copied === item.badge ? <CheckCircle2 size={13} className="text-[#16A34A]" /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DNS Records */}
      <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 shadow-sm mb-5">
        <h2 className="text-sm font-bold text-[#0D1F15] mb-1">DNS Records</h2>
        <p className="text-xs text-[#9BB8A8] mb-4">Add these records to your domain registrar to use a custom domain</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#EEF5F1]">
                {["Type", "Name", "Value", "TTL"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 font-bold text-[#6B8C7A] uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF5F1]">
              {DNS_RECORDS.map((r, i) => (
                <tr key={i} className="hover:bg-[#F8FAF9]">
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">{r.type}</span></td>
                  <td className="px-4 py-3 font-mono text-[#0D1F15]">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-[#6B8C7A]">
                    <div className="flex items-center gap-2">
                      <span>{r.value}</span>
                      <button onClick={() => copy(r.value, `dns-${i}`)} className="text-[#9BB8A8] hover:text-[#0D1F15]">
                        {copied === `dns-${i}` ? <CheckCircle2 size={11} className="text-[#16A34A]" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#9BB8A8]">{r.ttl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SSL */}
      <div className="bg-white rounded-2xl border border-[#E5EDE9] p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0F9F3] flex items-center justify-center">
            <Shield size={18} className="text-[#16A34A]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0D1F15]">SSL Certificate</h2>
            <p className="text-xs text-[#6B8C7A]">Managed automatically by Vercel — HTTPS enforced</p>
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
