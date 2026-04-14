/**
 * 马里奥与固体、隐藏砖的轴对齐解析（与具体关卡类解耦，便于复用）。
 */
import { rectsOverlap } from "../collision/marioGameCollision";
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

/**
 * 单帧内沿水平或垂直轴解析玩家与固体、隐藏砖相交。
 */
export function resolveMarioPlayerAxis(
  horizontal: boolean,
  p: PlayerColliderState,
  deps: PlayerResolveDeps,
): void {
  const { pw, ph, solids, blocks, tile } = deps;
  let px = p.x;
  let py = p.y;

  for (let iter = 0; iter < 6; iter++) {
    let moved = false;
    for (const s of solids) {
      if (!rectsOverlap(px, py, pw, ph, s)) continue;

      if (horizontal) {
        if (p.vx > 0) {
          px = s.x - pw;
        } else if (p.vx < 0) {
          px = s.x + s.w;
        }
        p.vx = 0;
        moved = true;
      } else {
        if (p.vy > 0) {
          py = s.y - ph;
          p.isGrounded = true;
        } else if (p.vy < 0) {
          py = s.y + s.h;
          if (s.kind === "block" && s.blockId !== undefined) {
            deps.onHeadHitSolidBlock(s.blockId);
          }
        }
        p.vy = 0;
        moved = true;
      }
    }
    if (!horizontal && p.vy < 0) {
      for (let bid = 0; bid < blocks.length; bid++) {
        const bh = blocks[bid];
        if (!bh.active || !bh.hidden || bh.revealed) continue;
        const br: Rect = { x: bh.x, y: bh.y, w: tile, h: tile };
        if (!rectsOverlap(px, py, pw, ph, br)) continue;
        py = br.y + br.h;
        p.vy = 0;
        bh.revealed = true;
        bh.gfx.visible = true;
        deps.rebuildBlockSolids();
        deps.onHiddenBlockHeadBump(bid);
        moved = true;
      }
    }
    if (!moved) break;
  }

  p.x = px;
  p.y = py;
}
