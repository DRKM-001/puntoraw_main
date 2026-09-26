"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface TeamCardProps {
  name: string;
  role: string;
  imageUrl?: string;
  pixelUrl?: string;
  videoUrl?: string;
  initials: string;
  coffeeUrl?: string;
  coffeeLabel?: string;
  coffeeColor?: "yellow" | "blue";
  /** Living profile page */
  profileHref?: string;
}

export function TeamCard({
  name,
  role,
  imageUrl,
  pixelUrl,
  videoUrl,
  initials,
  coffeeUrl,
  coffeeLabel = "Buy me a coffee",
  coffeeColor = "yellow",
  profileHref,
}: TeamCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className={`group relative rounded-xl overflow-hidden aspect-[3/4] ${profileHref ? "cursor-pointer" : "cursor-default"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Layer 1: Real photo (bottom) */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <span className="text-5xl font-bold text-white/30">{initials}</span>
        </div>
      )}

      {/* Layer 2: Looping video (if available) — fades in on hover */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out z-[5] ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Layer 3: Pixel art (top) — fades out on hover to reveal video or photo */}
      {pixelUrl && (
        <Image
          src={pixelUrl}
          alt={`${name} pixel art`}
          fill
          className={`object-cover transition-opacity duration-700 ease-in-out z-10 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20" />

      {/* Whole card opens the living profile (the coffee link sits above it) */}
      {profileHref && (
        <Link href={profileHref} aria-label={`Perfil de ${name}`} className="absolute inset-0 z-[25]" />
      )}

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-2 z-30 pointer-events-none">
        <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
          {name}
        </h3>
        <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 hidden sm:block">
          {role}
        </p>
        {profileHref && (
          <p className="text-[10px] sm:text-xs font-medium text-white/80 mt-1.5 sm:mt-2 group-hover:text-white">
            Perfil vivo →
          </p>
        )}
        {coffeeUrl && (
          <a
            href={coffeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`pointer-events-auto relative inline-flex items-center gap-1 mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-medium transition-colors ${
              coffeeColor === "blue"
                ? "text-blue-400 hover:text-blue-300"
                : "text-yellow-400 hover:text-yellow-300"
            }`}
          >
            <span>{coffeeLabel}</span>
          </a>
        )}
      </div>
    </div>
  );
}
