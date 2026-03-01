import React from "react";
import { Button } from "@/components/ui/button";

interface LoadMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function LoadMoreButton({ onClick, disabled }: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center pt-16 pb-24">
      <Button 
        onClick={onClick}
        disabled={disabled}
        className="rounded-full bg-[#1a1a1a] text-white px-8 py-6 text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        Load More
      </Button>
    </div>
  );
}
