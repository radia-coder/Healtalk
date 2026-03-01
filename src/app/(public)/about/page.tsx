"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import WhoAreWeSection from "@/components/about/WhoAreWeSection";
import CoreValuesSection from "@/components/about/CoreValuesSection";
import { AboutSlideshow } from "@/components/about/AboutSlideshow";

const leaders = [
  {
    id: 1,
    name: "Mr. Musab Mohamed",
    role: "CEO / Partner",
    image: "/images/Me.png",
    socialUrl: "https://www.instagram.com/maahir.03?igsh=anY3cXUzanhwNTNj&utm_source=qr",
    socialLabel: "Instagram"
  },
  {
    id: 2,
    name: "Mss. Ugbad Bashir Barre",
    role: "Client Director",
    image: "/images/Mustaf.png",
    socialUrl: "https://instagram.com",
    socialLabel: "Instagram"
  },
  {
    id: 3,
    name: "Mss. Radia Ahmed Abdirahman",
    role: "Head of Care Operations",
    image: "/images/Ciro.png",
    socialUrl: "https://instagram.com",
    socialLabel: "Instagram"
  },
  {
    id: 4,
    name: "Mss. Sabirin Ali Isack",
    role: "Director of Operations",
    image: "/images/Koonfur.png",
    socialUrl: "https://instagram.com",
    socialLabel: "Instagram"
  },
  {
    id: 5,
    name: "Mr. Abdulkadir Mohamed Abdi",
    role: "Head of People",
    image: "/images/Koonfur.png",
    socialUrl: "https://instagram.com",
    socialLabel: "Instagram"
  },
  /*
  {
    id: 6,
    name: "Michael Chen",
    role: "Head of Product",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80",
    socialUrl: "https://linkedin.com",
    socialLabel: "LinkedIn"
  }
  */
];

