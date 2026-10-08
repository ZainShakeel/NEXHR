"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Building2, ClipboardList,
  MapPin, Clock, Timer, Calendar, DollarSign,
  FileText, BarChart3, Bell, Settings, ChevronLeft,
  ChevronRight, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: null,
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { href: "/employees", label: "Employees", icon: Users },
      { href: "/departments", label: "Departments", icon: Building2 },
    ],
  },
  {
    label: "Time & Attendance",
    items: [
      { href: "/attendance", label: "Attendance", icon: ClipboardList },
      { href: "/geofencing", label: "Geofencing", icon: MapPin },
      { href: "/shifts", label: "Shifts", icon: Clock },
      { href: "/timesheets", label: "Timesheets", icon: Timer },
    ],
  },
  {
    label: "Leave",
    items: [
      { href: "/leave", label: "Leave Management", icon: Calendar },
      { href: "/leave-types", label: "Leave Types", icon: Calendar },
    ],
  },
  {
    label: "Payroll",
    items: [
      { href: "/payroll", label: "Payroll", icon: DollarSign },
      { href: "/salary-slips", label: "Salary Slips", icon: FileText },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  companyName?: string;
  userRole?: string;
  userName?: string;
}

export default function Sidebar({ companyName = "NexHR", userRole = "HR Admin", userName = "" }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => signOut({ callbackUrl: "/login" });

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "HR";

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 ease-in-out relative flex-shrink-0",
        collapsed ? "w-[64px]" : "w-[230px]"
      )}
      style={{ background: "linear-gradient(180deg, #071A10 0%, #0A2A1A 40%, #071A10 100%)" }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-20 w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors shadow-lg"
        style={{ background: "#16A34A", border: "2px solid #071A10" }}
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>

      {/* Logo */}
      <div
        className={cn("flex-shrink-0 h-[64px] flex items-center", collapsed ? "justify-center px-0" : "px-4")}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {collapsed ? (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}>
            <span className="text-white font-black text-sm">N</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 w-full">
            <div className="relative h-8 w-[110px]">
              <Image src="/nexhr-logo.png" alt="NexHR" fill className="object-contain object-left" priority />
            </div>
            <p className="text-[10px] text-white/35 truncate pl-0.5">{companyName}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: "none" }}>
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-0.5">
            {group.label && !collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] px-2 pt-4 pb-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                {group.label}
              </p>
            )}
            {group.label && collapsed && <div className="h-3" />}
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group relative mb-0.5",
                    active
                      ? "text-white"
                      : "text-white/45 hover:text-white/80"
                  )}
                  style={active ? {
                    background: "linear-gradient(90deg, rgba(22,163,74,0.25) 0%, rgba(22,163,74,0.08) 100%)",
                    borderLeft: "3px solid #22c55e",
                    paddingLeft: "0.5rem",
                  } : { borderLeft: "3px solid transparent" }}
                >
                  <item.icon
                    size={16}
                    className={cn("flex-shrink-0", active ? "text-green-400" : "text-white/40 group-hover:text-white/70")}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl"
                      style={{ background: "#16A34A" }}>
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 p-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all hover:bg-red-500/12 group",
            collapsed && "justify-center"
          )}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#16A34A,#22c55e)" }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName || "HR Admin"}</p>
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{userRole}</p>
            </div>
          )}
          {!collapsed && <LogOut size={13} className="text-white/25 group-hover:text-red-400 transition-colors flex-shrink-0" />}
        </button>
      </div>
    </aside>
  );
}
