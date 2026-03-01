"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FeatureItem {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface FeaturesAccordionProps {
  features?: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  {
    id: 1,
    title: "Private video sessions",
    image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=600&fit=crop",
    description:
      "Talk to your therapist from home, your car, or anywhere quiet. Sessions are fully encrypted — no one else can see or hear what you share.",
  },
  {
    id: 2,
    title: "Real, licensed therapists",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
    description:
      "Every therapist on HealTalk is licensed and verified. You get genuine clinical support from a real person — not a chatbot or an algorithm.",
  },
  {
    id: 3,
    title: "Book on your schedule",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop",
    description:
      "Pick a time that fits your life — mornings, evenings, or weekends. Many therapists have openings within the next few days.",
  },
  {
    id: 4,
    title: "Help for what you're going through",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
    description:
      "Whether it's anxiety, burnout, grief, relationship stress, or something you can't quite name — we have a therapist who specialises in exactly that.",
  },
  {
    id: 5,
    title: "Methods that actually work",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop",
    description:
      "Your therapist uses approaches backed by decades of research — like CBT and mindfulness — but shaped around you, not a textbook.",
  },
];

export default function FeaturesAccordion({ features = defaultFeatures }: FeaturesAccordionProps) {
  const [activeTabId, setActiveTabId] = useState<number | null>(1);
  const [activeImage, setActiveImage] = useState(features[0].image);

  return (
    <section className="pt-8 pb-8 md:pt-12 md:pb-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to get started
          </h2>
          <p className="text-lg text-text-secondary">
            From finding the right therapist to booking your first session — it&apos;s all simple, private, and built around you.
          </p>
        </div>

        {/* Accordion + Image Section */}
        <div className="flex w-full items-start justify-between gap-8 lg:gap-12">
          <div className="w-full md:w-1/2">
            <Accordion type="single" className="w-full" defaultValue="item-1">
              {features.map((tab) => (
                <AccordionItem key={tab.id} value={`item-${tab.id}`}>
                  <AccordionTrigger
                    onClick={() => {
                      setActiveImage(tab.image);
                      setActiveTabId(tab.id);
                    }}
                    className="cursor-pointer py-5 !no-underline transition hover:no-underline"
                  >
                    <h3
                      className={`text-lg md:text-xl font-semibold text-left transition-colors ${
                        tab.id === activeTabId ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {tab.title}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mt-2 text-text-secondary leading-relaxed">
                      {tab.description}
                    </p>
                    {/* Mobile Image */}
                    <div className="mt-6 md:hidden">
                      <Image
                        src={tab.image}
                        alt={tab.title}
                        width={800}
                        height={600}
                        className="h-full max-h-80 w-full rounded-lg object-cover shadow-md"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Desktop Image */}
          <div className="relative m-auto hidden w-1/2 overflow-hidden rounded-xl md:block">
            <Image
              src={activeImage}
              alt="Feature preview"
              width={800}
              height={600}
              className="aspect-[4/3] w-full rounded-xl object-cover shadow-lg transition-all duration-500"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
