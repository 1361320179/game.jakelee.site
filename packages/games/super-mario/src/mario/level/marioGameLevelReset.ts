/**
 * 关卡动态实体复位（不含重新 buildMarioLevel，便于同一关卡数据多次重置）。
 */
import { Container } from "pixi.js";
import {
  KOOPA_H,
  KOOPA_W,
  createBrickSprite,
  createQuestionSprite,
  type Smb1TextureSet,
} from "../../marioAssets";
import { clearBrickParticles } from "../fx/marioGameParticles";
import type {
  BlockData,
  BrickParticle,
  FloatingCoinData,
  GoombaData,
  KoopaData,
  MushroomData,
} from "../core/marioGameTypes";
import { marioPhysics } from "../core/marioGameTypes";

export type MarioLevelResetJson = {
  goombas: { x: number; y: number }[];
  koopas?: { x: number; y: number }[];
};

export function resetDynamicLevelEntities(o: {
  world: Container;
  brickParticles: BrickParticle[];
  mushrooms: MushroomData[];
  blocks: BlockData[];
  floatingCoins: FloatingCoinData[];
  goombas: GoombaData[];
  koopas: KoopaData[];
  smbTextures: Smb1TextureSet;
  level: MarioLevelResetJson;
  rebuildBlockSolids: () => void;
}): void {
  clearBrickParticles(o.world, o.brickParticles);
  for (const m of o.mushrooms) {
    o.world.removeChild(m.gfx);
    m.gfx.destroy({ children: true });
  }
  o.mushrooms.length = 0;

  for (const b of o.blocks) {
    b.active = true;
    b.used = false;
    b.brickCoinHitsRemaining = b.brickCoinHitsMax;
    b.bump = 0;
    if (b.hidden) {
      b.revealed = false;
      b.gfx.visible = false;
    } else {
      b.revealed = true;
      b.gfx.visible = true;
    }
    b.gfx.y = b.y;
    b.gfx.removeChildren();
    b.gfx.addChild(
      b.kind === "question"
        ? createQuestionSprite(o.smbTextures)
        : createBrickSprite(o.smbTextures),
    );
  }
  for (const fc of o.floatingCoins) {
    fc.alive = true;
    fc.gfx.visible = true;
    fc.gfx.position.set(fc.spawnX, fc.spawnY);
  }
  o.rebuildBlockSolids();

  let i = 0;
  for (const g of o.level.goombas) {
    const gd = o.goombas[i++];
    if (!gd) continue;
    gd.alive = true;
    gd.gfx.visible = true;
    gd.x = g.x;
    gd.y = g.y;
    gd.vx = -marioPhysics.goombaSpeed;
    gd.vy = 0;
    gd.gfx.position.set(g.x, g.y);
  }

  const kDefs = o.level.koopas ?? [];
  let ki = 0;
  for (const kd of kDefs) {
    const k = o.koopas[ki++];
    if (!k) continue;
    k.alive = true;
    k.mode = "walk";
    k.x = kd.x;
    k.y = kd.y;
    k.vx = -marioPhysics.koopaWalkSpeed;
    k.vy = 0;
    k.gfx.visible = true;
    k.gfx.position.set(kd.x, kd.y);
    k.sprite.texture = o.smbTextures.koopaWalk[0]!;
    k.sprite.setSize(KOOPA_W, KOOPA_H);
  }
}
