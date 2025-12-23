"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import { GAME_ASSETS, GAME_SPEED, PARALLAX_SPEEDS } from "@/lib/constants";

import { ParallaxLayer, type ParallaxLayerRef } from "./ParallaxLayer";

export interface GameCanvasProps {
  children?: React.ReactNode;
}

export interface GameCanvasRef {
  update: (deltaTime: number) => void;
  reset: () => void;
}

export const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(
  function GameCanvas({ children }, ref) {
    const skyLayerRef = useRef<ParallaxLayerRef>(null);
    const midLayerRef = useRef<ParallaxLayerRef>(null);
    const groundLayerRef = useRef<ParallaxLayerRef>(null);

    useImperativeHandle(ref, () => ({
      update: (deltaTime: number): void => {
        skyLayerRef.current?.updatePosition(GAME_SPEED, deltaTime);
        midLayerRef.current?.updatePosition(GAME_SPEED, deltaTime);
        groundLayerRef.current?.updatePosition(GAME_SPEED, deltaTime);
      },
      reset: (): void => {
        skyLayerRef.current?.reset();
        midLayerRef.current?.reset();
        groundLayerRef.current?.reset();
      },
    }));

    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ overscrollBehaviorY: "none" }}
      >
        {/* Sky layer - slowest (back) */}
        <ParallaxLayer
          ref={skyLayerRef}
          src={GAME_ASSETS.SKY_BG}
          speed={PARALLAX_SPEEDS.SKY}
          zIndex={0}
        />

        {/* Mid layer - medium speed */}
        <ParallaxLayer
          ref={midLayerRef}
          src={GAME_ASSETS.SKY_MID}
          speed={PARALLAX_SPEEDS.MID}
          zIndex={10}
        />

        {/* Ground layer - fastest (front) */}
        <ParallaxLayer
          ref={groundLayerRef}
          src={GAME_ASSETS.GROUND}
          speed={PARALLAX_SPEEDS.GROUND}
          zIndex={20}
          className="top-auto bottom-0 h-1/4"
        />

        {/* Game entities container */}
        <div className="absolute inset-0" style={{ zIndex: 30 }}>
          {children}
        </div>
      </div>
    );
  }
);
