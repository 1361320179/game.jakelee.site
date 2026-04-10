"use client";

import React, { useEffect, useState } from "react";
import { GameOverlay } from "./GameOverlay";

interface GameContainerProps {
  slug: string;
}

export const GameContainer: React.FC<GameContainerProps> = ({ slug }) => {
  const [dashProgress, setDashProgress] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Timer
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - startTime);
    }, 100);

    // Dynamically import the game to avoid SSR issues with PixiJS
    let unmountFn: (() => void) | null = null;
    
    const initGame = async () => {
      if (slug === "shadow-dash") {
        const { mountGame, unmountGame } = await import("@game/shadow-dash");
        unmountFn = unmountGame;
        await mountGame("pixi-canvas-container", {
          onDashCooldownUpdate: (progress) => setDashProgress(progress),
          onLevelComplete: () => alert("Level Complete!")
        });
      }
    };

    initGame();

    return () => {
      clearInterval(interval);
      if (unmountFn) unmountFn();
    };
  }, [slug]);

  return (
    <div
      className="game-viewport-shell"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        marginTop: "40px",
        borderRadius: "24px",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #fde68a 0%, #fda4af 35%, #93c5fd 70%, #5eead4 100%)",
        padding: "4px",
        boxShadow:
          "0 18px 40px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(255,255,255,0.35) inset",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          background: "#0f172a",
        }}
      >
      {/* PixiJS Canvas Container */}
        <div
          id="pixi-canvas-container"
          style={{ width: "100%", height: "100%" }}
        />

        <GameOverlay
          levelName={`L1-1 · ${slug}`}
          timeElapsed={timeElapsed}
          dashCooldownProgress={dashProgress}
          showPrompts={true}
        />
      </div>
    </div>
  );
};
