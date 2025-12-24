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
  decodeAsync: () => Promise<boolean>;
  playAndWait: (durationMs: number) => Promise<void>;
  fadeOut: (durationMs: number) => Promise<void>;
  setVolume: (volume: number) => void;
}

// Shared AudioContext for all sounds (iOS Safari prefers 44100 sample rate)
let sharedAudioContext: AudioContext | null = null;
// Track raw audio data waiting to be decoded
const rawAudioCache = new Map<string, ArrayBuffer>();

// Detect iOS PWA standalone mode - needs special handling
// Must be a function to evaluate lazily (not at module load/SSR time)
function isIOSPWA(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  // Check for iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  // Check for standalone mode (added to homescreen)
  const isStandalone =
    "standalone" in window.navigator &&
    (window.navigator as unknown as { standalone: boolean }).standalone ===
      true;
  return isIOS && isStandalone;
}

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
      // Catch any errors silently - audio will still work via fallback
      void sharedAudioContext.resume().catch(() => {
        // Silent catch - "failed to start audio device" error in PWA mode
        // Audio will still play via HTML Audio fallback
      });
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
 *
 * This function is intentionally aggressive - it always attempts unlock
 * if the context is suspended, because iOS can re-suspend the AudioContext
 * after backgrounding the PWA. Multiple calls are safe.
 */
