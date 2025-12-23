"use client";

import { motion } from "framer-motion";
import Snowfall from "react-snowfall";

import { ROOM_TIMING } from "@/lib/constants";

import type { JSX } from "react";

export interface SnowOverlayProps {
  isVisible: boolean;
  className?: string;
}

/**
 * Gentle snowfall effect overlay for the room scene finale.
 * Appears when Carolina and Dinn are finally together.
 */
export function SnowOverlay({
  isVisible,
  className = "",
}: SnowOverlayProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: ROOM_TIMING.SNOW_FADE_DURATION, ease: "easeOut" }}
      className={`pointer-events-none fixed inset-0 ${className}`}
      style={{ zIndex: 50 }}
      aria-hidden="true"
    >
      <Snowfall
        snowflakeCount={60}
        speed={[0.5, 1.5]}
        wind={[-0.5, 1]}
        radius={[1, 4]}
        color="rgba(255, 255, 255, 0.8)"
      />
    </motion.div>
  );
}
