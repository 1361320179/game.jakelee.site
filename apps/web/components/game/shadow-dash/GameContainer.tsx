"use client";

import type { MarioHudState } from "@game/shadow-dash";
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
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches
  );
}

/**
 * Reliable portrait detection on mobile: many browsers mis-report
 * `(orientation: portrait)` vs visual viewport during chrome UI / rotation.
 */
function readIsPortrait(): boolean {
  if (typeof window === "undefined") return false;

  const vv = window.visualViewport;
  let w = vv?.width ?? window.innerWidth;
  let h = vv?.height ?? window.innerHeight;

  if (w <= 1 || h <= 1) {
    w = window.innerWidth || window.screen?.width || w;
    h = window.innerHeight || window.screen?.height || h;
  }

  // Prefer the actual viewport aspect ratio. Some mobile browsers keep
  // `screen.orientation.type` stale after rotation or while browser chrome animates.
  if (w > h) return false;
  if (h > w) return true;

  const type = screen.orientation?.type ?? "";
  if (type.includes("landscape")) return false;
  if (type.includes("portrait")) return true;

  const legacy = (window as Window & { orientation?: number }).orientation;
  if (legacy === 90 || legacy === -90) return false;
  if (legacy === 0 || legacy === 180) return true;

  return window.matchMedia("(orientation: portrait)").matches;
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

async function tryUnlockOrientation(): Promise<void> {
  try {
    const o = screen.orientation as ScreenOrientation & {
      unlock?: () => void;
    };
    o?.unlock?.();
  } catch {
    /* */
  }
}

function PortraitRotateHint({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="game-portrait-hint" role="status" aria-live="polite">
      <div className="game-portrait-hint-card">
        <button
          type="button"
          className="game-portrait-hint-dismiss"
          onClick={onDismiss}
          aria-label="关闭横屏提示"
        >
          ✕
        </button>
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
  const [marioHud, setMarioHud] = useState<MarioHudState>({
    score: 0,
    coins: 0,
    lives: 3,
    world: "WORLD 1-1",
    time: 300,
  });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [portraitHint, setPortraitHint] = useState(false);
  const [portraitHintDismissed, setPortraitHintDismissed] = useState(false);
  /** 用户手动「横屏模式」：CSS 旋转视口，不依赖 orientation API */
  const [manualLandscape, setManualLandscape] = useState(false);

  const applyManualLandscape = useCallback(async () => {
    const el = rootRef.current;
    await tryEnterFullscreen(el);
    await tryLockLandscape();
    setManualLandscape(true);
  }, []);

  const clearManualLandscape = useCallback(async () => {
    setManualLandscape(false);
    await tryUnlockOrientation();
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      /* */
    }
  }, []);

  const syncPortraitHint = useCallback(() => {
    if (typeof window === "undefined") return;
    const portrait = readIsPortrait();
    const shouldShowHint = portrait && isTouchLike() && !portraitHintDismissed;
    setPortraitHint(shouldShowHint);

    // Re-enable the hint the next time the device returns to landscape,
    // so a later portrait session can still show guidance again.
    if (!portrait && portraitHintDismissed) {
      setPortraitHintDismissed(false);
    }
  }, [portraitHintDismissed]);

  /** After rotation, dimensions often update one frame late (iOS / Chrome). */
  const scheduleSyncPortraitHint = useCallback(() => {
    syncPortraitHint();
    requestAnimationFrame(() => {
      syncPortraitHint();
      requestAnimationFrame(syncPortraitHint);
    });
    window.setTimeout(syncPortraitHint, 120);
    window.setTimeout(syncPortraitHint, 350);
  }, [syncPortraitHint]);

  useEffect(() => {
    document.documentElement.classList.add("game-play-active");
    return () => {
      document.documentElement.classList.remove("game-play-active");
    };
  }, []);

  useEffect(() => {
    scheduleSyncPortraitHint();

    const mq = window.matchMedia("(orientation: portrait)");
    const onMq = () => scheduleSyncPortraitHint();
    mq.addEventListener("change", onMq);

    window.addEventListener("resize", scheduleSyncPortraitHint);
    window.addEventListener("orientationchange", scheduleSyncPortraitHint);

    const vv = window.visualViewport;
    vv?.addEventListener("resize", scheduleSyncPortraitHint);
    vv?.addEventListener("scroll", scheduleSyncPortraitHint);

    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("resize", scheduleSyncPortraitHint);
      window.removeEventListener("orientationchange", scheduleSyncPortraitHint);
      vv?.removeEventListener("resize", scheduleSyncPortraitHint);
      vv?.removeEventListener("scroll", scheduleSyncPortraitHint);
    };
  }, [scheduleSyncPortraitHint]);

  useEffect(() => {
    let cancelled = false;
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - startTime);
    }, 100);

    let unmountFn: (() => void) | null = null;

    const initGame = async () => {
      // Pixi 横版游戏：包内自管画布与物理，经回调同步冲刺冷却等
      if (slug === "shadow-dash") {
        const { mountGame, unmountGame } = await import("@game/shadow-dash");
        if (cancelled) return;
        unmountFn = unmountGame;
        await mountGame("pixi-canvas-container", {
          onHudUpdate: (s) => setMarioHud(s),
          onLevelComplete: () => alert("Course Clear!"),
          onGameOver: () => alert("Game Over"),
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
      className={`game-viewport-shell game-viewport-shell--fullscreen${manualLandscape ? " game-viewport-shell--manual-landscape" : ""}`}
    >
      <Link
        href={backHref}
        className="game-play-exit"
        prefetch={false}
        aria-label="返回游戏列表"
      >
        ✕
      </Link>

      <PortraitRotateHint
        visible={portraitHint}
        onDismiss={() => {
          setPortraitHint(false);
          setPortraitHintDismissed(true);
        }}
      />

      {isTouchLike() && (
        <button
          type="button"
          className={`game-landscape-fab${manualLandscape ? " game-landscape-fab--active" : ""}`}
          onClick={() =>
            manualLandscape ? void clearManualLandscape() : void applyManualLandscape()
          }
          aria-pressed={manualLandscape}
          aria-label={
            manualLandscape
              ? "退出横屏模式"
              : "横屏模式：全屏并尝试锁定横屏"
          }
        >
          <span className="game-landscape-fab-icon" aria-hidden>
            {manualLandscape ? "⤢" : "⤾"}
          </span>
          <span className="game-landscape-fab-text">
            {manualLandscape ? "恢复" : "横屏"}
          </span>
        </button>
      )}

      <div className="game-viewport-inner">
        <div
          id="pixi-canvas-container"
          className="game-pixi-mount"
          style={{ width: "100%", height: "100%" }}
        />

        <GameOverlay
          levelName={`L1-1 · ${slug}`}
          timeElapsed={timeElapsed}
          marioHud={slug === "shadow-dash" ? marioHud : null}
          showPrompts={true}
        />
      </div>
    </div>
  );
};
