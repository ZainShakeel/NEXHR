"use client";

import { useState } from "react";
import {
  Bell, Calendar, UserPlus, DollarSign, AlertTriangle,
  FileText, CheckCircle2, Clock, ChevronRight,
} from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string; type: string; title: string; body: string;
  time: string; read: boolean; href?: string; icon: any; color: string; bg: string;
};

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1", type: "leave", title: "New Leave Request",
    body: "Sara Khan has requested Annual Leave for Oct 15–17.",
    time: "2 hours ago", read: false, href: "/leave",
    icon: Calendar, color: "#F59E0B", bg: "#FEF3C7",
  },
  {
    id: "2", type: "employee", title: "New Employee Added",
    body: "Ahmed Ali joined the Sales department as Sales Manager.",
    time: "Yesterday", read: false, href: "/employees",
    icon: UserPlus, color: "#07845A", bg: "#E3F6EB",
  },
  {
    id: "3", type: "payroll", title: "Payroll Ready for Review",
    body: "October 2025 payroll has been generated and is awaiting approval.",
    time: "2 days ago", read: true, href: "/payroll",
    icon: DollarSign, color: "#3B82F6", bg: "#DBEAFE",
  },
  {
    id: "4", type: "leave", title: "Leave Approved",
    body: "Usman Tariq's Sick Leave request (Oct 10–11) has been approved.",
    time: "3 days ago", read: true, href: "/leave",
    icon: CheckCircle2, color: "#07845A", bg: "#E3F6EB",
  },
  {
    id: "5", type: "alert", title: "Attendance Irregularity",
    body: "3 employees have not checked in today. Review attendance now.",
    time: "Today, 10:15 AM", read: false, href: "/attendance",
    icon: AlertTriangle, color: "#EF4444", bg: "#FEE2E2",
  },
  {
    id: "6", type: "document", title: "Document Expiry Reminder",
    body: "Fatima Noor's employment contract expires on November 30, 2025.",
    time: "4 days ago", read: true,
    icon: FileText, color: "#F97316", bg: "#FFEDD5",
  },
  {
    id: "7", type: "leave", title: "Leave Request Rejected",
    body: "Ali Raza's Casual Leave request has been rejected.",
    time: "5 days ago", read: true, href: "/leave",
    icon: Clock, color: "#EF4444", bg: "#FEE2E2",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="p-6 space-y-5" style={{ background: "#F5F8F6", minHeight: "100%" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B24]">Notifications</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-sm font-medium transition-colors"
            style={{ color: "#07845A" }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([["all", "All"], ["unread", "Unread"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={filter === key
              ? { background: "#07845A", color: "#fff" }
              : { background: "#fff", color: "#475569", border: "1px solid #E2E8F0" }}>
            {label}
            {key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: filter === "unread" ? "rgba(255,255,255,0.25)" : "#EF4444", color: "#fff" }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={32} className="text-[#CBD5E1] mb-3" />
            <p className="text-sm font-semibold text-[#475569]">You&apos;re all caught up!</p>
            <p className="text-xs text-[#94A3B8] mt-1">No unread notifications</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
            {filtered.map(n => {
              const Icon = n.icon;
              const Wrapper = n.href ? Link : "div" as any;
              return (
                <Wrapper
                  key={n.id}
                  href={n.href ?? "#"}
                  onClick={() => markRead(n.id)}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                  style={!n.read ? { background: "#FAFFF9" } : {}}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: n.bg }}>
                    <Icon size={18} style={{ color: n.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#172B24]">{n.title}</p>
                      <span className="text-[10px] text-[#94A3B8] flex-shrink-0">{n.time}</span>
                    </div>
                    <p className="text-sm text-[#64748B] mt-0.5">{n.body}</p>
                  </div>

                  {/* Indicators */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full" style={{ background: "#07845A" }} />
                    )}
                    {n.href && <ChevronRight size={14} style={{ color: "#CBD5E1" }} />}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-[#94A3B8] text-center">
        Notification system is in preview. Real-time notifications will be available in a future update.
      </p>
    </div>
  );
}
