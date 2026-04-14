/**
 * 空中金币浮动动画与拾取（从 Game 抽出以控制主文件行数）。
 */
import type { Container } from "pixi.js";
import {
  FLOATING_COIN_H,
  FLOATING_COIN_W,
} from "../../marioAssets";
import { rectsOverlap } from "../collision/marioGameCollision";
import type { BrickParticle, FloatingCoinData } from "../core/marioGameTypes";
import { spawnCoinSparkle } from "../fx/marioGameParticles";

export type MutableCoinHud = {
  coins: number;
  score: number;
  lives: number;
};

export function tickFloatingCoinsAnim(
  coins: FloatingCoinData[],
  animTick: number,
): void {
  for (const c of coins) {
    if (!c.alive) continue;
    const bob = Math.sin(animTick * 0.22 + c.spawnX * 0.015) * 5;
    c.gfx.position.set(c.spawnX, c.spawnY + bob);
  }
}

export function tryCollectFloatingCoins(
  coins: FloatingCoinData[],
  px: number,
  py: number,
  pw: number,
  ph: number,
  world: Container,
  brickParticles: BrickParticle[],
  hud: MutableCoinHud,
): void {
  for (const c of coins) {
    if (!c.alive) continue;
    const gx = c.gfx.position.x;
    const gy = c.gfx.position.y;
    if (
      !rectsOverlap(px, py, pw, ph, {
        x: gx - FLOATING_COIN_W / 2,
        y: gy - FLOATING_COIN_H / 2,
        w: FLOATING_COIN_W,
        h: FLOATING_COIN_H,
      })
    )
      continue;
    c.alive = false;
    c.gfx.visible = false;
    hud.coins += 1;
    hud.score += 200;
    spawnCoinSparkle(world, brickParticles, gx, gy);
    if (hud.coins >= 100) {
      hud.coins -= 100;
      hud.lives += 1;
    }
  }
}
