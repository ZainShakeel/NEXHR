"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Users, MapPin, Calendar, DollarSign, BarChart3, Shield,
  Clock, Smartphone, ChevronRight, Check, Menu, X, ArrowRight,
  Star, Building2, Globe, Bell, Zap, Lock, Play,
} from "lucide-react";

const features = [
  { icon: Users,      title: "Employee Management",    desc: "Complete employee records, documents and profiles." },
  { icon: Clock,      title: "Attendance & Geofencing",desc: "Location-based check-in with GPS radius enforcement." },
  { icon: Calendar,   title: "Leave Management",       desc: "Apply, approve and track all leave types easily." },
  { icon: DollarSign, title: "Payroll & Salary Slips", desc: "Automated payroll with downloadable PDF payslips." },
  { icon: BarChart3,  title: "Shifts & Timesheets",    desc: "Flexible workforce scheduling and time tracking." },
  { icon: Bell,       title: "Reports & Analytics",    desc: "Data-driven HR decisions with export support." },
  { icon: Globe,      title: "Employee Self-Service",  desc: "Employees access their own info anytime." },
  { icon: Zap,        title: "Notifications & Alerts", desc: "Stay informed with real-time system updates." },
];

const roles = [
  { icon: Shield,    title: "Super Admin",    desc: "Manage companies, plans & analytics." },
  { icon: Building2, title: "Company Owner",  desc: "Full company control with HR management." },
  { icon: Users,     title: "HR / Admin",     desc: "Manage employees, attendance & documents." },
  { icon: Clock,     title: "Manager",        desc: "View and manage your team's data." },
  { icon: Smartphone,title: "Employee",       desc: "Access your profile, leave & payslips." },
];

const modules = ["Employees","Attendance","Geofencing","Shifts","Leave","Payroll","Reports"];

const plans = [
  {
    name: "Trial",    price: "Free",       sub: "1 month · 5 employees",
    badge: null, highlight: false,
    features: ["Up to 5 employees","All core modules","1 office location","Email support"],
    cta: "Start Free Trial",
  },
  {
    name: "Growth",   price: "PKR 4,999",  sub: "per month",
    badge: "Most Popular", highlight: true,
    features: ["Up to 200 employees","All core modules","Unlimited offices","GPS Geofencing","Priority support"],
    cta: "Get Started",
  },
  {
    name: "Enterprise", price: "Custom",  sub: "Contact sales",
    badge: null, highlight: false,
    features: ["Unlimited employees","Custom modules","Dedicated server","API access","SLA support"],
    cta: "Contact Sales",
  },
];

const testimonials = [
  { name: "Ayesha Khan",   role: "HR Manager, TechCorp",        stars: 5, text: "NexHR has completely transformed how we manage our team. It's simple, powerful and reliable." },
  { name: "Bilal Ahmed",   role: "Operations Manager, NextGen", stars: 5, text: "The mobile app makes it so easy for our employees. Our HR team saves hours every week." },
  { name: "Sara Malik",    role: "CEO, Horizon Ltd",            stars: 5, text: "Clean interface, great support and all the features we needed. NexHR is a game changer!" },
];

