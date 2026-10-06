"use client";

import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F9F8] flex">
      <SuperAdminSidebar />
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
