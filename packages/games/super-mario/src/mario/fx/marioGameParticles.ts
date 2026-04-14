/**
 * 砖块碎屑与金币闪光粒子（与主循环拆分）。
 */
import { Container, Graphics, type Ticker } from "pixi.js";
import type { BrickParticle } from "../core/marioGameTypes";

export function spawnBrickDebris(
  world: Container,
  particles: BrickParticle[],
  cx: number,
  cy: number,
): void {
  const colors = [0xb53120, 0xd85838, 0x6b1808, 0x4a1510, 0xfcb468];
  const n = 10 + Math.floor(Math.random() * 5);
  for (let i = 0; i < n; i++) {
    const g = new Graphics();
    const s = 3 + Math.random() * 4;
    g.rect(-s / 2, -s / 2, s, s).fill(colors[i % colors.length]!);
    g.position.set(cx + (Math.random() - 0.5) * 18, cy + (Math.random() - 0.5) * 10);
    world.addChild(g);
    particles.push({
      g,
      vx: (Math.random() - 0.5) * 5.5,
      vy: -Math.random() * 7 - 2,
      life: 1,
      av: (Math.random() - 0.5) * 0.35,
    });
  }
}

export function spawnCoinSparkle(
  world: Container,
  particles: BrickParticle[],
  cx: number,
  cy: number,
): void {
  const colors = [0xfcb020, 0xf8e040, 0xc88808, 0xffe8a0];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const g = new Graphics();
    const s = 2.2 + Math.random() * 2.4;
    g.circle(0, 0, s).fill(colors[i % colors.length]!);
    g.position.set(cx + (Math.random() - 0.5) * 14, cy + (Math.random() - 0.5) * 10);
    world.addChild(g);
    particles.push({
      g,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 5.5 - 1.5,
      life: 1,
      av: (Math.random() - 0.5) * 0.45,
    });
  }
}

export function updateBrickParticles(
  world: Container,
  particles: BrickParticle[],
  ticker: Ticker,
): void {
  if (particles.length === 0) return;
  const dt = ticker.deltaMS / 16.67;
  for (const p of particles) {
    p.life -= 0.018 * dt;
    p.g.x += p.vx * dt;
    p.g.y += p.vy * dt;
    p.vy += 0.42 * dt;
    p.g.rotation += p.av * dt;
    p.g.alpha = Math.max(0, p.life);
  }
  for (const p of particles) {
    if (p.life <= 0.02) {
      world.removeChild(p.g);
      p.g.destroy();
    }
  }
  const kept = particles.filter((p) => p.life > 0.02);
  particles.length = 0;
  particles.push(...kept);
}

export function clearBrickParticles(
  world: Container,
  particles: BrickParticle[],
): void {
  for (const p of particles) {
    world.removeChild(p.g);
    p.g.destroy();
  }
  particles.length = 0;
}
