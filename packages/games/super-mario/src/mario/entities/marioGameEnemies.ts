/**
 * 板栗仔 / 绿龟移动与滑壳击杀（从 Game 抽出以控制主文件行数）。
 */
import {
  GOOMBA_H,
  GOOMBA_W,
  KOOPA_H,
  KOOPA_W,
  type Smb1TextureSet,
} from "../../marioAssets";
import { rectsOverlap, resolveMobHorizontal, resolveMobVertical } from "../collision/marioGameCollision";
import type { GoombaData, KoopaData, SolidRef } from "../core/marioGameTypes";
import { marioPhysics } from "../core/marioGameTypes";

export function moveGoombaEntity(
  g: GoombaData,
  solids: SolidRef[],
  fallOffY: number,
): void {
  if (!g.alive) return;

  g.vy += marioPhysics.entityGravity;
  g.x += g.vx;
  resolveMobHorizontal(g, GOOMBA_W, GOOMBA_H, solids);

  g.y += g.vy;
  resolveMobVertical(g, GOOMBA_W, GOOMBA_H, solids);

  if (g.y > fallOffY) {
    g.alive = false;
    g.gfx.visible = false;
  }

  g.gfx.position.set(g.x, g.y);
}

export function moveKoopaEntity(
  k: KoopaData,
  solids: SolidRef[],
  goombas: GoombaData[],
  koopas: KoopaData[],
  smbTextures: Smb1TextureSet,
  animTick: number,
  fallOffY: number,
): number {
  let scoreAdd = 0;
  if (!k.alive) return scoreAdd;

  k.vy += marioPhysics.entityGravity;
  k.x += k.vx;
  resolveMobHorizontal(k, KOOPA_W, KOOPA_H, solids);
  k.y += k.vy;
  resolveMobVertical(k, KOOPA_W, KOOPA_H, solids);

  if (k.y > fallOffY) {
    k.alive = false;
    k.gfx.visible = false;
  }

  if (k.alive && k.mode === "slide" && Math.abs(k.vx) > 2.4) {
    for (const g of goombas) {
      if (!g.alive) continue;
      if (
        !rectsOverlap(k.x, k.y, KOOPA_W, KOOPA_H, {
          x: g.x,
          y: g.y,
          w: GOOMBA_W,
          h: GOOMBA_H,
        })
      )
        continue;
      g.alive = false;
      g.gfx.visible = false;
      scoreAdd += 100;
    }
    for (const o of koopas) {
      if (!o.alive || o === k) continue;
      if (o.mode !== "walk") continue;
      if (
        !rectsOverlap(k.x, k.y, KOOPA_W, KOOPA_H, {
          x: o.x,
          y: o.y,
          w: KOOPA_W,
          h: KOOPA_H,
        })
      )
        continue;
      o.alive = false;
      o.gfx.visible = false;
      scoreAdd += 200;
    }
  }

  k.gfx.position.set(k.x, k.y);
  if (k.mode === "walk") {
    const fr = Math.floor(animTick * 0.55) % 2;
    k.sprite.texture = smbTextures.koopaWalk[fr]!;
    k.sprite.setSize(KOOPA_W, KOOPA_H);
  }
  return scoreAdd;
}
