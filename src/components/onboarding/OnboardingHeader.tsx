import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

interface OnboardingHeaderProps {
  progress: number;
}

export function OnboardingHeader({ progress }: OnboardingHeaderProps) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 pt-2 pb-4">
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
      <div className="flex items-center gap-4 w-full px-4 mb-0">
        {/* Progress Bar - Custom Pill */}
        <div className="h-[10px] flex-1 bg-[#c7c7ff] rounded-full overflow-hidden relative">
            {/* Filled portion - Dynamic */}
            <div 
              className="absolute top-0 left-0 h-full bg-[#9393ff] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }} 
            />
        </div>

        {/* User Icon Button */}
        <button className="flex-shrink-0 w-[48px] h-[48px] bg-[#9393ff] rounded-xl flex items-center justify-center shadow-sm">
          <User className="text-white w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
