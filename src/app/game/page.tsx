"use client";

import { useEffect } from "react";

import { Game } from "@/components/features/game";
import { useAudio } from "@/hooks";
import { AUDIO_PATHS, ROOM_ASSETS, ROOM_TIMING } from "@/lib/constants";

import type { JSX } from "react";

/**
 * Preload images by creating Image objects.
 * Browser caches them for instant display on room page.
 */
function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

export default function GamePage(): JSX.Element {
  // Preload lofi music so it's ready for room page
  const lofiMusic = useAudio(AUDIO_PATHS.LOFI_CHRISTMAS, {
    loop: true,
    volume: ROOM_TIMING.MUSIC_VOLUME,
  });

  // Preload room assets on mount for smooth transition after game
  useEffect(() => {
    preloadImages(Object.values(ROOM_ASSETS));
    lofiMusic.preload();
  }, [lofiMusic]);

  return (
    <main className="h-svh w-full overflow-hidden">
      <Game />
    </main>
  );
}
