"use client";

import React, { useState } from "react";
import { GuideCard } from "@/components/guides/GuideCard";
import { LoadMoreButton } from "@/components/blog/LoadMoreButton"; // Re-using generic load more
import { GuideItem } from "@/lib/types";

interface GuidesGridProps {
  initialGuides: GuideItem[];
}

export function GuidesGrid({ initialGuides }: GuidesGridProps) {
  const [visibleCount, setVisibleCount] = useState(7); // Matches screenshot: 4 + 3
  const visibleGuides = initialGuides.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 md:px-8">
      {/* Grid: 1 col mobile, 2 tablet, 4 desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {visibleGuides.map((guide) => (
          <div key={guide.id} className="w-full">
            <GuideCard guide={guide} />
          </div>
        ))}
      </div>
      
      {visibleCount < initialGuides.length && (
        <LoadMoreButton onClick={handleLoadMore} />
      )}

      {/* Spacing before footer if no button */}
      {visibleCount >= initialGuides.length && <div className="h-24"></div>}
    </div>
  );
}
