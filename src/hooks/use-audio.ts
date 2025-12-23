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

function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    // iOS Safari performs better with 44100 sample rate
    sharedAudioContext = new AudioContextClass({ sampleRate: 44100 });
  }
  return sharedAudioContext;
}

// Resume AudioContext on user interaction (required by browsers)
function ensureAudioContextResumed(): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {
      // Ignore resume errors
    });
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
  const isLoadedRef = useRef(false);
  const isMuted = useGameStore((state) => state.isMuted);

  // Preload and decode audio buffer on mount
  useEffect(() => {
    let isCancelled = false;

    const loadAudio = async (): Promise<void> => {
      try {
        const ctx = getAudioContext();
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        if (!isCancelled) {
          audioBufferRef.current = audioBuffer;
          isLoadedRef.current = true;
        }
      } catch {
        // Fallback: buffer failed to load, play will be silent
      }
    };

    loadAudio();

    return (): void => {
      isCancelled = true;
      // Stop any playing source
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {
          // Ignore if already stopped
        }
        sourceNodeRef.current = null;
      }
    };
  }, [src]);

  const preload = useCallback((): void => {
    // Ensure AudioContext is resumed on user interaction
    ensureAudioContextResumed();
  }, []);

  const play = useCallback((): void => {
    if (!audioBufferRef.current || isMuted) {
      return;
    }

    ensureAudioContextResumed();
    const ctx = getAudioContext();

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
  }, [isMuted, loop, volume]);

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
  }, []);

  return { play, pause, stop, preload };
}
