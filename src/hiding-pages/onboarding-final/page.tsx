"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { GuideCard } from "@/components/onboarding/GuideCard";
import { GuideDetailModal } from "@/components/onboarding/GuideDetailModal";

// Mock Data based on user request
// Reusing available images cycling through 1-3
const GUIDES = [
  {
    id: 1,
    name: "Naima Bush",
    imageSrc: "/images/portrait-1.png",
    traits: ["🌿 Calm", "🤝 Supportive", "🧠 Practical"]
  },
  {
    id: 2,
    name: "Mary Rush",
    imageSrc: "/images/portrait-2.png",
    traits: ["💛 Warm", "🫶 Empathetic", "🧩 Collaborative"]
  },
  {
    id: 3,
    name: "Alli Hershey",
    imageSrc: "/images/portrait-3.png",
    traits: ["🌟 Encouraging", "🧘 Mindful", "💬 Direct"]
  },
  // Repeating for demo
  {
    id: 4,
    name: "Naima Bush",
    imageSrc: "/images/portrait-1.png",
    traits: ["🌿 Calm", "🤝 Supportive", "🧠 Practical"]
  },
  {
    id: 5,
    name: "Mary Rush",
    imageSrc: "/images/portrait-2.png",
    traits: ["💛 Warm", "🫶 Empathetic", "🧩 Collaborative"]
  },
  {
    id: 6,
    name: "Alli Hershey",
    imageSrc: "/images/portrait-3.png",
    traits: ["🌟 Encouraging", "🧘 Mindful", "💬 Direct"]
  }
];

// ... imports

export default function ChooseGuidePage() {
  const [selectedGuide, setSelectedGuide] = React.useState<typeof GUIDES[0] | null>(null);

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      {/* Header Section */}
      <div className="flex flex-col items-center pt-[64px] pb-[56px] px-4 w-full">
        {/* Logo Icon */}
        <div className="mb-[32px]">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/images/New_Logo.png"
              alt="HealTalk logo"
              width={128}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <h1 className="text-[32px] font-semibold text-[#1A1A1A] text-center mb-2 leading-tight font-sans">
          Choose your therapist
        </h1>
        <p className="text-[16px] font-normal text-[#1A1A1A] text-center font-sans">
          Each one is licensed and supportive.
        </p>
      </div>

      {/* Grid Section */}
      <div className="w-full flex justify-center pb-20 px-6 lg:px-[233px]">
        <div className="grid gap-[15px] justify-center"
             style={{
               gridTemplateColumns: "repeat(3, 320px)",
             }}
        >
             <style jsx>{`
                div.grid {
                    grid-template-columns: repeat(3, 320px);
                }
                @media (max-width: 1050px) {
                    div.grid {
                        grid-template-columns: repeat(2, 320px);
                    }
                }
                @media (max-width: 700px) {
                    div.grid {
                        grid-template-columns: repeat(1, 320px);
                    }
                }
             `}</style>

            {GUIDES.map((guide) => (
                <GuideCard
                    key={guide.id}
                    name={guide.name}
                    traits={guide.traits}
                    imageSrc={guide.imageSrc}
                    onClick={() => setSelectedGuide(guide)}
                />
            ))}
        </div>
      </div>

      {/* Detail Modal */}
      <GuideDetailModal 
        guide={selectedGuide} 
        isOpen={!!selectedGuide} 
        onClose={() => setSelectedGuide(null)}
        onNext={() => {
          if (!selectedGuide) return;
          const currentIndex = GUIDES.findIndex(g => g.id === selectedGuide.id);
          const nextIndex = (currentIndex + 1) % GUIDES.length;
          setSelectedGuide(GUIDES[nextIndex]);
        }}
        onPrev={() => {
          if (!selectedGuide) return;
          const currentIndex = GUIDES.findIndex(g => g.id === selectedGuide.id);
          const prevIndex = (currentIndex - 1 + GUIDES.length) % GUIDES.length;
          setSelectedGuide(GUIDES[prevIndex]);
        }}
      />
    </div>
  );
}
