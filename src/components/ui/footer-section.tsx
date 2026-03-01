'use client';

import React from "react";
import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, Grid2x2PlusIcon } from "lucide-react";

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: "Product",
    links: [
      { title: "Home", href: "/" },
      { title: "Find Psychologists", href: "/find-psychologists" },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "Sign In", href: "/login" },
      { title: "Get Started", href: "/signup" },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "Forgot Password", href: "/forgot-password" },
    ],
  },
  {
    label: "Social Links",
    links: [
      { title: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
      { title: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
      { title: "Youtube", href: "https://youtube.com", icon: YoutubeIcon },
      { title: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
    ],
  },
];

export function FooterSection() {
  return (
    <footer className="w-full px-6 pb-12">
      <div className="mx-auto w-full max-w-6xl rounded-[48px] border border-border bg-card px-8 py-12 md:px-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)] lg:gap-12">
          <AnimatedContainer className="space-y-4 md:col-span-2 lg:col-span-1">
            <Grid2x2PlusIcon className="size-8 text-foreground" />
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} HealTalk. All rights reserved.
            </p>
          </AnimatedContainer>

          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-foreground">{section.label}</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      {section.label === "Social Links" ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-foreground inline-flex items-center gap-2 transition-all duration-300"
                        >
                          {link.icon && <link.icon className="size-4" />}
                          {link.title}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="hover:text-foreground inline-flex items-center transition-all duration-300"
                        >
                          {link.icon && <link.icon className="size-4" />}
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
};

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
  );
};
