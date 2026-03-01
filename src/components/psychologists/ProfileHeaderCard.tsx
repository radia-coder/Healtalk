"use client";

import { BadgeCheck, MapPin, Phone, Mail, Globe, Star } from "lucide-react";
import Image from "next/image";
import { Psychologist } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ProfileHeaderCardProps {
  therapist: Psychologist;
}

export default function ProfileHeaderCard({ therapist }: ProfileHeaderCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-8 shadow-sm transition-shadow hover:shadow-md">
      {/* Photo Column */}
      <div className="flex-shrink-0 relative mx-auto md:mx-0">
        <div className="relative w-48 h-56 md:w-56 md:h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
           <Image
              src={therapist.image || therapist.photo || '/images/doctor-1.jpg'}
              alt={therapist.name || 'Therapist'} 
              fill 
              className="object-cover"
            />
        </div>
        {/* 'Top Choice' Badge Overlay */}
         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-teal-400 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap z-10">
            <Star size={12} className="fill-white" />
            Top Choice
         </div>
      </div>
      
      {/* Content Column */}
      <div className="flex-1 flex flex-col justify-center text-center md:text-left">
        {/* Name & Verification */}
        <div className="mb-2">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2 flex-wrap">
            {therapist.name}
            {therapist.verified && (
                <BadgeCheck className="text-teal-500 fill-teal-50" size={26} />
            )}
            </h1>
            <p className="text-lg text-slate-500 font-medium mt-1">{therapist.title}</p>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mb-4 font-medium">
            <MapPin size={18} className="text-slate-400" />
            <span>{therapist.location}</span>
        </div>

        {/* Quote/Intro */}
        {therapist.about && (
        <div className="mb-5 italic text-slate-600 leading-relaxed max-w-2xl">
            &ldquo;{therapist.about.slice(0, 140)}...&rdquo;
        </div>
        )}

        {/* Specialty Pills */}
        {therapist.conditions && therapist.conditions.length > 0 && (
        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            {therapist.conditions.slice(0, 4).map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-full border border-slate-200">
                    {tag}
                </span>
            ))}
        </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <Button variant="outline" className="gap-2 h-10 px-5 rounded-lg border-slate-200 hover:bg-slate-50 hover:text-teal-600 transition-colors">
                <Phone size={16} />
                Call
            </Button>
            <Button variant="outline" className="gap-2 h-10 px-5 rounded-lg border-slate-200 hover:bg-slate-50 hover:text-teal-600 transition-colors">
                <Mail size={16} />
                Email
            </Button>
            <Button variant="outline" className="gap-2 h-10 px-5 rounded-lg border-slate-200 hover:bg-slate-50 hover:text-teal-600 transition-colors">
                <Globe size={16} />
                My Website
            </Button>
        </div>
      </div>
    </div>
  );
}
