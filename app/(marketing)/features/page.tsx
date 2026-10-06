"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users, Clock, Calendar, DollarSign, BarChart3, MapPin,
  Smartphone, Bell, FileText, Shield, Globe, Zap, Check,
  ArrowRight, ChevronRight,
} from "lucide-react";

const allFeatures = [
  {
    category: "Employee Management",
    icon: Users,
    color: "#064E3B",
    items: [
      "Complete employee profiles & documents",
      "Department & designation management",
      "Custom employee fields",
      "Employee onboarding workflow",
      "Document storage & verification",
      "Emergency contact records",
    ],
  },
  {
    category: "Attendance & Time",
    icon: Clock,
    color: "#0F766E",
    items: [
      "Web & mobile check-in / check-out",
      "Real-time attendance tracking",
      "Late / early departure alerts",
      "Monthly & weekly attendance reports",
      "Overtime calculation",
      "Timesheet management",
    ],
  },
  {
    category: "GPS Geofencing",
    icon: MapPin,
    color: "#16A34A",
    items: [
      "Office location radius setup",
      "Location-based check-in enforcement",
      "Real-time distance validation",
      "Prevent fraudulent check-ins",
      "Multiple office locations",
      "Live location dashboard",
    ],
  },
  {
    category: "Leave Management",
    icon: Calendar,
    color: "#15803D",
    items: [
      "Multiple leave types (Annual, Sick, Casual)",
      "Online leave application",
      "Manager approval workflow",
      "Leave balance tracking",
      "Leave history & calendar",
      "Auto leave accrual",
    ],
  },
  {
    category: "Payroll & Salaries",
    icon: DollarSign,
    color: "#065F46",
    items: [
      "Automated monthly payroll",
      "Allowances & deductions engine",
      "EOBI & tax calculations (Pakistani law)",
      "PDF payslip generation",
      "Bulk payroll processing",
      "Payroll history & records",
    ],
  },
  {
    category: "Shifts & Scheduling",
    icon: Clock,
    color: "#047857",
    items: [
      "Multiple shift types",
      "Employee shift assignment",
      "Shift swap requests",
      "Weekly & monthly rosters",
      "Night shift support",
      "Break time management",
    ],
  },
  {
    category: "Reports & Analytics",
    icon: BarChart3,
    color: "#064E3B",
    items: [
      "Attendance analytics dashboard",
      "Payroll summary reports",
      "Employee headcount reports",
      "Leave utilization charts",
      "Export to Excel / PDF",
      "Custom date range filters",
    ],
  },
  {
    category: "Mobile App",
    icon: Smartphone,
    color: "#16A34A",
    items: [
      "iOS & Android support",
      "Mobile check-in with GPS",
      "Leave applications on mobile",
      "View payslips & attendance",
      "Push notifications",
      "Offline support",
    ],
  },
  {
    category: "Notifications",
    icon: Bell,
    color: "#15803D",
    items: [
      "Email notifications",
      "Late arrival alerts",
      "Leave approval / rejection alerts",
      "Payroll processed notifications",
      "Attendance reminders",
      "Custom notification rules",
    ],
  },
  {
    category: "Security & Access",
    icon: Shield,
    color: "#064E3B",
    items: [
      "Role-based access control",
      "Multi-tenant data isolation",
      "Secure password hashing",
      "JWT authentication",
      "Session management",
      "Audit logs",
    ],
  },
  {
    category: "Documents",
    icon: FileText,
    color: "#047857",
    items: [
      "Employee document uploads",
      "CNIC, passport, certificates",
      "Document expiry tracking",
      "Centralized document library",
      "Download & share documents",
      "Document verification status",
    ],
  },
  {
    category: "Self-Service Portal",
    icon: Globe,
    color: "#0F766E",
    items: [
      "Employee profile management",
      "View attendance history",
      "Apply & track leaves",
      "Download payslips",
      "Update personal info",
      "Access company policies",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-[#17211C]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-[#E5EAE7] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/nexhr-logo.png" alt="NexHR" width={100} height={34} className="object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Home",      href: "/" },
              { label: "Features",  href: "/features" },
              { label: "Solutions", href: "/solutions" },
              { label: "Pricing",   href: "/pricing" },
              { label: "About",     href: "/about" },
              { label: "Contact",   href: "/contact" },
            ].map((item) => (
              <a key={item.label} href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${item.label === "Features" ? "text-[#064E3B] bg-[#F0F4F2] font-semibold" : "text-[#4A5E55] hover:text-[#064E3B] hover:bg-[#F0F4F2]"}`}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#064E3B] hover:bg-[#F0F4F2] rounded-lg transition-colors">Login</Link>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d] transition-colors">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-[#064E3B] to-[#065F46] px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Zap size={12} className="text-[#4ade80]" />
            <span className="text-xs font-semibold text-[#86efac]">12 Powerful Modules</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Everything You Need to<br />Manage Your People</h1>
          <p className="text-[#A7C5B9] text-sm max-w-xl mx-auto mb-8">
            NexHR combines 12 HR modules into one unified platform. No integrations needed, no extra tools — just one system that works.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="flex items-center gap-2 px-6 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] transition-colors shadow-lg">
              Start Free Trial <ArrowRight size={14} />
            </Link>
            <Link href="/pricing" className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              View Pricing <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 bg-[#F7F9F8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allFeatures.map((feature) => (
              <div key={feature.category} className="bg-white rounded-2xl border border-[#E5EAE7] p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${feature.color}15` }}>
                    <feature.icon size={18} style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-bold text-[#17211C] text-sm">{feature.category}</h3>
                </div>
                <ul className="space-y-2.5">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={13} className="text-[#16A34A] mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-[#4A5E55] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#064E3B]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Transform Your HR Operations?</h2>
          <p className="text-[#A7C5B9] text-sm mb-6">Start your free trial today. No credit card required.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-7 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] transition-colors shadow-lg">
            Get Started Free <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#011a0f] py-8 px-6 text-center">
        <p className="text-xs text-[#4A5E55]">© 2026 NexHR · All Rights Reserved · Made in Pakistan 🇵🇰</p>
      </footer>
    </div>
  );
}
