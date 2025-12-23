"use client";

import { useCallback, useEffect, useRef } from "react";

import { useGameStore } from "@/lib/store";

interface UseAudioOptions {
  loop?: boolean;
  volume?: number;
}

interface UseAudioReturn {
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export function useAudio(
  src: string,
  options: UseAudioOptions = {}
): UseAudioReturn {
  const { loop = false, volume = 1 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMuted = useGameStore((state) => state.isMuted);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = loop;
    audioRef.current.volume = volume;

    return (): void => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, loop, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const play = useCallback((): void => {
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked by browser
      });
    }
  }, [isMuted]);

  const pause = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, pause, stop };
}