export function unlockAudio(): void {
  try {
    // Check if existing context is a zombie (closed or broken)
    if (sharedAudioContext) {
      if (sharedAudioContext.state === "closed") {
        // Context is dead, destroy it so we create a fresh one
        sharedAudioContext = null;
      }
    }

    const ctx = initAudioContext();
    if (!ctx) {
      return;
    }

    // If context is running, we're already unlocked
    if (ctx.state === "running") {
      return;
    }

    // Context is suspended or in another state - attempt full unlock
    // Play a silent buffer to trigger audio unlock on iOS
    try {
      const silentBuffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {
      // Buffer creation/playback failed - context might be zombie
      // Destroy and try once more with fresh context
      sharedAudioContext = null;
      const freshCtx = initAudioContext();
      if (freshCtx && freshCtx.state !== "running") {
        void freshCtx.resume().catch(() => {});
      }
    }

    // Explicitly resume the context
    void ctx.resume().catch(() => {
      // Resume failed - fallback audio will be used instead
    });

    // Also unlock HTML Audio by playing a silent data URI
    // This is critical for iOS PWA fallback audio to work
    try {
      const silentAudio = new Audio(
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
      );
      silentAudio.volume = 0;
      void silentAudio.play().catch(() => {
        // Silent catch - this is expected to fail sometimes
      });
    } catch {
      // Silent fail
    }
  } catch {
    // Silent fail - audio just won't work
  }
}

/**
 * Resume AudioContext after PWA returns from background.
 * Should be called on visibilitychange (visible) and pageshow events.
 *
 * On iOS PWA, when the app is closed and reopened, the old AudioContext
 * becomes a "zombie" - it exists in JS memory but the native audio resources
 * are reclaimed. We must destroy it and create fresh on next user gesture.
 */
export function resumeAudioContext(): void {
  if (!sharedAudioContext) {
    return;
  }

  // Try to resume first
  if (sharedAudioContext.state === "suspended") {
    void sharedAudioContext.resume().catch(() => {
      // Resume failed - context might be dead, destroy it
      destroyAudioContext();
    });
  }

  // If context is in "closed" state, it's definitely dead
  if (sharedAudioContext.state === "closed") {
    destroyAudioContext();
  }
}

/**
 * Destroy the current AudioContext to force creation of a fresh one.
 * This is necessary for iOS PWA where the context becomes unusable
 * after the app is backgrounded/closed.
 */
function destroyAudioContext(): void {
  if (sharedAudioContext) {
    try {
      void sharedAudioContext.close();
    } catch {
      // Already closed or invalid
    }
    sharedAudioContext = null;
  }
}

/**
 * Check if the AudioContext is currently in a playable state.
 * Useful for debugging PWA audio issues.
 */
export function getAudioContextState(): AudioContextState | "unavailable" {
  if (!sharedAudioContext) {
    return "unavailable";
  }
  return sharedAudioContext.state;
}

/**
 * Preload and decode critical game audio during countdown.
 * This is the "loading gate" pattern - ensures zero latency on first tap.
 * Must be called after AudioContext is unlocked (during/after user gesture).
 *
 * @param audioPaths - Array of audio paths to preload and decode
 * @returns Promise that resolves when all audio is decoded (or timeout)
 */
export async function preloadGameAudio(audioPaths: string[]): Promise<void> {
  const ctx = initAudioContext();
  if (!ctx) {
    return;
  }

  // Fetch and decode all audio in parallel
  const decodePromises = audioPaths.map(async (src) => {
    try {
      // Fetch if not already cached
      if (!rawAudioCache.has(src)) {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        rawAudioCache.set(src, arrayBuffer);
      }

      // Decode the audio buffer
      const rawData = rawAudioCache.get(src);
      if (rawData && ctx) {
        const clonedData = rawData.slice(0);
        await ctx.decodeAudioData(clonedData);
      }
    } catch {
      // Silent fail - audio will use fallback when played
    }
  });

  // Wait for all with a timeout (don't block game start indefinitely)
  await Promise.race([
    Promise.all(decodePromises),
    new Promise((resolve) => setTimeout(resolve, 2500)), // 2.5s max wait
  ]);
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
  const isFadingRef = useRef(false);
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
      // Skip cleanup if audio is fading - let the fade complete naturally
      if (isFadingRef.current) {
        return;
      }
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

    // Stop any currently playing source before starting new playback
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }

    // Stop any playing fallback audio
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current.currentTime = 0;
    }

    // iOS PWA STANDALONE MODE: Always use HTML5 Audio
    // Web Audio API is unreliable in iOS PWA mode after app is closed/reopened
    // HTML5 Audio is more reliable and works with the mute switch
    if (isIOSPWA()) {
      // Add cache-busting timestamp to prevent iOS from serving stale cached audio
      const cacheBustSrc = `${src}${src.includes("?") ? "&" : "?"}t=${Date.now()}`;
      const newAudio = new Audio(cacheBustSrc);
      newAudio.loop = loop;
      newAudio.volume = volume;
      fallbackAudioRef.current = newAudio;

      void newAudio.play().catch(() => {
        // Play failed - likely no user gesture or audio locked
      });
      return;
    }

    // Non-PWA mode: Try Web Audio API first, fall back to HTML5 Audio
    const ctx = initAudioContext();

    // Start decoding if not already done
    void decodeAudioBuffer();

    // If no AudioContext or buffer not ready, use HTML Audio
    if (!ctx || !audioBufferRef.current) {
      // Add cache-busting for iOS
      const cacheBustSrc = `${src}${src.includes("?") ? "&" : "?"}t=${Date.now()}`;
      const newAudio = new Audio(cacheBustSrc);
      newAudio.loop = loop;
      newAudio.volume = volume;
      fallbackAudioRef.current = newAudio;

      void newAudio.play().catch(() => {
        // Fallback play failed, ignore
      });
      return;
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
      // Web Audio failed, create fresh Audio element for fallback
      // Must create new element during user gesture for iOS compatibility
      const cacheBustSrc = `${src}${src.includes("?") ? "&" : "?"}t=${Date.now()}`;
      const newAudio = new Audio(cacheBustSrc);
      newAudio.loop = loop;
      newAudio.volume = volume;
      fallbackAudioRef.current = newAudio;

      void newAudio.play().catch(() => {
        // Fallback play failed too, ignore
      });
    }
  }, [isMuted, loop, volume, src, decodeAudioBuffer]);

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

  // Decode audio buffer and return a Promise that resolves when ready
  const decodeAsync = useCallback(async (): Promise<boolean> => {
    // Ensure AudioContext exists
    const ctx = initAudioContext();
    if (!ctx) {
      return false;
    }

    // If already decoded, return immediately
    if (audioBufferRef.current) {
      return true;
    }

    // Wait for raw data to be fetched if not already
    let attempts = 0;
    while (!rawAudioCache.has(src) && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      attempts++;
    }

    if (!rawAudioCache.has(src)) {
      return false;
    }

    // Decode the audio
    await decodeAudioBuffer();
    return audioBufferRef.current !== null;
  }, [src, decodeAudioBuffer]);

  // Play audio and wait for it to complete
  const playAndWait = useCallback(
    (durationMs: number): Promise<void> => {
      return new Promise((resolve) => {
        play();
        setTimeout(resolve, durationMs);
      });
    },
    [play]
  );

  // Fade out audio smoothly over duration
  const fadeOut = useCallback(
    (durationMs: number): Promise<void> => {
      return new Promise((resolve) => {
        isFadingRef.current = true;
        const steps = 20;
        const stepDuration = durationMs / steps;
        let currentStep = 0;

        const finishFade = (): void => {
          isFadingRef.current = false;
          stop();
          resolve();
        };

        // Handle Web Audio API gain node fade
        if (gainNodeRef.current && sharedAudioContext) {
          const startVolume = gainNodeRef.current.gain.value;
          const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume * (1 - currentStep / steps);

            if (gainNodeRef.current) {
              gainNodeRef.current.gain.value = Math.max(0, newVolume);
            }

            if (currentStep >= steps) {
              clearInterval(fadeInterval);
              finishFade();
            }
          }, stepDuration);
          return;
        }

        // Handle HTML5 Audio fade
        if (fallbackAudioRef.current) {
          const startVolume = fallbackAudioRef.current.volume;
          const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume * (1 - currentStep / steps);

            if (fallbackAudioRef.current) {
              fallbackAudioRef.current.volume = Math.max(0, newVolume);
            }

            if (currentStep >= steps) {
              clearInterval(fadeInterval);
              finishFade();
            }
          }, stepDuration);
          return;
        }

        // No audio playing, resolve immediately
        isFadingRef.current = false;
        resolve();
      });
    },
    [stop]
  );

  // Set volume dynamically
  const setVolume = useCallback((newVolume: number): void => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume;
    }

    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.volume = clampedVolume;
    }
  }, []);

  return {
    play,
    pause,
    stop,
    preload,
    decodeAsync,
    playAndWait,
    fadeOut,
    setVolume,
  };
}
