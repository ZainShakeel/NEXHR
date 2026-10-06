"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Clock, Calendar, DollarSign,
  User, LogOut, ChevronRight, FileText, Target,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",   href: "/employee/dashboard",   icon: LayoutDashboard },
  { label: "Attendance",  href: "/employee/attendance",  icon: Clock },
  { label: "My Leaves",   href: "/employee/leaves",      icon: Calendar },
  { label: "Requests",    href: "/employee/requests",    icon: FileText },
  { label: "Payslips",    href: "/employee/payslips",    icon: DollarSign },
  { label: "Assessment",  href: "/employee/assessment",  icon: Target },
  { label: "My Profile",  href: "/employee/profile",     icon: User },
];

export default function EmployeeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-56 bg-[#064E3B] flex flex-col z-40">
        <div className="px-5 py-5 border-b border-white/10">
          <Image src="/nexhr-logo.png" alt="NexHR" width={85} height={28} className="object-contain brightness-0 invert opacity-90" />
          <p className="text-[10px] text-[#86efac] font-bold mt-2 uppercase tracking-widest">Employee Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25" : "text-[#86efac] hover:bg-white/10 hover:text-white"
                }`}>
                <item.icon size={15} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={12} className="text-white/60" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
            <div className="w-7 h-7 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-[10px] font-bold">Z</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Zain Ahmed</p>
              <p className="text-[10px] text-[#86efac] truncate">IT Engineer</p>
            </div>
          </div>
          <Link href="/employee/login" className="flex items-center gap-2 px-3 py-2 text-[#86efac] hover:text-white hover:bg-white/10 rounded-xl text-xs transition-all">
            <LogOut size={13} /> Logout
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-56 min-h-screen">{children}</main>
    </div>
  );
}
