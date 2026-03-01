"use client";

import Link from "next/link";
import Image from "next/image";
import { psychologists } from "@/lib/data";
import { Star, MapPin } from "lucide-react";

// Professional psychologist images from Unsplash
const psychologistImages = [
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=1200&fit=crop", // Professional male doctor
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&h=1200&fit=crop", // Professional female doctor
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&h=1200&fit=crop", // Professional male therapist
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=1200&fit=crop", // Professional female therapist
];

export default function FeaturedPsychologists() {
  return (
    <section className="bg-background pt-8 pb-8 md:pt-12 md:pb-12">
      <div className="mx-auto max-w-7xl border-t border-border px-6">
        <span className="text-caption -ml-6 -mt-3.5 block w-max bg-background px-6">
          Our Therapists
        </span>

        <div className="mt-12 gap-4 sm:grid sm:grid-cols-2 md:mt-24">
          <div className="sm:w-2/5">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Meet our licensed psychologists
            </h2>
          </div>
          <div className="mt-6 sm:mt-0">
            <p className="text-muted-foreground">
              Each therapist offers warm, evidence-based care. Find someone who
              understands your needs and helps you feel better over time.
            </p>
          </div>
        </div>

        <div className="mt-12 md:mt-24">
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {psychologists.map((psychologist, index) => (
              <Link
                key={psychologist.id}
                href={`/psychologist/${psychologist.id}`}
                className="group overflow-hidden block"
              >
                <Image
                  className="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl"
                  src={psychologistImages[index % psychologistImages.length]}
                  alt={psychologist.name}
                  width={826}
                  height={1239}
                  loading="lazy"
                />
                <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                  <div className="flex justify-between">
                    <h3 className="text-title text-base font-medium transition-all duration-500 group-hover:tracking-wider">
                      {psychologist.name}
                    </h3>
                    <span className="text-xs">_0{index + 1}</span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1">
                    <span className="text-muted-foreground inline-block translate-y-6 text-sm opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {psychologist.specializations[0]}
                    </span>
                    <div className="inline-flex items-center gap-2 translate-y-8 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="flex items-center gap-1">
                        <Star className="text-accent fill-accent" size={14} />
                        <span className="text-sm font-medium">{psychologist.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-primary" />
                        <span className="text-xs text-muted-foreground">{psychologist.location}</span>
                      </div>
                    </div>
                    <span className="text-primary inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100">
                      View profile →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center md:mt-16">
          <Link
            href="/find-psychologists"
            className="group relative rounded-full border border-white/20 hover:brightness-110 active:scale-95 transition-all duration-300"
            style={{
                width: 'fit-content',
                height: '53px',
                background: 'rgba(190, 200, 185, 0.35)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'inline-flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingLeft: '24px',
                paddingRight: '4.5px',
                gap: '16px',
            }}
          >
             <span 
                className="text-black/95" 
                style={{ 
                    fontFamily: '"Helvetica Now", Helvetica, Arial, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    whiteSpace: 'nowrap'
                }}
            >
              Browse all therapists
            </span>
            <div 
                className="flex items-center justify-center rounded-full bg-[#d9e7c8] text-black transition-transform duration-300 group-hover:scale-105"
                style={{
                  width: '44px',
                  height: '44px',
                  flexShrink: 0
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#0b0f0c" }}>
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
