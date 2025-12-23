"use client";

/* eslint-disable @next/next/no-img-element -- Room sprites require precise positioning with percentage-based absolute layout */

import { motion } from "framer-motion";

import type { JSX } from "react";

const ROOM_ASSETS = {
  FURNISHED_ROOM: "/assets/room/room_furnished.png",
  DINN: "/assets/room/iso_dinn.png",
} as const;

const breatheAnimation = {
  scaleY: [1, 1.02, 1],
  translateY: [0, -2, 0],
};

export interface RoomSceneProps {
  className?: string;
}

export function RoomScene({ className = "" }: RoomSceneProps): JSX.Element {
  return (
    <div
      className={`relative left-1/2 w-[130vw] -translate-x-[39%] ${className}`}
    >
      {/* Room container */}
      <div className="relative">
        {/* Baked room background with all furniture */}
        <img
          src={ROOM_ASSETS.FURNISHED_ROOM}
          alt="Cozy living room"
          className="h-auto w-full"
          draggable={false}
        />

        {/* Dinn sitting on armchair with breathing animation */}
        <motion.img
          src={ROOM_ASSETS.DINN}
          alt="Dinn waiting on the armchair"
          className="absolute h-auto w-[12%] origin-bottom object-contain"
          style={{
            zIndex: 10,
            top: "38%",
            left: "41%",
          }}
          animate={breatheAnimation}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
