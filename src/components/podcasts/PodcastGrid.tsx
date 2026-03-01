"use client";

import React, { useState } from "react";
import { PodcastCard } from "@/components/podcasts/PodcastCard";
import { LoadMoreButton } from "@/components/blog/LoadMoreButton";
import { PodcastEpisode } from "@/lib/types";

interface PodcastGridProps {
  initialEpisodes: PodcastEpisode[];
}

export function PodcastGrid({ initialEpisodes }: PodcastGridProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleEpisodes = initialEpisodes.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 md:px-8">
      {/* Grid: 1 col mobile, 2 tablet, 3 desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 justify-items-center">
        {visibleEpisodes.map((episode) => (
          <div key={episode.id} className="w-full">
            <PodcastCard episode={episode} />
          </div>
        ))}
      </div>
      
      {visibleCount < initialEpisodes.length && (
        <LoadMoreButton onClick={handleLoadMore} />
      )}

      {/* Spacing before footer if no button */}
      {visibleCount >= initialEpisodes.length && <div className="h-24"></div>}
    </div>
  );
}
