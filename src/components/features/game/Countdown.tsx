"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { COUNTDOWN_INTERVAL_MS, COUNTDOWN_STEPS } from "@/lib/constants";

import type { JSX } from "react";

export interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const hasCompletedRef = useRef(false);

  // Progress through countdown steps
  useEffect(() => {
    if (hasCompletedRef.current) {
      return;
    }

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
  }, [currentStep, onComplete]);

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
