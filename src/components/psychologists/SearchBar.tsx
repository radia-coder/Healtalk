"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export default function SearchBar({ 
  placeholder = "Search by name, specialty, or hospital...",
  onSearch 
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="h-14 pl-12 pr-4 text-base border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  );
}
