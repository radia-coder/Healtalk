"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { SelectionCard } from "@/components/onboarding/SelectionCard";
import { NextButton } from "@/components/onboarding/NextButton";

const FREQUENCY_OPTIONS = [
  "Weekly",
  "Every two weeks",
  "Monthly",
  "Flexible",
];

const STEPS = ["Reasons", "Focus", "Style", "Schedule"];

function StepFlow({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-8 flex w-full items-center justify-center px-1">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const isDone = num < current;
        const isActive = num === current;

        return (
          <div key={label} className="flex items-center">
            <div className="flex w-[54px] flex-col items-center gap-1 sm:w-[60px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isDone
                    ? "bg-[#408954] text-white"
                    : isActive
                    ? "bg-[#b0e09e] text-black"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isDone ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold">{num}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  isActive ? "text-black" : isDone ? "text-[#408954]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-[2px] mb-5 transition-colors ${
                  num < current ? "bg-[#408954]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingStep4() {
  const router = useRouter();
  const { status } = useSession();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleToggle = (option: string) => {
    setSelectedOption((prev) => (prev === option ? null : option));
  };

  const handleNext = () => {
    if (status === "authenticated") {
      // Already logged in — go straight to the therapist directory.
      router.push("/find-psychologists");
    } else {
      // Not logged in — send to login, then redirect back to find-psychologists.
      router.push("/login?redirect=/find-psychologists");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F2EA]">
      <OnboardingHeader progress={90} />

      <div className="flex-1 flex w-full flex-col items-center px-4 pt-16 pb-28 sm:px-8 sm:pt-20">
        <h1 className="mb-6 px-2 text-center font-figtree text-[20px] font-medium leading-tight text-black">
          How often do you want to meet?
        </h1>

        <StepFlow current={4} />

        <div className="flex w-full max-w-[560px] flex-col items-center gap-4">
          {FREQUENCY_OPTIONS.map((option) => (
            <SelectionCard
              key={option}
              label={option}
              selected={selectedOption === option}
              onToggle={() => handleToggle(option)}
            />
          ))}
        </div>
      </div>

      <NextButton show={selectedOption !== null} onClick={handleNext} />
    </div>
  );
}
