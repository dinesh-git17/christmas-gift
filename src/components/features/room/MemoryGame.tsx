"use client";

import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Snowfall from "react-snowfall";

import { useAudio } from "@/hooks/use-audio";
import {
  AUDIO_PATHS,
  MEMORY_CARD_IMAGES,
  MEMORY_GAME_ASSETS,
  MEMORY_GAME_PAIRS,
  MEMORY_GAME_TIMING,
  MEMORY_WIN_MESSAGE,
} from "@/lib/constants";

import type { MemoryCard } from "@/lib/constants";
import type { JSX } from "react";

export interface MemoryGameProps {
  isOpen: boolean;
  onClose: () => void;
  onWin?: () => void;
}

// Generate random float configuration for each card position (0-8)
interface FloatConfig {
  delay: number;
  duration: number;
}

function generateFloatConfigs(): FloatConfig[] {
  return Array.from({ length: 9 }, () => ({
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 0.5,
  }));
}

// Generate digital particle configurations
interface ParticleConfig {
  id: number;
  delay: number;
  left: string;
  duration: number;
  char: string;
}

const PARTICLE_CHARS = ["0", "1", "•", "◦", "○", "●"];

function generateParticleConfigs(): ParticleConfig[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 8,
    left: `${Math.random() * 100}%`,
    duration: 6 + Math.random() * 4,
    char:
      PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)] ?? "•",
  }));
}

/**
 * Generates the initial deck with shuffled outer cards and fixed center gold card.
 * The gold card always stays at index 4 (center of 3x3 grid).
 */
function generateDeck(): MemoryCard[] {
  const outerCards: MemoryCard[] = MEMORY_GAME_PAIRS.flatMap((type, i) => [
    {
      id: `${type}-1-${i}`,
      type,
      isFlipped: false,
      isMatched: false,
      isCenter: false,
    },
    {
      id: `${type}-2-${i}`,
      type,
      isFlipped: false,
      isMatched: false,
      isCenter: false,
    },
  ]);

  // Fisher-Yates shuffle for outer cards
  for (let i = outerCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const cardI = outerCards[i];
    const cardJ = outerCards[j];
    if (cardI && cardJ) {
      outerCards[i] = cardJ;
      outerCards[j] = cardI;
    }
  }

  // Gold card at center (index 4)
  const goldCard: MemoryCard = {
    id: "gold-center",
    type: "gold",
    isFlipped: false,
    isMatched: false,
    isCenter: true,
  };

  return [...outerCards.slice(0, 4), goldCard, ...outerCards.slice(4)];
}

/**
 * Digital particle that floats upward with a glowing effect.
 */
interface DigitalParticleProps {
  delay: number;
  left: string;
  duration: number;
  char: string;
}

