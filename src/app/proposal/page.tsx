"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";

import { useAudio } from "@/hooks";
import {
  AUDIO_PATHS,
  PROPOSAL_APPRECIATION,
  PROPOSAL_CERTIFICATE,
  PROPOSAL_CONFIG,
} from "@/lib/constants";
import { getSMSLink } from "@/lib/utils";

import type { JSX } from "react";

type ViewState = "APPRECIATION" | "CERTIFICATE";

/**
 * AppreciationMessage - The bridge message before the certificate
 */
interface AppreciationMessageProps {
  onRescue: () => void;
}

function AppreciationMessage({
  onRescue,
}: AppreciationMessageProps): JSX.Element {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showButton, setShowButton] = useState(false);

  // Reveal lines one by one
  useEffect(() => {
    if (visibleLines < PROPOSAL_APPRECIATION.LINES.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, 1500);
      return (): void => clearTimeout(timer);
    } else {
      // All lines visible, show button after delay
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 800);
      return (): void => clearTimeout(timer);
    }
  }, [visibleLines]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-full flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-lg">
        {/* Terminal-style container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-terminal-green/30 rounded-lg border bg-black/60 p-6 backdrop-blur-sm sm:p-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-terminal-green/20 mb-6 border-b pb-4"
          >
            <span className="text-terminal-green font-mono text-lg sm:text-xl">
              {PROPOSAL_APPRECIATION.HEADER}
            </span>
          </motion.div>

          {/* Message lines */}
          <div className="text-terminal-green/80 space-y-4 font-mono text-sm leading-relaxed sm:text-base">
            {PROPOSAL_APPRECIATION.LINES.map((line, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: index < visibleLines ? 1 : 0,
                  x: index < visibleLines ? 0 : -10,
                }}
                transition={{ duration: 0.6 }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* CTA Button */}
          <AnimatePresence>
            {showButton && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRescue}
                  className="bg-terminal-green text-midnight relative w-full overflow-hidden rounded-lg py-4 font-mono text-lg font-bold transition-colors hover:bg-white"
                  type="button"
                >
                  {/* Pulsing glow */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-terminal-green absolute inset-0 rounded-lg blur-md"
                  />
                  <span className="relative z-10">
                    {PROPOSAL_APPRECIATION.CTA}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * RescueCertificate - The final certificate with the proposal question
 */
interface RescueCertificateProps {
  smsLink: string;
}

function RescueCertificate({ smsLink }: RescueCertificateProps): JSX.Element {
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Stagger the content reveal
  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 500);
    const buttonTimer = setTimeout(() => setShowButton(true), 2000);

    return (): void => {
      clearTimeout(contentTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-full flex-col items-center justify-center p-6"
    >
      {/* Certificate container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="bg-midnight/95 relative w-full max-w-md overflow-hidden rounded-xl border-2 border-yellow-500/50 p-6 sm:p-8"
        style={{
          boxShadow:
            "0 0 60px rgba(234, 179, 8, 0.15), 0 0 100px rgba(234, 179, 8, 0.1)",
        }}
      >
        {/* Golden corner decorations */}
        <div className="absolute top-0 left-0 h-16 w-16 border-t-2 border-l-2 border-yellow-500/30" />
        <div className="absolute top-0 right-0 h-16 w-16 border-t-2 border-r-2 border-yellow-500/30" />
        <div className="absolute bottom-0 left-0 h-16 w-16 border-b-2 border-l-2 border-yellow-500/30" />
        <div className="absolute right-0 bottom-0 h-16 w-16 border-r-2 border-b-2 border-yellow-500/30" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -10 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-center"
        >
          <div className="font-mono text-xs tracking-[0.3em] text-yellow-500/60 uppercase">
            {PROPOSAL_CERTIFICATE.FOOTER}
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold tracking-widest text-yellow-500 sm:text-3xl">
            {PROPOSAL_CERTIFICATE.HEADER}
          </h1>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: showContent ? 1 : 0,
            scale: showContent ? 1 : 0.8,
          }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="relative mx-auto mb-6 aspect-square w-48 sm:w-56"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, transparent 70%)",
            }}
          />
          <Image
            src="/assets/ui/reveal_hug.png"
            alt="Rescued"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* The Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 text-center"
        >
          <p className="text-xl leading-relaxed font-light text-white sm:text-2xl">
            {PROPOSAL_CERTIFICATE.QUESTION}
          </p>
        </motion.div>

        {/* CTA Button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.a
                href={smsLink}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-midnight relative block w-full overflow-hidden rounded-lg bg-yellow-500 py-4 text-center font-mono text-lg font-bold transition-colors hover:bg-yellow-400"
              >
                {/* Pulsing glow */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-lg bg-yellow-500 blur-md"
                />
                <span className="relative z-10">
                  {PROPOSAL_CERTIFICATE.CTA}
                </span>
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative seal */}
        <motion.div
          initial={{ opacity: 0, rotate: -20 }}
          animate={{
            opacity: showContent ? 0.3 : 0,
            rotate: showContent ? -12 : -20,
          }}
          transition={{ delay: 0.8 }}
          className="absolute -top-4 -right-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500/40"
        >
          <span className="text-2xl">{"<3"}</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * ProposalPage - The final proposal sequence
 */
export default function ProposalPage(): JSX.Element {
  const [viewState, setViewState] = useState<ViewState>("APPRECIATION");

  // Audio
  const loveStoryMusic = useAudio(AUDIO_PATHS.LOVE_STORY, {
    volume: 0.5,
    loop: true,
  });

  // Start music on mount
  useEffect(() => {
    loveStoryMusic.play();
    return (): void => {
      loveStoryMusic.stop();
    };
  }, [loveStoryMusic]);

  // Generate SMS link
  const smsLink = getSMSLink(
    PROPOSAL_CONFIG.PHONE_NUMBER,
    PROPOSAL_CONFIG.SMS_BODY
  );

  // Handle rescue button click
  const handleRescue = useCallback((): void => {
    // Slight volume swell effect
    loveStoryMusic.setVolume(0.7);
    setViewState("CERTIFICATE");
  }, [loveStoryMusic]);

  return (
    <div className="bg-midnight fixed inset-0">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            viewState === "CERTIFICATE"
              ? "radial-gradient(ellipse at 50% 30%, rgba(234, 179, 8, 0.05) 0%, transparent 60%)"
              : "radial-gradient(ellipse at 50% 30%, rgba(0, 255, 65, 0.03) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewState === "APPRECIATION" && (
          <AppreciationMessage key="appreciation" onRescue={handleRescue} />
        )}
        {viewState === "CERTIFICATE" && (
          <RescueCertificate key="certificate" smsLink={smsLink} />
        )}
      </AnimatePresence>
    </div>
  );
}
