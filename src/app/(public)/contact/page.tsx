import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact HealTalk | Support",
  description: "Get help, ask questions, or reach the HealTalk team.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-bold text-foreground mb-6">
          Contact HealTalk
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          We are here to help. Reach out anytime with questions or support needs.
        </p>

        <div className="space-y-5 text-text-secondary leading-relaxed">
          <p>
            Email:{" "}
            <a className="text-primary hover:underline" href="mailto:support@healtalk.com">
              support@healtalk.com
            </a>
          </p>
          <p>Phone: 1-800-555-0145</p>
          <p>Hours: Monday–Friday, 9:00 AM–6:00 PM (local time)</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/find-psychologists"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black hover:bg-primary/90"
          >
            Find a therapist
          </Link>
          <Link
            href="/onboarding/step-1"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-background"
          >
            Get started
          </Link>
        </div>
      </div>
    </main>
  );
}