export default function AboutPage() {
  const [activeLeader, setActiveLeader] = useState<number | null>(null);

  const toggleLeader = (id: number) => {
    setActiveLeader(activeLeader === id ? null : id);
  };

  return (
    <div className="min-h-screen font-sans">
      {/* SECTION 1: HERO */}
      <section className="pt-[160px] pb-[32px] px-10">
        <div className="max-w-[1470px] mx-auto">
          {/* HEADLINE */}
          <div className="max-w-[960px] mx-auto text-center mb-[48px]">
            <h1 className="font-logo text-[96px] leading-[1.1] tracking-[-0.04em] text-[#111827]">
              About HealTalk, for{" "}
              <span className="relative inline-block">
                real
                <svg
                  viewBox="0 0 358 28"
                  fill="none"
                  className="absolute left-0 bottom-[-10px] w-full h-[28px] text-[#2f6f6d]"
                >
                  <path
                    d="M2.20312 23.375C68.9036 12.8711 157.078 -4.72266 355.203 7.875"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              people.
            </h1>
          </div>

          {/* HERO IMAGE */}
          {/* HERO SLIDESHOW */}
          <div className="mb-[48px]">
             <AboutSlideshow />
          </div>

        </div>
      </section>

      {/* SECTION 2: STORY & VIDEO */}
      <section className="py-[48px] px-10">
        <div className="max-w-[1470px] mx-auto">
           {/* STORY TEXT */}
           <div className="max-w-[960px] mx-auto text-center mb-[48px]">
             <p className="font-heading font-bold text-[32px] leading-[1.15] tracking-[-1.28px] text-[#111827]">
               HealTalk started with one simple goal: make therapy easy to access, safe to use, and kind at every step. Choose a therapist, book a time, and meet by secure video. We protect your privacy in every session.
             </p>
           </div>

           {/* VIDEO CARD */}
           <div className="w-full max-w-[1220px] mx-auto h-[400px] lg:h-[681px] rounded-[24px] overflow-hidden relative shadow-sm border border-black/5">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80"
              >
                <source src="https://media.istockphoto.com/id/1324734893/video/diverse-business-people-having-meeting-in-board-room.mp4?s=mp4-640x640-is&k=20&c=vWj_5XqVzgLgZ7Z9zX8Z9zX8Z9zX8Z9zX8Z9zX8Z9zX8" type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="font-logo text-[80px] md:text-[120px] text-white tracking-tighter opacity-80">HealTalk</span>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 3: LEADERS (Refined Pixel-Perfect) */}
      <section className="py-[48px] px-10">
        <div className="max-w-[1470px] mx-auto">
          {/* SECTION HEADER */}
          <div className="mb-[48px] text-center">
             <h2 className="font-logo text-[48px] leading-[1.1] tracking-[-1.92px] text-[#111827]">
               Meet our clinical leaders.
             </h2>
          </div>

          {/* LEADERS GRID - Enforcing fixed dimensions on desktop */}
          <div className="flex flex-wrap justify-center gap-6">
             {leaders.map((leader) => {
               const isActive = activeLeader === leader.id;
               return (
                 <div
                    key={leader.id}
                    onClick={() => toggleLeader(leader.id)}
                    onMouseEnter={() => setActiveLeader(leader.id)}
                    onMouseLeave={() => setActiveLeader(null)}
                    onFocus={() => setActiveLeader(leader.id)}
                    onBlur={() => setActiveLeader(null)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isActive}
                    // Card Outer Styling:
                    // - w-[430px] h-[668px]: Exact requested dimensions on desktop
                    // - rounded-[24px]: Matches target large radius
                    // - bg-[#effc5f]: Yellow highlight background
                    // - shadow-sm: Subtle shadow
                    className={cn(
                        "relative w-full md:w-[430px] h-[600px] md:h-[668px] rounded-[24px] overflow-hidden cursor-pointer group transition-all duration-300 outline-none isolate shrink-0",
                        "bg-[#f0f0f0] border border-black/5 shadow-sm", // Default neutral background
                        isActive && "bg-[#effc5f] border-[#effc5f]" // Active yellow background
                    )}
                  >
                    {/* IMAGE */}
                    <div className="absolute inset-0 w-full h-full z-0">
                      <Image
                        src={leader.image}
                        alt={leader.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 430px"
                        className={cn(
                          "object-cover transition-all duration-500",
                          // Grayscale by default, smooth transition to color
                          isActive ? "grayscale-0 scale-105" : "grayscale contrast-[0.95]"
                        )}
                      />
                    </div>

                    {/* INSET PANEL */}
                    <div 
                      className={cn(
                        "absolute left-4 right-4 z-10 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col overflow-hidden",
                        // Styling: rounded-xl, shadow, inset positioning
                        "bottom-4 rounded-xl shadow-md",
                        // Colors:
                        isActive ? "bg-[#c7c5fc]" : "bg-[#f2f0e9]" // Lavender vs Cream
                      )}
                      style={{
                          height: isActive ? "140px" : "64px" // Explicit height transition for smoothness
                      }}
                    >
                      {/* Name - Fixed at top */}
                      <div className="px-6 pt-5 pb-2 shrink-0">
                        <h3 className="font-heading font-bold text-[20px] text-[#111827] leading-tight">
                            {leader.name}
                        </h3>
                      </div>
                      
                      {/* Expanded Content (Role & LinkedIn) - Pushed to bottom */}
                      <div 
                        className={cn(
                          "px-6 pb-6 mt-auto transition-all duration-300 delay-75 origin-bottom",
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        )}
                      >
                         <p className="font-heading text-[#4b5563] text-sm mb-3">
                             {leader.role}
                         </p>
                         <a 
                           href={leader.socialUrl}
                           className="inline-block border-b border-black text-xs font-bold uppercase tracking-wide hover:border-transparent transition-colors text-[#111827]"
                           onClick={(e) => e.stopPropagation()} 
                         >
                           {leader.socialLabel}
                         </a>
                      </div>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>
      </section>


      {/* SECTION 4: WHO ARE WE? */}
      <WhoAreWeSection />

      {/* SECTION 5: CORE VALUES */}
      <CoreValuesSection />
    </div>
  );
}
