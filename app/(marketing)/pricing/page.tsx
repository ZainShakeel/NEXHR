"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, X, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Trial",
    price: "Free",
    sub: "1 month · up to 5 employees",
    badge: null,
    highlight: false,
    features: [
      { label: "Employees",           val: "Up to 5" },
      { label: "Office locations",    val: "1" },
      { label: "All core modules",    val: true },
      { label: "GPS Geofencing",      val: false },
      { label: "Mobile App",          val: true },
      { label: "PDF Payslips",        val: true },
      { label: "Reports & Export",    val: "Basic" },
      { label: "Email support",       val: true },
      { label: "Priority support",    val: false },
      { label: "Dedicated manager",   val: false },
      { label: "API access",          val: false },
      { label: "Custom modules",      val: false },
    ],
    cta: "Start Free Trial",
    href: "/register",
  },
  {
    name: "Growth",
    price: "PKR 4,999",
    sub: "per month",
    badge: "Most Popular",
    highlight: true,
    features: [
      { label: "Employees",           val: "Up to 200" },
      { label: "Office locations",    val: "Unlimited" },
      { label: "All core modules",    val: true },
      { label: "GPS Geofencing",      val: true },
      { label: "Mobile App",          val: true },
      { label: "PDF Payslips",        val: true },
      { label: "Reports & Export",    val: "Advanced" },
      { label: "Email support",       val: true },
      { label: "Priority support",    val: true },
      { label: "Dedicated manager",   val: false },
      { label: "API access",          val: false },
      { label: "Custom modules",      val: false },
    ],
    cta: "Get Started",
    href: "/register",
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "Contact us for pricing",
    badge: null,
    highlight: false,
    features: [
      { label: "Employees",           val: "Unlimited" },
      { label: "Office locations",    val: "Unlimited" },
      { label: "All core modules",    val: true },
      { label: "GPS Geofencing",      val: true },
      { label: "Mobile App",          val: true },
      { label: "PDF Payslips",        val: true },
      { label: "Reports & Export",    val: "Full + Custom" },
      { label: "Email support",       val: true },
      { label: "Priority support",    val: true },
      { label: "Dedicated manager",   val: true },
      { label: "API access",          val: true },
      { label: "Custom modules",      val: true },
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
];

const faqs = [
  { q: "Is there a free plan?", a: "We offer a 1-month free trial with all core features and up to 5 employees. No credit card required." },
  { q: "Can I change my plan later?", a: "Yes. You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately." },
  { q: "What payment methods do you accept?", a: "We accept bank transfers, JazzCash, EasyPaisa, and international cards for enterprise clients." },
  { q: "Is my data secure?", a: "Your data is fully isolated per company. We use JWT authentication, secure hashing, and multi-tenant architecture." },
  { q: "Do I need to install anything?", a: "No installation needed. NexHR is fully cloud-based. Access it from any browser or download our mobile app." },
  { q: "What happens after the trial?", a: "After your 1-month trial, you can choose a paid plan to continue. Your data is preserved when you upgrade." },
];

function FeatureVal({ val }: { val: string | boolean }) {
  if (val === true)  return <Check size={15} className="text-[#16A34A] mx-auto" />;
  if (val === false) return <X size={15} className="text-[#D1D5DB] mx-auto" />;
  return <span className="text-xs font-medium text-[#17211C]">{val}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-[#17211C]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-[#E5EAE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Image src="/nexhr-logo.png" alt="NexHR" width={100} height={34} className="object-contain" /></Link>
          <div className="hidden md:flex items-center gap-1">
            {[{l:"Home",h:"/"},{l:"Features",h:"/features"},{l:"Solutions",h:"/solutions"},{l:"Pricing",h:"/pricing"},{l:"About",h:"/about"},{l:"Contact",h:"/contact"}].map((item)=>(
              <a key={item.l} href={item.h} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${item.l==="Pricing"?"text-[#064E3B] bg-[#F0F4F2] font-semibold":"text-[#4A5E55] hover:text-[#064E3B] hover:bg-[#F0F4F2]"}`}>{item.l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#064E3B] hover:bg-[#F0F4F2] rounded-lg">Login</Link>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d]">Get Started <ArrowRight size={14}/></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-14 bg-[#F7F9F8] px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Simple & Transparent</p>
          <h1 className="text-4xl font-bold text-[#064E3B] mb-3">Flexible Pricing Plans</h1>
          <p className="text-sm text-[#4A5E55]">Start with a free trial. Upgrade when you're ready. No hidden fees.</p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-2xl p-7 relative ${p.highlight ? "bg-[#064E3B] shadow-2xl shadow-[#064E3B]/25 scale-[1.02]" : "bg-white border border-[#E5EAE7]"}`}>
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#16A34A] text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    {p.badge}
                  </div>
                )}
                <h3 className={`font-bold text-lg mb-1 ${p.highlight ? "text-white" : "text-[#17211C]"}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className={`text-3xl font-bold ${p.highlight ? "text-[#4ade80]" : "text-[#064E3B]"}`}>{p.price}</span>
                </div>
                <p className={`text-xs mb-6 ${p.highlight ? "text-[#86efac]" : "text-[#8AA398]"}`}>{p.sub}</p>
                <ul className="space-y-3 mb-7">
                  {p.features.map((f) => (
                    <li key={f.label} className="flex items-center justify-between gap-2">
                      <span className={`text-xs ${p.highlight ? "text-[#A7C5B9]" : "text-[#4A5E55]"}`}>{f.label}</span>
                      <FeatureVal val={f.val} />
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className={`block w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors ${p.highlight ? "bg-[#16A34A] text-white hover:bg-[#22c55e]" : "bg-[#064E3B] text-white hover:bg-[#16A34A]"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 bg-[#F7F9F8]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Common Questions</p>
            <h2 className="text-2xl font-bold text-[#064E3B]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl border border-[#E5EAE7] p-5">
                <h4 className="text-sm font-bold text-[#17211C] mb-2">{faq.q}</h4>
                <p className="text-xs text-[#4A5E55] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6 bg-[#064E3B] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-3">Start Your Free Trial Today</h2>
          <p className="text-[#A7C5B9] text-sm mb-6">1 month free. Up to 5 employees. No credit card needed.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-7 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] text-sm">Start Free Trial</Link>
            <Link href="/contact" className="px-7 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 text-sm">Contact Sales</Link>
          </div>
        </div>
      </section>
      <footer className="bg-[#011a0f] py-8 px-6 text-center">
        <p className="text-xs text-[#4A5E55]">© 2026 NexHR · All Rights Reserved · Made in Pakistan 🇵🇰</p>
      </footer>
    </div>
  );
}
