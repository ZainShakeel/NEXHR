"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Leaf, Users, DollarSign, Clock, MapPin, BarChart3,
  Briefcase, Check, ChevronRight, ArrowLeft,
} from "lucide-react";

const modules = [
  { id: "employees",   label: "Employees",          icon: Users,      desc: "Records & profiles"    },
  { id: "attendance",  label: "Attendance",         icon: Clock,      desc: "Check-in & timesheets" },
  { id: "leave",       label: "Leave Management",   icon: Briefcase,  desc: "Apply & approve"       },
  { id: "payroll",     label: "Payroll",            icon: DollarSign, desc: "Salary & slips"        },
  { id: "geofencing",  label: "GPS Geofencing",     icon: MapPin,     desc: "Location check-in"     },
  { id: "reports",     label: "Reports",            icon: BarChart3,  desc: "Analytics & export"    },
];

const sizes = ["1–10 employees", "11–50 employees", "51–200 employees", "201–500 employees", "500+ employees"];

const plans: Record<string, string> = {
  "1–10 employees":   "Trial (1 month free, up to 5 employees)",
  "11–50 employees":  "Growth — PKR 4,999/month",
  "51–200 employees": "Growth — PKR 4,999/month",
  "201–500 employees":"Enterprise — Custom pricing",
  "500+ employees":   "Enterprise — Custom pricing",
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [selectedModules, setSelectedModules] = useState<string[]>(["employees", "attendance"]);
  const [companySize, setCompanySize] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", domain: "", password: "" });

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#064E3B] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">You're all set!</h1>
          <p className="text-[#A7C5B9] mb-2">Account created for <strong className="text-white">{form.company}</strong></p>
          <p className="text-[#A7C5B9] mb-8 text-sm">Your 1-month trial has started. Login with your credentials to get started.</p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="px-6 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] transition-colors">
              Go to Login →
            </Link>
            <Link href="/" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              Back to Home
            </Link>
          </div>
          <p className="text-[#4A5E55] text-xs mt-6">Need help? Contact us at support@nexhr.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E5EAE7] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#064E3B] rounded-lg flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span className="font-bold text-[#064E3B]">NexHR</span>
        </Link>
        <p className="text-xs text-[#8AA398]">Already have an account? <Link href="/login" className="text-[#16A34A] font-semibold hover:underline">Login</Link></p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s ? "bg-[#16A34A] text-white" :
                  step === s ? "bg-[#064E3B] text-white" :
                  "bg-[#E5EAE7] text-[#8AA398]"
                }`}>
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 3 && <div className={`w-16 h-0.5 rounded ${step > s ? "bg-[#16A34A]" : "bg-[#E5EAE7]"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#E5EAE7] shadow-sm p-8">
            {/* Step 1: Modules */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-[#17211C] mb-1">Select Your Modules</h2>
                <p className="text-sm text-[#8AA398] mb-6">Choose the features you want to activate for your company</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {modules.map((m) => {
                    const active = selectedModules.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleModule(m.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          active
                            ? "border-[#16A34A] bg-[#ECFDF5]"
                            : "border-[#E5EAE7] hover:border-[#C8D5CF]"
                        }`}
                      >
                        {active && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#16A34A] rounded-full flex items-center justify-center">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${active ? "bg-[#064E3B]" : "bg-[#F7F9F8]"}`}>
                          <m.icon size={17} className={active ? "text-white" : "text-[#8AA398]"} />
                        </div>
                        <p className={`text-sm font-semibold ${active ? "text-[#064E3B]" : "text-[#17211C]"}`}>{m.label}</p>
                        <p className="text-[11px] text-[#8AA398] mt-0.5">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedModules.length === 0}
                  className="w-full py-3 bg-[#064E3B] text-white font-semibold rounded-xl hover:bg-[#16A34A] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Company Size */}
            {step === 2 && (
              <div>
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-[#8AA398] hover:text-[#17211C] mb-5">
                  <ArrowLeft size={14} /> Back
                </button>
                <h2 className="text-2xl font-bold text-[#17211C] mb-1">Select Company Size</h2>
                <p className="text-sm text-[#8AA398] mb-6">This helps us recommend the right plan for you</p>
                <div className="flex flex-col gap-3 mb-8">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setCompanySize(s)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                        companySize === s
                          ? "border-[#16A34A] bg-[#ECFDF5]"
                          : "border-[#E5EAE7] hover:border-[#C8D5CF]"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${companySize === s ? "text-[#064E3B]" : "text-[#17211C]"}`}>{s}</span>
                      {companySize === s && (
                        <div className="w-5 h-5 bg-[#16A34A] rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {companySize && (
                  <div className="bg-[#ECFDF5] border border-green-200 rounded-xl px-4 py-3 mb-5">
                    <p className="text-xs text-[#4A5E55]">Recommended plan:</p>
                    <p className="text-sm font-bold text-[#064E3B]">{plans[companySize]}</p>
                  </div>
                )}
                <button
                  onClick={() => setStep(3)}
                  disabled={!companySize}
                  className="w-full py-3 bg-[#064E3B] text-white font-semibold rounded-xl hover:bg-[#16A34A] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div>
                <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm text-[#8AA398] hover:text-[#17211C] mb-5">
                  <ArrowLeft size={14} /> Back
                </button>
                <h2 className="text-2xl font-bold text-[#17211C] mb-1">Create Your Account</h2>
                <p className="text-sm text-[#8AA398] mb-6">Fill in your details to get started</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Your Name *</label>
                      <input required type="text" placeholder="Zain Ahmed" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Work Email *</label>
                      <input required type="email" placeholder="you@company.com" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Company Name *</label>
                      <input required type="text" placeholder="ABC Corporation" value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Phone Number *</label>
                      <input required type="tel" placeholder="+92 300 1234567" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Company Domain *</label>
                      <div className="flex items-center border border-[#E5EAE7] rounded-lg focus-within:border-[#16A34A] overflow-hidden">
                        <input required type="text" placeholder="abc" value={form.domain}
                          onChange={(e) => setForm({ ...form, domain: e.target.value.toLowerCase().replace(/\s/g,"") })}
                          className="flex-1 px-3 py-2.5 text-sm focus:outline-none" />
                        <span className="px-3 py-2.5 text-xs text-[#8AA398] bg-[#F7F9F8] border-l border-[#E5EAE7]">.nexhr.app</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Password *</label>
                      <input required type="password" placeholder="Min. 8 characters" value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
                    </div>
                  </div>

                  <div className="bg-[#F7F9F8] rounded-xl p-4 text-xs text-[#4A5E55] space-y-1">
                    <div className="flex items-center gap-2"><Check size={12} className="text-[#16A34A]" /> 1-month free trial — {companySize}</div>
                    <div className="flex items-center gap-2"><Check size={12} className="text-[#16A34A]" /> No credit card required</div>
                    <div className="flex items-center gap-2"><Check size={12} className="text-[#16A34A]" /> Access to all selected modules</div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#064E3B] text-white font-semibold rounded-xl hover:bg-[#16A34A] transition-colors">
                    Create Account & Start Trial →
                  </button>
                  <p className="text-center text-[11px] text-[#8AA398]">
                    By signing up you agree to our <span className="text-[#16A34A] cursor-pointer hover:underline">Terms of Service</span> and <span className="text-[#16A34A] cursor-pointer hover:underline">Privacy Policy</span>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
