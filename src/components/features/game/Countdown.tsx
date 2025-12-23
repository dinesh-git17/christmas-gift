"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AUDIO_PATHS,
  COUNTDOWN_INTERVAL_MS,
  COUNTDOWN_STEPS,
} from "@/lib/constants";
import { useGameStore } from "@/lib/store";

import type { JSX } from "react";

export interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const hasCompletedRef = useRef(false);
  const isMuted = useGameStore((state) => state.isMuted);

  // Audio refs
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const goAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    beepAudioRef.current = new Audio(AUDIO_PATHS.COUNTDOWN_BEEP);
    goAudioRef.current = new Audio(AUDIO_PATHS.COUNTDOWN_GO);

    beepAudioRef.current.volume = 0.3;
    goAudioRef.current.volume = 0.5;

    return (): void => {
      beepAudioRef.current = null;
      goAudioRef.current = null;
    };
  }, []);

  // Play audio for current step
  const playStepAudio = useCallback(
    (step: number): void => {
      if (isMuted) {
        return;
      }

      const isLastStep = step === COUNTDOWN_STEPS.length - 1;
      const audio = isLastStep ? goAudioRef.current : beepAudioRef.current;

      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Ignore audio play errors (e.g., user hasn't interacted yet)
        });
      }
    },
    [isMuted]
  );

  // Progress through countdown steps
  useEffect(() => {
    if (hasCompletedRef.current) {
      return;
    }

    // Play audio for current step
    playStepAudio(currentStep);

    // If we've reached the last step, wait for it to display then complete
    if (currentStep >= COUNTDOWN_STEPS.length - 1) {
      const timeout = setTimeout(() => {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onComplete();
        }
      }, COUNTDOWN_INTERVAL_MS);

      return (): void => {
        clearTimeout(timeout);
      };
    }

    // Move to next step
    const timeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, COUNTDOWN_INTERVAL_MS);

    return (): void => {
      clearTimeout(timeout);
    };
  }, [currentStep, onComplete, playStepAudio]);

  const currentText = COUNTDOWN_STEPS[currentStep];
  const isLastStep = currentStep === COUNTDOWN_STEPS.length - 1;

  return (
    <div className="bg-midnight/60 absolute inset-0 z-50 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className={`font-mono font-bold ${
            isLastStep
              ? "text-romance-gold text-5xl sm:text-7xl"
              : "text-terminal-green text-6xl sm:text-8xl"
          }`}
        >
          {currentText}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
