"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useCompany } from "@/hooks/useCompany";
import {
  LayoutDashboard, Clock, Calendar, FileText, User,
  ClipboardList, LogOut, Leaf, Menu, X, Bell, ChevronRight,
} from "lucide-react";

const nav = [
  { href: "/employee/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { href: "/employee/attendance", label: "Attendance",   icon: Clock },
  { href: "/employee/leaves",     label: "My Leaves",    icon: Calendar },
  { href: "/employee/requests",   label: "Requests",     icon: ClipboardList },
  { href: "/employee/payslips",   label: "Pay Slips",    icon: FileText },
  { href: "/employee/profile",    label: "My Profile",   icon: User },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userName, companyName } = useCompany();
  const [open, setOpen] = useState(false);

  const isLogin = pathname === "/employee/login";
  if (isLogin) return <>{children}</>;

  const initials = userName
    ? userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "E";

  return (
    <div className="flex h-screen bg-[#F4F8F6] overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#064E3B] flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center flex-shrink-0">
              <Leaf size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">NexHR</p>
              <p className="text-[10px] text-white/40 truncate max-w-[120px]">{companyName || "Employee Portal"}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${active
                    ? "bg-white/15 text-white border-l-2 border-[#22c55e] pl-[calc(0.75rem-2px)]"
                    : "text-white/60 hover:bg-white/8 hover:text-white border-l-2 border-transparent"
                  }`}>
                <item.icon size={17} className={`flex-shrink-0 ${active ? "text-[#22c55e]" : "text-white/50 group-hover:text-white"}`} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={13} className="text-white/40" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName || "Employee"}</p>
              <p className="text-[10px] text-white/40">Employee</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/employee/login" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/60 hover:bg-white/8 hover:text-white transition-colors text-sm">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E5EAE7] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 rounded-lg text-[#4A5E55] hover:bg-[#F7F9F8]">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-[#17211C]">
              {nav.find(n => pathname === n.href || pathname.startsWith(n.href + "/"))?.label || "Employee Portal"}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 rounded-xl text-[#8AA398] hover:bg-[#F7F9F8] relative">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#064E3B] flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
