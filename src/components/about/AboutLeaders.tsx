"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data with Unsplash Placeholders
const LEADERS = [
  {
    id: "esben",
    name: "Esben Poulsen",
    role: "COO / Partner",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    linkedin: "https://linkedin.com",
  },
  {
    id: "fredrik",
    name: "Fredrik Nyquist Langmyhr",
    role: "CEO / Partner",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
    linkedin: "https://linkedin.com",
  },
  {
    id: "helle",
    name: "Helle Cecilie Aasen",
    role: "Head of Recruitment",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    linkedin: "https://linkedin.com",
  },
  {
    id: "mark",
    name: "Mark Johnson",
    role: "Senior Partner",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800",
    linkedin: "https://linkedin.com",
  },
  {
    id: "sarah",
    name: "Sarah Williams",
    role: "Director of Talent",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    linkedin: "https://linkedin.com",
  },
  {
    id: "david",
    name: "David Chen",
    role: "Technical Advisor",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    linkedin: "https://linkedin.com",
  },
];

export default function AboutLeaders() {
  const [activeLeaderId, setActiveLeaderId] = useState<string | null>(null);

  const toggleLeader = (id: string) => {
    setActiveLeaderId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-[#fff7f2] w-full py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* 1. Top Centered Text Block */}
      <div className="max-w-xl mx-auto mb-6 text-center">
        <p className="font-heading text-base md:text-lg font-medium text-text-secondary leading-relaxed">
          Today, we’re a team of 70+ full-stack recruiters and talent advisors
          setting a new standard for how ambitious companies find talent.
        </p>
      </div>

      {/* 2. Section Title */}
      <h2 className="font-logo text-4xl md:text-5xl text-foreground text-center mb-16">
        Meet our leaders.
      </h2>

      {/* 3. Leaders Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {LEADERS.map((leader) => {
          const isActive = activeLeaderId === leader.id;

          return (
            <button
              key={leader.id}
              onClick={() => toggleLeader(leader.id)}
              className={cn(
                "group relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden transition-all duration-300 ease-out text-left focus:outline-none focus:ring-4 focus:ring-accent/50",
                isActive 
                  ? "bg-[#d5f567]" 
                  : "bg-transparent hover:bg-[#d5f567]" // Hover highlight
              )}
              aria-pressed={isActive}
            >
              {/* Leader Image */}
              <div className="absolute inset-x-0 top-0 bottom-[10%] overflow-hidden rounded-t-[2rem] rounded-b-[1rem] z-0">
                 <Image 
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className={cn(
                        "object-cover transition-all duration-500",
                        isActive 
                          ? "grayscale-0" 
                          : "grayscale group-hover:grayscale-0" // Hover tint removal
                    )}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                 />
              </div>

              {/* Bottom Panel */}
              <div
                className={cn(
                  "absolute bottom-4 left-4 right-4 rounded-xl transition-all duration-300 flex flex-col justify-end px-4 py-3 z-10",
                  isActive
                    ? "bg-[#c4c4ff] h-[110px]" // Expanded Purple Panel
                    : "bg-[#f5ebe6] h-[60px] group-hover:bg-[#c4c4ff] group-hover:h-[110px]" // Hover expansion
                )}
              >
                {/* Name */}
                <span className="text-foreground font-bold text-lg leading-tight truncate">
                  {leader.name}
                </span>

                {/* Expanded Info (Role + LinkedIn) */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 flex flex-col gap-1",
                    isActive 
                      ? "opacity-100 mt-1 max-h-20" 
                      : "opacity-0 max-h-0 group-hover:opacity-100 group-hover:mt-1 group-hover:max-h-20" // Hover visibility
                  )}
                >
                  <span className="text-xs font-medium text-foreground/80 uppercase tracking-wide">
                    {leader.role}
                  </span>
                  <Link
                    href={leader.linkedin}
                    target="_blank"
                    className="text-foreground underline decoration-1 underline-offset-2 text-sm font-medium hover:text-foreground/80 w-fit pointer-events-auto"
                    onClick={(e) => e.stopPropagation()} // Prevent card click
                  >
                    LinkedIn
                  </Link>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
