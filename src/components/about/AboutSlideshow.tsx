"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    step: "STEP 1",
    title: "Feel understood,\nnot judged",
    image: "/images/about-slides/slide-1.jpg",
  },
  {
    id: 2,
    step: "STEP 2",
    title: "Build coping skills\nthat work",
    image: "/images/about-slides/slide-2.jpg",
  },
  {
    id: 3,
    step: "STEP 3",
    title: "Talk to a licensed\ntherapist",
    image: "/images/about-slides/slide-3.jpg",
  },
  {
    id: 4,
    step: "STEP 4",
    title: "Create a plan you\ncan follow",
    image: "/images/about-slides/slide-4.jpg",
  },
];

export function AboutSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleManualSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div 
      className="relative w-full max-w-[1343px] mx-auto rounded-[24px] overflow-hidden h-[611px] group isolate"
    >
      {/* Inline styles for the keyframes to keep it self-contained and performant */}
      <style jsx>{`
        @keyframes progress-fill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Image */}
          <Image
            src={slide.image}
            alt={slide.title.replace("\n", " ")}
            fill
            className="object-cover"
            priority={index === 0}
          />
          
          {/* Overlays */}
          <div 
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0) 70%)' }}
          />
          <div 
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }}
          />

          {/* Text Content */}
          <div className="absolute bottom-[60px] left-[48px] text-white">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-white/90">
              {slide.step}
            </p>
            <h2 className="text-4xl md:text-[52px] font-sans font-medium leading-[1.1] whitespace-pre-line text-white shadow-sm">
              {slide.title}
            </h2>
            {/* Spacer for bars */}
            <div className="h-10" /> 
          </div>
        </div>
      ))}

      {/* Progress Bars (Fixed on top, pointer-events-auto for clicking) */}
      <div className="absolute bottom-[48px] left-[48px] flex gap-3 z-40">
        {slides.map((_, index) => {
           const isActive = index === currentSlide;
           return (
            <button
                key={index}
                onClick={() => handleManualSlide(index)}
                className="relative h-1 overflow-hidden transition-all duration-300 cursor-pointer group/bar"
                style={{ 
                    width: '64px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.22)' // Track color
                }}
                aria-label={`Go to slide ${index + 1}`}
            >
                {/* Active Fill with Animation */}
                {isActive && (
                    <div
                        className="absolute inset-0 bg-[#F4A340] h-full w-full origin-left"
                        style={{
                            animationName: 'progress-fill',
                            animationDuration: '7000ms',
                            animationTimingFunction: 'linear',
                            animationFillMode: 'forwards'
                        }}
                        onAnimationEnd={handleNext}
                    />
                )}
            </button>
           );
        })}
      </div>
    </div>
  );
}
