/**
 * HUD 节流上报（与 Pixi 主循环解耦）。
 */
import type { MarioHudState } from "../core/marioGameTypes";

const HUD_MIN_INTERVAL_MS = 120;

export type MarioHudSnapshot = {
  score: number;
  coins: number;
  lives: number;
  worldLabel: string;
  time: number;
};

export function tryEmitMarioHud(
  onHud: ((s: MarioHudState) => void) | undefined,
  lastEmitMs: number,
  force: boolean,
  snap: MarioHudSnapshot,
): number {
  if (!onHud) return lastEmitMs;
  const now = performance.now();
  if (!force && now - lastEmitMs < HUD_MIN_INTERVAL_MS) return lastEmitMs;
  onHud({
    score: snap.score,
    coins: snap.coins,
    lives: snap.lives,
    world: snap.worldLabel,
    time: snap.time,
  });
  return now;
}
