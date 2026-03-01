import React from "react";
import { GuidesHero } from "@/components/guides/GuidesHero";
import { GuidesGrid } from "@/components/guides/GuidesGrid";
import { RESOURCE_FALLBACK_GUIDES } from "@/lib/resource-fallback";

async function getGuides() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/guides`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return RESOURCE_FALLBACK_GUIDES;
    const data = await res.json();
    const guides = Array.isArray(data.guides) ? data.guides : [];
    return guides.length > 0 ? guides : RESOURCE_FALLBACK_GUIDES;
  } catch (error) {
    console.error('Failed to fetch guides:', error);
    return RESOURCE_FALLBACK_GUIDES;
  }
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="min-h-screen bg-[#F6F1EA] flex flex-col">
      <main className="flex-grow">
        <GuidesHero />
        <GuidesGrid initialGuides={guides} />
      </main>
    </div>
  );
}
