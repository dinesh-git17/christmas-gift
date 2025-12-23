"use client";

import { motion, AnimatePresence } from "framer-motion";

import type { JSX } from "react";

export interface SubtitleProps {
  text: string;
  className?: string;
}

/**
 * Cinematic subtitle component with smooth fade transitions.
 * Used for narrative text synchronized with room scene animations.
 */
export function Subtitle({ text, className = "" }: SubtitleProps): JSX.Element {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-28 flex items-center justify-center px-4 sm:bottom-36 ${className}`}
    >
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="max-w-md text-center font-serif text-lg leading-relaxed text-white/80 italic drop-shadow-lg sm:text-xl md:max-w-lg md:text-2xl"
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
