"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, HelpCircle, FileText, ArrowRight, ChevronRight } from "lucide-react";

const articles = [
  { title: "Getting Started with NexHR",        tag: "Guide",       desc: "Step-by-step guide to set up your company and add your first employees." },
  { title: "How to Configure GPS Geofencing",   tag: "Tutorial",    desc: "Set up office locations and enable location-based attendance for your team." },
  { title: "Payroll Setup for Pakistani Law",   tag: "Payroll",     desc: "Learn how to configure EOBI, income tax deductions and salary slips." },
  { title: "Managing Leave Policies",           tag: "Leave",       desc: "Create leave types, set approval workflows and configure auto accrual." },
  { title: "Setting Up Employee Roles",         tag: "Access",      desc: "Assign the right roles and permissions to keep your data secure." },
  { title: "Running Monthly Payroll",           tag: "Payroll",     desc: "Process payroll, review deductions and send bulk payslips in minutes." },
];

const faqs = [
  { q: "How do I reset my password?",         a: "Go to the login page and click 'Forgot Password'. You'll receive a reset link via email." },
  { q: "Can I add multiple offices?",          a: "Yes. In the Growth and Enterprise plans, you can add unlimited office locations with separate geofencing zones." },
  { q: "How does GPS check-in work?",          a: "Employees open the NexHR app, and the system verifies their GPS location against the office radius before allowing check-in." },
  { q: "How do I export payroll reports?",     a: "Go to Payroll > Reports, select the month and click Export. You can download as PDF or Excel." },
];

const tagColors: Record<string, string> = {
  Guide:    "bg-[#ECFDF5] text-[#16A34A]",
  Tutorial: "bg-[#EFF6FF] text-[#2563EB]",
  Payroll:  "bg-[#FFF7ED] text-[#EA580C]",
  Leave:    "bg-[#FDF4FF] text-[#9333EA]",
  Access:   "bg-[#F0FDF4] text-[#15803D]",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white text-[#17211C]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-[#E5EAE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Image src="/nexhr-logo.png" alt="NexHR" width={100} height={34} className="object-contain" /></Link>
          <div className="hidden md:flex items-center gap-1">
            {[{l:"Home",h:"/"},{l:"Features",h:"/features"},{l:"Solutions",h:"/solutions"},{l:"Pricing",h:"/pricing"},{l:"About",h:"/about"},{l:"Contact",h:"/contact"}].map((item)=>(
              <a key={item.l} href={item.h} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${"text-[#4A5E55] hover:text-[#064E3B] hover:bg-[#F0F4F2]"}`}>{item.l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#064E3B] hover:bg-[#F0F4F2] rounded-lg">Login</Link>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d]">Get Started <ArrowRight size={14}/></Link>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-14 bg-[#F7F9F8] px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Help & Guides</p>
          <h1 className="text-4xl font-bold text-[#064E3B] mb-3">Resources &amp; Documentation</h1>
          <p className="text-sm text-[#4A5E55]">Everything you need to get the most out of NexHR.</p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: BookOpen,   label: "Getting Started",  desc: "Setup guides for new teams" },
            { icon: HelpCircle, label: "Help Center",      desc: "Answers to common questions" },
            { icon: FileText,   label: "Documentation",    desc: "Full product documentation" },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-[#E5EAE7] rounded-2xl p-5 hover:shadow-md transition-shadow text-center group cursor-pointer">
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#064E3B] transition-colors">
                <c.icon size={18} className="text-[#16A34A] group-hover:text-white transition-colors" />
              </div>
              <p className="text-sm font-bold text-[#17211C]">{c.label}</p>
              <p className="text-xs text-[#8AA398] mt-1">{c.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-[11px] font-semibold text-[#16A34A] opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                Explore <ChevronRight size={11}/>
              </div>
            </div>
          ))}
        </div>

        {/* Articles */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-[#064E3B] mb-5">Popular Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((a) => (
              <div key={a.title} className="bg-[#F7F9F8] rounded-xl border border-[#E5EAE7] p-5 hover:border-[#16A34A] hover:shadow-sm transition-all group cursor-pointer">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${tagColors[a.tag] || "bg-[#F0F4F2] text-[#4A5E55]"}`}>{a.tag}</span>
                <h3 className="text-sm font-bold text-[#17211C] mt-2.5 mb-1 group-hover:text-[#064E3B]">{a.title}</h3>
                <p className="text-xs text-[#8AA398] leading-relaxed">{a.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-[11px] font-semibold text-[#16A34A] opacity-0 group-hover:opacity-100 transition-opacity">
                  Read guide <ChevronRight size={11}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-6 bg-[#F7F9F8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-[#064E3B] mb-6">Quick Answers</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.q} className="bg-white rounded-xl border border-[#E5EAE7] p-5">
                <p className="text-sm font-bold text-[#17211C] mb-2">{f.q}</p>
                <p className="text-xs text-[#4A5E55] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-[#064E3B] rounded-2xl p-6 text-center">
            <p className="text-white font-bold mb-2">Can't find your answer?</p>
            <p className="text-[#A7C5B9] text-xs mb-4">Our support team is here to help you.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white text-sm font-semibold rounded-xl hover:bg-[#22c55e]">
              Contact Support <ArrowRight size={13}/>
            </Link>
          </div>
        </div>
      </section>
      <footer className="bg-[#011a0f] py-8 px-6 text-center">
        <p className="text-xs text-[#4A5E55]">© 2026 NexHR · All Rights Reserved · Made in Pakistan 🇵🇰</p>
      </footer>
    </div>
  );
}
