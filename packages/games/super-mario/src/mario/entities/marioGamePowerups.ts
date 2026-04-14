/**
 * 蘑菇移动与拾取（变大）。
 */
import {
  rectsOverlap,
  resolveMushroomHorizontal,
  resolveMushroomVertical,
} from "../collision/marioGameCollision";
import {
  MUSHROOM_H,
  MUSHROOM_W,
  PLAYER_BIG_H,
  PLAYER_H,
} from "../../marioAssets";
import type { MushroomData, SolidRef } from "../core/marioGameTypes";
import { marioPhysics } from "../core/marioGameTypes";

export function moveMushroomEntity(
  m: MushroomData,
  solids: SolidRef[],
  fallOffY: number,
): void {
  if (!m.alive) return;
  m.vy += marioPhysics.entityGravity;
  m.x += m.vx;
  resolveMushroomHorizontal(m, solids);
  m.y += m.vy;
  resolveMushroomVertical(m, solids);
  if (m.y > fallOffY) {
    m.alive = false;
    m.gfx.visible = false;
  }
  m.gfx.position.set(m.x, m.y);
}

export function tryPickupMushrooms(
  mushrooms: MushroomData[],
  px: number,
  py: number,
  pw: number,
  ph: number,
  isBig: boolean,
  playerY: number,
): { scoreAdd: number; isBig: boolean; playerY: number } {
  let scoreAdd = 0;
  let big = isBig;
  let pyOut = playerY;
  for (const m of mushrooms) {
    if (!m.alive) continue;
    if (
      !rectsOverlap(px, py, pw, ph, {
        x: m.x,
        y: m.y,
        w: MUSHROOM_W,
        h: MUSHROOM_H,
      })
    )
      continue;
    m.alive = false;
    m.gfx.visible = false;
    scoreAdd += 1000;
    if (!big) {
      big = true;
      pyOut -= PLAYER_BIG_H - PLAYER_H;
    }
  }
  return { scoreAdd, isBig: big, playerY: pyOut };
}
