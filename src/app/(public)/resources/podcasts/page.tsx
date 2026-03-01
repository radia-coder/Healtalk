import React from "react";
import { PodcastsHero } from "@/components/podcasts/PodcastsHero";
import { PodcastGrid } from "@/components/podcasts/PodcastGrid";
import { RESOURCE_FALLBACK_PODCASTS } from "@/lib/resource-fallback";

async function getPodcasts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/podcasts`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return RESOURCE_FALLBACK_PODCASTS;
    const data = await res.json();
    const episodes = Array.isArray(data.episodes) ? data.episodes : [];
    return episodes.length > 0 ? episodes : RESOURCE_FALLBACK_PODCASTS;
  } catch (error) {
    console.error('Failed to fetch podcast episodes:', error);
    return RESOURCE_FALLBACK_PODCASTS;
  }
}

export default async function PodcastsPage() {
  const episodes = await getPodcasts();

  return (
    <div className="min-h-screen bg-[#F6F1EA] flex flex-col">

      <main className="flex-grow">
        <PodcastsHero />
        <PodcastGrid initialEpisodes={episodes} />
      </main>
    </div>
  );
}
