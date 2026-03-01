"use client";

import Link from "next/link";
import { Star, MapPin, Languages, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PsychologistCardProps {
  psychologist: {
    id: number;
    name: string;
    credentials: string;
    experience: number;
    rating: number;
    reviewCount: number;
    specializations: string[];
    hospital: string;
    location: string;
    languages: string[];
    nextAvailable: string;
    price: number;
    photo?: string;
    bio?: string;
  };
}

export default function PsychologistCard({ psychologist }: PsychologistCardProps) {
  const shortBio = psychologist.bio
    ? `${psychologist.bio.slice(0, 120)}${psychologist.bio.length > 120 ? "..." : ""}`
    : "Warm, evidence-based care focused on your needs.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:border-primary hover:shadow-lg h-full flex flex-col"
    >
      {/* Photo */}
      <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-full bg-primary/30 flex items-center justify-center text-6xl font-bold text-primary">
          {psychologist.name.split(' ')[1]?.[0] || psychologist.name[0]}
        </div>
      </div>

      {/* Name & Credentials */}
      <h3 className="text-xl font-bold text-foreground mb-1">
        {psychologist.name}
      </h3>
      <p className="text-sm text-text-secondary mb-2">
        {psychologist.credentials}
      </p>
      <p className="text-sm text-text-secondary mb-3">
        {psychologist.experience} years of experience
      </p>
      <p className="text-sm text-text-secondary mb-4">
        {shortBio}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <Star className="text-accent fill-accent" size={16} />
        <span className="font-semibold text-sm">{psychologist.rating}</span>
        <span className="text-text-secondary text-sm">
          ({psychologist.reviewCount} reviews)
        </span>
      </div>

      {/* Specialization Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {psychologist.specializations.slice(0, 3).map((spec) => (
          <span
            key={spec}
            className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
          >
            {spec}
          </span>
        ))}
      </div>

      {/* Hospital */}
      <div className="flex items-start gap-2 text-sm text-text-secondary mb-2">
        <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <span>{psychologist.hospital}, {psychologist.location}</span>
      </div>

      {/* Languages */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
        <Languages size={16} className="text-primary flex-shrink-0" />
        <span>{psychologist.languages.join(", ")}</span>
      </div>

      {/* Next Available */}
      <div className="flex items-center gap-2 text-sm text-success mb-4">
        <Calendar size={16} className="flex-shrink-0" />
        <span>{psychologist.nextAvailable}</span>
      </div>

      {/* Price & Actions */}
      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
        <div className="text-lg font-bold text-foreground">
          ₺{psychologist.price}
          <span className="text-sm font-normal text-text-secondary">/session</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/psychologist/${psychologist.id}`}>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
              View profile
            </Button>
          </Link>
          <Link href={`/psychologist/${psychologist.id}?book=true`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
              Book session
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
