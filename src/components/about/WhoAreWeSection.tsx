"use client";

import React from "react";
import { cn } from "@/lib/utils";

const StatCard = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
  delay?: number; // Kept for compatibility but unused
}) => {
  return (
    <div
      className={cn(
        "rounded-[32px] p-8 flex flex-col justify-between hover:shadow-sm",
        className
      )}
    >
      <span className="font-heading text-sm font-medium text-[#111827]/60">
        {label}
      </span>
      <span className="font-logo text-[48px] md:text-[64px] leading-none text-[#131E0D] mt-auto pt-4">
        {value}
      </span>
    </div>
  );
};

const MosaicGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full lg:h-[418px] lg:grid-rows-2">
      {/* Row 1: Founding Year - Full Width */}
      <StatCard
        label="Sessions supported"
        value="18k+"
        className="md:col-span-2 lg:row-span-1 bg-[#ced4fc] min-h-[200px] lg:min-h-0 h-full" // Pastel Periwinkle
      />

      {/* Row 2: Employees & Happiness */}
      <StatCard
        label="Licensed psychologists"
        value="120+"
        className="bg-[#ffe1f9] min-h-[200px] lg:min-h-0 h-full" // Pastel Pink
      />
      <StatCard
        label="Client satisfaction"
        value="4.8/5"
        className="bg-[#d4f2c4] min-h-[200px] lg:min-h-0 h-full" // Pastel Green
      />
    </div>
  );
};

const IllustrationCard = () => {
  return (
    <div
      className="w-full h-full min-h-[418px] lg:h-[418px] bg-[#e8e6ff] rounded-[32px] flex items-center justify-center relative overflow-hidden group"
    >
       {/* Abstract Character Illustration Container - Scaled to fit */}
       <div className="relative w-[300px] h-[400px] scale-90 lg:scale-[0.85] origin-center">
          {/* Planet/Halo */}
          <div 
             className="absolute top-[20px] left-[50%] -translate-x-1/2 w-[120px] h-[120px] z-10"
          >
             {/* Ring */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[40px] border-[3px] border-[#131E0D] rounded-[50%] rotate-[-15deg]" />
             {/* Planet Body */}
             <div className="w-full h-full bg-[#ced4fc] rounded-full border-[3px] border-[#131E0D]" />
          </div>

          {/* Star */}
          <svg
             viewBox="0 0 24 24"
             className="absolute top-[60px] left-[40px] w-12 h-12 text-[#effc5f] z-20 drop-shadow-[0_2px_0_rgba(0,0,0,1)]"
             fill="currentColor"
             stroke="#131E0D"
             strokeWidth="2"
          >
             <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>

          {/* Abstract Hand/Body Shape */}
          <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-[220px] h-[300px]">
              {/* Main "J" or Hand Shape */}
              <svg viewBox="0 0 200 300" className="w-full h-full overflow-visible">
                 <path 
                   d="M60 50 C 60 20, 140 20, 140 50 L 140 200 C 140 250, 60 250, 60 200 L 60 150 C 60 120, 20 120, 20 150 L 20 200 C 20 280, 180 280, 180 200 L 180 50 C 180 -10, 20 -10, 20 50" 
                   fill="#FFFBF8" 
                   stroke="#131E0D" 
                   strokeWidth="3"
                   className="drop-shadow-lg"
                 />
                 {/* Decorative elements */}
                 <circle cx="160" cy="80" r="10" fill="#FC7D45" stroke="#131E0D" strokeWidth="2" />
                 <path d="M50 240 L150 240" stroke="#131E0D" strokeWidth="3" strokeLinecap="round" className="opacity-20" />
              </svg>
          </div>

          {/* Dot */}
          <div className="absolute top-10 right-10 w-4 h-4 bg-[#131E0D] rounded-full" />
       </div>
    </div>
  );
};

export default function WhoAreWeSection() {
  return (
    <section className="py-[48px] px-10">
      <div className="max-w-[1470px] mx-auto">
        {/* Title */}
        <div className="text-center mb-[48px]">
          <h2 className="font-logo text-[64px] md:text-[80px] leading-tight tracking-[-0.02em] text-[#131E0D]">
            So who are we?
          </h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Illustration */}
          <div className="w-full h-full lg:h-[418px]">
            <IllustrationCard />
          </div>

          {/* Right Column: Stats Mosaic */}
          <div className="w-full mt-6 lg:mt-0 lg:h-[418px] flex flex-col justify-between">
            <MosaicGrid />
          </div>
        </div>
      </div>
    </section>
  );
}
