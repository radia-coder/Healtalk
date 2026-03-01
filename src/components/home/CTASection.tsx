"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative w-full h-[834px] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/CTA.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
        {/* Top Pill */}
        <div className="mb-8 inline-flex items-center justify-center px-5 py-[6px] rounded-full border border-white/40 backdrop-blur-sm">
          <span
            className="text-white uppercase tracking-wider"
            style={{
              fontFamily: '"Helvetica Now", "Helvetica", "Arial", sans-serif',
              fontWeight: 400,
              fontSize: "11px",
              lineHeight: "15px",
            }}
          >
            READY WHEN YOU ARE
          </span>
        </div>

        {/* Headline */}
        <h2
          className="text-white mb-10 text-center"
          style={{
            fontFamily: '"Times New Roman", Times, Baskerville, Georgia, serif',
            fontWeight: 300,
            fontSize: "84px",
            lineHeight: "78px",
            letterSpacing: "-0.02em",
          }}
        >
          <span className="block">Start feeling better.</span>
          <span className="block">We&apos;ll be with you.</span>
        </h2>

        {/* Primary Button */}
        {/* Primary Button */}
        <Link
          href="/find-psychologists"
          className="group relative inline-flex items-center justify-between transition-all duration-300 hover:brightness-110 active:scale-95"
          style={{
            height: "53px",
            borderRadius: "999px",
            background: "rgba(190, 200, 185, 0.35)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
            paddingLeft: "24px",
            paddingRight: "4.5px", // Matches vertical margin: (53-44)/2 = 4.5px
            gap: "16px"
          }}
        >
          <span
            className="text-white/95"
            style={{
              fontFamily: '"Helvetica Now", system-ui, sans-serif',
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "1",
              whiteSpace: "nowrap",
            }}
          >
            Get Connected
          </span>
          <div 
            className="flex items-center justify-center rounded-full bg-[#d9e7c8] text-black"
            style={{
              width: "44px",
              height: "44px",
              flexShrink: 0,
            }}
          >
            {/* Custom Sharp Arrow SVG to match reference exactly */}
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "#0b0f0c" }}
            >
              <path 
                d="M7 17L17 7M17 7H8M17 7V16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* Responsive Styles Injection */}
      <style jsx>{`
        @media (max-width: 768px) {
          h2 {
            font-size: 48px !important;
            line-height: 1.1 !important;
          }
        }
      `}</style>
    </section>
  );
}
