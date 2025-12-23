"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAudio } from "@/hooks/use-audio";
import {
  AUDIO_PATHS,
  HAPTIC_DURATION_MS,
  SCAN_DURATION_MS,
} from "@/lib/constants";

import { FingerprintIcon } from "./FingerprintIcon";

import type { JSX } from "react";

export interface FingerprintScannerProps {
  onScanComplete: () => void;
}

type ScanState = "idle" | "scanning" | "success";

export function FingerprintScanner({
  onScanComplete,
}: FingerprintScannerProps): JSX.Element {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const scanAudio = useAudio(AUDIO_PATHS.SCAN_HOLOGRAM, { loop: true });
  const successAudio = useAudio(AUDIO_PATHS.SUCCESS_UNLOCK);

  const cancelAnimation = useCallback((): void => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const triggerHaptic = useCallback((): void => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(HAPTIC_DURATION_MS);
    }
  }, []);

  const handleScanComplete = useCallback((): void => {
    cancelAnimation();
    setScanState("success");
    setProgress(100);
    scanAudio.stop();
    successAudio.play();
    triggerHaptic();

    setTimeout(() => {
      onScanComplete();
    }, 500);
  }, [cancelAnimation, onScanComplete, scanAudio, successAudio, triggerHaptic]);

  const handlePressStart = useCallback((): void => {
    if (scanState === "success") {
      return;
    }

    setScanState("scanning");
    startTimeRef.current = performance.now();
    lastUpdateRef.current = 0;
    scanAudio.play();

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTimeRef.current;
      const newProgress = Math.min((elapsed / SCAN_DURATION_MS) * 100, 100);

      // Only update state every ~50ms to reduce re-renders
      if (currentTime - lastUpdateRef.current > 50) {
        lastUpdateRef.current = currentTime;
        setProgress(newProgress);
      }

      if (newProgress >= 100) {
        handleScanComplete();
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [scanState, scanAudio, handleScanComplete]);

  const handlePressEnd = useCallback((): void => {
    if (scanState === "success") {
      return;
    }

    cancelAnimation();
    setScanState("idle");
    setProgress(0);
    scanAudio.stop();
  }, [scanState, cancelAnimation, scanAudio]);

  useEffect(() => {
    return (): void => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  const getIconColorClass = (): string => {
    switch (scanState) {
      case "idle":
        return "text-white/50";
      case "scanning":
        return "text-terminal-green";
      case "success":
        return "text-terminal-green drop-shadow-[0_0_20px_rgba(0,255,65,0.8)]";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <p className="font-mono text-sm tracking-widest text-white/60 uppercase">
        Place finger to authenticate
      </p>

      <div
        className="relative flex h-40 w-40 cursor-pointer items-center justify-center select-none"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
      >
        {/* Outer ring with progress */}
        <svg className="absolute h-full w-full" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle
            cx="80"
            cy="80"
            r="75"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          {/* Progress ring */}
          <circle
            cx="80"
            cy="80"
            r="75"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 75}
            strokeDashoffset={2 * Math.PI * 75 * (1 - progress / 100)}
            className="text-terminal-green"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              transition: "stroke-dashoffset 80ms linear",
              willChange: "stroke-dashoffset",
            }}
          />
        </svg>

        {/* Fingerprint icon */}
        <motion.div
          animate={
            scanState === "scanning"
              ? {
                  scale: [1, 1.02, 1],
                }
              : {}
          }
          transition={{
            duration: 0.5,
            repeat: scanState === "scanning" ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <FingerprintIcon
            className={`h-20 w-20 transition-colors duration-300 ${getIconColorClass()}`}
          />
        </motion.div>

        {/* Scan beam */}
        <AnimatePresence>
          {scanState === "scanning" && (
            <motion.div
              initial={{ top: "20%", opacity: 0 }}
              animate={{
                top: ["20%", "80%", "20%"],
                opacity: [0.8, 0.8, 0.8],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="via-terminal-green absolute left-1/2 h-0.5 w-16 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Success glow effect */}
        <AnimatePresence>
          {scanState === "success" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-terminal-green/30 absolute inset-0 rounded-full"
            />
          )}
        </AnimatePresence>
      </div>

      <p className="text-terminal-green/80 h-5 font-mono text-xs">
        {scanState === "scanning" && `Scanning... ${Math.round(progress)}%`}
        {scanState === "success" && "Access Granted"}
      </p>
    </div>
  );
}
