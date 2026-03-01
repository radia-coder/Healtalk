"use client";

import Link from "next/link";
import { Star, MapPin, CheckCircle, Video, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Psychologist } from "@/lib/types";
import Image from "next/image";

interface TherapistListCardProps {
  therapist: Psychologist;
}

export default function TherapistListCard({ therapist }: TherapistListCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 w-full max-w-[1356px] min-h-[268px] mx-auto box-border">
      {/* Left: Image (clickable) */}
      <div className="flex-shrink-0">
        <Link href={`/psychologists/${therapist.id}`}>
            <div className="relative w-full md:w-56 h-48 md:h-full min-h-[200px] rounded-xl overflow-hidden bg-slate-100 cursor-pointer">
            <Image
                src={therapist.image || therapist.photo || '/images/doctor-1.jpg'}
                alt={therapist.name || 'Therapist'}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
            />
            </div>
        </Link>
      </div>

      {/* Middle: Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-start py-2">
        <div className="flex items-center gap-2 mb-1">
            <Link href={`/psychologists/${therapist.id}`} className="hover:underline">
                <h3 className="text-2xl font-bold text-slate-900 truncate">
                {therapist.name}
                </h3>
            </Link>
            {therapist.verified && (
              <CheckCircle size={20} className="text-teal-500 fill-teal-50 flex-shrink-0" />
            )}
        </div>
        <p className="text-base font-medium text-slate-500 mb-3 border-b border-dashed border-slate-300 pb-2 w-fit">
            {therapist.title}
        </p>

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
            <MapPin size={18} className="text-slate-400" />
            <span className="text-base">{therapist.location}</span>
        </div>

        {/* Tags Row */}
        {therapist.conditions && therapist.conditions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
            {therapist.conditions.slice(0, 3).map((bgItem) => (
                <span key={bgItem} className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200">
                    {bgItem}
                </span>
            ))}
        </div>
        )}

        {/* Highlights Badges */}
        <div className="flex flex-wrap gap-2 mt-auto">
            <span className="bg-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-teal-100">
                <Star size={12} className="fill-white" /> Top Choice
            </span>
             <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-rose-200">
                <CheckCircle size={12} /> Insurance Accepted
            </span>
             <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-slate-200">
                <Star size={12} /> {therapist.experience} years experience
            </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex-shrink-0 w-full md:w-72 flex flex-col gap-3 md:border-l md:border-slate-100 md:pl-8 justify-center py-2 h-full">
            {/* Call Button */}
             <Button className="w-full h-12 bg-[#2D2A3E] hover:bg-[#1a1824] text-white flex justify-center items-center gap-3 px-4 rounded-xl shadow-lg shadow-slate-200 active:scale-95 transition-all">
                <Phone size={20} className="fill-white/20" />
                <span className="font-semibold text-base">Call Now</span>
             </Button>
             
             {/* Book Button */}
             <Link href={`/psychologists/${therapist.id}`} className="w-full">
                <Button variant="outline" className="w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-700 flex justify-center items-center gap-3 px-4 rounded-xl active:scale-95 transition-all">
                    <Calendar size={20} className="text-slate-400" />
                    <span className="font-semibold text-base">Book Appointment</span>
                </Button>
            </Link>

            <div className="flex items-center gap-2 text-sm font-medium text-orange-500 mt-2 justify-center">
                <Video size={16} />
                <span>Available Online</span>
            </div>
             <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-900 mt-1">
                <span className="font-bold text-xl">{therapist.priceRange?.split(' ')[0] || '$50'}</span> per session
            </div>
      </div>
    </div>
  );
}
