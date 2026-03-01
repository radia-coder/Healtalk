"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function HeroSection() {
    // Stage: 0 = Hero1 playing, 1 = Hero1 fading out / Hero2 playing? 
    // Actually, simplest is just activeVideo index: 1 or 2
    const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
    const isVisible = true;
    
    // Refs to control playback if needed, though autoPlay usually handles it.
    // We might need to manually play the next video when switching to ensure it starts immediately.
    const video1Ref = useRef<HTMLVideoElement>(null);
    const video2Ref = useRef<HTMLVideoElement>(null);

    // Handle video ending
    const handleVideoEnd = (videoIndex: 1 | 2) => {
        if (videoIndex === 1) {
            setActiveVideo(2);
            // Ensure video 2 is playing
            if (video2Ref.current) {
                video2Ref.current.currentTime = 0;
                video2Ref.current.play().catch(e => console.log("Video 2 autoplay failed", e));
            }
        } else {
            setActiveVideo(1);
            // Ensure video 1 is playing
            if (video1Ref.current) {
                video1Ref.current.currentTime = 0;
                video1Ref.current.play().catch(e => console.log("Video 1 autoplay failed", e));
            }
        }
    };

    return (
        <section 
            className="relative w-full flex flex-col justify-center overflow-hidden z-0"
            style={{
                height: '835px', // Exact desktop height
                margin: '0',
                padding: '0',
                top: '0',
            }}
        >
            {/* 
              BACKGROUND CONTENT
              - Sequential Video Loop
              - Dark cinematic overlay
            */}
            <div className="absolute inset-0 z-0 bg-black m-0 p-0">
                {/* Video 1 */}
                <div 
                    className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${activeVideo === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    style={{ margin: 0, padding: 0 }}
                >
                    <video
                        ref={video1Ref}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        playsInline
                        onEnded={() => handleVideoEnd(1)}
                        style={{ objectPosition: 'center' }}
                    >
                        <source src="/videos/Hero1.mp4" type="video/mp4" />
                    </video>
                </div>

                {/* Video 2 */}
                <div 
                    className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${activeVideo === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <video
                        ref={video2Ref}
                        className="w-full h-full object-cover"
                        // We don't verify 'autoPlay' here because we trigger it manually on switch, 
                        // but keeping keys consistent helps. 
                        // Actually, for seamlessness, we can keep both mounted and play them when needed.
                        muted
                        playsInline
                        onEnded={() => handleVideoEnd(2)}
                        style={{ objectPosition: 'center' }}
                    >
                        <source src="/videos/Hero2.mp4" type="video/mp4" />
                    </video>
                </div>

                {/* Overlay - "Stronger dark at bottom-left, softer elsewhere" */}
                {/* Also adding a subtle blur to the container if requested, but CSS blur on video can kill performance. 
                    Let's use a very slight backdrop-filter on the overlay div or just rely on the video quality. 
                    User asked for "very light blur/softness".
                */}
                <div 
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                        background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.8) 100%)",
                        // Adding a secondary radial gradient for the "vignette" feel
                    }}
                >
                    <div 
                        className="absolute inset-0"
                        style={{
                            background: "radial-gradient(circle at 30% 80%, rgba(0,0,0,0.4) 0%, transparent 60%)"
                        }} 
                    />
                </div>
                
                {/* Optional "Film Look" Blur on top of video */}
                <div className="absolute inset-0 z-20 backdrop-blur-[1px] pointer-events-none mix-blend-soft-light opacity-30"></div>
            </div>

            {/* 
              CONTENT
              - Main Headline: Top 25%, Left 72px
              - Subtext: 24-32px below Headline
              - CTA: Bottom 50px, Left 72px
            */}
            <div className="relative z-30 w-full h-full"> 
                
                {/* Headline & Subtext Container */}
                <div 
                    suppressHydrationWarning
                    className={`absolute left-0 px-6 lg:left-[72px] lg:px-0 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                        top: '25%', // Approx 200-250px from top
                    }}
                >
                    <h1 
                        className="text-white font-serif tracking-tight leading-tight mb-0"
                        style={{
                            fontFamily: '"Times New Roman", Times, Baskerville, Georgia, serif',
                            fontWeight: 300,
                            fontSize: 'clamp(40px, 6vw, 84px)', // Responsive clamp
                            lineHeight: '78px', // Exact line height
                            whiteSpace: 'pre-line', // Respect line breaks in text
                        }}
                    >
                        You don&apos;t have to<br />
                        figure this out<br />
                        alone.
                    </h1>

                </div>


                {/* CTA BUTTON */}
                <div 
                    suppressHydrationWarning
                    className={`absolute left-6 lg:left-[72px] transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                        bottom: '50px', // 40-60px from bottom
                    }}
                >
                    <Link href="/find-psychologists">
                        <button 
                            className="group inline-flex items-center justify-between transition-all duration-300 hover:brightness-110 active:scale-95"
                            style={{
                                height: '53px',
                                background: 'rgba(190, 200, 185, 0.35)', // Matches CTA section exact color
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                borderRadius: '3rem', 
                                paddingLeft: '24px',
                                paddingRight: '4.5px', // Matches vertical margin: (53-44)/2 = 4.5px
                                gap: '16px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.20)'
                            }}
                        >
                            <span 
                                className="text-white/95"
                                style={{ 
                                    fontFamily: '"Helvetica Now", Helvetica, Arial, sans-serif',
                                    fontSize: '16px',
                                    lineHeight: '1',
                                    fontWeight: 400,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Get Connected
                            </span>
                            
                            {/* Circle Badge with Arrow */}
                            <div 
                                className="flex items-center justify-center rounded-full bg-[#d9e7c8] text-black transition-transform duration-300 group-hover:scale-105"
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    flexShrink: 0
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
                        </button>
                    </Link>
                </div>
            </div>

        </section>
    );
}
