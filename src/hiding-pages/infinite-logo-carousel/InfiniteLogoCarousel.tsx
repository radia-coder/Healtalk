"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { BRAND_LOGOS } from "./about/brand-logos";

// Quadruple the logos for seamless infinite loop
const INFINITE_LOGOS = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

export default function InfiniteLogoCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const state = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
    cardWidth: 150 + 24, // card width (150px) + gap (24px)
    totalWidth: 0,
  });

  // Initialize positioning
  useEffect(() => {
    state.current.totalWidth = BRAND_LOGOS.length * state.current.cardWidth;
    // Start at the beginning of the second set
    state.current.currentX = -state.current.totalWidth;

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${state.current.currentX}px)`;
    }
  }, []);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Track cursor position for custom drag indicator
  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCursorPos({ x, y });
    }
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return;

    state.current.isDragging = true;
    state.current.startX = e.clientX;
    state.current.lastX = e.clientX;
    state.current.lastTime = Date.now();
    state.current.velocity = 0;

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    handleMouseMove(e);

    if (!state.current.isDragging || !trackRef.current) return;

    const currentTime = Date.now();
    const deltaX = e.clientX - state.current.lastX;
    const deltaTime = currentTime - state.current.lastTime;

    // Calculate velocity for momentum
    if (deltaTime > 0) {
      state.current.velocity = deltaX / deltaTime;
    }

    state.current.currentX += deltaX;
    state.current.lastX = e.clientX;
    state.current.lastTime = currentTime;

    // Infinite loop boundaries during drag
    const oneSetWidth = state.current.totalWidth;

    if (state.current.currentX > -oneSetWidth) {
      state.current.currentX -= oneSetWidth;
      state.current.startX -= oneSetWidth;
      state.current.lastX -= oneSetWidth;
    } else if (state.current.currentX <= -(oneSetWidth * 2)) {
      state.current.currentX += oneSetWidth;
      state.current.startX += oneSetWidth;
      state.current.lastX += oneSetWidth;
    }

    trackRef.current.style.transform = `translateX(${state.current.currentX}px)`;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    state.current.isDragging = false;
    (e.target as Element).releasePointerCapture(e.pointerId);

    // Apply momentum/inertia after release
    if (Math.abs(state.current.velocity) > 0.1) {
      applyMomentum();
    }
  };

  const applyMomentum = () => {
    if (!trackRef.current || state.current.isDragging) return;

    // Gradually slow down the momentum with smooth deceleration
    state.current.velocity *= 0.92; // Slower decay for smoother glide

    if (Math.abs(state.current.velocity) > 0.05) {
      state.current.currentX += state.current.velocity * 16; // Apply velocity

      // Infinite loop boundaries
      const oneSetWidth = state.current.totalWidth;

      if (state.current.currentX > -oneSetWidth) {
        state.current.currentX -= oneSetWidth;
      } else if (state.current.currentX <= -(oneSetWidth * 2)) {
        state.current.currentX += oneSetWidth;
      }

      trackRef.current.style.transform = `translateX(${state.current.currentX}px)`;

      animationRef.current = requestAnimationFrame(applyMomentum);
    } else {
      // Stop momentum when velocity is too low
      state.current.velocity = 0;
    }
  };

  return (
    <section className="relative py-16 px-6 bg-background overflow-hidden">
      <div className="w-full max-w-[1470px] mx-auto">
        {/* Heading */}
        <h2 className="text-[36px] md:text-[40px] font-heading font-bold text-center mb-14 text-[#111827] tracking-tight">
          Trusted by teams who care about mental health.
        </h2>

        {/* Carousel Container */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden"
        >
          {/* Draggable Track Wrapper */}
          <div
            className="relative w-full h-[213px] cursor-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
            style={{ touchAction: "pan-y" }}
          >
            {/* Track */}
            <div
              ref={trackRef}
              className="absolute top-0 left-0 flex gap-6 will-change-transform select-none h-full"
            >
              {INFINITE_LOGOS.map((logo, index) => (
                <div
                  key={`${logo.id}-${index}`}
                  className="flex-shrink-0 w-[150px] h-[213px] bg-white rounded-[16px] flex items-center justify-center shadow-sm pointer-events-none select-none transition-shadow duration-300 hover:shadow-md border border-black/5"
                >
                  <div className="text-[#111827] scale-[0.65]">
                    {logo.svg}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEFT Edge Fade Gradient */}
          <div
            className="absolute top-0 left-0 h-full w-[120px] pointer-events-none z-10"
            style={{
              background: "linear-gradient(to right, var(--background) 0%, transparent 100%)"
            }}
          />

          {/* RIGHT Edge Fade Gradient */}
          <div
            className="absolute top-0 right-0 h-full w-[120px] pointer-events-none z-10"
            style={{
              background: "linear-gradient(to left, var(--background) 0%, transparent 100%)"
            }}
          />

          {/* Floating Drag Indicator - Follows Cursor - No Animations */}
          {isHovering && (
            <div
              className="absolute top-0 left-0 pointer-events-none z-20"
              style={{
                transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
              }}
            >
              <div className="translate-x-3 translate-y-3 bg-[#131E0D] text-white text-[13px] font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                Drag
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
