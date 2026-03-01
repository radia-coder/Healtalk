"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { BRAND_LOGOS } from "./brand-logos";

// Triplicate the logos to ensure seamless looping (Left Buffer | Middle | Right Buffer)
const REPEATED_LOGOS = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

export default function TrustedLogosCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Custom Cursor/Pill Position
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Physics / Layout Refs
  const state = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,     // The visual translation value
    itemWidth: 155 + 16, // Card width + gap
    totalWidth: 0,   // Width of one full set of logos
  });

  // Initialize positioning
  useEffect(() => {
    state.current.totalWidth = BRAND_LOGOS.length * state.current.itemWidth;
    // Start in the middle set
    state.current.currentX = -state.current.totalWidth;
    
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${state.current.currentX}px)`;
    }
  }, []);

  // --- Handlers for Custom Cursor ---
  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update React state for the pill render
      setCursorPos({ x, y });
    }
  }, []);

  // --- Drag Logic (Pointer Events) ---
  const onPointerDown = (e: React.PointerEvent) => {
    state.current.isDragging = true;
    state.current.startX = e.clientX;
    setIsDragging(true);
    
    // Capture pointer to track outside container if needed
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    // Always update cursor position if hovering (or dragging)
    handleMouseMove(e);

    if (!state.current.isDragging) return;

    const deltaX = e.clientX - state.current.startX;
    state.current.startX = e.clientX; // Reset startX for next delta
    
    state.current.currentX += deltaX;

    // --- Infinite Loop Teleportation ---
    // Boundaries: 
    // We start at -totalWidth.
    // If we drag right (positive delta) and > 0, we jump back to -totalWidth.
    // If we drag left (negative delta) and < -2 * totalWidth, we jump forward to -totalWidth.
    
    const oneSetWidth = state.current.totalWidth;
    
    // Check Right Boundary (Showing start of first set)
    if (state.current.currentX > 0) {
      state.current.currentX -= oneSetWidth;
    }
    // Check Left Boundary (Showing end of third set)
    else if (state.current.currentX < -(oneSetWidth * 2)) {
      state.current.currentX += oneSetWidth;
    }

    // Apply transform directly for performance
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${state.current.currentX}px)`;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    state.current.isDragging = false;
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full relative overflow-hidden group py-10 cursor-none" // Global cursor-none for section
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      // We rely on pointer events for the track, but mouse move on container handles pill
    >
      {/* Title Spacer (Title is in parent, but ensuring spacing consistency) */}
      <div className="mb-0" />

      {/* Draggable Track */}
      <div
        ref={trackRef}
        className={cn(
          "flex gap-4 touch-pan-y will-change-transform",
          // While dragging, disable selection and maybe add grabbing style cursor-wise (though we hide native cursor)
          "select-none" 
        )}
        style={{ 
          // Ensure we can grab it
          touchAction: "pan-y",
          cursor: "none" // Force hide native cursor on track too
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {REPEATED_LOGOS.map((logo, index) => (
          <div
            key={`${logo.id}-${index}`}
            className={cn(
               "relative flex-shrink-0 w-[155px] h-[208px] bg-white rounded-[20px] flex items-center justify-center border border-black/5 shadow-sm overflow-hidden pointer-events-none select-none",
               // Only the container needs pointer events for dragging, cards should not block
            )}
          >
            {/* Logo */}
            <div className="text-gray-400 opacity-60 transition-opacity duration-300 transform scale-90">
              {logo.svg}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Drag Pill (Custom Cursor) */}
      <div 
        className={cn(
          "absolute top-0 left-0 pointer-events-none z-50 transition-opacity duration-200 ease-out flex items-center justify-center",
          isHovering ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
        }}
      >
        {/* Helper wrapper to offset the pill slightly so it's not centered exactly covering the click point if we had scaling, 
            but centering it on the "cursor" point feels more like a custom cursor. 
            References usually have it float slightly or be the cursor. 
            User said "follow mouse coordinates... Place it near the cursor (e.g., +12px)". 
        */}
        <div 
          className={cn(
            "translate-x-3 translate-y-3 bg-[#1a1a1a] text-white text-[12px] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap transition-transform duration-200",
            isDragging && "scale-90"
          )}
        >
          {isDragging ? "Dragging" : "Drag"}
        </div>
      </div>
    </div>
  );
}
