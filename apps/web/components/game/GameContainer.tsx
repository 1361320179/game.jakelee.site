"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameOverlay } from "./GameOverlay";

interface GameContainerProps {
  slug: string;
  /** Localized path back to game list, e.g. /en/games */
  backHref: string;
}

function isTouchLike(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches
  );
}

async function tryEnterFullscreen(el: HTMLElement | null): Promise<void> {
  if (!el) return;
  try {
    if (document.fullscreenElement == null && el.requestFullscreen) {
      await el.requestFullscreen();
    }
  } catch {
    /* user may deny or API unsupported */
  }
}

async function tryLockLandscape(): Promise<void> {
  try {
    const o = screen.orientation as ScreenOrientation & {
      lock?: (type: string) => Promise<void>;
    };
    if (o?.lock) {
      await o.lock("landscape");
    }
  } catch {
    /* iOS / desktop / no gesture */
  }
}

function PortraitRotateHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="game-portrait-hint" role="status" aria-live="polite">
      <div className="game-portrait-hint-card">
        <div className="game-portrait-hint-icon" aria-hidden>
          <span className="game-portrait-phone">📱</span>
          <span className="game-portrait-arrow">↻</span>
        </div>
        <p className="game-portrait-hint-title">请横屏游玩 · Landscape</p>
        <p className="game-portrait-hint-sub">
          旋转设备至横屏以获得最佳体验 · Rotate for a wider play area
        </p>
      </div>
    </div>
  );
}

export const GameContainer: React.FC<GameContainerProps> = ({
  slug,
  backHref,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dashProgress, setDashProgress] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [portraitHint, setPortraitHint] = useState(false);

  const syncPortraitHint = useCallback(() => {
    if (typeof window === "undefined") return;
    const portrait = window.matchMedia("(orientation: portrait)").matches;
    setPortraitHint(portrait && isTouchLike());
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("game-play-active");
    return () => {
      document.documentElement.classList.remove("game-play-active");
    };
  }, []);

  useEffect(() => {
    syncPortraitHint();
    const mq = window.matchMedia("(orientation: portrait)");
    const onChange = () => syncPortraitHint();
    mq.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [syncPortraitHint]);

  useEffect(() => {
    let cancelled = false;
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - startTime);
    }, 100);

    let unmountFn: (() => void) | null = null;

    const initGame = async () => {
      if (slug === "shadow-dash") {
        const { mountGame, unmountGame } = await import("@game/shadow-dash");
        if (cancelled) return;
        unmountFn = unmountGame;
        await mountGame("pixi-canvas-container", {
          onDashCooldownUpdate: (progress) => setDashProgress(progress),
          onLevelComplete: () => alert("Level Complete!"),
        });
      }
    };

    void initGame();

    return () => {
      cancelled = true;
      clearInterval(interval);
      unmountFn?.();
    };
  }, [slug]);

  useEffect(() => {
    const onFirstGesture = () => {
      const el = rootRef.current;
      void tryEnterFullscreen(el);
      void tryLockLandscape();
    };
    window.addEventListener("pointerdown", onFirstGesture, { passive: true });
    void tryLockLandscape();
    return () => window.removeEventListener("pointerdown", onFirstGesture);
  }, []);

  return (
    <div
      ref={rootRef}
      className="game-viewport-shell game-viewport-shell--fullscreen"
    >
      <Link
        href={backHref}
        className="game-play-exit"
        prefetch={false}
        aria-label="返回游戏列表"
      >
        ✕
      </Link>

      <PortraitRotateHint visible={portraitHint} />

      <div className="game-viewport-inner">
        <div
          id="pixi-canvas-container"
          className="game-pixi-mount"
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
