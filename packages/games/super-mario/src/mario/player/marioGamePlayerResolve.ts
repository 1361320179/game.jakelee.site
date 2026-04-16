/**
 * 马里奥与固体、隐藏砖的解析：按 X / Y 分轴回推，减少边角误判导致的卡住。
 */
import {
  rectsOverlap,
  rectsPlayerVsSolid,
} from "../collision/marioGameCollision";
import type { BlockData, Rect, SolidRef } from "../core/marioGameTypes";

export type PlayerColliderState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
};

export type PlayerResolveDeps = {
  pw: number;
  ph: number;
  solids: SolidRef[];
  blocks: BlockData[];
  tile: number;
  /** 顶到固体问号/砖（blockId） */
  onHeadHitSolidBlock: (blockId: number) => void;
  /** 顶开隐藏砖后需重建碰撞体 */
  rebuildBlockSolids: () => void;
  /** 隐藏砖被头撞到：显形并触发与问号砖相同的顶击逻辑 */
  onHiddenBlockHeadBump: (blockId: number) => void;
};

function penetrationX(px: number, pw: number, s: Rect): number {
  return Math.min(px + pw - s.x, s.x + s.w - px);
}

function penetrationY(py: number, ph: number, s: Rect): number {
  return Math.min(py + ph - s.y, s.y + s.h - py);
}

/**
 * 先只解横向；这里使用严格 AABB，避免脚底贴地容差把前方空气误判成横向阻挡。
 */
export function resolveMarioPlayerHorizontalCollisions(
  p: PlayerColliderState,
  deps: PlayerResolveDeps,
): void {
  const { pw, ph, solids } = deps;
  let px = p.x;

  for (let iter = 0; iter < 8; iter++) {
    let bestPen = Infinity;
    let bestSolid: SolidRef | null = null;

    for (const s of solids) {
      if (!rectsOverlap(px, p.y, pw, ph, s)) continue;
      const ox = penetrationX(px, pw, s);
      const oy = penetrationY(p.y, ph, s);
      if (ox <= 0 || oy <= 0) continue;
      if (ox < bestPen) {
        bestPen = ox;
        bestSolid = s;
      }
    }

    if (!bestSolid) break;

    const s = bestSolid;
    const penL = px + pw - s.x;
    const penR = s.x + s.w - px;
    if (penL < penR || (penL === penR && p.vx <= 0)) {
      px = s.x - pw;
    } else {
      px = s.x + s.w;
    }
    p.vx = 0;
  }

  p.x = px;
}

function resolveHiddenBlockHeadHits(
  p: PlayerColliderState,
  deps: PlayerResolveDeps,
): void {
  if (p.vy >= 0) return;
  const { pw, ph, blocks, tile } = deps;
  let py = p.y;

  for (let bid = 0; bid < blocks.length; bid++) {
    const bh = blocks[bid];
    if (!bh.active || !bh.hidden || bh.revealed) continue;
    const br: Rect = { x: bh.x, y: bh.y, w: tile, h: tile };
    if (!rectsOverlap(p.x, py, pw, ph, br)) continue;
    const penB = py + ph - br.y;
    const penT = br.y + br.h - py;
    if (penT >= penB) continue;
    py = br.y + br.h;
    p.vy = 0;
    bh.revealed = true;
    bh.gfx.visible = true;
    deps.rebuildBlockSolids();
    deps.onHiddenBlockHeadBump(bid);
  }

  p.y = py;
}

export function resolveMarioPlayerVerticalCollisions(
  p: PlayerColliderState,
  deps: PlayerResolveDeps,
): void {
  const { pw, ph, solids } = deps;
  resolveHiddenBlockHeadHits(p, deps);
  let py = p.y;

  for (let iter = 0; iter < 8; iter++) {
    let bestPen = Infinity;
    let bestSolid: SolidRef | null = null;

    for (const s of solids) {
      if (!rectsPlayerVsSolid(p.x, py, pw, ph, s)) continue;
      const penB = py + ph - s.y;
      const penT = s.y + s.h - py;
      if (penB <= 0 || penT <= 0) continue;
      const pen = Math.min(penB, penT);
      if (pen < bestPen) {
        bestPen = pen;
        bestSolid = s;
      }
    }

    if (!bestSolid) break;

    const s = bestSolid;
    const penB = py + ph - s.y;
    const penT = s.y + s.h - py;
    if (penB < penT || (penB === penT && p.vy >= 0)) {
      py = s.y - ph;
      if (p.vy >= 0) p.isGrounded = true;
      p.vy = 0;
    } else {
      py = s.y + s.h;
      p.vy = 0;
      if (s.kind === "block" && s.blockId !== undefined) {
        deps.onHeadHitSolidBlock(s.blockId);
      }
    }
  }

  p.y = py;
}

export function resolveMarioPlayerCollisions(
  p: PlayerColliderState,
  deps: PlayerResolveDeps,
): void {
  resolveMarioPlayerHorizontalCollisions(p, deps);
  resolveMarioPlayerVerticalCollisions(p, deps);
}
