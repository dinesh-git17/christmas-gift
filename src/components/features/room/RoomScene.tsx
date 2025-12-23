"use client";

/* eslint-disable @next/next/no-img-element -- Room sprites require precise positioning with percentage-based absolute layout */

import confetti from "canvas-confetti";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

import { useAudio } from "@/hooks/use-audio";
import { AUDIO_PATHS, ROOM_ASSETS } from "@/lib/constants";

import type { JSX } from "react";

/** Scene step representing the narrative timeline */
export type SceneStep = 0 | 1 | 2 | 3 | 4;

/** Animation timing constants - slowed down for cinematic feel */
const TIMING = {
  // Initial scene
  ROOM_FADE_DURATION: 2,
  STEP_0_HOLD: 3000, // Hold first message before Carolina appears

  // Carolina entrance
  CAROLINA_FADE_DELAY: 0.5,
  CAROLINA_FADE_DURATION: 1.2,
  STEP_1_HOLD: 2500, // Let Carolina's appearance breathe

  // Walk to couch
  CAROLINA_WALK_DELAY: 0.3,
  CAROLINA_WALK_DURATION: 4, // Slower walk

  // Together scene
  STEP_3_HOLD: 4000, // Hold romantic message before showing hint
  DINN_BREATHE_DURATION: 2.5,

  // Glow animation
  DINN_GLOW_DURATION: 2,
} as const;

/** Breathing animation keyframes */
const breatheAnimation = {
  scaleY: [1, 1.02, 1],
  translateY: [0, -2, 0],
};

/** Carolina's entrance and walk animation variants */
const carolinaVariants: Variants = {
  initial: {
    opacity: 0,
    x: 180,
    y: 100,
  },
  enter: {
    opacity: 1,
    x: 180,
    y: 100,
    transition: {
      duration: TIMING.CAROLINA_FADE_DURATION,
      delay: TIMING.CAROLINA_FADE_DELAY,
      ease: "easeOut",
    },
  },
  walkToCouch: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: TIMING.CAROLINA_WALK_DURATION,
      delay: TIMING.CAROLINA_WALK_DELAY,
      ease: "easeInOut",
    },
  },
};

export interface RoomSceneProps {
  className?: string;
  onStepChange?: (step: SceneStep) => void;
  onDinnClick?: () => void;
  hasReadLetter?: boolean;
  hasUnlockedGame?: boolean;
  isLetterOpen?: boolean;
}

