"use client";

import { useEffect } from "react";

import { unlockAudio, resumeAudioContext } from "@/hooks";

import type { JSX, ReactNode } from "react";

export interface AudioProviderProps {
  children: ReactNode;
}

/**
 * Global audio provider that handles iOS PWA audio unlock and lifecycle events.
 *
 * This provider:
 * 1. Attaches global touchstart/click listeners to unlock audio on first interaction
 * 2. Handles visibilitychange to resume audio when PWA returns from background
 * 3. Handles pageshow event for PWA-specific background/foreground transitions
 * 4. Handles focus event for when PWA window regains focus
 *
 * Must wrap the app at the layout level to ensure audio works across all pages.
 */
export function AudioProvider({ children }: AudioProviderProps): JSX.Element {
  useEffect(() => {
    // Global unlock on user interaction
    // Using passive: true for better scroll performance
    // Not using { once: true } because iOS may need re-unlock after backgrounding
    const handleUserInteraction = (): void => {
      unlockAudio();
    };

    // Handle PWA returning from background
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        // PWA has returned to foreground - attempt to resume/recreate audio context
        resumeAudioContext();
      }
    };

    // Handle PWA-specific page show event (fires when app is restored from bfcache)
    const handlePageShow = (event: PageTransitionEvent): void => {
      // Always try to resume on pageshow, not just when persisted
      // iOS PWA may not set persisted correctly
      resumeAudioContext();
      if (event.persisted) {
        // Page was restored from bfcache - extra resume attempt
        resumeAudioContext();
      }
    };

    // Handle window focus - iOS PWA may regain focus without visibility change
    const handleFocus = (): void => {
      resumeAudioContext();
    };

    // Attach listeners
    // Both touchstart AND touchend are needed for iOS compatibility
    // touchstart: iOS 6-8, touchend: iOS 9+
    document.addEventListener("touchstart", handleUserInteraction, {
      passive: true,
    });
    document.addEventListener("touchend", handleUserInteraction, {
      passive: true,
    });
    document.addEventListener("click", handleUserInteraction, {
      passive: true,
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);

    // Also try to resume on initial mount (in case we're reopening the PWA)
    resumeAudioContext();

    // Cleanup on unmount
    return (): void => {
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("touchend", handleUserInteraction);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return <>{children}</>;
}
