"use client";

import { PricingCards, PricingTier } from "@/components/ui/pricing-cards";

const tiers: PricingTier[] = [
    {
        name: "SELF",
        price: 99,
        interval: "per session",
        description: "For individuals seeking personal growth and support",
        backgroundColor: "#c7c7ff",
        features: [
            { name: "50-minute video session", included: true },
            { name: "Chat with therapist", included: true },
            { name: "Digital worksheets", included: true },
            { name: "Journaling tools", included: true },
            { name: "Crisis support resources", included: true },
            { name: "Insurance receipt", included: true },
        ],
        cta: {
            text: "Get started",
            href: "/signup",
            variant: "hero"
        }
    },
    {
        name: "ONGOING",
        price: 349,
        interval: "monthly",
        description: "Comprehensive care plan for continuous progress",
        backgroundColor: "#c4eab2",
        features: [
            { name: "4 sessions per month", included: true },
            { name: "Unlimited messaging", included: true },
            { name: "Priority scheduling", included: true },
            { name: "Progress tracking", included: true, highlight: true },
            { name: "Family sessions included", included: true },
            { name: "Cancel anytime", included: true },
        ],
        cta: {
            text: "Start subscription",
            href: "/signup?plan=ongoing",
            variant: "hero"
        }
    },
];

export default function PricingSection() {
    return (
        <PricingCards 
            tiers={tiers}
            className="gap-6"
            containerClassName=""
            sectionClassName="bg-background pt-8 pb-8 md:pt-12 md:pb-12"
        />
    );
}
