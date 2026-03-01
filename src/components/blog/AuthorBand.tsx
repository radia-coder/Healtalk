import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Author } from "@/lib/types";
import { Linkedin } from "lucide-react";

interface AuthorBandProps {
  author: Author;
}

export function AuthorBand({ author }: AuthorBandProps) {
  return (
    <div className="w-full bg-[#C4EAB2] px-4"> {/* Pastel Green Band */}
      <div className="max-w-[1632px] h-[450px] mx-auto flex items-center justify-center">
        <div className="max-w-[956px] mx-auto">
          <div className="bg-[#E1F4D7] rounded-[24px] p-8 md:p-10 shadow-sm h-[287px] flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Author Info */}
            <div className="flex-1 space-y-4">
                <div>
                    <h3 className="text-[32px] leading-[37px] font-bold text-[#131E0D] font-heading">{author.name}</h3>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a]/60 mt-1">{author.role}</p>
                </div>
                <p className="text-[20px] leading-[25px] font-normal text-[#131E0D] font-heading">
                    {author.bio}
                </p>
                <div className="pt-2">
                    <Link href={author.linkedinUrl} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#1a1a1a] hover:underline decoration-1 underline-offset-4">
                        <Linkedin size={16} />
                        <span>{author.socialLabel || "LinkedIn"}</span>
                    </Link>
                </div>
            </div>

            {/* Author Photo */}
            <div className="shrink-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[20px] overflow-hidden bg-gray-200">
                    <Image
                        src={author.imageUrl}
                        alt={author.name}
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
