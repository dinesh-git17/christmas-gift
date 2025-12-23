"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";

export interface ParallaxLayerProps {
  src: string;
  speed: number;
  zIndex: number;
  className?: string;
  /** Width of one tile in pixels - used for seamless looping */
  tileWidth?: number;
  /** Vertical alignment of the background image */
  verticalAlign?: "top" | "center" | "bottom";
  /** Scale background larger than container to crop edges (e.g., 120 = 120% height) */
  backgroundScale?: number;
}

export interface ParallaxLayerRef {
  updatePosition: (gameSpeed: number, deltaTime: number) => void;
  reset: () => void;
}

export const ParallaxLayer = forwardRef<ParallaxLayerRef, ParallaxLayerProps>(
  function ParallaxLayer(
    {
      src,
      speed,
      zIndex,
      className = "",
      tileWidth,
      verticalAlign = "center",
      backgroundScale,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);
    const imageTileWidthRef = useRef(0);

    // Preload image to get its natural dimensions for proper tiling
    useEffect(() => {
      if (tileWidth) {
        imageTileWidthRef.current = tileWidth;
        return;
      }

      const img = new Image();
      img.onload = (): void => {
        if (containerRef.current) {
          // Calculate scaled width based on container height and image aspect ratio
          const containerHeight = containerRef.current.offsetHeight;
          const scale = (backgroundScale ?? 100) / 100;
          const scaledHeight = containerHeight * scale;
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          imageTileWidthRef.current = scaledHeight * aspectRatio;
        }
      };
      img.src = src;
    }, [src, tileWidth, backgroundScale]);

    useImperativeHandle(ref, () => ({
      updatePosition: (gameSpeed: number, deltaTime: number): void => {
        if (!containerRef.current || imageTileWidthRef.current === 0) {
          return;
        }

        // Move based on speed multiplier and delta time (60fps baseline)
        const movement = gameSpeed * speed * deltaTime * 60;
        positionRef.current -= movement;

        // Reset when one full tile width has scrolled (seamless loop)
        if (positionRef.current <= -imageTileWidthRef.current) {
          positionRef.current += imageTileWidthRef.current;
        }

        // Apply background position directly to DOM (no React re-render)
        containerRef.current.style.backgroundPositionX = `${positionRef.current}px`;
      },
      reset: (): void => {
        positionRef.current = 0;
        if (containerRef.current) {
          containerRef.current.style.backgroundPositionX = "0px";
        }
      },
    }));

    const bgPositionY =
      verticalAlign === "top"
        ? "top"
        : verticalAlign === "bottom"
          ? "bottom"
          : "center";

    // Scale > 100 makes image larger than container, overflow:hidden crops edges
    const bgSize = backgroundScale ? `auto ${backgroundScale}%` : "auto 100%";

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden ${className}`}
        style={{
          zIndex,
          backgroundImage: `url(${src})`,
          backgroundRepeat: "repeat-x",
          backgroundSize: bgSize,
          backgroundPositionY: bgPositionY,
          // GPU acceleration for smooth scrolling on Safari
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          willChange: "background-position",
        }}
      />
    );
  }
);
