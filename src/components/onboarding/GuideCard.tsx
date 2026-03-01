"use client";

import Image from "next/image";

interface GuideCardProps {
  name: string;
  traits: string[];
  imageSrc: string;
  onClick?: () => void;
}

export function GuideCard({ name, traits, imageSrc, onClick }: GuideCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative w-[320px] h-[418px] rounded-[0.75rem] overflow-hidden cursor-pointer transition-all duration-300 ease hover:-translate-y-3 bg-[#F3E5D8]"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.16)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/*
         Full Bleed Image
         Using a beige background #F3E5D8 behind it for the "Studio" look if image is transparent
      */}
      <Image
        src={imageSrc}
        alt={name}
        fill
        className="object-cover object-center"
        sizes="321px"
      />

      {/*
         Bottom Gradient Overlay
         Transparent to Dark
      */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[50%] flex flex-col justify-end px-[24px] py-[24px]"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)"
        }}
      >
        <h3 className="text-[22px] font-semibold text-white mb-2 font-sans leading-tight">
          {name}
        </h3>
        
        <div className="flex flex-col gap-1">
          {traits.map((trait, idx) => (
            <div key={idx} className="flex items-center text-[13px] font-medium text-white/95 leading-tight font-sans tracking-wide">
               {/* Trait formatting: Emoji Space Text */}
               <span>{trait}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
