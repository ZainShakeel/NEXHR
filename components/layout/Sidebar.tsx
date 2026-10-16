"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Building2, ClipboardList, MapPin, Clock,
  Calendar, DollarSign, FileText, BarChart3, Bell, Settings,
  ChevronLeft, ChevronRight, LogOut, Briefcase, UserPlus,
  FolderOpen, Target, GraduationCap, Megaphone, HelpCircle,
  GitBranch, Timer, ChevronDown, ChevronUp,
} from "lucide-react";

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
      { href: "/org-chart", label: "Org Chart", icon: GitBranch, soon: true },
    ],
  },
  {
    label: "Time & Attendance",
    items: [
      { href: "/attendance", label: "Attendance", icon: ClipboardList },
      { href: "/shifts", label: "Shifts", icon: Clock },
      { href: "/timesheets", label: "Timesheets", icon: Timer },
      { href: "/geofencing", label: "Geofencing", icon: MapPin },
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
    label: "Payroll & Finance",
    items: [
      { href: "/payroll", label: "Payroll", icon: DollarSign },
      { href: "/salary-slips", label: "Salary Slips", icon: FileText },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { href: "/recruitment", label: "Job Openings", icon: Briefcase, soon: true },
    ],
  },
  {
    label: "Development",
    items: [
      { href: "/performance", label: "Performance", icon: Target, soon: true },
      { href: "/training", label: "Training", icon: GraduationCap, soon: true },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/documents", label: "Documents", icon: FolderOpen, soon: true },
      { href: "/announcements", label: "Announcements", icon: Megaphone, soon: true },
      { href: "/onboarding", label: "Onboarding", icon: UserPlus, soon: true },
      { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/help", label: "Help & Support", icon: HelpCircle, soon: true },
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
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const handleLogout = () => signOut({ callbackUrl: "/login" });

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "HR";

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0 transition-all duration-300 ease-in-out relative"
      style={{
        width: collapsed ? 64 : 240,
        background: "#FFFFFF",
        borderRight: "1px solid #E2E8F0",
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[68px] z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors"
        style={{ background: "#07845A", border: "2px solid #fff", color: "#fff" }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
      </button>

      {/* Logo + Company */}
      <div
        className="flex-shrink-0 h-16 flex items-center px-4"
        style={{ borderBottom: "1px solid #E2E8F0" }}
      >
        {collapsed ? (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: "linear-gradient(135deg,#07845A,#0fa870)" }}
          >
            N
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image src="/nexhr-logo.png" alt="NexHR" fill className="object-contain" priority />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#172B24] truncate">NexHR</p>
              <p className="text-[10px] text-[#64748B] truncate">{companyName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
        {navGroups.map((group, gi) => {
          const isGroupCollapsed = group.label ? collapsedGroups[group.label] : false;
          return (
            <div key={gi} className="mb-0.5">
              {group.label && !collapsed && (
                <button
                  onClick={() => toggleGroup(group.label!)}
                  className="w-full flex items-center justify-between px-4 pt-4 pb-1.5 group"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {group.label}
                  </span>
                  {isGroupCollapsed
                    ? <ChevronDown size={10} className="text-[#94A3B8]" />
                    : <ChevronUp size={10} className="text-[#94A3B8]" />
                  }
                </button>
              )}
              {group.label && collapsed && <div className="h-2" />}

              {!isGroupCollapsed && group.items.map((item: any) => {
                const active = pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.soon ? "#" : item.href}
                    title={collapsed ? item.label : undefined}
                    className="flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100 group relative mb-0.5"
                    style={active
                      ? { background: "#E3F6EB", color: "#07845A" }
                      : { color: "#475569" }
                    }
                    onClick={item.soon ? (e) => e.preventDefault() : undefined}
                  >
                    <item.icon
                      size={16}
                      className="flex-shrink-0 transition-colors"
                      style={{ color: active ? "#07845A" : "#94A3B8" }}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate" style={{ color: active ? "#07845A" : "#475569" }}>
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.soon && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#F1F5F9", color: "#94A3B8" }}>
                        Soon
                      </span>
                    )}
                    {active && !collapsed && (
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#07845A" }} />
                    )}
                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg"
                        style={{ background: "#1E293B", color: "#fff" }}>
                        {item.label}
                        {item.soon && <span className="ml-1.5 text-[9px] opacity-60">(soon)</span>}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid #E2E8F0" }}>
        <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#07845A,#0fa870)" }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#172B24] truncate">{userName || "HR Admin"}</p>
              <p className="text-[10px] text-[#64748B] truncate">{userRole}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors group"
              title="Logout"
            >
              <LogOut size={14} className="text-[#94A3B8] group-hover:text-red-500 transition-colors" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center mt-2 p-1.5 rounded-lg hover:bg-red-50 transition-colors group"
            title="Logout"
          >
            <LogOut size={14} className="text-[#94A3B8] group-hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>
    </aside>
  );
}
