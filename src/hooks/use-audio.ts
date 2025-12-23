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
  preload: () => void;
}

export function useAudio(
  src: string,
  options: UseAudioOptions = {}
): UseAudioReturn {
  const { loop = false, volume = 1 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadedRef = useRef(false);
  const isMuted = useGameStore((state) => state.isMuted);

  useEffect(() => {
    const audio = new Audio();
    audio.src = src;
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = "auto";
    // iOS Safari optimization: load metadata immediately
    audio.load();
    audioRef.current = audio;

    const handleCanPlayThrough = (): void => {
      isLoadedRef.current = true;
    };

    audio.addEventListener("canplaythrough", handleCanPlayThrough);

    return (): void => {
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src, loop, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const preload = useCallback((): void => {
    if (audioRef.current && !isLoadedRef.current) {
      // Trigger load on user interaction for iOS
      audioRef.current.load();
    }
  }, []);

  const play = useCallback((): void => {
    if (audioRef.current && !isMuted) {
      // Clone for overlapping sounds or reset for looping
      if (!loop && audioRef.current.currentTime > 0) {
        audioRef.current.currentTime = 0;
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay may be blocked by browser
        });
      }
    }
  }, [isMuted, loop]);

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

  return { play, pause, stop, preload };
}
