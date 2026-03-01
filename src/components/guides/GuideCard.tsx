import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GuideItem } from "@/lib/types";

interface GuideCardProps {
  guide: GuideItem;
}

export function GuideCard({ guide }: GuideCardProps) {
  const themeStyles: Record<string, string> = {
    lavender: "bg-[#D8D4FE]", // Unsplash/Amby lavender
    green: "bg-[#CCEFD8]",    // Pastel mint green
    cream: "bg-[#FFFBF2]",    // Warm cream
    blue: "bg-[#D4E0FF]",     // Pastel blue
  };

  return (
    <Link href={guide.href} className="group block h-full">
      <div className="flex flex-col gap-4 h-full">
        {/* Cover Tile */}
        <div className={cn(
            "relative w-full aspect-[4/5] rounded-[16px] p-6 flex flex-col justify-between transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg",
            themeStyles[guide.theme] || themeStyles.cream
        )}>
            {/* Top: Tag + Title */}
            <div className="flex flex-col gap-4">
                <div className="w-fit border border-[#1a1a1a]/20 px-2 py-[2px] rounded-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]">GUIDE</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-display text-[#1a1a1a] leading-[0.95] tracking-tight">
                    {guide.coverTitle || guide.title}
                </h3>
            </div>

            {/* Bottom: Illustration + Brand */}
            <div className="flex items-end justify-between mt-auto">
                {/* Abstract Illustration (CSS/SVG) */}
                 <div className="w-16 h-16 opacity-80">
                    {/* Dynamic simple SVG based on theme to mimic the "doodles" */}
                    {guide.theme === 'lavender' && (
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-[#FFD700] stroke-black stroke-[3px]">
                             <rect x="10" y="40" width="30" height="50" fill="#FFD700" />
                             <circle cx="60" cy="30" r="15" fill="#FF8C00" />
                             <path d="M50 80 L80 50 L90 70" fill="none" />
                        </svg>
                    )}
                    {guide.theme === 'green' && (
                         <svg viewBox="0 0 100 100" className="w-full h-full fill-[#FF6B6B] stroke-black stroke-[3px]">
                             <circle cx="30" cy="70" r="20" fill="#FF6B6B" />
                             <rect x="50" y="20" width="20" height="60" fill="#4ECDC4" />
                        </svg>
                    )}
                    {guide.theme === 'cream' && (
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-[#6C5CE7] stroke-black stroke-[3px]">
                             <path d="M10 80 Q 50 10 90 80" fill="none" />
                             <circle cx="50" cy="40" r="15" fill="#6C5CE7" />
                        </svg>
                    )}
                    {guide.theme === 'blue' && (
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-[#FD79A8] stroke-black stroke-[3px]">
                             <rect x="20" y="20" width="40" height="40" transform="rotate(45 40 40)" fill="#FD79A8" />
                             <circle cx="70" cy="70" r="10" fill="#00B894" />
                        </svg>
                    )}
                 </div>

                <span className="font-display text-sm text-[#1a1a1a] font-medium">Amby</span>
            </div>
        </div>

        {/* Bottom Content */}
        <div className="flex flex-col gap-1 px-1">
             <h4 className="text-lg font-bold text-[#1a1a1a] leading-tight group-hover:text-gray-600 transition-colors">
                {guide.title}
            </h4>
            <span className="text-sm font-medium text-[#1a1a1a] underline decoration-1 decoration-[#1a1a1a]/30 underline-offset-4 group-hover:decoration-[#1a1a1a] transition-all">
                Get the guide
            </span>
        </div>
      </div>
    </Link>
  );
}
