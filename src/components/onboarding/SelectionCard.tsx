"use client";

import { Check } from "lucide-react";

interface SelectionCardProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function SelectionCard({ label, selected, onToggle }: SelectionCardProps) {
  const isOngoing = label.includes("Ongoing");
  
  // Logic based on user request:
  // Option Buttons (Default): #c4eab2
  // "Ongoing" Color: #c7c7ff 
  // Selected state: Slightly stronger version of base? 
  // Actually prompts said: "The selected state should be slightly stronger... but still based on #c4eab2".
  // Let's interpret: 
  //   Default: #c4eab2
  //   Selected: #b0e09e (slightly darker green) OR keep same and just add border? User said "stronger".
  //   Ongoing Default: #c7c7ff
  //   Ongoing Selected: #a3a3ff (slightly darker purple)
  
  const baseBg = isOngoing ? "bg-[#c7c7ff]" : "bg-[#c4eab2]";
  const selectedBg = isOngoing ? "bg-[#b3b3fa]" : "bg-[#b0e09e]"; // Slightly darker for selection
  const hoverBg = isOngoing ? "hover:bg-[#d4d4ff]" : "hover:bg-[#d4f0c4]";

  return (
    <button
      onClick={onToggle}
      className={`
        relative w-[490px] h-[50px] text-left rounded-[16px] pl-6
        transition-all duration-200 group flex items-center
        ${selected ? `${selectedBg} border-black/10` : `${baseBg} border-transparent ${hoverBg}`}
      `}
      style={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="flex-1 flex items-center justify-between w-full pr-4">
        <span className="font-figtree font-semibold text-black text-[14px]">
          {label}
        </span>

        {/* Selection Indicator */}
        {selected && (
          <div className="flex-shrink-0 ml-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isOngoing ? "bg-[#5a5aff]" : "bg-[#408954]"
            }`}>
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
