"use client";

import { motion } from "framer-motion";

import type { JSX } from "react";

export interface LetterViewProps {
  className?: string;
  onClose?: () => void;
}

/**
 * The romantic letter reveal - the final surprise.
 * TODO: Implement the letter content and animations.
 */
export function LetterView({ className = "" }: LetterViewProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 ${className}`}
    >
      <div className="px-8 text-center">
        <p className="font-serif text-2xl text-white/80 italic">
          Letter content coming soon...
        </p>
      </div>
    </motion.div>
  );
}
