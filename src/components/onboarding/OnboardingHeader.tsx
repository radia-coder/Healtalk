import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

interface OnboardingHeaderProps {
  progress: number;
}

export function OnboardingHeader({ progress }: OnboardingHeaderProps) {
  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-5 px-4 pt-14 pb-5 sm:px-6 sm:pt-16">
      {/* HealTalk logo */}
      <div className="flex items-center justify-center">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/images/New_Logo.png"
            alt="HealTalk logo"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Progress Row */}
      <div className="mb-0 flex w-full items-center gap-3 sm:gap-4">
        {/* Progress Bar - Custom Pill */}
        <div className="h-[10px] flex-1 bg-[#c7c7ff] rounded-full overflow-hidden relative">
            {/* Filled portion - Dynamic */}
            <div 
              className="absolute top-0 left-0 h-full bg-[#9393ff] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }} 
            />
        </div>

        {/* User Icon Button */}
        <button
          type="button"
          aria-label="Profile"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#9393ff] shadow-sm sm:h-12 sm:w-12"
        >
          <User className="h-5 w-5 text-white sm:h-6 sm:w-6" />
        </button>
      </div>
    </div>
  );
}
