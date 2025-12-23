"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export interface ParallaxLayerProps {
  src: string;
  speed: number;
  zIndex: number;
  className?: string;
}

export interface ParallaxLayerRef {
  updatePosition: (gameSpeed: number, deltaTime: number) => void;
  reset: () => void;
}

export const ParallaxLayer = forwardRef<ParallaxLayerRef, ParallaxLayerProps>(
  function ParallaxLayer({ src, speed, zIndex, className = "" }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);
    const widthRef = useRef(0);

    useImperativeHandle(ref, () => ({
      updatePosition: (gameSpeed: number, deltaTime: number): void => {
        if (!containerRef.current) {
          return;
        }

        // Get the actual width on first call or if not set
        if (widthRef.current === 0) {
          widthRef.current = containerRef.current.offsetWidth / 2;
        }

        // Move based on speed multiplier and delta time (60fps baseline)
        const movement = gameSpeed * speed * deltaTime * 60;
        positionRef.current -= movement;

        // Reset when one full image width has scrolled
        if (positionRef.current <= -widthRef.current) {
          positionRef.current += widthRef.current;
        }

        // Apply transform directly to DOM (no React re-render)
        containerRef.current.style.transform = `translateX(${positionRef.current}px)`;
      },
      reset: (): void => {
        positionRef.current = 0;
        if (containerRef.current) {
          containerRef.current.style.transform = "translateX(0px)";
        }
      },
    }));

    return (
      <div
        className={`absolute inset-0 overflow-hidden ${className}`}
        style={{ zIndex }}
      >
        <div
          ref={containerRef}
          className="flex h-full w-[200%] will-change-transform"
        >
          {/* Two copies of the image for seamless looping */}
          <div
            className="h-full w-1/2 bg-cover bg-center bg-repeat-x"
            style={{ backgroundImage: `url(${src})` }}
          />
          <div
            className="h-full w-1/2 bg-cover bg-center bg-repeat-x"
            style={{ backgroundImage: `url(${src})` }}
          />
        </div>
      </div>
    );
  }
);
