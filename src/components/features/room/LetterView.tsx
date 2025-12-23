"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Caveat } from "next/font/google";

import { FINAL_LETTER_CONTENT } from "@/lib/constants";

import type { JSX } from "react";

// Load the handwriting font
const handwriting = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export interface LetterViewProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The romantic letter reveal - the final surprise.
 * A warm paper modal with handwritten-style text.
 */
export function LetterView({ isOpen, onClose }: LetterViewProps): JSX.Element {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* The Letter */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`relative w-full max-w-lg overflow-hidden rounded-sm bg-[#fdfbf7] p-8 shadow-2xl md:p-12 ${handwriting.className}`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-full p-2 text-stone-400 transition-colors hover:text-stone-800"
              aria-label="Close letter"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Letter content */}
            <div className="relative space-y-6 text-2xl text-stone-800 md:text-3xl">
              <h2 className="font-bold">Dear Carolina,</h2>

              <div className="space-y-4 leading-relaxed">
                {FINAL_LETTER_CONTENT.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-4 text-right font-bold text-red-700">
                Love, Dinn ❤️
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
