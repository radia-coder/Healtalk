"use client";

import Link from "next/link";
import { Star, MapPin, Languages, Calendar, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Psychologist } from "@/lib/types";
import Image from "next/image";

interface TherapistCardProps {
  therapist: Psychologist;
}

export default function TherapistCard({ therapist }: TherapistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-card border border-border rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:border-primary/50 flex flex-col h-full group"
    >
      {/* Header: Photo & Basic Info */}
      <div className="flex gap-4 mb-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-background shadow-sm">
          <Image
            src={therapist.image || therapist.photo || '/images/doctor-1.jpg'}
            alt={therapist.name || 'Therapist'}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground truncate">
              {therapist.name}
            </h3>
            {therapist.verified && (
              <CheckCircle size={16} className="text-blue-500 fill-blue-500/10 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm font-medium text-primary mb-1">
            {therapist.title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
             <MapPin size={14} className="text-text-secondary" />
             <span className="truncate">{therapist.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md">
            <Star className="text-accent fill-accent" size={14} />
            <span className="font-bold text-sm">{therapist.rating}</span>
          </div>
          <span className="text-xs text-text-secondary">({therapist.reviewCount})</span>
        </div>
      </div>

      {/* Tags */}
      {therapist.conditions && therapist.conditions.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {therapist.conditions.slice(0, 3).map((condition) => (
          <span
            key={condition}
            className="px-2.5 py-0.5 bg-secondary/30 text-secondary-foreground text-xs font-medium rounded-full"
          >
            {condition}
          </span>
        ))}
        {therapist.conditions.length > 3 && (
            <span className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                +{therapist.conditions.length - 3} more
            </span>
        )}
      </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm text-text-secondary">
        {therapist.languages && therapist.languages.length > 0 && (
        <div className="flex items-center gap-2">
            <Languages size={15} className="text-primary/70" />
            <span className="truncate">{therapist.languages.slice(0, 2).join(", ")}</span>
        </div>
        )}
        {therapist.experience && (
        <div className="flex items-center gap-2">
            <Clock size={15} className="text-primary/70" />
            <span>{therapist.experience} years exp.</span>
        </div>
        )}
        {therapist.nextAvailable && (
        <div className="flex items-center gap-2 col-span-2">
            <Calendar size={15} className="text-green-600" />
            <span className="text-green-600 font-medium">Available: {therapist.nextAvailable}</span>
        </div>
        )}
      </div>

      {/* Footer: Price & Actions */}
      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary">Per session</span>
          <span className="text-base font-bold text-foreground">{therapist.priceRange || '$50'}</span>
        </div>
        <div className="flex gap-2">
           <Link href={`/psychologists/${therapist.id}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary/5">
              Profile
            </Button>
          </Link>
          <Link href={`/psychologists/${therapist.id}`} className="w-full">
             <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
              Book
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
