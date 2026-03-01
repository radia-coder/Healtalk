"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "ENG", flag: "/flags/uk.svg", label: "English" },
  { code: "SO", flag: "/flags/so.svg", label: "Somali" },
  { code: "TR", flag: "/flags/tr.svg", label: "Turkish" },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("ENG");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If click is outside the dropdown container, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setSelectedLang(code);
    setIsOpen(false);
    // Future: Persist to localStorage or context
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
          isOpen ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
        )}
        aria-label="Language selector"
        aria-expanded={isOpen}
      >
        <Globe className="w-5 h-5 text-gray-700" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[130px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 slide-in-from-top-2">
             {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-2.5 transition-colors text-left",
                      "hover:bg-gray-50", 
                      isSelected && "bg-gray-50/80" 
                    )}
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] shrink-0 border border-gray-100">
                      <Image 
                        src={lang.flag} 
                        alt={lang.code} 
                        fill 
                        className="object-cover" 
                        sizes="24px"
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-bold tracking-wide",
                      isSelected ? "text-gray-900" : "text-gray-600"
                    )}>
                      {lang.code}
                    </span>
                  </button>
                );
             })}
        </div>
      )}
    </div>
  );
}
