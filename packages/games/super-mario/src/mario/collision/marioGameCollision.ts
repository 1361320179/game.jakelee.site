/**
 * 与固体 AABB 相交检测及敌人/蘑菇位移解析（无状态纯函数）。
 */
import { MUSHROOM_H, MUSHROOM_W } from "../../marioAssets";
import type { MobBody, MushroomData, Rect, SolidRef } from "../core/marioGameTypes";

export function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  b: Rect,
): boolean {
  return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
}

/** 玩家与固体：脚底与平台顶「贴住」也算重叠，避免严格 AABB 漏检导致穿地。 */
export function rectsPlayerVsSolid(
  px: number,
  py: number,
  pw: number,
  ph: number,
  b: Rect,
): boolean {
  const floorSlop = 1.25;
  return (
    px < b.x + b.w &&
    px + pw > b.x &&
    py < b.y + b.h &&
    py + ph > b.y - floorSlop
  );
}

export function resolveMobHorizontal(
  m: MobBody,
  w: number,
  h: number,
  solids: SolidRef[],
): void {
  for (let iter = 0; iter < 5; iter++) {
    let hit = false;
    for (const s of solids) {
      if (!rectsOverlap(m.x, m.y, w, h, s)) continue;
      if (m.vx > 0) {
        m.x = s.x - w;
        m.vx = -Math.abs(m.vx);
        hit = true;
      } else if (m.vx < 0) {
        m.x = s.x + s.w;
        m.vx = Math.abs(m.vx);
        hit = true;
      }
    }
    if (!hit) break;
  }
}

export function resolveMobVertical(
  m: MobBody,
  w: number,
  h: number,
  solids: SolidRef[],
): void {
  for (let iter = 0; iter < 5; iter++) {
    let hit = false;
    for (const s of solids) {
      if (!rectsOverlap(m.x, m.y, w, h, s)) continue;
      if (m.vy > 0) {
        m.y = s.y - h;
        m.vy = 0;
        hit = true;
      } else if (m.vy < 0) {
        m.y = s.y + s.h;
        m.vy = 0;
        hit = true;
      }
    }
    if (!hit) break;
  }
}

export function resolveMushroomHorizontal(
  m: MushroomData,
  solids: SolidRef[],
): void {
  for (let iter = 0; iter < 5; iter++) {
    let hit = false;
    for (const s of solids) {
      if (!rectsOverlap(m.x, m.y, MUSHROOM_W, MUSHROOM_H, s)) continue;
      if (m.vx > 0) {
        m.x = s.x - MUSHROOM_W;
        m.vx = -Math.abs(m.vx);
        hit = true;
      } else if (m.vx < 0) {
        m.x = s.x + s.w;
        m.vx = Math.abs(m.vx);
        hit = true;
      }
    }
    if (!hit) break;
  }
}

export function resolveMushroomVertical(
  m: MushroomData,
  solids: SolidRef[],
): void {
  for (let iter = 0; iter < 5; iter++) {
    let hit = false;
    for (const s of solids) {
      if (!rectsOverlap(m.x, m.y, MUSHROOM_W, MUSHROOM_H, s)) continue;
      if (m.vy > 0) {
        m.y = s.y - MUSHROOM_H;
        m.vy = 0;
        hit = true;
      } else if (m.vy < 0) {
        m.y = s.y + s.h;
        m.vy = 0;
        hit = true;
      }
    }
    if (!hit) break;
  }
}
