import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HealTalk | Online Therapy & Licensed Psychologists",
  description: "Find a therapist you trust. Private, supportive care on your schedule.",
};

// Lazy load components that are below the fold
const FeaturesAccordion = dynamic(() => import("@/components/home/FeaturesAccordion"), {
  loading: () => <div className="h-96" />
});
const FeaturedPsychologists = dynamic(() => import("@/components/home/FeaturedPsychologists"), {
  loading: () => <div className="h-96" />
});
const WhyChoosePsyConnect = dynamic(() => import("@/components/home/WhyChoosePsyConnect"), {
  loading: () => <div className="h-96" />
});
const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
  loading: () => <div className="h-96" />
});

export default function Home() {
  return (
    <main className="m-0 p-0 w-full overflow-x-hidden">
      <HeroSection />
      <FeaturesAccordion />
      <Testimonials />
      <FeaturedPsychologists />
      <WhyChoosePsyConnect />
    </main>
  );
}
