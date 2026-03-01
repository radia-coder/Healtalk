"use client";

import { ChevronDown } from "lucide-react";

export function PatientActivityChart() {
  return (
    <div className="bg-white rounded-[16px] border border-[#E6EAF2] p-6 shadow-[0_8px_24px_rgba(17,24,39,0.02)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-gray-900 text-lg">My Activity</h3>
        <button className="flex items-center gap-2 text-sm text-gray-500 border border-[#E6EAF2] rounded-lg px-3 py-1.5 hover:bg-gray-50">
           This Week
           <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
        <div className="text-sm text-gray-500">No activity data yet.</div>
      </div>
    </div>
  );
}
