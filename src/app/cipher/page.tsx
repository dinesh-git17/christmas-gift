"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Unlock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useMemo } from "react";

import {
  MatrixRain,
  FinalBootSequence,
  DecryptionLetter,
} from "@/components/features/effects";
import { useAudio, unlockAudio } from "@/hooks";
import {
  AUDIO_PATHS,
  CIPHER_BG_COLOR,
  CIPHER_CONFIG,
  CIPHER_LEVELS,
  CIPHER_MESSAGES,
  CIPHER_SUCCESS_MESSAGES,
} from "@/lib/constants";

import type { CipherTileState } from "@/lib/constants";
import type { JSX } from "react";

// Type for letter evaluation result
interface LetterEvaluation {
  letter: string;
  state: CipherTileState;
}

// Type for keyboard key states
type KeyboardKeyStates = Record<string, CipherTileState>;

// Dinn feedback types
type DinnMode = "success" | "hint" | null;

/**
 * ClassifiedBriefing - Mission dossier card before game starts
 */
interface ClassifiedBriefingProps {
  onProceed: () => void;
}

function ClassifiedBriefing({
  onProceed,
}: ClassifiedBriefingProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
    >
      {/* Dossier folder */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 20 }}
        className="relative w-full max-w-sm"
      >
        {/* Folder tab */}
        <div className="absolute -top-4 left-6 h-6 w-24 rounded-t-md bg-amber-700/90" />

        {/* Main folder body */}
        <div className="relative overflow-hidden rounded-lg border-2 border-amber-800/60 bg-gradient-to-br from-amber-100 to-amber-200 p-6 shadow-2xl">
          {/* Paper texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* CLASSIFIED stamp */}
          <motion.div
            initial={{ scale: 2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="absolute top-4 right-4"
          >
            <div className="rounded border-4 border-red-600 px-3 py-1 font-mono text-sm font-black tracking-wider text-red-600 uppercase">
              CLASSIFIED
            </div>
          </motion.div>

          {/* Content */}
          <div className="relative z-10 pt-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <p className="font-mono text-xs tracking-widest text-amber-700 uppercase">
                Mission Briefing
              </p>
              <h2 className="mt-1 font-mono text-xl font-bold text-gray-900">
                FINAL OBJECTIVE
              </h2>
            </motion.div>

            {/* Mission details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 font-mono text-sm leading-relaxed text-gray-800"
            >
              <p>Decrypt the encoded transmission.</p>
              <div className="rounded bg-amber-300/50 p-3">
                <p className="font-semibold text-gray-900">Parameters:</p>
                <ul className="mt-2 space-y-1 text-gray-700">
                  <li>• 3 encrypted words</li>
                  <li>• 4 attempts per word</li>
                  <li>• No second chances</li>
                </ul>
              </div>
            </motion.div>

            {/* Proceed button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onProceed}
              className="mt-6 w-full rounded bg-gray-900 py-3 font-mono text-sm font-bold tracking-wider text-amber-100 uppercase transition-colors hover:bg-gray-800"
              type="button"
            >
              Accept Mission
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * MatrixGlitch - Falling matrix characters effect
 */
const MATRIX_COLUMNS = 20;
const MATRIX_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

// Pre-computed random values for matrix effect
const MATRIX_COLUMN_DATA = Array.from({ length: MATRIX_COLUMNS }).map(
  (_, i) => ({
    duration: 1.5 + ((i * 7) % 10) / 10,
    delay: ((i * 3) % 8) / 10,
    chars: Array.from({ length: 15 }).map(
      (_, j) => MATRIX_CHARS[(i * 13 + j * 7) % MATRIX_CHARS.length]
    ),
  })
);

function MatrixGlitch(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {MATRIX_COLUMN_DATA.map((col, i) => (
        <motion.div
          key={i}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "100vh", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: col.duration,
            delay: col.delay,
            ease: "linear",
          }}
          className="text-terminal-green/60 absolute font-mono text-sm"
          style={{ left: `${(i / MATRIX_COLUMNS) * 100}%` }}
        >
          {col.chars.map((char, j) => (
            <div key={j} className="opacity-80">
              {char}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Evaluates a guess against the target word
 */
function evaluateGuess(guess: string, targetWord: string): LetterEvaluation[] {
  const result: LetterEvaluation[] = [];
  const targetLetters = targetWord.split("");
  const guessLetters = guess.split("");
  const matchedIndices = new Set<number>();

  // First pass: exact matches (green)
  guessLetters.forEach((letter, index) => {
    if (letter === targetLetters[index]) {
      result[index] = { letter, state: "correct" };
      matchedIndices.add(index);
    }
  });

  // Second pass: present (yellow) and absent (gray)
  guessLetters.forEach((letter, index) => {
    if (result[index]) {
      return;
    }
    const targetIndex = targetLetters.findIndex(
      (targetLetter, i) => targetLetter === letter && !matchedIndices.has(i)
    );
    if (targetIndex !== -1) {
      result[index] = { letter, state: "present" };
      matchedIndices.add(targetIndex);
    } else {
      result[index] = { letter, state: "absent" };
    }
  });

  return result;
}

/**
 * DinnFeedback - Shows Dinn with message during grid fade
 */
interface DinnFeedbackProps {
  mode: DinnMode;
  message: string;
}

function DinnFeedback({ mode, message }: DinnFeedbackProps): JSX.Element {
  const imageSrc =
    mode === "success"
      ? "/assets/characters/dinn_heart.png"
      : "/assets/characters/dinn_wave.png";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Speech bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.25 }}
        className="border-terminal-green/40 bg-terminal-green/10 relative max-w-[280px] rounded-xl border px-5 py-4 backdrop-blur-sm"
      >
        <p className="text-terminal-green text-center font-mono text-sm sm:text-base">
          {message}
        </p>
        {/* Pointer */}
        <div className="border-terminal-green/40 bg-terminal-green/10 absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-r border-b" />
      </motion.div>

      {/* Dinn image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="relative h-32 w-32 sm:h-40 sm:w-40"
      >
        <Image
          src={imageSrc}
          alt="Dinn"
          fill
          className="object-contain drop-shadow-lg"
          style={
            mode === "hint"
              ? {
                  filter:
                    "sepia(100%) hue-rotate(90deg) saturate(250%) drop-shadow(0 0 8px #00ff41)",
                  opacity: 0.85,
                }
              : undefined
          }
          unoptimized
        />
        {/* Hologram scanline for hint mode */}
        {mode === "hint" && (
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="via-terminal-green/30 pointer-events-none absolute inset-0 h-6 bg-gradient-to-b from-transparent to-transparent"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * CipherTile - Individual tile
 */
interface CipherTileProps {
  letter: string;
  state: CipherTileState;
  delay?: number;
  isRevealing?: boolean;
}

function CipherTile({
  letter,
  state,
  delay = 0,
  isRevealing = false,
}: CipherTileProps): JSX.Element {
  const baseClasses =
    "flex h-14 w-14 items-center justify-center rounded-lg border-2 font-mono text-2xl font-bold uppercase transition-colors sm:h-16 sm:w-16 sm:text-3xl";

  const stateClasses: Record<CipherTileState, string> = {
    empty: "border-terminal-green/30 bg-transparent",
    filled: "border-terminal-green bg-transparent text-terminal-green",
    correct: "border-terminal-green bg-terminal-green text-midnight",
    present: "border-yellow-500 bg-yellow-500/80 text-midnight",
    absent: "border-gray-600 bg-gray-800/50 text-gray-400",
  };

  if (isRevealing && state !== "empty" && state !== "filled") {
    return (
      <motion.div
        initial={{ rotateX: 0 }}
        animate={{ rotateX: [0, 90, 0] }}
        transition={{
          duration: CIPHER_CONFIG.TILE_FLIP_DURATION_MS / 1000,
          delay: delay / 1000,
          times: [0, 0.5, 1],
        }}
        style={{ transformStyle: "preserve-3d" }}
        className={`${baseClasses} ${stateClasses[state]}`}
      >
        {letter}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={letter ? { scale: 0.8 } : false}
      animate={{ scale: 1 }}
      transition={{ duration: 0.08 }}
      className={`${baseClasses} ${stateClasses[state]}`}
    >
      {letter}
    </motion.div>
  );
}

/**
 * CipherGrid - The 5x4 grid
 */
interface CipherGridProps {
  guesses: LetterEvaluation[][];
  currentGuess: string;
  currentRow: number;
  shakeRow: number;
  isRevealing: boolean;
  revealingRow: number;
}

function CipherGrid({
  guesses,
  currentGuess,
  currentRow,
  shakeRow,
  isRevealing,
  revealingRow,
}: CipherGridProps): JSX.Element {
  const rows: JSX.Element[] = [];

  for (let i = 0; i < CIPHER_CONFIG.MAX_GUESSES; i++) {
    const tiles: JSX.Element[] = [];

    // For completed rows (i < currentRow), show from guesses
    // For the revealing row, also show from guesses (it was just added)
    const isCompletedRow =
      i < currentRow || (isRevealing && i === revealingRow);

    for (let j = 0; j < CIPHER_CONFIG.WORD_LENGTH; j++) {
      let letter = "";
      let state: CipherTileState = "empty";

      if (isCompletedRow) {
        const rowIndex = i;
        const rowGuesses = guesses[rowIndex];
        if (rowGuesses) {
          const evaluation = rowGuesses[j];
          if (evaluation) {
            letter = evaluation.letter;
            state = evaluation.state;
          }
        }
      } else if (i === currentRow) {
        letter = currentGuess[j] || "";
        state = letter ? "filled" : "empty";
      }

      tiles.push(
        <CipherTile
          key={`${i}-${j}`}
          letter={letter}
          state={state}
          delay={
            isRevealing && i === revealingRow
              ? j * CIPHER_CONFIG.TILE_FLIP_DELAY_MS
              : 0
          }
          isRevealing={isRevealing && i === revealingRow}
        />
      );
    }

    rows.push(
      <motion.div
        key={i}
        animate={shakeRow === i ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: CIPHER_CONFIG.SHAKE_DURATION_MS / 1000 }}
        className="flex gap-2 sm:gap-2.5"
      >
        {tiles}
      </motion.div>
    );
  }

  return <div className="flex flex-col gap-2 sm:gap-2.5">{rows}</div>;
}

/**
 * CipherKeyboard - Wordle-sized keyboard
 */
interface CipherKeyboardProps {
  keyStates: KeyboardKeyStates;
  onKeyPress: (key: string) => void;
  disabled: boolean;
}

function CipherKeyboard({
  keyStates,
  onKeyPress,
  disabled,
}: CipherKeyboardProps): JSX.Element {
  const getKeyClasses = (key: string): string => {
    const state = keyStates[key] || "empty";

    const baseClasses =
      "flex h-[52px] items-center justify-center rounded-md font-bold uppercase transition-colors active:brightness-90 select-none touch-manipulation";

    const stateClasses: Record<CipherTileState | "empty", string> = {
      empty: "bg-[#818384] text-white",
      filled: "bg-[#818384] text-white",
      correct: "bg-terminal-green text-midnight",
      present: "bg-[#b59f3b] text-white",
      absent: "bg-[#3a3a3c] text-[#818384]",
    };

    // Action keys get 1.5x width, letter keys are flex-1
    const isActionKey = key === "ENTER" || key === "⌫";
    const widthClasses = isActionKey
      ? "flex-[1.5] text-[10px]"
      : "flex-1 text-lg";

    return `${baseClasses} ${stateClasses[state]} ${widthClasses}`;
  };

  return (
    <div className="mx-auto flex w-full max-w-[500px] flex-col gap-[6px] px-1">
      {/* Row 1: Q-P (10 keys) */}
      <div className="flex gap-[5px]">
        {CIPHER_CONFIG.KEYBOARD_ROWS[0]?.map((key) => (
          <button
            key={key}
            onPointerDown={(e) => {
              e.preventDefault();
              if (!disabled) {
                onKeyPress(key);
              }
            }}
            disabled={disabled}
            className={getKeyClasses(key)}
            type="button"
          >
            {key}
          </button>
        ))}
      </div>
      {/* Row 2: A-L (9 keys) - slightly indented */}
      <div className="flex gap-[5px] px-[5%]">
        {CIPHER_CONFIG.KEYBOARD_ROWS[1]?.map((key) => (
          <button
            key={key}
            onPointerDown={(e) => {
              e.preventDefault();
              if (!disabled) {
                onKeyPress(key);
              }
            }}
            disabled={disabled}
            className={getKeyClasses(key)}
            type="button"
          >
            {key}
          </button>
        ))}
      </div>
      {/* Row 3: Enter, Z-M, Backspace */}
      <div className="flex gap-[5px]">
        {CIPHER_CONFIG.KEYBOARD_ROWS[2]?.map((key) => (
          <button
            key={key}
            onPointerDown={(e) => {
              e.preventDefault();
              if (!disabled) {
                onKeyPress(key);
              }
            }}
            disabled={disabled}
            className={getKeyClasses(key)}
            type="button"
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * VictoryModal - System unlocked card with matrix glitch
 */
interface VictoryModalProps {
  isVisible: boolean;
  showCard: boolean;
  onContinue: () => void;
}

function VictoryModal({
  isVisible,
  showCard,
  onContinue,
}: VictoryModalProps): JSX.Element {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-midnight fixed inset-0 z-50"
        >
          {/* Matrix glitch effect */}
          <MatrixGlitch />

          {/* Card container */}
          <div className="relative flex h-full items-center justify-center p-6">
            <AnimatePresence>
              {showCard && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="border-terminal-green/40 bg-midnight/80 w-full max-w-md rounded-lg border-2 p-6 backdrop-blur-sm"
                >
                  {/* Header */}
                  <div className="border-terminal-green/30 mb-6 flex items-center gap-3 border-b pb-4">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Unlock className="text-terminal-green h-5 w-5" />
                    </motion.div>
                    <div>
                      <div className="text-terminal-green/60 font-mono text-xs tracking-widest uppercase">
                        System Status
                      </div>
                      <h1 className="text-terminal-green font-mono text-xl font-bold">
                        FULLY UNLOCKED
                      </h1>
                    </div>
                  </div>

                  {/* Terminal output */}
                  <div className="bg-terminal-green/5 mb-6 rounded-md p-4 font-mono text-sm">
                    <div className="text-terminal-green/70">
                      {"> DECRYPTION COMPLETE"}
                    </div>
                    <div className="text-terminal-green/70">
                      {"> ALL CIPHERS SOLVED"}
                    </div>
                    <div className="text-terminal-green">
                      {"> STATUS: CONNECTION SYNCHRONIZED"}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <p className="text-terminal-green/90 font-mono text-sm leading-relaxed">
                      {CIPHER_MESSAGES.ALL_LEVELS_COMPLETE}
                    </p>
                    <p className="text-terminal-green/70 mt-3 font-mono text-sm">
                      Final transmission awaits.
                    </p>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onContinue}
                    type="button"
                    className="bg-terminal-green text-midnight relative min-h-[56px] w-full overflow-hidden rounded-lg py-4 font-mono text-lg font-bold transition-colors hover:bg-white"
                  >
                    {/* Pulsing glow effect */}
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.02, 1],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="bg-terminal-green absolute inset-0 rounded-lg blur-md"
                    />
                    <span className="relative z-10">CONTINUE</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * CipherPage - Main game
 */
export default function CipherPage(): JSX.Element {
  const router = useRouter();

  // Game state
  const [currentLevel, setCurrentLevel] = useState(0);
  const [guesses, setGuesses] = useState<LetterEvaluation[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentRow, setCurrentRow] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [keyStates, setKeyStates] = useState<KeyboardKeyStates>({});

  // UI state
  const [showBriefing, setShowBriefing] = useState(true);
  const [shakeRow, setShakeRow] = useState(-1);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealingRow, setRevealingRow] = useState(-1);
  const [showVictory, setShowVictory] = useState(false);
  const [showVictoryCard, setShowVictoryCard] = useState(false);
  const [showMatrixSequence, setShowMatrixSequence] = useState(false);
  const [showDecryptionLetter, setShowDecryptionLetter] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dinn feedback state
  const [dinnMode, setDinnMode] = useState<DinnMode>(null);
  const [dinnMessage, setDinnMessage] = useState("");
  const [gridVisible, setGridVisible] = useState(true);

  // Current level data
  const levelData = useMemo(() => CIPHER_LEVELS[currentLevel], [currentLevel]);
  const targetWord = levelData?.word || "";
  const currentHint = useMemo(() => {
    if (!levelData) {
      return "";
    }
    const hintIndex = Math.min(failCount, levelData.hints.length - 1);
    return levelData.hints[hintIndex] || "";
  }, [levelData, failCount]);

  // Audio
  const collectSound = useAudio(AUDIO_PATHS.COLLECT, { volume: 0.5 });
  const errorSound = useAudio(AUDIO_PATHS.ERROR, { volume: 0.4 });
  const successSound = useAudio(AUDIO_PATHS.SUCCESS_UNLOCK, { volume: 0.6 });

  // Haptic feedback
  const triggerHaptic = useCallback((): void => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  }, []);

  // Set body background
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = CIPHER_BG_COLOR;
    document.documentElement.style.backgroundColor = CIPHER_BG_COLOR;
    return (): void => {
      document.body.style.backgroundColor = originalBg;
      document.documentElement.style.backgroundColor = originalBg;
    };
  }, []);

  // Preload audio
  useEffect(() => {
    collectSound.preload();
    errorSound.preload();
    successSound.preload();
  }, [collectSound, errorSound, successSound]);

  // Show Dinn feedback with grid fade
  const showDinnFeedback = useCallback(
    (mode: DinnMode, message: string, onComplete: () => void): void => {
      // Fade out grid
      setGridVisible(false);

      setTimeout(() => {
        // Show Dinn
        setDinnMode(mode);
        setDinnMessage(message);

        // After display duration, fade Dinn out and grid back in
        setTimeout(() => {
          setDinnMode(null);

          setTimeout(() => {
            setGridVisible(true);
            onComplete();
          }, 150);
        }, CIPHER_CONFIG.DINN_DISPLAY_DURATION_MS);
      }, CIPHER_CONFIG.GRID_FADE_DURATION_MS);
    },
    []
  );

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (key: string): void => {
      if (showBriefing || isProcessing || isRevealing || dinnMode) {
        return;
      }

      unlockAudio();

      if (key === "⌫" || key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (key === "ENTER") {
        if (currentGuess.length !== CIPHER_CONFIG.WORD_LENGTH) {
          setShakeRow(currentRow);
          triggerHaptic();
          errorSound.play();
          setTimeout(() => setShakeRow(-1), CIPHER_CONFIG.SHAKE_DURATION_MS);
          return;
        }

        setIsProcessing(true);

        const evaluation = evaluateGuess(currentGuess, targetWord);
        const isCorrect = evaluation.every((e) => e.state === "correct");

        // Start revealing immediately
        setIsRevealing(true);
        setRevealingRow(currentRow);
        setGuesses((prev) => [...prev, evaluation]);

        const revealDuration =
          CIPHER_CONFIG.WORD_LENGTH * CIPHER_CONFIG.TILE_FLIP_DELAY_MS +
          CIPHER_CONFIG.TILE_FLIP_DURATION_MS;

        setTimeout(() => {
          // Update key states
          setKeyStates((prev) => {
            const newStates = { ...prev };
            evaluation.forEach(({ letter, state }) => {
              if (newStates[letter] === "correct") {
                return;
              }
              if (newStates[letter] === "present" && state !== "correct") {
                return;
              }
              newStates[letter] = state;
            });
            return newStates;
          });

          setIsRevealing(false);
          setRevealingRow(-1);

          if (isCorrect) {
            collectSound.play();

            const successMessage =
              CIPHER_SUCCESS_MESSAGES[currentLevel] || "Perfect!";

            if (currentLevel < CIPHER_LEVELS.length - 1) {
              // Show Dinn heart, then advance level
              showDinnFeedback("success", successMessage, () => {
                setCurrentLevel((prev) => prev + 1);
                setGuesses([]);
                setCurrentGuess("");
                setCurrentRow(0);
                setFailCount(0);
                setKeyStates({});
                setIsProcessing(false);
              });
            } else {
              // Final level - show Dinn then victory with matrix effect
              showDinnFeedback("success", successMessage, () => {
                successSound.play();
                setShowVictory(true);
                setIsProcessing(false);
                // Show card after matrix glitch plays
                setTimeout(() => {
                  setShowVictoryCard(true);
                }, 1200);
              });
            }
          } else {
            // Wrong guess - shake the row with haptic feedback
            triggerHaptic();
            errorSound.play();
            setShakeRow(currentRow);

            setTimeout(() => {
              setShakeRow(-1);

              if (currentRow >= CIPHER_CONFIG.MAX_GUESSES - 1) {
                // Out of guesses - show hint and reset
                const newFailCount = failCount + 1;
                setFailCount(newFailCount);

                const hintIndex = Math.min(
                  newFailCount,
                  (levelData?.hints.length || 1) - 1
                );
                const hintMessage = levelData?.hints[hintIndex] || currentHint;

                showDinnFeedback("hint", hintMessage, () => {
                  setGuesses([]);
                  setCurrentGuess("");
                  setCurrentRow(0);
                  setKeyStates({});
                  setIsProcessing(false);
                });
              } else {
                // Move to next row
                setCurrentGuess("");
                setCurrentRow((prev) => prev + 1);
                setIsProcessing(false);
              }
            }, CIPHER_CONFIG.SHAKE_DURATION_MS);
          }
        }, revealDuration);

        return;
      }

      // Letter input
      if (
        /^[A-Z]$/i.test(key) &&
        currentGuess.length < CIPHER_CONFIG.WORD_LENGTH
      ) {
        setCurrentGuess((prev) => prev + key.toUpperCase());
      }
    },
    [
      showBriefing,
      currentGuess,
      currentRow,
      currentLevel,
      targetWord,
      isProcessing,
      isRevealing,
      dinnMode,
      failCount,
      levelData,
      currentHint,
      collectSound,
      errorSound,
      successSound,
      showDinnFeedback,
      triggerHaptic,
    ]
  );

  // Physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return (): void => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const handleVictoryContinue = useCallback((): void => {
    // Hide victory modal and show matrix sequence
    setShowVictory(false);
    setShowVictoryCard(false);
    setShowMatrixSequence(true);
  }, []);

  const handleMatrixSequenceComplete = useCallback((): void => {
    // Transition from matrix sequence to decryption letter
    setShowMatrixSequence(false);
    setShowDecryptionLetter(true);
  }, []);

  const handleDecryptionLetterComplete = useCallback((): void => {
    router.replace("/proposal");
  }, [router]);

  const handleBriefingProceed = useCallback((): void => {
    setShowBriefing(false);
  }, []);

  return (
    <div className="bg-midnight fixed inset-0">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(0, 255, 65, 0.03) 0%, transparent 50%)",
        }}
      />

      <AnimatePresence>
        {!showBriefing && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative flex h-full flex-col items-center justify-between px-4 py-6"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
              <h1 className="text-terminal-green/70 font-mono text-xs font-bold tracking-[0.3em] sm:text-sm">
                ENCRYPTION PROTOCOL
              </h1>
              <p className="text-terminal-green/50 mt-1 font-mono text-xs">
                Level {currentLevel + 1} of {CIPHER_LEVELS.length}
              </p>
            </motion.div>

            {/* Game area - Grid and Dinn feedback layered */}
            <div className="relative flex flex-1 flex-col items-center justify-center">
              {/* Grid - fades out when Dinn shows */}
              <motion.div
                animate={{ opacity: gridVisible && !dinnMode ? 1 : 0 }}
                transition={{
                  duration: CIPHER_CONFIG.GRID_FADE_DURATION_MS / 1000,
                }}
                className="absolute"
              >
                <CipherGrid
                  guesses={guesses}
                  currentGuess={currentGuess}
                  currentRow={currentRow}
                  shakeRow={shakeRow}
                  isRevealing={isRevealing}
                  revealingRow={revealingRow}
                />
              </motion.div>

              {/* Dinn feedback - fades in when showing */}
              <AnimatePresence>
                {dinnMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute"
                  >
                    <DinnFeedback mode={dinnMode} message={dinnMessage} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Keyboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: dinnMode ? 0.3 : 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
              }}
            >
              <CipherKeyboard
                keyStates={keyStates}
                onKeyPress={handleKeyPress}
                disabled={
                  isProcessing || isRevealing || showVictory || !!dinnMode
                }
              />
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Victory modal */}
      <VictoryModal
        isVisible={showVictory}
        showCard={showVictoryCard}
        onContinue={handleVictoryContinue}
      />

      {/* Classified briefing */}
      <AnimatePresence>
        {showBriefing && (
          <ClassifiedBriefing onProceed={handleBriefingProceed} />
        )}
      </AnimatePresence>

      {/* Matrix sequence - shown after victory */}
      <AnimatePresence>
        {showMatrixSequence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Matrix rain effect */}
            <MatrixRain />

            {/* Terminal boot sequence - appears after rain starts */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <FinalBootSequence
                startDelay={1800}
                onComplete={handleMatrixSequenceComplete}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decryption letter - shown after matrix sequence */}
      <AnimatePresence>
        {showDecryptionLetter && (
          <DecryptionLetter onComplete={handleDecryptionLetterComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}
