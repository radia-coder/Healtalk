"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { specializations, hospitals, cities } from "@/lib/data";

interface FilterSidebarProps {
  onFilterChange?: (filters: {
    specializations: string[];
    hospitals: string[];
    city: string;
    rating: number | null;
    availability: string | null;
    priceRange: { min: number; max: number };
    languages: string[];
  }) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 200, max: 1000 });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const languages = ["Turkish", "English", "Arabic", "Kurdish"];

  const filters = useMemo(
    () => ({
      specializations: selectedSpecializations,
      hospitals: selectedHospitals,
      city: selectedCity,
      rating: selectedRating,
      availability: selectedAvailability,
      priceRange,
      languages: selectedLanguages,
    }),
    [
      selectedSpecializations,
      selectedHospitals,
      selectedCity,
      selectedRating,
      selectedAvailability,
      priceRange,
      selectedLanguages,
    ]
  );

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const handleClearAll = () => {
    setSelectedSpecializations([]);
    setSelectedHospitals([]);
    setSelectedCity("All Cities");
    setSelectedRating(null);
    setSelectedAvailability(null);
    setPriceRange({ min: 200, max: 1000 });
    setSelectedLanguages([]);
  };

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const toggleHospital = (hospital: string) => {
    setSelectedHospitals(prev =>
      prev.includes(hospital) ? prev.filter(h => h !== hospital) : [...prev, hospital]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">FILTERS</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-sm text-primary hover:text-primary/80"
        >
          <X size={16} className="mr-1" />
          Clear All
        </Button>
      </div>

      {/* Location */}
      <div className="mb-6 pb-6 border-b border-border">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          📍 Location
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Specialization */}
      <div className="mb-6 pb-6 border-b border-border">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          🎯 Specialization
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {specializations.slice(0, 6).map((spec) => (
            <label key={spec} className="flex items-center gap-2 cursor-pointer hover:bg-background p-1 rounded">
              <input
                type="checkbox"
                checked={selectedSpecializations.includes(spec)}
                onChange={() => toggleSpecialization(spec)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-foreground">{spec}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="mb-6 pb-6 border-b border-border">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          ⭐ Minimum Rating
        </label>
        <div className="space-y-2">
          {[4.0, 4.5, 4.8].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer hover:bg-background p-1 rounded">
              <input
                type="radio"
                name="rating"
                checked={selectedRating === rating}
                onChange={() => setSelectedRating(rating)}
                className="w-4 h-4 text-primary border-border focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-foreground">{rating}+ stars</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6 pb-6 border-b border-border">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          📅 Availability
        </label>
        <div className="space-y-2">
          {["Available Today", "Available This Week", "Available This Month"].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-background p-1 rounded">
              <input
                type="radio"
                name="availability"
                checked={selectedAvailability === option}
                onChange={() => setSelectedAvailability(option)}
                className="w-4 h-4 text-primary border-border focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-foreground">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Hospital */}
      <div className="mb-6 pb-6 border-b border-border">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          🏥 Hospital
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {hospitals.map((hospital) => (
            <label key={hospital} className="flex items-center gap-2 cursor-pointer hover:bg-background p-1 rounded">
              <input
                type="checkbox"
                checked={selectedHospitals.includes(hospital)}
                onChange={() => toggleHospital(hospital)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-foreground">{hospital}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-6 border-b border-border">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          💰 Price Range
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="200"
            max="1000"
            step="50"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-sm text-text-secondary">
            <span>₺{priceRange.min}</span>
            <span>₺{priceRange.max}</span>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          🗣️ Languages
        </label>
        <div className="space-y-2">
          {languages.map((lang) => (
            <label key={lang} className="flex items-center gap-2 cursor-pointer hover:bg-background p-1 rounded">
              <input
                type="checkbox"
                checked={selectedLanguages.includes(lang)}
                onChange={() => toggleLanguage(lang)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-foreground">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <Button
        className="w-full bg-primary hover:bg-primary/90 text-background"
        onClick={() => onFilterChange?.(filters)}
      >
        Apply Filters
      </Button>
    </div>
  );
}
