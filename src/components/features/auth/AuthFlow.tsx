"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { Game } from "@/components/features/game";
import { BOOT_FADE_DURATION_MS } from "@/lib/constants";
import { useAuthStore } from "@/lib/store";

import { BootSequence } from "./BootSequence";
import { FingerprintScanner } from "./FingerprintScanner";
import { Keypad } from "./Keypad";
import { MissionUplink } from "./MissionUplink";

import type { AuthStage } from "@/lib/store";
import type { JSX } from "react";

type FlowStage = "uplink" | "fingerprint" | "keypad" | "boot" | "game";

// Session storage key for tracking uplink completion
const UPLINK_SESSION_KEY = "north-pole-uplink-complete";

/**
 * Check if running as iOS PWA (standalone mode)
 */
function isIOSPWA(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    "standalone" in window.navigator &&
    (window.navigator as unknown as { standalone: boolean }).standalone ===
      true;
  return isIOS && isStandalone;
}

/**
 * Check if uplink has been completed this session
 */
function hasCompletedUplink(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return sessionStorage.getItem(UPLINK_SESSION_KEY) === "true";
}

/**
 * Mark uplink as complete and force a hard reload
 * This reinitializes the audio context on iOS PWA
 * Using cache-busting URL to bypass iOS PWA restore-from-cache behavior
 */
function completeUplinkAndReload(): void {
  sessionStorage.setItem(UPLINK_SESSION_KEY, "true");
  // Force hard reload by navigating to URL with cache-buster
  // This prevents iOS from restoring from bfcache
  const url = new URL(window.location.href);
  url.searchParams.set("_t", Date.now().toString());
  window.location.href = url.toString();
}

const emptySubscribe = (): (() => void) => {
  return () => {};
};

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function AuthFlow(): JSX.Element {
  const isClient = useIsClient();
  const authStage = useAuthStore((state) => state.authStage);
  const setAuthStage = useAuthStore((state) => state.setAuthStage);
  const resetAuth = useAuthStore((state) => state.resetAuth);
  const [isBootFading, setIsBootFading] = useState(false);
  const [isBootComplete, setIsBootComplete] = useState(false);

  // Check if we need to show the uplink screen (iOS PWA only, once per session)
  const needsUplink = isClient && isIOSPWA() && !hasCompletedUplink();

  // Reset auth state when uplink is needed (user restarted PWA)
  useEffect(() => {
    if (needsUplink) {
      resetAuth();
    }
  }, [needsUplink, resetAuth]);

  const getFlowStageFromAuth = (stage: AuthStage): FlowStage => {
    // If on iOS PWA and haven't completed uplink, show uplink first
    if (needsUplink) {
      return "uplink";
    }
    if (stage === "AUTHENTICATED") {
      return "game";
    }
    if (stage === "BOOTING") {
      return "boot";
    }
    if (stage === "SCANNED") {
      return "keypad";
    }
    return "fingerprint";
  };

  const flowStage = getFlowStageFromAuth(authStage);

  // Handle uplink initialization - reload the page to fix iOS PWA audio
  const handleUplinkInitialize = useCallback((): void => {
    completeUplinkAndReload();
  }, []);

  const handleScanComplete = useCallback((): void => {
    setAuthStage("SCANNED");
  }, [setAuthStage]);

  const handleKeypadSuccess = useCallback((): void => {
    setAuthStage("BOOTING");
  }, [setAuthStage]);

  // Handle boot sequence completion - start fade out
  const handleBootComplete = useCallback((): void => {
    setIsBootFading(true);

    // After fade animation completes, mark boot as complete and update auth
    setTimeout(() => {
      setIsBootComplete(true);
      setAuthStage("AUTHENTICATED");
    }, BOOT_FADE_DURATION_MS);
  }, [setAuthStage]);

  const getStageKey = (stage: AuthStage | FlowStage): string => {
    if (stage === "uplink") {
      return "uplink";
    }
    if (
      stage === "BOOTING" ||
      stage === "AUTHENTICATED" ||
      stage === "boot" ||
      stage === "game"
    ) {
      return "boot";
    }
    if (stage === "SCANNED" || stage === "keypad") {
      return "keypad";
    }
    return "fingerprint";
  };

  if (!isClient) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="bg-terminal-green/20 h-8 w-8 animate-pulse rounded-full" />
      </div>
    );
  }

  // Boot/Game phase - Game is mounted behind BootSequence
  if (flowStage === "boot" || flowStage === "game") {
    return (
      <div className="relative h-svh w-full overflow-hidden overscroll-none">
        {/* Game layer - always mounted when in boot/game phase, starts behind boot */}
        <div className="absolute inset-0 z-0">
          <Game />
        </div>

        {/* Boot sequence overlay - fades out to reveal game */}
        <AnimatePresence>
          {!isBootComplete && (
            <motion.div
              key="boot-overlay"
              initial={{ opacity: 1 }}
              animate={{ opacity: isBootFading ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: BOOT_FADE_DURATION_MS / 1000 }}
              className="bg-midnight absolute inset-0 z-10"
            >
              <BootSequence onComplete={handleBootComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Uplink stage - iOS PWA only, shown before fingerprint
  if (flowStage === "uplink") {
    return <MissionUplink onInitialize={handleUplinkInitialize} />;
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden overscroll-none">
      <AnimatePresence mode="wait">
        {flowStage === "fingerprint" && (
          <motion.div
            key={getStageKey(flowStage)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <FingerprintScanner onScanComplete={handleScanComplete} />
          </motion.div>
        )}

        {flowStage === "keypad" && (
          <motion.div
            key={getStageKey(flowStage)}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <Keypad onSuccess={handleKeypadSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
