"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Loader2, UserPlus, Calendar, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

type Notif = {
  id: string; type: "leave_request" | "new_employee" | "payroll" | "attendance";
  title: string; message: string; time: string; read: boolean;
};

const ICONS: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  leave_request: Calendar,
  new_employee: UserPlus,
  payroll: DollarSign,
  attendance: Clock,
};
const COLORS: Record<string, string> = {
  leave_request: "bg-blue-50 text-blue-600",
  new_employee: "bg-purple-50 text-purple-600",
  payroll: "bg-green-50 text-green-600",
  attendance: "bg-amber-50 text-amber-600",
};

export default function NotificationsPage() {
  const { companyId, status: authStatus } = useCompany();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!companyId) return;
    try {
      const [leaveRes, empRes, payRes] = await Promise.all([
        fetch(`/api/leave?companyId=${companyId}`).then((r) => r.json()),
        fetch(`/api/employees?companyId=${companyId}`).then((r) => r.json()),
        fetch(`/api/payroll?companyId=${companyId}`).then((r) => r.json()),
      ]);

      const items: Notif[] = [];

      const leaves = Array.isArray(leaveRes) ? leaveRes : [];
      const pending = leaves.filter((l: any) => l.status === "PENDING");
      if (pending.length > 0) {
        items.push({
          id: "leave-pending",
          type: "leave_request",
          title: "Pending Leave Requests",
          message: `${pending.length} leave request${pending.length > 1 ? "s" : ""} awaiting your approval`,
          time: "Today",
          read: false,
        });
      }

      const employees = Array.isArray(empRes) ? empRes : [];
      const thisMonth = employees.filter((e: any) => {
        const joined = new Date(e.joiningDate);
        const now = new Date();
        return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
      });
      if (thisMonth.length > 0) {
        items.push({
          id: "new-emp",
          type: "new_employee",
          title: "New Employees This Month",
          message: `${thisMonth.length} new employee${thisMonth.length > 1 ? "s" : ""} joined this month`,
          time: "This month",
          read: false,
        });
      }

      const payrolls = Array.isArray(payRes) ? payRes : [];
      const draftPayroll = payrolls.find((p: any) => p.status === "DRAFT");
      if (draftPayroll) {
        const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        items.push({
          id: `payroll-${draftPayroll.id}`,
          type: "payroll",
          title: "Payroll Awaiting Processing",
          message: `${MONTHS[draftPayroll.month]} ${draftPayroll.year} payroll is in DRAFT status`,
          time: "Action required",
          read: false,
        });
      }

      if (items.length === 0) {
        items.push({
          id: "all-good",
          type: "attendance",
          title: "All caught up!",
          message: "No pending actions. Your HR operations are running smoothly.",
          time: "Now",
          read: true,
        });
      }

      setNotifs(items);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const unread = notifs.filter((n) => !n.read).length;

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex flex-col h-full"><Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-[#17211C]">Notifications</h1>
          {unread > 0 && (
            <span className="bg-[#16A34A] text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>
          )}
        </div>

        <div className="space-y-3 max-w-2xl">
          {notifs.map((n) => {
            const Icon = ICONS[n.type];
            const colorCls = COLORS[n.type];
            return (
              <div key={n.id} className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 ${!n.read ? "border-[#16A34A]/30" : "border-[#E5EAE7]"}`}>
                <div className={`w-10 h-10 ${colorCls} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#17211C]">{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-[#4A5E55] mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-[#8AA398] mt-1.5">{n.time}</p>
                </div>
                {n.read && <CheckCircle2 size={15} className="text-[#8AA398] flex-shrink-0 mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