const security = [
  "Multi-tenant data isolation","Secure authentication","Role-based permissions",
  "Payroll protection","Audit logs","Data encryption",
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#17211C] font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-[#E5EAE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image src="/nexhr-logo.png" alt="NexHR" width={110} height={36} className="object-contain" />
          </Link>
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: "Home",      href: "/" },
              { label: "Features",  href: "/features" },
              { label: "Solutions", href: "/solutions" },
              { label: "Pricing",   href: "/pricing" },
              { label: "Resources", href: "/resources" },
              { label: "About",     href: "/about" },
              { label: "Contact",   href: "/contact" },
            ].map((item) => (
              <a key={item.label} href={item.href}
                className="px-3 py-2 text-sm font-medium text-[#4A5E55] hover:text-[#064E3B] hover:bg-[#F0F4F2] rounded-lg transition-all">
                {item.label}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setLoginOpen(true)} className="px-4 py-2 text-sm font-semibold text-[#064E3B] hover:bg-[#F0F4F2] rounded-lg transition-colors">
              Login
            </button>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d] transition-colors shadow-sm">
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>
          <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-[#E5EAE7] bg-white px-6 py-4 space-y-1">
            {[
              {l:"Home",h:"/"},{l:"Features",h:"/features"},{l:"Solutions",h:"/solutions"},
              {l:"Pricing",h:"/pricing"},{l:"About",h:"/about"},{l:"Contact",h:"/contact"},
            ].map(({ l, h }) => (
              <a key={l} href={h}
                className="block px-3 py-2.5 text-sm font-medium text-[#4A5E55] hover:bg-[#F0F4F2] rounded-lg" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button onClick={() => { setLoginOpen(true); setMenuOpen(false); }} className="w-full py-2.5 text-sm font-semibold text-[#064E3B] border border-[#E5EAE7] rounded-lg">Login</button>
              <Link href="/register" className="w-full py-2.5 text-sm font-semibold bg-[#16A34A] text-white rounded-lg text-center">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── LOGIN MODAL ── */}
      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setLoginOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLoginOpen(false)} className="absolute top-4 right-4 text-[#8AA398] hover:text-[#17211C]"><X size={20} /></button>
            <Image src="/nexhr-logo.png" alt="NexHR" width={100} height={34} className="object-contain mb-5" />
            <h2 className="text-xl font-bold text-[#17211C] mb-1">Welcome back</h2>
            <p className="text-sm text-[#8AA398] mb-5">Choose your login type</p>
            <div className="space-y-3">
              <Link href="/login" onClick={() => setLoginOpen(false)}
                className="flex items-center justify-between px-4 py-4 rounded-xl border-2 border-[#064E3B] bg-[#064E3B]/5 hover:bg-[#064E3B]/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#064E3B] rounded-lg flex items-center justify-center"><Building2 size={17} className="text-white" /></div>
                  <div>
                    <p className="text-sm font-bold text-[#064E3B]">Company / HR Login</p>
                    <p className="text-[11px] text-[#8AA398]">Owners, HR Admins, Managers</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#064E3B]" />
              </Link>
              <Link href="/employee-login" onClick={() => setLoginOpen(false)}
                className="flex items-center justify-between px-4 py-4 rounded-xl border-2 border-[#E5EAE7] hover:border-[#16A34A] hover:bg-[#ECFDF5] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#16A34A] rounded-lg flex items-center justify-center"><Users size={17} className="text-white" /></div>
                  <div>
                    <p className="text-sm font-bold text-[#17211C]">Employee Login</p>
                    <p className="text-[11px] text-[#8AA398]">Attendance, leaves & payslips</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#8AA398]" />
              </Link>
            </div>
            <p className="text-center text-xs text-[#8AA398] mt-5">
              New? <Link href="/register" className="text-[#16A34A] font-semibold hover:underline" onClick={() => setLoginOpen(false)}>Register your company</Link>
            </p>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="pt-16 bg-gradient-to-br from-white via-[#F0F9F4] to-[#ECFDF5] relative overflow-hidden">
        {/* BG decoration */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#16A34A]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-[#064E3B]/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white border border-[#16A34A]/30 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-[#16A34A]">Modern HR Solutions for Growing Teams</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-[#064E3B] leading-[1.1] mb-5">
              Smarter People.<br />
              <span className="text-[#16A34A]">Stronger Business.</span>
            </h1>
            <p className="text-base text-[#4A5E55] leading-relaxed mb-8 max-w-lg">
              NexHR is a complete HR management system that helps you manage your people, attendance, leave, payroll and more — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/register" className="flex items-center gap-2 px-6 py-3.5 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#15803d] transition-colors shadow-lg shadow-[#16A34A]/25">
                Get Started Free <ArrowRight size={15} />
              </Link>
              <button className="flex items-center gap-2 px-6 py-3.5 bg-white text-[#064E3B] font-semibold rounded-xl border-2 border-[#E5EAE7] hover:border-[#16A34A] transition-colors">
                <Play size={14} className="fill-[#16A34A] text-[#16A34A]" /> Watch Demo
              </button>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 text-xs text-[#8AA398]">
              {[
                { icon: Building2, label: "Multiple Companies · One Platform" },
                { icon: Lock,      label: "100% Secure · Your Data, Our Priority" },
                { icon: Zap,       label: "Scalable · From 5 to 10,000+ employees" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5">
                  <b.icon size={13} className="text-[#16A34A]" />
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative z-10">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#16A34A]/10 to-[#064E3B]/5 rounded-3xl blur-xl" />
              <Image src="/hero-image.png" alt="NexHR Dashboard" width={700} height={500}
                className="relative w-full object-contain drop-shadow-2xl" priority />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-4">
            <div>
              <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Powerful Features</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B]">Everything You Need to<br />Manage Your People</h2>
            </div>
            <p className="text-sm text-[#4A5E55] max-w-sm">From attendance to payroll, NexHR gives you all the tools to build a more productive and engaged team.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="p-5 rounded-2xl border border-[#E5EAE7] hover:border-[#16A34A] hover:shadow-lg transition-all group cursor-default">
                <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#064E3B] transition-colors">
                  <f.icon size={18} className="text-[#16A34A] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-[#17211C] mb-1">{f.title}</h3>
                <p className="text-xs text-[#8AA398] leading-relaxed">{f.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-[11px] font-semibold text-[#16A34A] opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={11} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="py-20 px-6 bg-[#F7F9F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Built for Everyone</p>
            <h2 className="text-3xl font-bold text-[#064E3B]">Role-Based Access</h2>
            <p className="text-sm text-[#4A5E55] mt-2">Different roles. Different needs. One powerful platform.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {roles.map((r) => (
              <div key={r.title} className="bg-white rounded-2xl border border-[#E5EAE7] p-5 text-center hover:border-[#16A34A] hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#064E3B] transition-colors">
                  <r.icon size={20} className="text-[#16A34A] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-[#17211C] mb-1">{r.title}</h3>
                <p className="text-[11px] text-[#8AA398] leading-relaxed">{r.desc}</p>
                <button className="mt-3 text-[11px] font-semibold text-[#16A34A] flex items-center gap-0.5 mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEB + MOBILE SPLIT ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="absolute -inset-6 bg-[#ECFDF5] rounded-3xl -z-10" />
            <Image src="/hero-image.png" alt="NexHR Web & Mobile" width={640} height={460} className="w-full object-contain drop-shadow-xl relative z-10" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">The Complete HR Platform</p>
            <h2 className="text-3xl font-bold text-[#064E3B] mb-4">Powerful Web &amp; Mobile Apps</h2>
            <p className="text-sm text-[#4A5E55] mb-7 leading-relaxed">
              Designed for both desktop and mobile, NexHR keeps your team connected and productive — anywhere, anytime.
            </p>
            <div className="space-y-3 mb-8">
              {["Multi-tenant architecture","Enterprise-grade security","Cloud-based & always available","Easy setup & onboarding"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#ECFDF5] border border-[#16A34A]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-[#16A34A]" />
                  </div>
                  <span className="text-sm text-[#4A5E55]">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 px-5 py-3 bg-[#064E3B] text-white text-sm font-semibold rounded-xl hover:bg-[#16A34A] transition-colors">
              Explore All Features <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MODULES STRIP ── */}
      <section className="py-14 px-6 bg-[#064E3B]">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold text-[#86efac] uppercase tracking-widest mb-6 text-center">Core Modules</p>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Streamlined HR Operations</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {modules.map((m, i) => (
              <div key={m} className="flex items-center gap-2">
                <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors cursor-default">
                  {m}
                </div>
                {i < modules.length - 1 && <ChevronRight size={14} className="text-[#16A34A]" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GEOFENCING HIGHLIGHT ── */}
      <section className="py-20 px-6 bg-[#F7F9F8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Map mockup */}
          <div className="bg-white rounded-2xl border border-[#E5EAE7] shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-[#8AA398] font-semibold uppercase tracking-wide">Office Location</p>
                <p className="text-sm font-bold text-[#17211C]">Lahore HQ · 100 m radius</p>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#16A34A] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" /> Live
              </span>
            </div>
            {/* SVG map */}
            <div className="relative bg-[#ECFDF5] rounded-xl h-52 flex items-center justify-center overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs><pattern id="grid2" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#16A34A" strokeWidth="0.5"/>
                </pattern></defs>
                <rect width="100%" height="100%" fill="url(#grid2)" />
              </svg>
              <div className="relative flex items-center justify-center">
                <div className="w-44 h-44 rounded-full border-2 border-[#16A34A]/20 bg-[#16A34A]/5 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-[#16A34A]/35 bg-[#16A34A]/10 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#16A34A]/20 border-2 border-[#16A34A] flex items-center justify-center">
                      <MapPin size={18} className="text-[#16A34A]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg px-3 py-2 text-[10px] font-mono text-[#4A5E55] shadow-sm border border-[#E5EAE7]">
                31.5204°N · 74.3587°E
              </div>
            </div>
            {/* Check-in cards */}
            <div className="mt-4 space-y-2">
              {[
                { name: "Zain Ahmed",  role: "Marketing Manager", dist: "12 m",  status: "Within Office Range", ok: true },
                { name: "Ayesha Khan", role: "IT Engineer",        dist: "8 m",   status: "Within Office Range", ok: true },
              ].map((e) => (
                <div key={e.name} className="flex items-center justify-between bg-[#F7F9F8] rounded-xl px-4 py-2.5 border border-[#E5EAE7]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#064E3B] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{e.name.charAt(0)}</div>
                    <div>
                      <p className="text-xs font-semibold text-[#17211C]">{e.name}</p>
                      <p className="text-[10px] text-[#8AA398]">{e.status} · Distance: {e.dist}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold bg-[#16A34A] text-white px-3 py-1.5 rounded-lg">Check In</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Smart Geofencing</p>
            <h2 className="text-3xl font-bold text-[#064E3B] mb-4">Keep Your Team<br />Within Reach</h2>
            <p className="text-sm text-[#4A5E55] mb-7 leading-relaxed">
              Monitor check-ins, ensure location accuracy and maintain workplace integrity with our advanced GPS geofencing feature. 100% free with Leaflet.js — no API costs.
            </p>
            <div className="space-y-3 mb-8">
              {["Location-based check-ins","Real-time distance validation","Prevent false check-ins","Works on web & mobile"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#ECFDF5] border border-[#16A34A]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-[#16A34A]" />
                  </div>
                  <span className="text-sm text-[#4A5E55]">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 px-5 py-3 border-2 border-[#064E3B] text-[#064E3B] text-sm font-semibold rounded-xl hover:bg-[#064E3B] hover:text-white transition-all">
              Learn More <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">What Our Clients Say</p>
              <h2 className="text-3xl font-bold text-[#064E3B]">Trusted by Growing Businesses</h2>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({length:5}).map((_,i)=><Star key={i} size={16} fill="#F59E0B" className="text-[#F59E0B]"/>)}
              <span className="text-sm font-bold text-[#17211C] ml-1">4.8/5</span>
              <span className="text-xs text-[#8AA398]">Based on 500+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-[#E5EAE7] p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">{Array.from({length:t.stars}).map((_,i)=><Star key={i} size={13} fill="#F59E0B" className="text-[#F59E0B]"/>)}</div>
                <p className="text-sm text-[#4A5E55] leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#F0F4F2]">
                  <div className="w-9 h-9 bg-[#064E3B] rounded-full flex items-center justify-center text-white text-sm font-bold">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-xs font-bold text-[#17211C]">{t.name}</p>
                    <p className="text-[10px] text-[#8AA398]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY BAND ── */}
      <section className="py-16 px-6 bg-[#064E3B]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-[#86efac] text-xs font-bold uppercase tracking-widest mb-2">Enterprise Ready</p>
              <h2 className="text-2xl font-bold text-white">Simple. Secure. Scalable.</h2>
              <p className="text-[#A7C5B9] text-sm mt-2">Built with security and data isolation at the core. Your data, your rules — always.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {security.map((s) => (
                <div key={s} className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-4 py-3">
                  <Check size={13} className="text-[#16A34A] flex-shrink-0" />
                  <span className="text-xs text-white font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-6 bg-[#F7F9F8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#16A34A] uppercase tracking-widest mb-2">Simple &amp; Transparent</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B]">Flexible Pricing Plans</h2>
            <p className="text-sm text-[#4A5E55] mt-2">Choose the plan that fits your business needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-2xl p-7 relative ${p.highlight ? "bg-[#064E3B] shadow-2xl shadow-[#064E3B]/30 scale-105" : "bg-white border border-[#E5EAE7]"}`}>
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#16A34A] text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow">
                    {p.badge}
                  </div>
                )}
                <h3 className={`font-bold text-lg mb-1 ${p.highlight ? "text-white" : "text-[#17211C]"}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className={`text-3xl font-bold ${p.highlight ? "text-[#4ade80]" : "text-[#064E3B]"}`}>{p.price}</span>
                </div>
                <p className={`text-xs mb-5 ${p.highlight ? "text-[#86efac]" : "text-[#8AA398]"}`}>{p.sub}</p>
                <ul className="space-y-2.5 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check size={13} className={p.highlight ? "text-[#4ade80]" : "text-[#16A34A]"} />
                      <span className={`text-sm ${p.highlight ? "text-[#d1fae5]" : "text-[#4A5E55]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors ${p.highlight ? "bg-[#16A34A] text-white hover:bg-[#22c55e]" : "bg-[#064E3B] text-white hover:bg-[#16A34A]"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-6 bg-[#064E3B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-20 w-72 h-72 bg-white rounded-full" />
          <div className="absolute bottom-0 left-20 w-56 h-56 bg-white rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Let's Build a Better<br />Workplace Together</h2>
          <p className="text-[#A7C5B9] mb-8 text-sm">Join thousands of companies already using NexHR to manage their people and grow their business.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] transition-colors shadow-lg">
              Get Started Free <ArrowRight size={15} />
            </Link>
            <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              <Play size={14} className="fill-white" /> Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#011a0f] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/10">
            <div className="col-span-2 md:col-span-1">
              <Image src="/nexhr-logo.png" alt="NexHR" width={100} height={34} className="object-contain brightness-0 invert opacity-80 mb-3" />
              <p className="text-xs text-[#4A5E55] leading-relaxed">Smarter People. Stronger Business.</p>
            </div>
            {[
              { label: "Product",   links: ["Features","Pricing","Integrations"] },
              { label: "Solutions", links: ["Small Business","Enterprise","Remote Teams"] },
              { label: "Resources", links: ["Help","Blog","Help Center"] },
              { label: "Company",   links: ["About Us","Contact","Privacy"] },
            ].map((col) => (
              <div key={col.label}>
                <p className="text-xs font-bold text-white mb-3">{col.label}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-xs text-[#4A5E55] hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6">
            <p className="text-xs text-[#4A5E55]">© 2026 NexHR · All Rights Reserved · Made in Pakistan 🇵🇰</p>
            <div className="flex gap-4 text-xs text-[#4A5E55]">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
