"use client";

import { useState } from "react";
import { Target, BarChart2, Clock } from "lucide-react";

type Tab = "evaluations" | "goals";

export default function EmployeeAssessmentPage() {
  const [tab, setTab] = useState<Tab>("evaluations");

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9F8] p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#17211C]">Performance & Assessment</h1>
        <p className="text-sm text-[#4A5E55]">Track your goals and evaluations</p>
      </div>

      <div className="flex gap-1 mb-5 bg-[#E5EAE7] p-1 rounded-xl w-fit">
        {(["evaluations", "goals"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${tab === t ? "bg-white text-[#17211C] shadow-sm" : "text-[#4A5E55]"}`}>
            {t === "evaluations" ? "Evaluations" : "My Goals"}
          </button>
        ))}
      </div>

      {tab === "evaluations" && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-10 flex flex-col items-center text-center shadow-sm">
          <div className="w-12 h-12 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mb-4">
            <BarChart2 size={22} className="text-[#16A34A]" />
          </div>
          <h2 className="text-sm font-bold text-[#17211C] mb-1">No Evaluations Yet</h2>
          <p className="text-xs text-[#8AA398] max-w-xs">Performance evaluations will appear here once your manager completes a review cycle. Check back later.</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#8AA398]">
            <Clock size={12} /> Performance module coming soon
          </div>
        </div>
      )}

      {tab === "goals" && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-10 flex flex-col items-center text-center shadow-sm">
          <div className="w-12 h-12 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mb-4">
            <Target size={22} className="text-[#16A34A]" />
          </div>
          <h2 className="text-sm font-bold text-[#17211C] mb-1">No Goals Assigned</h2>
          <p className="text-xs text-[#8AA398] max-w-xs">Your manager will assign goals and KPIs here. Once set, you&apos;ll be able to track your progress against each target.</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#8AA398]">
            <Clock size={12} /> Goals module coming soon
          </div>
        </div>
      )}
    </div>
  );
}
