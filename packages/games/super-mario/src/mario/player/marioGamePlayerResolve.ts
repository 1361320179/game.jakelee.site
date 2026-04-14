/**
 * 马里奥与固体、隐藏砖的解析：最小穿透轴分离 + 脚底贴台容差，减少穿模与卡角。
 */
import { rectsPlayerVsSolid } from "../collision/marioGameCollision";
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
 * 单步物理后调用：用最小穿透深度迭代分离，处理 vx/vy 为 0 时仍与固体相交的情况。
 */
export function resolveMarioPlayerCollisions(
  p: PlayerColliderState,
  deps: PlayerResolveDeps,
): void {
  const { pw, ph, solids, blocks, tile } = deps;
  let px = p.x;
  let py = p.y;

  for (let iter = 0; iter < 14; iter++) {
    if (p.vy < 0) {
      for (let bid = 0; bid < blocks.length; bid++) {
        const bh = blocks[bid];
        if (!bh.active || !bh.hidden || bh.revealed) continue;
        const br: Rect = { x: bh.x, y: bh.y, w: tile, h: tile };
        if (!rectsPlayerVsSolid(px, py, pw, ph, br)) continue;
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
    }

    let bestPen = Infinity;
    let bestSolid: SolidRef | null = null;
    let bestAxis: "x" | "y" = "x";

    for (const s of solids) {
      if (!rectsPlayerVsSolid(px, py, pw, ph, s)) continue;
      const ox = penetrationX(px, pw, s);
      const oy = penetrationY(py, ph, s);
      if (ox <= 0 || oy <= 0) continue;
      const pen = Math.min(ox, oy);
      if (pen < bestPen) {
        bestPen = pen;
        bestSolid = s;
        bestAxis = ox < oy ? "x" : "y";
      }
    }

    if (!bestSolid) break;

    const s = bestSolid;
    if (bestAxis === "x") {
      const penL = px + pw - s.x;
      const penR = s.x + s.w - px;
      if (penL < penR || (penL === penR && p.vx <= 0)) {
        px = s.x - pw;
      } else {
        px = s.x + s.w;
      }
      p.vx = 0;
    } else {
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
  }

  p.x = px;
  p.y = py;
}
