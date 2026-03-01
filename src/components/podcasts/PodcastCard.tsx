"use client";

import React from "react";
import Link from "next/link";
import { PodcastEpisode } from "@/lib/types";

interface PodcastCardProps {
  episode: PodcastEpisode;
}

export function PodcastCard({ episode }: PodcastCardProps) {
  return (
    <div className="group flex flex-col gap-5 bg-[#FBF9F6] p-4 rounded-[18px] w-full md:w-[450px] h-auto md:h-[600px]">
      {/* Cover Block */}
      <div className="relative w-full aspect-square md:aspect-auto md:h-[396px] bg-[#d5f0c0] rounded-[16px] flex flex-col items-center justify-between py-6 overflow-hidden shrink-0">
        {/* Top Text */}
        <span className="font-display text-2xl text-[#1a1a1a]">HealTalk</span>

        {/* Center Illustration — simple mind/heart icon */}
        <div className="w-28 h-28 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Brain outline — simplified two-lobe shape */}
            <ellipse cx="38" cy="52" rx="18" ry="22" fill="white" stroke="#1a1a1a" strokeWidth="2.5"/>
            <ellipse cx="62" cy="52" rx="18" ry="22" fill="white" stroke="#1a1a1a" strokeWidth="2.5"/>
            <rect x="44" y="30" width="12" height="44" fill="#d5f0c0"/>
            <line x1="50" y1="30" x2="50" y2="74" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Sparkle */}
            <circle cx="72" cy="28" r="4" fill="#408954"/>
            <circle cx="28" cy="30" r="2.5" fill="#408954"/>
          </svg>
        </div>

        {/* Bottom Text */}
        <span className="font-display text-sm text-[#1a1a1a]">Wellness</span>
      </div>

      {/* Info Block */}
      <div className="flex flex-col gap-3 px-1 flex-grow">
        {/* Episode Number + Host */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="border border-[#1a1a1a]/20 px-2 py-[2px] rounded-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]">
              Ep. {episode.episodeNumber}
            </span>
          </div>
          {episode.host && (
            <span className="text-[11px] text-[#555] font-medium">{episode.host}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1a1a1a] leading-tight line-clamp-2">
          {episode.title}
        </h3>

        {/* Description */}
        {episode.description && (
          <p className="text-[13px] text-[#555] leading-snug line-clamp-3">
            {episode.description}
          </p>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 mt-auto pt-2">
          <Link
            href={episode.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 group/link"
          >
            {/* Official Spotify logo */}
            <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#1a1a1a] group-hover/link:underline">
              Spotify
            </span>
          </Link>

          <Link
            href={episode.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 group/link"
          >
            {/* Official YouTube logo */}
            <div className="w-6 h-6 rounded-[5px] bg-[#FF0000] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#1a1a1a] group-hover/link:underline">
              YouTube
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
