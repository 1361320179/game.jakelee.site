/**
 * 踩踏板栗仔 / 绿龟与食人花受伤判定（与宿主解耦，便于换关卡数据）。
 */
import {
  GOOMBA_H,
  GOOMBA_W,
  KOOPA_H,
  KOOPA_W,
  PLAYER_BIG_H,
  PLAYER_H,
  PIRANHA_H,
  PIRANHA_W,
  type Smb1TextureSet,
} from "../../marioAssets";
import { rectsOverlap } from "../collision/marioGameCollision";
import type { GoombaData, KoopaData, PiranhaData, Rect } from "../core/marioGameTypes";
import { marioPhysics } from "../core/marioGameTypes";

export type StompScratch = {
  vy: number;
  isGrounded: boolean;
  score: number;
};

export function applyGoombaStompAndDamage(
  goombas: GoombaData[],
  px: number,
  py: number,
  pw: number,
  ph: number,
  scratch: StompScratch,
  gate: { won: boolean; frozen: boolean; deathSequenceMs: number; flagSliding: boolean },
  onSideHitEnemy: () => void,
): void {
  if (gate.flagSliding) return;

  for (const g of goombas) {
    if (!g.alive) continue;
    if (!rectsOverlap(px, py, pw, ph, { x: g.x, y: g.y, w: GOOMBA_W, h: GOOMBA_H }))
      continue;

    const stomp =
      scratch.vy > 0.35 &&
      py + ph <= g.y + GOOMBA_H * 0.55;

    if (stomp) {
      g.alive = false;
      g.gfx.visible = false;
      scratch.score += 100;
      scratch.vy = marioPhysics.stompBounce;
      scratch.isGrounded = false;
    } else if (!gate.won && !gate.frozen && gate.deathSequenceMs <= 0) {
      onSideHitEnemy();
      break;
    }
  }
}

export function applyKoopaStompAndDamage(
  koopas: KoopaData[],
  smbTextures: Smb1TextureSet,
  px: number,
  py: number,
  pw: number,
  ph: number,
  scratch: StompScratch,
  gate: { won: boolean; frozen: boolean; deathSequenceMs: number; flagSliding: boolean },
  onSideHitEnemy: () => void,
): void {
  if (gate.flagSliding) return;

  for (const k of koopas) {
    if (!k.alive) continue;
    if (
      !rectsOverlap(px, py, pw, ph, {
        x: k.x,
        y: k.y,
        w: KOOPA_W,
        h: KOOPA_H,
      })
    )
      continue;

    const stomp =
      scratch.vy > 0.35 && py + ph <= k.y + KOOPA_H * 0.52;

    if (stomp) {
      if (gate.won || gate.frozen || gate.deathSequenceMs > 0) break;
      if (k.mode === "walk") {
        k.mode = "shell";
        k.vx = 0;
        k.sprite.texture = smbTextures.koopaShell;
        k.sprite.setSize(KOOPA_W, KOOPA_H);
        scratch.score += 100;
        scratch.vy = marioPhysics.stompBounce;
        scratch.isGrounded = false;
      } else if (k.mode === "shell") {
        k.mode = "slide";
        const pcx = px + pw / 2;
        k.vx =
          pcx >= k.x + KOOPA_W / 2
            ? marioPhysics.shellSlideSpeed
            : -marioPhysics.shellSlideSpeed;
        scratch.score += 400;
        scratch.vy = marioPhysics.stompBounce;
        scratch.isGrounded = false;
      } else {
        k.vx *= -1;
        scratch.score += 100;
        scratch.vy = marioPhysics.stompBounce;
        scratch.isGrounded = false;
      }
      continue;
    }

    if (gate.won || gate.frozen || gate.deathSequenceMs > 0) continue;

    if (k.mode === "slide") {
      onSideHitEnemy();
      break;
    }
    if (k.mode === "walk") {
      onSideHitEnemy();
      break;
    }
  }
}

export function checkPiranhaPlantHits(
  piranhas: PiranhaData[],
  animTick: number,
  px: number,
  py: number,
  pw: number,
  ph: number,
  opts: {
    won: boolean;
    frozen: boolean;
    deathSequenceMs: number;
    iframes: number;
    flagSliding: boolean;
  },
  onHitEnemy: () => void,
): void {
  if (opts.flagSliding) return;
  if (opts.won || opts.frozen || opts.deathSequenceMs > 0 || opts.iframes > 0) return;

  for (const pr of piranhas) {
    const up = (Math.sin(animTick * 0.042 + pr.phase) + 1) / 2;
    if (up < 0.3) continue;
    const plantY = pr.pipeTop - up * pr.emergeMax - PIRANHA_H;
    const hurt: Rect = {
      x: pr.baseX + 8,
      y: plantY + 18,
      w: PIRANHA_W - 16,
      h: PIRANHA_H - 22,
    };
    if (rectsOverlap(px, py, pw, ph, hurt)) {
      onHitEnemy();
      break;
    }
  }
}

export function tryShrinkMarioFromHit(
  iframes: number,
  isBig: boolean,
  playerY: number,
): { iframes: number; isBig: boolean; playerY: number; shrank: boolean; needDeath: boolean } {
  if (iframes > 0)
    return { iframes, isBig, playerY, shrank: false, needDeath: false };
  if (isBig) {
    return {
      iframes: 110,
      isBig: false,
      playerY: playerY + (PLAYER_BIG_H - PLAYER_H),
      shrank: true,
      needDeath: false,
    };
  }
  return { iframes, isBig, playerY, shrank: false, needDeath: true };
}
