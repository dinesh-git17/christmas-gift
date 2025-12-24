"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useMemo } from "react";

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
 * VictoryModal
 */
interface VictoryModalProps {
  isVisible: boolean;
  onContinue: () => void;
}

function VictoryModal({
  isVisible,
  onContinue,
}: VictoryModalProps): JSX.Element {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-midnight/90 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="border-terminal-green/40 bg-midnight/80 relative mx-4 flex max-w-sm flex-col items-center gap-6 rounded-xl border p-8 text-center backdrop-blur-md"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0, 255, 65, 0.3)",
                  "0 0 40px rgba(0, 255, 65, 0.5)",
                  "0 0 20px rgba(0, 255, 65, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-xl"
            />
            <div className="text-5xl">🔓</div>
            <div>
              <h2 className="text-terminal-green mb-2 font-mono text-xl font-bold sm:text-2xl">
                {CIPHER_MESSAGES.ALL_LEVELS_COMPLETE}
              </h2>
              <p className="text-terminal-green/70 font-mono text-sm">
                Connection fully synchronized
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="bg-terminal-green text-midnight min-h-[48px] w-full rounded-lg px-8 py-3 font-mono font-bold transition-colors hover:bg-white"
              type="button"
            >
              Continue
            </motion.button>
          </motion.div>
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
  const [shakeRow, setShakeRow] = useState(-1);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealingRow, setRevealingRow] = useState(-1);
  const [showVictory, setShowVictory] = useState(false);
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
      if (isProcessing || isRevealing || dinnMode) {
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
              // Final level - show Dinn then victory
              showDinnFeedback("success", successMessage, () => {
                successSound.play();
                setShowVictory(true);
                setIsProcessing(false);
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
    router.replace("/room");
  }, [router]);

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

      <main className="relative flex h-full flex-col items-center justify-between px-4 py-6">
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
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
          }}
        >
          <CipherKeyboard
            keyStates={keyStates}
            onKeyPress={handleKeyPress}
            disabled={isProcessing || isRevealing || showVictory || !!dinnMode}
          />
        </motion.div>
      </main>

      {/* Victory modal */}
      <VictoryModal
        isVisible={showVictory}
        onContinue={handleVictoryContinue}
      />
    </div>
  );
}
