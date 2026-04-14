/**
 * 掉命粒子与死亡序列时间推进（与关卡宿主解耦）。
 */
import { Graphics, type Container, type Ticker } from "pixi.js";
import type { DeathParticle } from "../core/marioGameTypes";

export function spawnMarioDeathParticles(
  world: Container,
  out: DeathParticle[],
  cx: number,
  cy: number,
): void {
  const colors = [0xe01010, 0x2060d0, 0xf8b890, 0xffd54f, 0xffffff];
  for (let i = 0; i < 16; i++) {
    const g = new Graphics();
    g.roundRect(-4, -4, 8, 8, 2).fill(colors[i % colors.length]!);
    g.position.set(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 16);
    world.addChild(g);
    out.push({
      g,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 5 - 1.5,
      life: 1,
    });
  }
}

export function tickMarioDeathParticles(
  particles: DeathParticle[],
  ticker: Ticker,
): void {
  const dt = ticker.deltaMS / 16.67;
  for (const p of particles) {
    p.life -= 0.011 * dt;
    p.g.x += p.vx * dt;
    p.g.y += p.vy * dt;
    p.vy += 0.34 * dt;
    p.g.alpha = Math.max(0, p.life);
    p.g.rotation += 0.12 * dt;
  }
}

export function pruneDeadParticles(particles: DeathParticle[]): DeathParticle[] {
  return particles.filter((p) => p.life > 0.02);
}

export function clearDeathParticlesGfx(
  world: Container,
  particles: DeathParticle[],
): void {
  for (const p of particles) {
    world.removeChild(p.g);
    p.g.destroy();
  }
  particles.length = 0;
}
