"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Zap, Shield, Users, ArrowRight } from "lucide-react";

const team = [
  { name: "Zain Shakeel",  role: "Founder & CEO",        initial: "Z" },
  { name: "Team NexHR",    role: "Product & Engineering", initial: "T" },
];

const values = [
  { icon: Heart,  title: "People First",     desc: "Every feature is built with your employees in mind. Simple tools that respect their time." },
  { icon: Zap,    title: "Always Improving", desc: "We ship updates regularly. Your feedback directly shapes our product roadmap." },
  { icon: Shield, title: "Data Security",    desc: "Your HR data is sensitive. We treat it with the highest security standards at all times." },
  { icon: Users,  title: "Built for Pakistan", desc: "PKR payroll, EOBI, local compliance — NexHR is built specifically for Pakistani businesses." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#17211C]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-[#E5EAE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Image src="/nexhr-logo.png" alt="NexHR" width={100} height={34} className="object-contain" /></Link>
          <div className="hidden md:flex items-center gap-1">
            {[{l:"Home",h:"/"},{l:"Features",h:"/features"},{l:"Solutions",h:"/solutions"},{l:"Pricing",h:"/pricing"},{l:"About",h:"/about"},{l:"Contact",h:"/contact"}].map((item)=>(
              <a key={item.l} href={item.h} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${item.l==="About"?"text-[#064E3B] bg-[#F0F4F2] font-semibold":"text-[#4A5E55] hover:text-[#064E3B] hover:bg-[#F0F4F2]"}`}>{item.l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#064E3B] hover:bg-[#F0F4F2] rounded-lg">Login</Link>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d]">Get Started <ArrowRight size={14}/></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-[#064E3B] to-[#065F46] px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#86efac] text-xs font-bold uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Built in Pakistan,<br />for Pakistan</h1>
          <p className="text-[#A7C5B9] text-sm max-w-xl mx-auto">
            NexHR was born from a simple frustration — most HR software wasn't built for Pakistani businesses. We decided to change that.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Our Mission</p>
            <h2 className="text-2xl font-bold text-[#064E3B] mb-4">Smarter People. Stronger Business.</h2>
            <p className="text-sm text-[#4A5E55] leading-relaxed mb-4">
              We believe every business, from a 5-person startup to a 5,000-person corporation, deserves world-class HR tools. We're building the most complete, affordable and easy-to-use HR platform for the Pakistani market.
            </p>
            <p className="text-sm text-[#4A5E55] leading-relaxed">
              NexHR handles the complexity of Pakistani payroll, local compliance, and workforce management — so you can focus on growing your business and taking care of your people.
            </p>
          </div>
          <div className="bg-[#F7F9F8] rounded-2xl p-7 border border-[#E5EAE7]">
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "2026",  label: "Founded" },
                { num: "5+",    label: "Modules" },
                { num: "PKR",   label: "Native Currency" },
                { num: "100%",  label: "Cloud-Based" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-white rounded-xl border border-[#E5EAE7]">
                  <p className="text-2xl font-bold text-[#064E3B]">{stat.num}</p>
                  <p className="text-xs text-[#8AA398] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-[#F7F9F8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">What We Stand For</p>
            <h2 className="text-2xl font-bold text-[#064E3B]">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-[#E5EAE7] p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center mb-3">
                  <v.icon size={18} className="text-[#16A34A]" />
                </div>
                <h3 className="text-sm font-bold text-[#17211C] mb-1.5">{v.title}</h3>
                <p className="text-xs text-[#4A5E55] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">The People Behind NexHR</p>
            <h2 className="text-2xl font-bold text-[#064E3B]">Meet the Team</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl border border-[#E5EAE7] p-6 text-center w-48 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-[#064E3B] rounded-2xl flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
                  {member.initial}
                </div>
                <p className="text-sm font-bold text-[#17211C]">{member.name}</p>
                <p className="text-[11px] text-[#8AA398] mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6 bg-[#064E3B] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-3">Join the NexHR Journey</h2>
          <p className="text-[#A7C5B9] text-sm mb-6">Start your free trial and see how NexHR can transform your HR operations.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-7 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] text-sm">Start Free Trial</Link>
            <Link href="/contact" className="px-7 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 text-sm">Get in Touch</Link>
          </div>
        </div>
      </section>
      <footer className="bg-[#011a0f] py-8 px-6 text-center">
        <p className="text-xs text-[#4A5E55]">© 2026 NexHR · All Rights Reserved · Made in Pakistan 🇵🇰</p>
      </footer>
    </div>
  );
}
