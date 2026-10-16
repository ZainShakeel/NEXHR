"use client";

import { useState } from "react";
import { Search, Bell, HelpCircle, ChevronDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  companyName?: string;
  userName?: string;
  userRole?: string;
  notificationCount?: number;
  action?: { label: string; href?: string; onClick?: () => void; icon?: React.ReactNode };
}

export default function Header({
  title,
  subtitle,
  companyName = "NexHR",
  userName = "HR Admin",
  userRole = "HR Admin",
  notificationCount = 0,
  action,
}: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "HR";

  return (
    <header
      className="flex-shrink-0 h-14 flex items-center gap-4 px-5"
      style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 30 }}
    >
      {/* Search */}
      <div className={`relative flex-1 max-w-80 transition-all`}>
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: searchFocused ? "#07845A" : "#94A3B8" }}
        />
        <input
          type="text"
          placeholder="Search employees, departments…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg transition-all focus:outline-none"
          style={{
            background: "#F8FAFC",
            border: `1px solid ${searchFocused ? "#07845A" : "#E2E8F0"}`,
            color: "#172B24",
          }}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Action button */}
        {action && (
          action.href ? (
            <Link
              href={action.href}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: "#07845A" }}
            >
              {action.icon}
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all hover:opacity-90"
              style={{ background: "#07845A" }}
            >
              {action.icon}
              {action.label}
            </button>
          )
        )}

        {/* Help */}
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#F1F5F9]"
          title="Help & Support"
        >
          <HelpCircle size={16} className="text-[#94A3B8]" />
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#F1F5F9] relative"
        >
          <Bell size={16} className="text-[#94A3B8]" />
          {notificationCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
              style={{ background: "#EF4444" }}
            >
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-6" style={{ background: "#E2E8F0" }} />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors hover:bg-[#F8FAFC]"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: "linear-gradient(135deg,#07845A,#0fa870)" }}
            >
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-[#172B24] leading-tight">{userName}</p>
              <p className="text-[10px] text-[#64748B]">{userRole}</p>
            </div>
            <ChevronDown size={13} className="text-[#94A3B8]" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-lg z-50 py-1"
                style={{ background: "#fff", border: "1px solid #E2E8F0" }}
              >
                <div className="px-3 py-2.5 border-b" style={{ borderColor: "#F1F5F9" }}>
                  <p className="text-xs font-semibold text-[#172B24]">{userName}</p>
                  <p className="text-[10px] text-[#64748B]">{companyName} · {userRole}</p>
                </div>
                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-xs text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                  onClick={() => setProfileOpen(false)}>
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
