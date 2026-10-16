"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useCompany } from "@/hooks/useCompany";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { companyName, userName, role } = useCompany();

  const roleLabel =
    role === "COMPANY_OWNER" ? "Company Owner" :
    role === "HR_ADMIN" ? "HR Admin" :
    role === "MANAGER" ? "Manager" :
    "HR User";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F5F8F6" }}>
      <Sidebar
        companyName={companyName || "NexHR"}
        userRole={roleLabel}
        userName={userName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          companyName={companyName || "NexHR"}
          userName={userName}
          userRole={roleLabel}
          notificationCount={0}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
