"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, ArrowRightIcon } from "@radix-ui/react-icons";

export interface PricingFeature {
    name: string;
    highlight?: boolean;
    included: boolean;
}

export interface PricingTier {
    name: string;
    price: number;
    interval?: string;
    description: string;
    features: PricingFeature[];
    highlight?: boolean;
    backgroundColor?: string;
    cta?: {
        text: string;
        href?: string;
        onClick?: () => void;
        variant?: "default" | "hero";
    };
}

export interface PricingCardsProps extends React.HTMLAttributes<HTMLDivElement> {
    tiers: PricingTier[];
    containerClassName?: string;
    cardClassName?: string;
    sectionClassName?: string;
}

export function PricingCards({
    tiers,
    className,
    containerClassName,
    cardClassName,
    sectionClassName,
    ...props
}: PricingCardsProps) {
    return (
        <section
            className={cn(
                "bg-background text-foreground",
                "py-12 sm:py-24 md:py-32 px-4",
                "fade-bottom overflow-hidden pb-0",
                sectionClassName
            )}
        >
            <div className={cn("w-full max-w-5xl mx-auto px-4", containerClassName)} {...props}>
                <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8", className)}>
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={cn(
                                "relative group",
                                "rounded-2xl transition-all duration-500",
                                tier.highlight
                                    ? "bg-gradient-to-b from-neutral-950 to-neutral-900 dark:from-neutral-900 dark:to-neutral-950"
                                    : tier.backgroundColor ? "" : "bg-white dark:bg-neutral-900",
                                "border border-neutral-200 dark:border-neutral-800",
                                "hover:border-neutral-300 dark:hover:border-neutral-700",
                                "hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)]",
                                cardClassName
                            )}
                            style={{ backgroundColor: tier.backgroundColor }}
                        >
                            <div className="p-10 flex flex-col h-full">
                                <div className="space-y-4">
                                    <h3 className={cn(
                                        "text-lg uppercase tracking-wider font-medium",
                                        tier.highlight
                                            ? "text-white"
                                            : "text-neutral-900 dark:text-white"
                                    )}>
                                        {tier.name}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className={cn(
                                            "text-5xl font-light",
                                            tier.highlight
                                                ? "text-white"
                                                : "text-neutral-900 dark:text-white"
                                        )}>
                                            ${tier.price}
                                        </span>
                                        <span className={cn(
                                            "text-sm",
                                            tier.highlight
                                                ? "text-neutral-400"
                                                : "text-neutral-500 dark:text-neutral-400"
                                        )}>
                                            {tier.interval || "one-time"}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-sm pb-6 border-b",
                                        tier.highlight
                                            ? "text-neutral-400 border-neutral-800"
                                            : "text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                                    )}>
                                        {tier.description}
                                    </p>
                                </div>

                                <div className="mt-8 space-y-4 flex-grow">
                                    {tier.features.map((feature) => (
                                        <div
                                            key={feature.name}
                                            className="flex items-center gap-3"
                                        >
                                            <div className={cn(
                                                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                                                feature.included
                                                    ? tier.highlight
                                                        ? "text-white"
                                                        : "text-neutral-900 dark:text-white"
                                                    : "text-neutral-300 dark:text-neutral-700"
                                            )}>
                                                <CheckIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className={cn(
                                                "text-sm",
                                                tier.highlight
                                                    ? "text-neutral-300"
                                                    : "text-neutral-600 dark:text-neutral-300"
                                            )}>
                                                {feature.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {tier.cta && (
                                    <div className={cn("mt-8", tier.cta.variant === "hero" && "flex justify-center")}>
                                        {tier.cta.variant === "hero" ? (
                                             <Button
                                                asChild={Boolean(tier.cta.href)}
                                                className={cn(
                                                    "w-fit h-[53px] group relative rounded-full", /* Match CTA height 53px and width fit */
                                                    "border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.20)]",
                                                    "hover:brightness-110 active:scale-95 transition-all duration-300",
                                                    cardClassName
                                                )}
                                                style={{
                                                    background: 'rgba(190, 200, 185, 0.35)',
                                                    backdropFilter: 'blur(10px)',
                                                    WebkitBackdropFilter: 'blur(10px)',
                                                    display: 'inline-flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    paddingLeft: '24px',
                                                    paddingRight: '4.5px', // Match CTA padding
                                                    gap: '16px',
                                                }}
                                                onClick={tier.cta.onClick}
                                            >
                                                {tier.cta.href ? (
                                                    <a href={tier.cta.href} className="flex items-center gap-4"> 
                                                        <span 
                                                            className="text-black/95" 
                                                            style={{ 
                                                                fontFamily: '"Helvetica Now", Helvetica, Arial, sans-serif',
                                                                fontSize: '16px',
                                                                fontWeight: 400,
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {tier.cta.text}
                                                        </span>
                                                        <div 
                                                            className="flex items-center justify-center rounded-full bg-[#d9e7c8] text-black transition-transform duration-300 group-hover:scale-105"
                                                            style={{
                                                                width: '44px', // Match CTA size
                                                                height: '44px',
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#0b0f0c" }}>
                                                                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    // Non-link version
                                                    <>
                                                        <span 
                                                            className="text-black/95"
                                                            style={{ 
                                                                fontFamily: '"Helvetica Now", Helvetica, Arial, sans-serif',
                                                                fontSize: '16px',
                                                                fontWeight: 400,
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {tier.cta.text}
                                                        </span>
                                                        <div 
                                                            className="flex items-center justify-center rounded-full bg-[#d9e7c8] text-black transition-transform duration-300 group-hover:scale-105"
                                                            style={{
                                                                width: '44px', 
                                                                height: '44px',
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#0b0f0c" }}>
                                                                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </div>
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                className={cn(
                                                    "w-full h-12 group relative",
                                                    tier.highlight
                                                        ? "bg-white hover:bg-neutral-100 text-neutral-900"
                                                        : "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900",
                                                    "transition-all duration-300"
                                                )}
                                                onClick={tier.cta.onClick}
                                                asChild={Boolean(tier.cta.href)}
                                            >
                                                {tier.cta.href ? (
                                                    <a href={tier.cta.href}>
                                                        <span className="relative z-10 flex items-center justify-center gap-2 font-medium tracking-wide">
                                                            {tier.cta.text}
                                                            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className="relative z-10 flex items-center justify-center gap-2 font-medium tracking-wide">
                                                        {tier.cta.text}
                                                        <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                    </span>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
