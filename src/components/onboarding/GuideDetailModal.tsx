"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Volume2, ArrowLeft, ArrowRight } from "lucide-react";

interface Guide {
  id: number;
  name: string;
  imageSrc: string;
  traits: string[];
}

interface GuideDetailModalProps {
  guide: Guide | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function GuideDetailModal({ guide, isOpen, onClose, onNext, onPrev }: GuideDetailModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !guide) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Container wrapper for relative positioning of arrows */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Previous Button (Left) */}
        <button
          onClick={onPrev}
          aria-label="Previous"
          className="absolute top-1/2 -left-[84px] -translate-y-1/2 w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center z-[60] shadow-[0_10px_25px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)] hover:bg-[#F5F5F5] hover:shadow-[0_12px_30px_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.1)] active:scale-98 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2D8B5E]/20"
        >
          <ArrowLeft className="w-5 h-5 text-[#111111]" strokeWidth={2} />
        </button>

        {/* Next Button (Right) */}
        <button
          onClick={onNext}
          aria-label="Next"
          className="absolute top-1/2 -right-[84px] -translate-y-1/2 w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center z-[60] shadow-[0_10px_25px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)] hover:bg-[#F5F5F5] hover:shadow-[0_12px_30px_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.1)] active:scale-98 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2D8B5E]/20"
        >
          <ArrowRight className="w-5 h-5 text-[#111111]" strokeWidth={2} />
        </button>

        {/* Modal Content Card */}
        <div 
          className="relative w-[835px] h-[545px] bg-white rounded-[2.5rem] shadow-2xl flex p-[26px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Left Column: Media */}
          <div className="relative w-[390px] h-[493px] rounded-[2rem] overflow-hidden bg-[#E8E2D9] shrink-0 group">
            <Image
              src={guide.imageSrc}
              alt={guide.name}
              fill
              className="object-cover object-top"
            />
            
            {/* Sound Icon (Top Left) */}
            <button className="absolute top-4 left-4 w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/80 transition-colors">
              <Volume2 className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          {/* Right Column: Content */}
          <div className="flex-1 flex flex-col pl-[32px] pt-[8px] pb-[8px] relative">
            {/* Close Button (Top Right) */}
            <button 
              onClick={onClose}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Info */}
            <div className="mt-2 text-left">
              <h2 className="text-[28px] font-bold text-gray-900 leading-tight font-figtree mb-1">
                {guide.name}
              </h2>
              <p className="text-[15px] font-medium text-gray-500 mb-3">
                Licensed Therapist
              </p>
              
              {/* Traits Row */}
              <div className="flex flex-wrap gap-x-3 text-[14px] text-gray-700 font-medium mb-6">
                {guide.traits.map((trait, i) => (
                  <span key={i} className="flex items-center">
                     {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Body Paragraph */}
            <div className="text-[15px] leading-[1.6] text-[#4b5563] space-y-4 pr-4">
              <p>
                {guide.name.split(' ')[0]} has 12 years of clinical experience supporting adults through anxiety, stress, and life changes. Their style is warm, clear, and focused on small steps that add up.
              </p>
              <p>
                They have worked in community clinics and private practice. Outside of work, {guide.name.split(' ')[0]} enjoys nature walks, journaling, and time with family.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-auto w-full flex justify-center pb-2">
              <Link
                href="/signup"
                className="w-[354px] h-[60px] bg-black text-white rounded-full font-semibold text-[16px] flex items-center justify-center hover:bg-gray-900 transition-colors active:scale-[0.99]"
              >
                Book a session with {guide.name.split(' ')[0]}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