export function RoomScene({
  className = "",
  onStepChange,
  onDinnClick,
  hasReadLetter = false,
  hasUnlockedGame = false,
  isLetterOpen = false,
}: RoomSceneProps): JSX.Element {
  const [animationPhase, setAnimationPhase] = useState<
    "waiting" | "entering" | "walking" | "together" | "interactive"
  >("waiting");

  // Confetti celebration sound
  const confettiSound = useAudio(AUDIO_PATHS.COLLECT, { volume: 0.5 });

  const advanceStep = useCallback(
    (newStep: SceneStep): void => {
      onStepChange?.(newStep);
    },
    [onStepChange]
  );

  // Step 0 -> Step 1: Initial hold, then Carolina appears
  useEffect(() => {
    const step1Timer = setTimeout(() => {
      advanceStep(1);
      setAnimationPhase("entering");
    }, TIMING.STEP_0_HOLD);

    return (): void => {
      clearTimeout(step1Timer);
    };
  }, [advanceStep]);

  // Step 1 -> Step 2: Let Carolina's appearance breathe, then walk
  useEffect(() => {
    if (animationPhase !== "entering") {
      return;
    }

    const step2Timer = setTimeout(() => {
      advanceStep(2);
      setAnimationPhase("walking");
    }, TIMING.STEP_1_HOLD);

    return (): void => {
      clearTimeout(step2Timer);
    };
  }, [animationPhase, advanceStep]);

  // Step 3 -> Step 4: Hold romantic message, then show hint
  useEffect(() => {
    if (animationPhase !== "together") {
      return;
    }

    const step4Timer = setTimeout(() => {
      advanceStep(4);
      setAnimationPhase("interactive");
    }, TIMING.STEP_3_HOLD);

    return (): void => {
      clearTimeout(step4Timer);
    };
  }, [animationPhase, advanceStep]);

  const handleWalkComplete = useCallback((): void => {
    advanceStep(3);
    setAnimationPhase("together");
  }, [advanceStep]);

  const handleDinnClick = useCallback((): void => {
    if (animationPhase === "interactive") {
      // Parent handles routing based on hasReadLetter and hasUnlockedGame
      onDinnClick?.();
    }
  }, [animationPhase, onDinnClick]);

  // Carolina confetti celebration - triggers when sitting together
  const handleCarolinaClick = useCallback(
    (e: React.MouseEvent): void => {
      const isClickable =
        animationPhase === "together" || animationPhase === "interactive";
      if (!isClickable) {
        return;
      }

      e.stopPropagation();
      confettiSound.play();

      // Fire confetti from click coordinates (normalized 0-1)
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 70,
        origin: { x, y },
        colors: ["#00ff41", "#ef4444", "#ffffff"],
        disableForReducedMotion: true,
        zIndex: 100,
      });
    },
    [animationPhase, confettiSound]
  );

  const isDinnInteractive = animationPhase === "interactive";
  const isCarolinaInteractive =
    animationPhase === "together" || animationPhase === "interactive";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: TIMING.ROOM_FADE_DURATION, ease: "easeOut" }}
      className={`relative left-1/2 w-[150vw] -translate-x-[36%] ${className}`}
    >
      {/* Room container */}
      <div className="relative">
        {/* Layer 0: Baked room background with all furniture */}
        <img
          src={ROOM_ASSETS.FURNISHED_ROOM}
          alt="Cozy living room"
          className="h-auto w-full"
          draggable={false}
        />

        {/* Layer 1: Dinn sitting on couch with breathing animation */}
        <motion.div
          className="absolute h-auto w-[12%] origin-bottom"
          style={{
            zIndex: 10,
            top: "40%",
            left: "44%",
            cursor: isDinnInteractive ? "pointer" : "default",
          }}
          animate={{
            ...breatheAnimation,
            filter: isDinnInteractive
              ? [
                  "drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))",
                  "drop-shadow(0 0 20px rgba(255, 215, 0, 0.7))",
                  "drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))",
                ]
              : "none",
          }}
          transition={{
            scaleY: {
              duration: TIMING.DINN_BREATHE_DURATION,
              repeat: Infinity,
              ease: "easeInOut",
            },
            translateY: {
              duration: TIMING.DINN_BREATHE_DURATION,
              repeat: Infinity,
              ease: "easeInOut",
            },
            filter: {
              duration: TIMING.DINN_GLOW_DURATION,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          onClick={handleDinnClick}
          role={isDinnInteractive ? "button" : undefined}
          tabIndex={isDinnInteractive ? 0 : undefined}
          onKeyDown={(e): void => {
            if (isDinnInteractive && (e.key === "Enter" || e.key === " ")) {
              handleDinnClick();
            }
          }}
        >
          <img
            src={ROOM_ASSETS.DINN}
            alt="Dinn waiting on the couch"
            className="h-auto w-full object-contain"
            draggable={false}
          />

          {/* "Encore" Bubble - Only shows after reading the letter */}
          <AnimatePresence>
            {hasReadLetter && !isLetterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-midnight absolute -top-14 left-1/2 -translate-x-1/2 rounded-xl bg-white px-4 py-2 text-sm font-bold whitespace-nowrap shadow-xl"
                onClick={handleDinnClick}
              >
                {hasUnlockedGame
                  ? "Tap for memories! 💭"
                  : "Psst... one more surprise! 🎁"}
                {/* Arrow pointing down */}
                <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Layer 2: Carolina - starts at tree, walks to couch (left pillow) */}
        <motion.img
          src={ROOM_ASSETS.CAROLINA}
          alt="Carolina"
          className={`absolute h-auto w-[12%] origin-bottom object-contain ${isCarolinaInteractive ? "cursor-pointer hover:brightness-110" : ""}`}
          style={{
            zIndex: 10,
            top: "42%",
            left: "36%",
            scaleX: -1,
          }}
          onClick={handleCarolinaClick}
          variants={carolinaVariants}
          initial="initial"
          animate={
            animationPhase === "together" || animationPhase === "interactive"
              ? {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  ...breatheAnimation,
                }
              : animationPhase === "walking"
                ? "walkToCouch"
                : animationPhase === "entering"
                  ? "enter"
                  : "initial"
          }
          transition={
            animationPhase === "together" || animationPhase === "interactive"
              ? {
                  scaleY: {
                    duration: TIMING.DINN_BREATHE_DURATION,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  translateY: {
                    duration: TIMING.DINN_BREATHE_DURATION,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : undefined
          }
          onAnimationComplete={(definition): void => {
            if (definition === "walkToCouch") {
              handleWalkComplete();
            }
          }}
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
