/**
 * 问号砖闪烁与砖块顶动动画（无经济/碰撞副作用）。
 */
import { Sprite } from "pixi.js";
import type { Ticker } from "pixi.js";
import { TILE, type Smb1TextureSet } from "../../marioAssets";
import type { BlockData } from "../core/marioGameTypes";

export function tickQuestionBlocksBlink(
  blocks: BlockData[],
  animTick: number,
  smbTextures: Smb1TextureSet,
): void {
  const useB = Math.floor(animTick * 2.8) % 2 === 1;
  const tex = useB ? smbTextures.questionB : smbTextures.question;
  for (const b of blocks) {
    if (!b.active || (b.hidden && !b.revealed)) continue;
    if (b.kind !== "question" || b.used) continue;
    const spr = b.gfx.children[0];
    if (spr instanceof Sprite) {
      spr.texture = tex;
      spr.setSize(TILE, TILE);
    }
  }
}

export function tickBlockBumpOffsets(blocks: BlockData[], ticker: Ticker): void {
  const dt = ticker.deltaMS / 16.67;
  for (const b of blocks) {
    if (!b.active || b.bump <= 0) continue;
    b.bump -= 0.14 * dt;
    const amp = Math.max(0, b.bump);
    b.gfx.y = b.y - Math.sin(amp * Math.PI) * 10;
    if (b.bump <= 0) {
      b.bump = 0;
      b.gfx.y = b.y;
    }
  }
}
