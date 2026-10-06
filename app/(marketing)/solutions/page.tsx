"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, Users, Globe, Smartphone, Check, ArrowRight, ChevronRight } from "lucide-react";

const solutions = [
  {
    icon: Building2,
    title: "Small Business",
    subtitle: "1–50 Employees",
    desc: "Everything a small company needs to manage HR from day one. Simple setup, powerful features, affordable pricing.",
    features: ["Employee records & profiles","Attendance tracking","Leave management","Monthly payroll","Basic reports"],
    cta: "Start Free Trial",
    href: "/register",
    highlight: false,
  },
  {
    icon: Users,
    title: "Growing Companies",
    subtitle: "50–500 Employees",
    desc: "Scale your HR operations as you grow. Manage multiple departments, complex payroll, and advanced workflows.",
    features: ["All Small Business features","GPS Geofencing","Multiple departments","Advanced payroll (EOBI, Tax)","Priority support"],
    cta: "Get Started",
    href: "/register",
    highlight: true,
  },
  {
    icon: Globe,
    title: "Enterprise",
    subtitle: "500+ Employees",
    desc: "Full-scale HR platform for large organizations. Custom modules, dedicated infrastructure, and SLA-backed support.",
    features: ["All Growth features","Unlimited employees","Custom modules","API access","Dedicated account manager"],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
  {
    icon: Smartphone,
    title: "Remote Teams",
    subtitle: "Distributed Workforce",
    desc: "Manage remote employees with mobile-first HR tools. GPS check-in, mobile payslips, and real-time attendance.",
    features: ["Mobile app (iOS & Android)","Remote attendance tracking","Digital payslips","Online leave applications","Push notifications"],
    cta: "Get Started",
    href: "/register",
    highlight: false,
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white text-[#17211C]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-[#E5EAE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Image src="/nexhr-logo.png" alt="NexHR" width={100} height={34} className="object-contain" /></Link>
          <div className="hidden md:flex items-center gap-1">
            {[{l:"Home",h:"/"},{l:"Features",h:"/features"},{l:"Solutions",h:"/solutions"},{l:"Pricing",h:"/pricing"},{l:"About",h:"/about"},{l:"Contact",h:"/contact"}].map((item)=>(
              <a key={item.l} href={item.h} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${item.l==="Solutions"?"text-[#064E3B] bg-[#F0F4F2] font-semibold":"text-[#4A5E55] hover:text-[#064E3B] hover:bg-[#F0F4F2]"}`}>{item.l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#064E3B] hover:bg-[#F0F4F2] rounded-lg">Login</Link>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d]">Get Started <ArrowRight size={14}/></Link>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-20 bg-gradient-to-br from-[#064E3B] to-[#065F46] px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Solutions for Every<br />Type of Business</h1>
          <p className="text-[#A7C5B9] text-sm mb-6">Whether you're a small startup or a large enterprise, NexHR has the right solution for your needs.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] transition-colors shadow-lg">
            Start Free Trial <ArrowRight size={14}/>
          </Link>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F7F9F8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {solutions.map((s) => (
              <div key={s.title} className={`rounded-2xl p-7 border ${s.highlight ? "bg-[#064E3B] border-[#064E3B] shadow-2xl" : "bg-white border-[#E5EAE7]"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.highlight ? "bg-[#16A34A]" : "bg-[#ECFDF5]"}`}>
                  <s.icon size={20} className={s.highlight ? "text-white" : "text-[#16A34A]"} />
                </div>
                <div className="mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${s.highlight ? "text-[#86efac]" : "text-[#16A34A]"}`}>{s.subtitle}</span>
                  <h3 className={`text-xl font-bold mt-0.5 ${s.highlight ? "text-white" : "text-[#17211C]"}`}>{s.title}</h3>
                </div>
                <p className={`text-sm mb-5 leading-relaxed ${s.highlight ? "text-[#A7C5B9]" : "text-[#4A5E55]"}`}>{s.desc}</p>
                <ul className="space-y-2 mb-6">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check size={13} className={s.highlight ? "text-[#4ade80]" : "text-[#16A34A]"} />
                      <span className={`text-sm ${s.highlight ? "text-[#d1fae5]" : "text-[#4A5E55]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={s.href} className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${s.highlight ? "bg-[#16A34A] text-white hover:bg-[#22c55e]" : "bg-[#064E3B] text-white hover:bg-[#16A34A]"}`}>
                  {s.cta} <ChevronRight size={14}/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-[#064E3B] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-3">Not Sure Which Plan Fits?</h2>
          <p className="text-[#A7C5B9] text-sm mb-6">Talk to our team and we'll help you choose the right solution for your business.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="px-6 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] transition-colors text-sm">Talk to Sales</Link>
            <Link href="/pricing" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-sm">Compare Plans</Link>
          </div>
        </div>
      </section>
      <footer className="bg-[#011a0f] py-8 px-6 text-center">
        <p className="text-xs text-[#4A5E55]">© 2026 NexHR · All Rights Reserved · Made in Pakistan 🇵🇰</p>
      </footer>
    </div>
  );
}
