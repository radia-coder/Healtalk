"use client";

import React from "react";

const cards = [
  {
    title: "Care",
    description:
      "We listen first and lead with empathy in every session.",
    illustration: (
      <svg viewBox="0 0 200 120" className="w-48 h-32">
        {/* Shadow */}
        <ellipse cx="100" cy="110" rx="60" ry="6" fill="#131E0D" />
        {/* Circle 1 */}
        <circle cx="70" cy="60" r="45" fill="#effc5f" stroke="#131E0D" strokeWidth="2.5" />
        {/* Face 1 */}
        <path d="M55 55 L55 65" stroke="#131E0D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M85 55 L85 65" stroke="#131E0D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M60 75 Q70 85 80 75" fill="none" stroke="#131E0D" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Circle 2 (Overlapping) */}
        <circle cx="130" cy="60" r="45" fill="#effc5f" stroke="#131E0D" strokeWidth="2.5" className="mix-blend-multiply" />
        {/* Face 2 */}
        <path d="M115 55 L115 65" stroke="#131E0D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M145 55 L145 65" stroke="#131E0D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M120 75 Q130 85 140 75" fill="none" stroke="#131E0D" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Safety",
    description:
      "Privacy and confidentiality are built into everything we do.",
    illustration: (
      <svg viewBox="0 0 200 120" className="w-48 h-32">
        {/* Shadow */}
        <ellipse cx="100" cy="110" rx="70" ry="6" fill="#131E0D" />
        {/* Bar 1 */}
        <rect x="40" y="60" width="30" height="40" rx="8" fill="#effc5f" stroke="#131E0D" strokeWidth="2.5" />
        {/* Bar 2 */}
        <rect x="80" y="40" width="30" height="60" rx="8" fill="#effc5f" stroke="#131E0D" strokeWidth="2.5" />
        {/* Dashed Bar 3 */}
        <rect x="120" y="20" width="30" height="80" rx="8" fill="none" stroke="#131E0D" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    ),
  },
  {
    title: "Growth",
    description:
      "We support steady progress with simple, real-life steps.",
    illustration: (
      <svg viewBox="0 0 200 120" className="w-48 h-32">
        {/* Shadow */}
        <ellipse cx="120" cy="110" rx="40" ry="6" fill="#131E0D" />
        {/* Speed Lines */}
        <line x1="20" y1="40" x2="80" y2="40" stroke="#131E0D" strokeWidth="2.5" />
        <line x1="40" y1="60" x2="90" y2="60" stroke="#131E0D" strokeWidth="2.5" />
        <line x1="30" y1="80" x2="80" y2="80" stroke="#131E0D" strokeWidth="2.5" />
        {/* Ball */}
        <circle cx="120" cy="60" r="40" fill="#effc5f" stroke="#131E0D" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    title: "Respect",
    description:
      "We honor each person’s story, identity, and goals.",
    illustration: (
      <svg viewBox="0 0 200 120" className="w-48 h-32">
        {/* Shadows */}
        <ellipse cx="60" cy="110" rx="20" ry="6" fill="#131E0D" />
        <ellipse cx="140" cy="110" rx="20" ry="6" fill="#131E0D" />
        {/* Arrow 1 */}
        <path d="M60 30 L90 60 L70 60 L70 90 L50 90 L50 60 L30 60 Z" fill="#effc5f" stroke="#131E0D" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Arrow 2 (Taller) */}
        <path d="M140 10 L170 40 L150 40 L150 90 L130 90 L130 40 L110 40 Z" fill="#effc5f" stroke="#131E0D" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function CoreValuesSection() {
  return (
    <section className="py-[48px] px-10">
      <div className="max-w-[1470px] mx-auto">
        {/* Header */}
        <div className="text-center mb-[48px]">
          <div className="inline-block px-4 py-1 mb-6 border border-[#131E0D]/10 rounded-full bg-[#fdfbf7]">
             <span className="font-heading text-xs font-bold tracking-widest uppercase text-[#131E0D]/70">
               Driven by Principle
             </span>
          </div>
          <h2 className="font-logo text-[48px] md:text-[56px] leading-[1.1] text-[#131E0D] max-w-[900px] mx-auto">
            Our four values guide how we care for people.
          </h2>
        </div>

        {/* Flex Layout for Fixed Cards - Always in a row */}
        <div className="flex flex-nowrap overflow-x-auto pb-8 -mx-10 px-10 md:justify-center gap-6 scrollbar-hide snap-x">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group relative w-[327px] h-[496px] shrink-0 bg-white rounded-[32px] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 focus-within:shadow-md focus-within:-translate-y-1 outline-none border border-[#131E0D]/5 snap-center"
              tabIndex={0}
            >
              {/* Illustration Area (Top) */}
              <div className="absolute top-[60px] left-0 right-0 flex justify-center transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105">
                {card.illustration}
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white">
                 <div className="transform transition-transform duration-300 ease-out group-hover:-translate-y-2 group-focus-visible:-translate-y-2">
                    <h3 className="font-heading font-bold text-[24px] text-[#131E0D] mb-2">
                        {card.title}
                    </h3>
                    {/* Fixed height container for description to prevent layout shift */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] transition-all duration-300 ease-out">
                        <div className="overflow-hidden">
                            <p className="text-[#131E0D]/80 leading-relaxed text-[16px] pt-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 delay-[50ms]">
                                {card.description}
                            </p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
