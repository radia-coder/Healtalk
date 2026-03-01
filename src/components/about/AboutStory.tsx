import React from "react";

export default function AboutStory() {
  return (
    <section className="bg-[#fff7f2] w-full py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* 1. Top Centered Text Block */}
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <p className="font-heading text-lg md:text-2xl font-medium text-foreground leading-relaxed">
          We started out back in 2012, as a team of two in Oslo. Our mission was
          simple, connect the best talent with companies that are pushing their
          industries forward.
        </p>
      </div>

      {/* 2. Video Card */}
      <div className="w-full max-w-[1200px] aspect-[16/9] md:aspect-[21/9] relative rounded-[2.5rem] overflow-hidden shadow-xl bg-gray-900 group">
        <video
          className="w-full h-full object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/video-poster-placeholder.jpg" // Optional placeholder
        >
          {/* Replace with actual video source when available */}
          {/* <source src="/videos/about-story.mp4" type="video/mp4" /> */}
        </video>

        {/* Video Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <h2 className="font-logo text-5xl md:text-7xl lg:text-8xl text-white drop-shadow-md">
            HealTalk
          </h2>
        </div>
        
        {/* Placeholder overlay for dev visibility if video fails/missing */}
        <div className="absolute inset-0 bg-black/20 z-0" />
      </div>
    </section>
  );
}
