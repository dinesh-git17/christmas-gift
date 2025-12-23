"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import { useAuthStore } from "@/lib/store";

import { BootSequence } from "./BootSequence";
import { FingerprintScanner } from "./FingerprintScanner";
import { Keypad } from "./Keypad";

import type { AuthStage } from "@/lib/store";
import type { JSX } from "react";

type FlowStage = "fingerprint" | "keypad" | "boot";

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
  const router = useRouter();
  const isClient = useIsClient();
  const authStage = useAuthStore((state) => state.authStage);
  const setAuthStage = useAuthStore((state) => state.setAuthStage);

  const getFlowStageFromAuth = (stage: AuthStage): FlowStage => {
    if (stage === "BOOTING" || stage === "AUTHENTICATED") {
      return "boot";
    }
    if (stage === "SCANNED") {
      return "keypad";
    }
    return "fingerprint";
  };

  const flowStage = getFlowStageFromAuth(authStage);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (authStage === "AUTHENTICATED") {
      router.push("/game");
    }
  }, [authStage, isClient, router]);

  const handleScanComplete = useCallback((): void => {
    setAuthStage("SCANNED");
  }, [setAuthStage]);

  const handleKeypadSuccess = useCallback((): void => {
    setAuthStage("BOOTING");
  }, [setAuthStage]);

  const getStageKey = (stage: AuthStage | FlowStage): string => {
    if (stage === "BOOTING" || stage === "AUTHENTICATED" || stage === "boot") {
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

  if (flowStage === "boot") {
    return <BootSequence />;
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
