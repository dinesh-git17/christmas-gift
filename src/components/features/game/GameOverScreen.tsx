"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { JSX } from "react";

export interface GameOverScreenProps {
  score: number;
  onReboot: (event: React.MouseEvent | React.TouchEvent) => void;
}

const TARGET_HEARTS = 10;

export function GameOverScreen({
  score,
  onReboot,
}: GameOverScreenProps): JSX.Element {
  const router = useRouter();

  const handleAbort = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.stopPropagation();
      router.push("/");
    },
    [router]
  );

  const handleReboot = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.stopPropagation();
      onReboot(event);
    },
    [onReboot]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-midnight/85 absolute inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md"
    >
      {/* HUD Frame - Red Error Theme */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="border-terminal-red/40 bg-midnight/60 flex w-full max-w-md flex-col gap-6 rounded-lg border-2 p-6 backdrop-blur-sm"
      >
        {/* Error Header */}
        <div className="border-terminal-red/30 border-b pb-4">
          <div className="text-terminal-red/60 mb-1 font-mono text-xs tracking-widest uppercase">
            SYSTEM ERROR
          </div>
          <h1 className="text-glitch text-terminal-red font-mono text-xl font-bold sm:text-2xl">
            🚫 SIGNAL LOST
          </h1>
        </div>

        {/* Diagnostic Report */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="border-terminal-red/30 bg-terminal-red/5 space-y-3 rounded-md border p-4"
        >
          <div className="flex items-start gap-2">
            <span className="text-terminal-red/60 font-mono text-xs">
              ERROR CODE:
            </span>
            <span className="text-terminal-red font-mono text-xs">
              GLITCH_COLLISION_DETECTED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-terminal-red/60 font-mono text-xs">
              HEARTS RECOVERED:
            </span>
            <span className="font-mono text-sm font-bold text-white">
              {score} / {TARGET_HEARTS}
            </span>
          </div>
        </motion.div>

        {/* Motivational Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-terminal-red/10 rounded-md p-3 text-center"
        >
          <p className="font-mono text-sm text-white/80">
            The connection is unstable. We need more hearts to lock the signal.
          </p>
        </motion.div>

        {/* Actions */}
        <div className="mt-2 flex flex-col gap-3">
          {/* Primary Button: Reboot System */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReboot}
            onTouchEnd={handleReboot}
            type="button"
            className="bg-terminal-red min-h-[56px] w-full rounded-lg py-4 font-mono text-lg font-bold text-white transition-colors hover:bg-red-600"
          >
            <motion.span
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              REBOOT SYSTEM
            </motion.span>
          </motion.button>

          {/* Secondary Action: Abort Mission */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
            onClick={handleAbort}
            onTouchEnd={handleAbort}
            type="button"
            className="min-h-[44px] py-2 font-mono text-sm text-white/50 transition-colors hover:text-white/80"
          >
            ABORT MISSION
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
