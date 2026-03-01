import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CTASection() {
  return (
    <div className="px-6 pb-12 pt-14 text-center md:px-12 lg:px-16 lg:pt-16">
      {/* Logo */}
      <div className="flex justify-center pb-6">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/images/New_Logo.png"
            alt="HealTalk logo"
            width={140}
            height={48}
            className="h-12 w-auto"
          />
        </Link>
      </div>

      {/* Headline */}
      <h2 className="text-[32px] font-bold leading-tight text-[#1f2937] md:text-[40px] lg:text-[46px]">
        Book a session that fits your life
      </h2>

      {/* Subtitle */}
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#667085] md:text-lg">
        Talk with a licensed therapist in a safe, private space
        <br className="hidden sm:block" />
        on your schedule.
      </p>

      {/* CTA Button */}
      <Link href="/find-psychologists">
        <Button
          size="lg"
          className="mt-8 h-12 rounded-full bg-primary px-7 text-base font-semibold text-black shadow-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background has-[>svg]:px-7"
        >
          Find a therapist
          <ArrowRight className="size-5" />
        </Button>
      </Link>
    </div>
  );
}
