"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState, useSyncExternalStore } from "react";

import { Game } from "@/components/features/game";
import { BOOT_FADE_DURATION_MS } from "@/lib/constants";
import { useAuthStore } from "@/lib/store";

import { BootSequence } from "./BootSequence";
import { FingerprintScanner } from "./FingerprintScanner";
import { Keypad } from "./Keypad";

import type { AuthStage } from "@/lib/store";
import type { JSX } from "react";

type FlowStage = "fingerprint" | "keypad" | "boot" | "game";

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
  const [isBootFading, setIsBootFading] = useState(false);
  const [isBootComplete, setIsBootComplete] = useState(false);

  const getFlowStageFromAuth = (stage: AuthStage): FlowStage => {
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
