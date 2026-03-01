import React from "react";
import { BlogPost } from "@/lib/types";

interface HeroIllustrationProps {
  post: BlogPost;
}

export function HeroIllustration({ post }: HeroIllustrationProps) {
  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 mb-16 md:mb-24">
      {/* Intro Text */}
      <div className="max-w-4xl mb-12">
        <h1 className="text-4xl md:text-6xl lg:text-[72px] font-display font-medium leading-[1.05] tracking-tight text-[#1a1a1a] mb-6">
            {post.title}
        </h1>
        <p className="text-lg md:text-xl leading-relaxed max-w-2xl text-[#1a1a1a]">
            {post.subtitle}
        </p>
      </div>

      {/* Hero Card */}
      <div className="w-full bg-[#D8D4FE] rounded-[32px] p-8 md:p-16 relative overflow-hidden shadow-sm border border-[#C4C0F0]">
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            {/* Left Content (Decorative Title repetition or keywords) */}
            <div className="flex-1">
                <div className="font-display text-5xl md:text-7xl lg:text-8xl leading-none text-[#1a1a1a]">
                    {post.title.split(' ').slice(0, 3).map((word, i) => (
                        <div key={i}>{word}</div>
                    ))}
                </div>
            </div>

            {/* Right Illustration (Abstract Placeholder) */}
            <div className="flex-1 flex justify-center md:justify-end">
                <div className="w-64 h-64 md:w-80 md:h-80 relative">
                     {/* Abstract Diamond/Coins Illustration placeholder from reference */}
                     <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                        <circle cx="100" cy="100" r="80" fill="#F3EEE6" stroke="black" strokeWidth="2" />
                        <path d="M100 20 L120 60 L180 60 L140 100 L160 160 L100 130 L40 160 L60 100 L20 60 L80 60 Z" fill="#F0FF80" stroke="black" strokeWidth="2" transform="translate(0, -10)" />
                        <text x="100" y="115" textAnchor="middle" fontFamily="serif" fontSize="24" fontWeight="bold">NOK</text>
                     </svg>
                </div>
            </div>
         </div>
         
         {/* Amby Mark */}
         <div className="absolute bottom-6 right-8 font-display text-2xl text-[#1a1a1a]">Amby</div>
      </div>
    </div>
  );
}
