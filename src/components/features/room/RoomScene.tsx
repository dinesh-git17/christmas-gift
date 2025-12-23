"use client";

/* eslint-disable @next/next/no-img-element -- Room sprites require precise positioning with percentage-based absolute layout */

import { motion, type Variants } from "framer-motion";
import { useState, useEffect } from "react";

import type { JSX } from "react";

const ROOM_ASSETS = {
  FURNISHED_ROOM: "/assets/room/room_furnished.png",
  DINN: "/assets/room/iso_dinn.png",
  CAROLINA: "/assets/room/iso_carolina.png",
} as const;

/** Animation timing constants in seconds */
const TIMING = {
  DINN_BREATHE_DURATION: 2,
  CAROLINA_FADE_DELAY: 1,
  CAROLINA_FADE_DURATION: 0.8,
  CAROLINA_WALK_DELAY: 2,
  CAROLINA_WALK_DURATION: 2.5,
  TOGETHER_DELAY: 4500, // ms - when both start breathing together
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
    x: 180, // Start near Christmas tree (right side)
    y: 100, // Lower in the room
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
    x: 0, // Final position on left pillow
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
}

export function RoomScene({ className = "" }: RoomSceneProps): JSX.Element {
  const [animationPhase, setAnimationPhase] = useState<
    "waiting" | "entering" | "together"
  >("waiting");

  useEffect(() => {
    // Phase transitions based on animation timing
    const enterTimer = setTimeout(() => {
      setAnimationPhase("entering");
    }, TIMING.CAROLINA_FADE_DELAY * 1000);

    const togetherTimer = setTimeout(() => {
      setAnimationPhase("together");
    }, TIMING.TOGETHER_DELAY);

    return (): void => {
      clearTimeout(enterTimer);
      clearTimeout(togetherTimer);
    };
  }, []);

  return (
    <div
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

        {/* Layer 1: Dinn sitting on couch (right pillow) with breathing animation */}
        <motion.img
          src={ROOM_ASSETS.DINN}
          alt="Dinn waiting on the couch"
          className="absolute h-auto w-[12%] origin-bottom object-contain"
          style={{
            zIndex: 10,
            top: "38%",
            left: "48%",
          }}
          animate={breatheAnimation}
          transition={{
            duration: TIMING.DINN_BREATHE_DURATION,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          draggable={false}
        />

        {/* Layer 2: Carolina - starts at tree, walks to couch (left pillow) */}
        <motion.img
          src={ROOM_ASSETS.CAROLINA}
          alt="Carolina"
          className="absolute h-auto w-[12%] origin-bottom object-contain"
          style={{
            zIndex: 10,
            top: "38%",
            left: "40%",
          }}
          variants={carolinaVariants}
          initial="initial"
          animate={
            animationPhase === "together"
              ? {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  ...breatheAnimation,
                }
              : ["enter", "walkToCouch"]
          }
          transition={
            animationPhase === "together"
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
          draggable={false}
        />

        {/* Layer 3: Warm ambient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-orange-500/5 mix-blend-overlay" />
      </div>
    </div>
  );
}
