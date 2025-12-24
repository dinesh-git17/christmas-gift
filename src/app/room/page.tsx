"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

import {
  RoomScene,
  Subtitle,
  SnowOverlay,
  LetterView,
  ChoiceMenu,
  MemoryGame,
  type SceneStep,
} from "@/components/features/room";
import { useAudio, unlockAudio } from "@/hooks/use-audio";
import { AUDIO_PATHS, ROOM_SCRIPT, ROOM_TIMING } from "@/lib/constants";

import type { JSX } from "react";

// Room background color for iOS Safari safe area (matches gradient edge)
const ROOM_BG_COLOR = "#0a0404";

export default function RoomPage(): JSX.Element {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<SceneStep>(0);
  const [showLetter, setShowLetter] = useState(false);
  const [hasReadLetter, setHasReadLetter] = useState(false);
  const [hasUnlockedGame, setHasUnlockedGame] = useState(false);
  const [showChoiceMenu, setShowChoiceMenu] = useState(false);
  const [showMemoryGame, setShowMemoryGame] = useState(false);

  // Set body background for iOS Safari safe area coloring
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = ROOM_BG_COLOR;
    document.documentElement.style.backgroundColor = ROOM_BG_COLOR;

    return (): void => {
      document.body.style.backgroundColor = originalBg;
      document.documentElement.style.backgroundColor = originalBg;
    };
  }, []);

  const lofiMusic = useAudio(AUDIO_PATHS.LOFI_CHRISTMAS, {
    loop: true,
    volume: ROOM_TIMING.MUSIC_VOLUME,
  });

  // Handle step changes from RoomScene
  const handleStepChange = useCallback((step: SceneStep): void => {
    setCurrentStep(step);
  }, []);

  // Start the experience on tap
  const handleStart = useCallback((): void => {
    if (!hasStarted) {
      // Unlock audio for iOS PWA - must be called during user gesture
      unlockAudio();
      setHasStarted(true);
      lofiMusic.preload();
      lofiMusic.play();
    }
  }, [hasStarted, lofiMusic]);

  // Handle Dinn click - behavior depends on progression state
  const handleDinnClick = useCallback((): void => {
    if (!hasReadLetter) {
      // Phase 1: First time - open letter
      setShowLetter(true);
    } else if (!hasUnlockedGame) {
      // Phase 2: After reading letter - launch memory game
      setHasUnlockedGame(true);
      setShowMemoryGame(true);
    } else {
      // Phase 3+: Show choice menu for revisiting
      setShowChoiceMenu(true);
    }
  }, [hasReadLetter, hasUnlockedGame]);

  // Handle letter close - marks letter as read
  const handleLetterClose = useCallback((): void => {
    setShowLetter(false);
    setHasReadLetter(true);
  }, []);

  // Choice menu handlers
  const handleChoiceMenuClose = useCallback((): void => {
    setShowChoiceMenu(false);
  }, []);

  const handleChoiceSelectLetter = useCallback((): void => {
    setShowChoiceMenu(false);
    setShowLetter(true);
  }, []);

  const handleChoiceSelectGame = useCallback((): void => {
    setShowChoiceMenu(false);
    setShowMemoryGame(true);
  }, []);

  // Memory game handlers
  const handleMemoryGameClose = useCallback((): void => {
    setShowMemoryGame(false);
  }, []);

  const handleMemoryGameWin = useCallback((): void => {
    // Stop music - navigation is handled by MemoryGame component
    lofiMusic.stop();
  }, [lofiMusic]);

  // Get current subtitle text based on step
  const currentText = ROOM_SCRIPT[currentStep]?.text ?? "";

  // Show snow when together (step 3+)
  const showSnow = currentStep >= 3;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,_#2d1810_0%,_#1a0d08_35%,_#0a0404_70%,_#000000_100%)]">
      {/* Tap to start overlay */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onClick={handleStart}
            onTouchStart={handleStart}
            className="absolute inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col items-center gap-6 px-8 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles
                  className="h-10 w-10 text-amber-200/90"
                  strokeWidth={1.5}
                />
              </motion.div>
              <p className="font-serif text-xl leading-relaxed text-white/90 italic sm:text-2xl">
                Tap the screen to reveal the magic...
              </p>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mt-4 rounded-full border border-white/30 px-6 py-2 text-sm text-white/60"
              >
                tap anywhere
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main scene - only renders after start */}
      {hasStarted && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: ROOM_TIMING.FADE_IN_DURATION,
            ease: "easeOut",
          }}
          className="flex h-full flex-col items-center justify-center"
        >
          {/* Room scene with character animations */}
          <RoomScene
            onStepChange={handleStepChange}
            onDinnClick={handleDinnClick}
            hasReadLetter={hasReadLetter}
            hasUnlockedGame={hasUnlockedGame}
            isLetterOpen={showLetter}
          />

          {/* Cinematic subtitle overlay */}
          <Subtitle text={currentText} />

          {/* Snow particle effect - appears after reunion */}
          <SnowOverlay isVisible={showSnow} />
        </motion.main>
      )}

      {/* Letter overlay */}
      <LetterView isOpen={showLetter} onClose={handleLetterClose} />

      {/* Choice menu for revisiting */}
      <ChoiceMenu
        isOpen={showChoiceMenu}
        onClose={handleChoiceMenuClose}
        onSelectLetter={handleChoiceSelectLetter}
        onSelectGame={handleChoiceSelectGame}
      />

      {/* Memory Match mini-game */}
      <MemoryGame
        isOpen={showMemoryGame}
        onClose={handleMemoryGameClose}
        onWin={handleMemoryGameWin}
      />
    </div>
  );
}
