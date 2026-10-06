"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Mail, Phone, MapPin, ArrowRight, Check } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", employees: "", message: "" });

  return (
    <div className="min-h-screen bg-white text-[#17211C]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-[#E5EAE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Image src="/nexhr-logo.png" alt="NexHR" width={100} height={34} className="object-contain" /></Link>
          <div className="hidden md:flex items-center gap-1">
            {[{l:"Home",h:"/"},{l:"Features",h:"/features"},{l:"Solutions",h:"/solutions"},{l:"Pricing",h:"/pricing"},{l:"About",h:"/about"},{l:"Contact",h:"/contact"}].map((item)=>(
              <a key={item.l} href={item.h} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${item.l==="Contact"?"text-[#064E3B] bg-[#F0F4F2] font-semibold":"text-[#4A5E55] hover:text-[#064E3B] hover:bg-[#F0F4F2]"}`}>{item.l}</a>
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
          <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Get in Touch</p>
          <h1 className="text-4xl font-bold text-[#064E3B] mb-3">We'd Love to Hear From You</h1>
          <p className="text-sm text-[#4A5E55]">Questions, demos, enterprise pricing — our team is ready to help.</p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-3">Contact Information</p>
              <div className="space-y-4">
                {[
                  { icon: Mail,    label: "Email",   value: "support@nexhr.com" },
                  { icon: Phone,   label: "Phone",   value: "+92 300 0000000" },
                  { icon: MapPin,  label: "Office",  value: "Lahore, Pakistan" },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0">
                      <c.icon size={16} className="text-[#16A34A]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#8AA398] uppercase tracking-wide">{c.label}</p>
                      <p className="text-sm text-[#17211C] font-medium">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#064E3B] rounded-2xl p-5 text-white">
              <p className="text-sm font-bold mb-2">Looking for Enterprise?</p>
              <p className="text-[#A7C5B9] text-xs mb-4">Get custom pricing, dedicated support, and a personalized demo for your team.</p>
              <a href="mailto:enterprise@nexhr.com" className="text-[#4ade80] text-xs font-semibold hover:underline">enterprise@nexhr.com →</a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 bg-[#16A34A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#064E3B] mb-2">Message Received!</h3>
                <p className="text-sm text-[#4A5E55] mb-6">Our team will get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="text-sm text-[#16A34A] font-semibold hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="bg-[#F7F9F8] rounded-2xl border border-[#E5EAE7] p-7 space-y-4">
                <h3 className="text-sm font-bold text-[#17211C] mb-4">Send a Message</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Your Name *</label>
                    <input required type="text" placeholder="Zain Ahmed" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Work Email *</label>
                    <input required type="email" placeholder="you@company.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Company Name</label>
                    <input type="text" placeholder="ABC Corporation" value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Number of Employees</label>
                    <select value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A]">
                      <option value="">Select range</option>
                      <option>1–10</option><option>11–50</option><option>51–200</option><option>200+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Message *</label>
                  <textarea required rows={4} placeholder="Tell us how we can help..." value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#16A34A] resize-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#064E3B] text-white font-semibold rounded-xl hover:bg-[#16A34A] transition-colors text-sm">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-[#011a0f] py-8 px-6 text-center">
        <p className="text-xs text-[#4A5E55]">© 2026 NexHR · All Rights Reserved · Made in Pakistan 🇵🇰</p>
      </footer>
    </div>
  );
}
