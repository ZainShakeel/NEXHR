"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Building2, ClipboardList,
  MapPin, Clock, Timer, Calendar, DollarSign,
  FileText, BarChart3, Bell, Settings, ChevronLeft,
  ChevronRight, LogOut, Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
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

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "HR";

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#064E3B] transition-all duration-300 ease-in-out relative flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-[#064E3B] border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-white text-base tracking-tight leading-none">NexHR</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-2.5 px-0.5">
            <p className="text-[11px] text-[#A7C5B9] font-medium truncate">{companyName}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{userRole}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.label && !collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/30 px-2 pt-4 pb-1.5">
                {group.label}
              </p>
            )}
            {group.label && collapsed && <div className="h-3" />}
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                    active
                      ? "bg-white/12 text-white border-l-2 border-[#22c55e] pl-[calc(0.5rem-2px)]"
                      : "text-[#A7C5B9] hover:bg-white/8 hover:text-white border-l-2 border-transparent"
                  )}
                >
                  <item.icon
                    size={17}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      active ? "text-[#22c55e]" : "text-[#A7C5B9] group-hover:text-white"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate text-[13px]">{item.label}</span>
                  )}
                  {/* Tooltip for collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[#022c1a] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
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
      <div className="px-2 py-3 border-t border-white/10 flex-shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[#A7C5B9] hover:bg-white/8 hover:text-white transition-colors group",
            collapsed && "justify-center"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName || userRole}</p>
              <p className="text-[10px] text-white/40 truncate">{userRole}</p>
            </div>
          )}
          {!collapsed && <LogOut size={14} className="text-white/30 group-hover:text-white flex-shrink-0" />}
        </button>
      </div>
    </aside>
  );
}
