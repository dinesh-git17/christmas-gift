"use client";

import { useEffect, useRef } from "react";

import type { JSX } from "react";

export interface MatrixRainProps {
  /** Opacity of the rain effect (0-1), useful for fading */
  opacity?: number;
}

// Characters to use in the rain (Katakana + Latin + Numbers)
const MATRIX_CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

const FONT_SIZE = 16;
const FALL_SPEED = 0.6;

/**
 * MatrixRain - Canvas-based digital rain effect
 * High-performance implementation using requestAnimationFrame
 */
export function MatrixRain({ opacity = 1 }: MatrixRainProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<number[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Set canvas size to match window
    const resize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reinitialize drops on resize
      const columns = Math.ceil(canvas.width / FONT_SIZE);
      dropsRef.current = Array.from(
        { length: columns },
        () => Math.random() * -100
      );
    };

    resize();
    window.addEventListener("resize", resize);

    // Animation loop
    const draw = (): void => {
      if (!ctx || !canvas) {
        return;
      }

      // Semi-transparent black to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style
      ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;
      ctx.font = `${FONT_SIZE}px monospace`;

      // Draw each column
      const drops = dropsRef.current;
      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] ?? 0;
        // Random character
        const charIndex = Math.floor(Math.random() * MATRIX_CHARS.length);
        const char = MATRIX_CHARS[charIndex] ?? "0";
        const x = i * FONT_SIZE;

        // Draw the character
        ctx.fillText(char, x, y * FONT_SIZE);

        // Randomly reset drop to top (creates varied rain effect)
        if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          // Move drop down
          drops[i] = y + FALL_SPEED;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(draw);

    return (): void => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ opacity }}
    />
  );
}
