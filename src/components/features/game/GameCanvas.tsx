"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import { GAME_ASSETS, PARALLAX_SPEEDS } from "@/lib/constants";

import { ParallaxLayer, type ParallaxLayerRef } from "./ParallaxLayer";

export interface GameCanvasProps {
  children?: React.ReactNode;
}

export interface GameCanvasRef {
  update: (deltaTime: number, currentSpeed: number) => void;
  reset: () => void;
}

export const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(
  function GameCanvas({ children }, ref) {
    const skyLayerRef = useRef<ParallaxLayerRef>(null);
    const midLayerRef = useRef<ParallaxLayerRef>(null);
    const groundLayerRef = useRef<ParallaxLayerRef>(null);

    useImperativeHandle(ref, () => ({
      update: (deltaTime: number, currentSpeed: number): void => {
        skyLayerRef.current?.updatePosition(currentSpeed, deltaTime);
        midLayerRef.current?.updatePosition(currentSpeed, deltaTime);
        groundLayerRef.current?.updatePosition(currentSpeed, deltaTime);
      },
      reset: (): void => {
        skyLayerRef.current?.reset();
        midLayerRef.current?.reset();
        groundLayerRef.current?.reset();
      },
    }));

    return (
      <div
        className="relative h-full w-full overflow-hidden bg-[#1a1a2e]"
        style={{ overscrollBehaviorY: "none" }}
      >
        {/*
          Sky layer - village scene with transparent bottom
          Aligned to top, scaled to show full scene width
          The bottom ~40% is transparent, designed to blend with ground
        */}
        <ParallaxLayer
          ref={skyLayerRef}
          src={GAME_ASSETS.SKY_BG}
          speed={PARALLAX_SPEEDS.SKY}
          zIndex={0}
          verticalAlign="top"
        />

        {/* Mid layer - disabled, not needed with new assets */}
        <ParallaxLayer
          ref={midLayerRef}
          src={GAME_ASSETS.SKY_MID}
          speed={PARALLAX_SPEEDS.MID}
          zIndex={10}
          verticalAlign="top"
          className="hidden"
        />

        {/*
          Ground layer - snow surface and underground ice crystals
          Positioned at bottom 30%, showing snow edge and ice underground
        */}
        <ParallaxLayer
          ref={groundLayerRef}
          src={GAME_ASSETS.GROUND}
          speed={PARALLAX_SPEEDS.GROUND}
          zIndex={20}
          verticalAlign="center"
          backgroundScale={180}
          className="!top-auto !h-[35%]"
        />

        {/* Game entities container */}
        <div className="absolute inset-0" style={{ zIndex: 30 }}>
          {children}
        </div>
      </div>
    );
  }
);
