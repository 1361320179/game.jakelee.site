/**
 * 食人花贴图与升降动画。
 */
import { PIRANHA_H, PIRANHA_W, type Smb1TextureSet } from "../../marioAssets";
import type { PiranhaData } from "../core/marioGameTypes";

export function tickPiranhaPlantGraphics(
  piranhas: PiranhaData[],
  smbTextures: Smb1TextureSet,
  animTick: number,
): void {
  for (const pr of piranhas) {
    const t = animTick * 0.25 + pr.phase;
    const chomp = (Math.sin(t) + 1) / 2;
    pr.head.texture = smbTextures.piranhaHead[chomp > 0.52 ? 1 : 0];
    pr.head.setSize(PIRANHA_W, 34);
    const up = (Math.sin(animTick * 0.042 + pr.phase) + 1) / 2;
    const plantY = pr.pipeTop - up * pr.emergeMax - PIRANHA_H;
    pr.gfx.position.set(pr.baseX, plantY);
  }
}
