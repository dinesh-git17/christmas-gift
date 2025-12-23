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

// Shared AudioContext for all sounds (iOS Safari prefers 44100 sample rate)
let sharedAudioContext: AudioContext | null = null;
// Track raw audio data waiting to be decoded
const rawAudioCache = new Map<string, ArrayBuffer>();
// Track if audio has been unlocked (especially important for PWA mode)
let isAudioUnlocked = false;

// Create and resume AudioContext - MUST be called during user gesture on iOS Safari
function initAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      // iOS Safari performs better with 44100 sample rate
      sharedAudioContext = new AudioContextClass({ sampleRate: 44100 });
    }

    // Resume if suspended (must happen in same call stack as user gesture)
    if (sharedAudioContext.state === "suspended") {
      // Use void to handle promise without await (gesture must be sync)
      void sharedAudioContext.resume();
    }

    return sharedAudioContext;
  } catch {
    // AudioContext creation failed
    return null;
  }
}

/**
 * Unlock audio for iOS PWA mode.
 * Must be called during a user gesture (touch/click).
 * Plays a silent buffer to fully unlock the AudioContext.
 */
export function unlockAudio(): void {
  if (isAudioUnlocked) {
    return;
  }

  try {
    const ctx = initAudioContext();
    if (!ctx) {
      return;
    }

    // Create and play a silent buffer to unlock audio on iOS PWA
    const silentBuffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = silentBuffer;
    source.connect(ctx.destination);
    source.start(0);

    // Also try to resume the context explicitly
    if (ctx.state === "suspended") {
      void ctx.resume().then(() => {
        isAudioUnlocked = true;
      });
    } else {
      isAudioUnlocked = true;
    }
  } catch {
    // Silent fail - audio just won't work
  }
}

export function useAudio(
  src: string,
  options: UseAudioOptions = {}
): UseAudioReturn {
  const { loop = false, volume = 1 } = options;
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const isDecodingRef = useRef(false);
  const isMuted = useGameStore((state) => state.isMuted);

  // Pre-fetch raw audio data on mount (doesn't need AudioContext)
  useEffect(() => {
    const prefetchAudio = async (): Promise<void> => {
      if (rawAudioCache.has(src)) {
        return;
      }

      try {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        rawAudioCache.set(src, arrayBuffer);
      } catch {
        // Fetch failed, will use fallback
      }
    };

    void prefetchAudio();

    // Also create fallback HTML Audio element for iOS Safari first play
    fallbackAudioRef.current = new Audio(src);
    fallbackAudioRef.current.preload = "auto";
    fallbackAudioRef.current.loop = loop;
    fallbackAudioRef.current.volume = volume;

    return (): void => {
      // Stop any playing source on unmount
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {
          // Ignore if already stopped
        }
        sourceNodeRef.current = null;
      }
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.pause();
        fallbackAudioRef.current = null;
      }
    };
  }, [src, loop, volume]);

  // Decode raw audio data into AudioBuffer
  const decodeAudioBuffer = useCallback(async (): Promise<void> => {
    if (
      audioBufferRef.current ||
      isDecodingRef.current ||
      !sharedAudioContext
    ) {
      return;
    }

    const rawData = rawAudioCache.get(src);
    if (!rawData) {
      return;
    }

    isDecodingRef.current = true;

    try {
      // Clone the ArrayBuffer since decodeAudioData detaches it
      const clonedData = rawData.slice(0);
      const audioBuffer = await sharedAudioContext.decodeAudioData(clonedData);
      audioBufferRef.current = audioBuffer;
    } catch {
      // Decode failed, will continue using fallback
    } finally {
      isDecodingRef.current = false;
    }
  }, [src]);

  const preload = useCallback((): void => {
    // Initialize AudioContext on user gesture - this unlocks audio on iOS Safari
    initAudioContext();
    void decodeAudioBuffer();
  }, [decodeAudioBuffer]);

  const play = useCallback((): void => {
    if (isMuted) {
      return;
    }

    // Initialize AudioContext on user gesture - this is the key fix for iOS Safari
    const ctx = initAudioContext();

    // Start decoding if not already done
    void decodeAudioBuffer();

    // If no AudioContext or buffer not ready, use HTML Audio fallback
    if (!ctx || !audioBufferRef.current) {
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.currentTime = 0;
        void fallbackAudioRef.current.play().catch(() => {
          // Fallback play failed, ignore
        });
      }
      return;
    }

    // Stop fallback if it was playing
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current.currentTime = 0;
    }

    try {
      // Create new source node for each play (required by Web Audio API)
      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.loop = loop;

      // Create gain node for volume control
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;

      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Store refs for stop/pause
      sourceNodeRef.current = source;
      gainNodeRef.current = gainNode;

      // Start immediately (0 = now)
      source.start(0);

      // Clean up when sound ends (for non-looping sounds)
      if (!loop) {
        source.onended = (): void => {
          sourceNodeRef.current = null;
        };
      }
    } catch {
      // Web Audio failed, try fallback
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.currentTime = 0;
        void fallbackAudioRef.current.play().catch(() => {
          // Fallback play failed too, ignore
        });
      }
    }
  }, [isMuted, loop, volume, decodeAudioBuffer]);

  const pause = useCallback((): void => {
    // Web Audio API doesn't have pause - must stop and recreate
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
    // Also pause fallback audio
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
    }
  }, []);

  const stop = useCallback((): void => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
    // Also stop fallback audio
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current.currentTime = 0;
    }
  }, []);

  return { play, pause, stop, preload };
}
