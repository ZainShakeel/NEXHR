"use client";

import { useSession } from "next-auth/react";

export function useCompany() {
  const { data: session, status } = useSession();
  const companyId   = (session?.user as any)?.companyId ?? "";
  const companyName = (session?.user as any)?.companyName ?? "";
  const role        = (session?.user as any)?.role ?? "";
  const employeeId  = (session?.user as any)?.employeeId ?? "";
  const userName    = session?.user?.name ?? "";
  return { companyId, companyName, role, employeeId, userName, status };
}
