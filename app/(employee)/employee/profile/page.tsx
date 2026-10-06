"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, User, Mail, Phone, Building2, Calendar, DollarSign, BadgeCheck, Clock } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";

type Profile = {
  id: string; employeeId: string; firstName: string; lastName: string;
  designation: string; employmentType: string; status: string;
  joiningDate: string; basicSalary: number; gender: string;
  cnic?: string; phone?: string; dateOfBirth?: string;
  department?: { name: string };
  shift?: { name: string; startTime: string; endTime: string };
  user: { email: string; role: string };
};

export default function EmployeeProfilePage() {
  const { companyId, employeeId, status: authStatus } = useCompany();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!companyId || !employeeId) return;
    fetch(`/api/employees/${employeeId}?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => { setProfile(d?.id ? d : null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyId, employeeId]);

  useEffect(() => { load(); }, [load]);

  if (authStatus === "loading" || loading) {
    return <div className="flex-1 flex items-center justify-center bg-[#F7F9F8]"><Loader2 size={24} className="animate-spin text-[#16A34A]" /></div>;
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F7F9F8] text-[#8AA398]">
        <User size={28} className="mb-3" />
        <p className="text-sm">Profile not found. Contact HR.</p>
      </div>
    );
  }

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;

  const details = [
    { icon: Mail, label: "Email", value: profile.user.email },
    { icon: Phone, label: "Phone", value: profile.phone ?? "Not set" },
    { icon: BadgeCheck, label: "CNIC", value: profile.cnic ?? "Not set" },
    { icon: User, label: "Gender", value: profile.gender },
    { icon: Calendar, label: "Date of Birth", value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" }) : "Not set" },
    { icon: Building2, label: "Department", value: profile.department?.name ?? "—" },
    { icon: Calendar, label: "Joining Date", value: new Date(profile.joiningDate).toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" }) },
    { icon: DollarSign, label: "Basic Salary", value: `PKR ${Number(profile.basicSalary).toLocaleString()}` },
    { icon: Clock, label: "Shift", value: profile.shift ? `${profile.shift.name} (${profile.shift.startTime}–${profile.shift.endTime})` : "Not assigned" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9F8] p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#17211C]">My Profile</h1>
        <p className="text-sm text-[#4A5E55]">Your personal and employment details</p>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#064E3B] text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#17211C]">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-[#4A5E55]">{profile.designation}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8AA398]">
              <span className="font-mono">{profile.employeeId}</span>
              <span>·</span>
              <span>{profile.employmentType.replace("_", " ")}</span>
              <span>·</span>
              <span className={`font-bold ${profile.status === "ACTIVE" ? "text-green-700" : "text-red-600"}`}>{profile.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#17211C] mb-4">Profile Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#F7F9F8] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-[#4A5E55]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8AA398]">{label}</p>
                  <p className="text-xs font-semibold text-[#17211C]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5EAE7] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8AA398]">Account Role</span>
            <span className="text-xs font-bold text-[#17211C]">{profile.user.role.replace("_", " ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