function DigitalParticle({
  delay,
  left,
  duration,
  char,
}: DigitalParticleProps): JSX.Element {
  return (
    <motion.div
      initial={{ y: "100vh", opacity: 0 }}
      animate={{ y: "-10vh", opacity: [0, 0.6, 0.6, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      className="text-terminal-green/40 pointer-events-none absolute font-mono text-xs"
      style={{ left }}
    >
      {char}
    </motion.div>
  );
}

/**
 * Floating holographic card with glass effect and bobbing animation.
 */
interface FloatingCardProps {
  card: MemoryCard;
  floatConfig: FloatConfig;
  onClick: () => void;
  isLocked: boolean;
  isDisabled: boolean;
  isCenterUnlocked: boolean;
}

function FloatingCard({
  card,
  floatConfig,
  onClick,
  isLocked,
  isDisabled,
  isCenterUnlocked,
}: FloatingCardProps): JSX.Element | null {
  const showFront = card.isFlipped || card.isMatched;
  const cardImage = MEMORY_CARD_IMAGES[card.type];
  const isGoldAndUnlocked =
    card.isCenter && isCenterUnlocked && !card.isFlipped;

  // Matched cards dissolve - render invisible placeholder to maintain grid
  if (card.isMatched && !card.isCenter) {
    return <div className="aspect-square w-full" aria-hidden="true" />;
  }

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: [0, -8, 0],
      }}
      exit={{
        scale: 1.3,
        opacity: 0,
        transition: { duration: 0.4, ease: "easeOut" },
      }}
      transition={{
        scale: { duration: 0.3 },
        opacity: { duration: 0.3 },
        y: {
          duration: floatConfig.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatConfig.delay,
        },
      }}
      className="aspect-square w-full"
    >
      <motion.button
        onClick={onClick}
        disabled={isDisabled || card.isMatched || (card.isCenter && isLocked)}
        whileHover={
          !isDisabled && !card.isMatched && !(card.isCenter && isLocked)
            ? { scale: 1.08 }
            : undefined
        }
        whileTap={
          !isDisabled && !card.isMatched && !(card.isCenter && isLocked)
            ? { scale: 0.95 }
            : undefined
        }
        className={`relative h-full w-full [perspective:1000px] disabled:cursor-not-allowed ${
          !isDisabled && !card.isMatched && !(card.isCenter && isLocked)
            ? "cursor-pointer"
            : ""
        }`}
        aria-label={
          card.isCenter && isLocked
            ? "Locked card - match all pairs to unlock"
            : `Memory card ${card.isFlipped ? card.type : "hidden"}`
        }
      >
        {/* Pulsing glow ring for unlocked gold card */}
        {isGoldAndUnlocked && (
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-yellow-400/40 via-amber-300/50 to-yellow-400/40 blur-md"
          />
        )}

        {/* Hover glow effect */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="bg-terminal-green/20 absolute -inset-1 rounded-2xl blur-md transition-opacity"
          style={{ pointerEvents: "none" }}
        />

        <motion.div
          initial={false}
          animate={{ rotateY: showFront ? 180 : 0 }}
          transition={{
            duration: MEMORY_GAME_TIMING.FLIP_DURATION / 1000,
            ease: "easeInOut",
          }}
          className="relative h-full w-full [transform-style:preserve-3d]"
        >
          {/* Card Back - High-tech gift box */}
          <div
            className={`absolute inset-0 overflow-hidden rounded-xl border border-white/20 shadow-lg [backface-visibility:hidden] ${
              card.isCenter && isLocked ? "opacity-50" : ""
            } ${isGoldAndUnlocked ? "border-yellow-400/50" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for animation control */}
            <img
              src={MEMORY_GAME_ASSETS.CARD_BACK}
              alt="Card back"
              className="h-full w-full object-cover"
              draggable={false}
            />
            {/* Lock icon overlay */}
            {card.isCenter && isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Lock className="h-8 w-8 text-white/60" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Card Front - Glass effect with otter sticker */}
          <div
            className={`absolute inset-0 [transform:rotateY(180deg)] overflow-hidden rounded-xl border border-white/30 bg-white/10 shadow-lg backdrop-blur-md [backface-visibility:hidden] ${
              card.isCenter && card.isFlipped
                ? "ring-2 ring-yellow-400/80 ring-offset-2 ring-offset-transparent"
                : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for animation control */}
            <img
              src={cardImage}
              alt={`${card.type} card`}
              className="h-full w-full object-cover"
              draggable={false}
            />
            {/* Glass reflection overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          </div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

/**
 * Memory Match mini-game overlay.
 * A 3x3 grid with 4 pairs of festive otter cards and a locked center gold card.
 * Features zero-gravity floating animation and holographic glass effects.
 */
export function MemoryGame({
  isOpen,
  onClose,
  onWin,
}: MemoryGameProps): JSX.Element {
  const [cards, setCards] = useState<MemoryCard[]>(() => generateDeck());
  const [floatConfigs, setFloatConfigs] = useState<FloatConfig[]>(() =>
    generateFloatConfigs()
  );
  const [particleConfigs] = useState<ParticleConfig[]>(() =>
    generateParticleConfigs()
  );
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isCenterUnlocked, setIsCenterUnlocked] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const collectSound = useAudio(AUDIO_PATHS.COLLECT, { volume: 0.6 });
  const successSound = useAudio(AUDIO_PATHS.SUCCESS_UNLOCK, { volume: 0.7 });
  const errorSound = useAudio(AUDIO_PATHS.ERROR_HIT, { volume: 0.3 });

  // Reset game when opened
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      queueMicrotask(() => {
        setCards(generateDeck());
        setFloatConfigs(generateFloatConfigs());
        setFlippedCards([]);
        setIsProcessing(false);
        setMatchedPairs(0);
        setIsCenterUnlocked(false);
        setHasWon(false);
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Preload audio on mount
  useEffect(() => {
    collectSound.preload();
    successSound.preload();
    errorSound.preload();
  }, [collectSound, successSound, errorSound]);

  // Unlock center card when all pairs are matched
  useEffect(() => {
    if (matchedPairs === 4 && !isCenterUnlocked) {
      const timer = setTimeout(() => {
        setIsCenterUnlocked(true);
        successSound.play();
      }, MEMORY_GAME_TIMING.UNLOCK_DELAY);

      return (): void => clearTimeout(timer);
    }
    return undefined;
  }, [matchedPairs, isCenterUnlocked, successSound]);

  // Fire massive confetti for win
  const fireConfetti = useCallback((): void => {
    const count = 300;
    const defaults = {
      origin: { y: 0.5 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options): void {
      void confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Gold-themed massive burst
    fire(0.3, {
      spread: 30,
      startVelocity: 65,
      scalar: 1,
      colors: ["#FFD700", "#FFA500", "#FFE135"],
    });
    fire(0.25, {
      spread: 80,
      scalar: 1.5,
      colors: ["#FFD700", "#32CD32", "#FF0000", "#FFFFFF"],
    });
    fire(0.35, {
      spread: 120,
      decay: 0.9,
      scalar: 1,
      colors: ["#FFD700", "#FFFFFF", "#00FF41"],
    });
    fire(0.1, {
      spread: 150,
      startVelocity: 35,
      decay: 0.95,
      scalar: 1.8,
      colors: ["#FFD700", "#FF69B4", "#00CED1", "#FF1493"],
    });

    // Second wave
    setTimeout(() => {
      fire(0.2, {
        spread: 100,
        startVelocity: 55,
        colors: ["#FFD700", "#FFA500"],
      });
    }, 150);
  }, []);

  // Handle card click
  const handleCardClick = useCallback(
    (cardId: string): void => {
      if (isProcessing) {
        return;
      }
      if (flippedCards.length >= 2) {
        return;
      }

      const card = cards.find((c) => c.id === cardId);
      if (!card) {
        return;
      }
      if (card.isFlipped || card.isMatched) {
        return;
      }

      // Handle center card (gold)
      if (card.isCenter) {
        if (!isCenterUnlocked) {
          return;
        }

        // Reveal gold card and trigger win
        setCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
        );

        setTimeout(() => {
          setHasWon(true);
          fireConfetti();
          successSound.play();
          onWin?.();
        }, MEMORY_GAME_TIMING.WIN_CONFETTI_DELAY);

        return;
      }

      // Flip the card
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
      );
      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      // Check for match when 2 cards are flipped
      if (newFlippedCards.length === 2) {
        setIsProcessing(true);
        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards.find((c) => c.id === firstId);
        const secondCard = cards.find((c) => c.id === secondId);

        if (firstCard && secondCard && firstCard.type === secondCard.type) {
          // Match found - cards will dissolve
          setTimeout(() => {
            successSound.play();
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              )
            );
            setMatchedPairs((prev) => prev + 1);
            setFlippedCards([]);
            setIsProcessing(false);
          }, MEMORY_GAME_TIMING.MATCH_DELAY + 200);
        } else {
          // No match - flip back
          setTimeout(() => {
            errorSound.play();
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedCards([]);
            setIsProcessing(false);
          }, MEMORY_GAME_TIMING.MISMATCH_DELAY);
        }
      }
    },
    [
      cards,
      flippedCards,
      isProcessing,
      isCenterUnlocked,
      errorSound,
      successSound,
      fireConfetti,
      onWin,
    ]
  );

  // Preload card images
  const imagesToPreload = useMemo(() => {
    return [MEMORY_GAME_ASSETS.CARD_BACK, ...Object.values(MEMORY_CARD_IMAGES)];
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-midnight/98 fixed inset-0 z-50 flex items-center justify-center overflow-hidden backdrop-blur-xl"
        >
          {/* Gentle snowfall background */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <Snowfall
              snowflakeCount={40}
              speed={[0.3, 1]}
              wind={[-0.3, 0.5]}
              radius={[1, 3]}
              color="rgba(255, 255, 255, 0.4)"
            />
          </div>

          {/* Digital particles floating up */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            {particleConfigs.map((particle) => (
              <DigitalParticle
                key={particle.id}
                delay={particle.delay}
                left={particle.left}
                duration={particle.duration}
                char={particle.char}
              />
            ))}
          </div>

          {/* Subtle radial gradient for depth */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(0, 255, 65, 0.03) 0%, transparent 60%)",
            }}
            aria-hidden="true"
          />

          {/* Preload images */}
          <div className="hidden" aria-hidden="true">
            {imagesToPreload.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element -- Game sprite preload
              <img key={src} src={src} alt="" />
            ))}
          </div>

          {/* Close Button - Floating top right */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 min-h-[44px] min-w-[44px] rounded-full border border-white/10 bg-white/5 p-3 text-white/50 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close game"
          >
            <X className="h-5 w-5" />
          </motion.button>

          {/* Game Container */}
          <div className="relative flex flex-col items-center gap-4 px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-terminal-green font-mono text-base font-bold tracking-[0.2em] sm:text-lg">
                MEMORY MATCH
              </h2>
              <motion.p
                key={
                  hasWon ? "won" : isCenterUnlocked ? "unlock" : matchedPairs
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-xs text-white/50 sm:text-sm"
              >
                {hasWon
                  ? MEMORY_WIN_MESSAGE
                  : isCenterUnlocked
                    ? "✨ Tap the golden card! ✨"
                    : `Match all pairs (${matchedPairs}/4)`}
              </motion.p>
            </motion.div>

            {/* 3x3 Floating Grid */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="grid w-[85vw] max-w-[420px] grid-cols-3 gap-3 sm:gap-4"
            >
              <AnimatePresence mode="popLayout">
                {cards.map((card, index) => (
                  <FloatingCard
                    key={card.id}
                    card={card}
                    floatConfig={
                      floatConfigs[index] ?? { delay: 0, duration: 2.5 }
                    }
                    onClick={(): void => handleCardClick(card.id)}
                    isLocked={card.isCenter && !isCenterUnlocked}
                    isDisabled={isProcessing || hasWon}
                    isCenterUnlocked={isCenterUnlocked}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Win overlay with message and button */}
            <AnimatePresence>
              {hasWon && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-center"
                >
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.5,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="text-3xl font-bold text-yellow-400 drop-shadow-lg sm:text-4xl"
                  >
                    {MEMORY_WIN_MESSAGE}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.3 }}
                    onClick={onClose}
                    className="mt-6 min-h-[48px] min-w-[140px] rounded-xl border border-yellow-400/30 bg-yellow-500/20 px-8 py-3 font-mono text-lg text-yellow-400 backdrop-blur-sm transition-all hover:border-yellow-400/50 hover:bg-yellow-500/30"
                  >
                    Continue
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
