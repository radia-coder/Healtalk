import React from "react";

export function PodcastsHero() {
  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 pt-32 pb-16 md:pt-48 md:pb-24 text-center">
      <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-medium text-[#1a1a1a] leading-[0.9] tracking-tight mb-6">
        Mind & Wellbeing
      </h1>
      <p className="text-base md:text-lg text-[#1a1a1a] font-sans max-w-lg mx-auto leading-relaxed">
        Talks and podcasts from the world's most trusted<br className="hidden md:block"/>
        psychologists and researchers — in plain language.
      </p>
    </div>
  );
}
