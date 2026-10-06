"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useCompany } from "@/hooks/useCompany";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { companyName, userName, role } = useCompany();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        companyName={companyName || "NexHR"}
        userRole={role === "COMPANY_OWNER" ? "HR Admin" : role || "HR Admin"}
        userName={userName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
