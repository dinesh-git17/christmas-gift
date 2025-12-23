"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Gamepad2, X } from "lucide-react";

import type { JSX } from "react";

export interface ChoiceMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLetter: () => void;
  onSelectGame: () => void;
}

/**
 * Choice menu for revisiting letter or playing the game.
 * Appears after the player has discovered both surprises.
 */
export function ChoiceMenu({
  isOpen,
  onClose,
  onSelectLetter,
  onSelectGame,
}: ChoiceMenuProps): JSX.Element {
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

          {/* Menu Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-midnight/90 relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 p-6 text-center shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-full p-2 text-white/50 transition-colors hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <h2 className="mb-6 font-mono text-xl font-bold tracking-widest text-white">
              MEMORY LOG
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {/* Read Letter Option */}
              <button
                onClick={onSelectLetter}
                className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 p-4 font-mono text-white transition-colors hover:bg-white/10"
              >
                <Heart className="h-5 w-5 text-red-400" />
                <span>Read Letter</span>
              </button>

              {/* Play Game Option */}
              <button
                onClick={onSelectGame}
                className="border-terminal-green/20 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 flex min-h-[56px] w-full items-center justify-center gap-3 rounded-xl border p-4 font-mono transition-colors"
              >
                <Gamepad2 className="h-5 w-5" />
                <span>Play Surprise</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
