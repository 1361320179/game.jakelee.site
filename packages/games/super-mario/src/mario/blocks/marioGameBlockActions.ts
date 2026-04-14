/**
 * 顶砖、碎砖、蘑菇生成等与经济相关的关卡交互（供任意马里奥式关卡宿主调用）。
 */
import { Container } from "pixi.js";
import {
  MUSHROOM_H,
  MUSHROOM_W,
  TILE,
  createMushroomSprite,
  createUsedBlockSprite,
  type Smb1TextureSet,
} from "../../marioAssets";
import { spawnBrickDebris, spawnCoinSparkle } from "../fx/marioGameParticles";
import type { BlockData, BrickParticle, MushroomData } from "../core/marioGameTypes";

export type MarioBlockWorld = {
  world: Container;
  brickParticles: BrickParticle[];
  smbTextures: Smb1TextureSet;
  blocks: BlockData[];
  mushrooms: MushroomData[];
  rebuildBlockSolids: () => void;
  getIsBig: () => boolean;
  /** 金币 / 分数 / 命，由宿主持有并在本模块内就地修改 */
  economy: { coins: number; score: number; lives: number };
};

function grantCoinFromBlock(w: MarioBlockWorld, cx: number, cy: number): void {
  w.economy.coins += 1;
  w.economy.score += 200;
  spawnCoinSparkle(w.world, w.brickParticles, cx, cy);
  if (w.economy.coins >= 100) {
    w.economy.coins -= 100;
    w.economy.lives += 1;
  }
}

export function hitBlockFromBelow(id: number, w: MarioBlockWorld): void {
  const b = w.blocks[id];
  if (!b || !b.active || b.bump > 0) return;
  if (b.hidden && !b.revealed) return;

  if (b.kind === "brick" && b.brickCoinHitsRemaining > 0) {
    b.bump = 1;
    grantCoinFromBlock(w, b.x + TILE / 2, b.y + TILE / 2);
    b.brickCoinHitsRemaining -= 1;
    if (b.brickCoinHitsRemaining === 0) {
      b.gfx.removeChildren();
      b.gfx.addChild(createUsedBlockSprite(w.smbTextures));
    }
    return;
  }

  if (b.kind === "brick" && w.getIsBig()) {
    breakBrickBlock(id, w);
    return;
  }

  if (b.kind === "brick") {
    b.bump = 1;
    return;
  }

  if (b.used) {
    b.bump = 1;
    return;
  }

  b.bump = 1;
  b.used = true;
  if (b.loot === "mushroom") {
    spawnMushroomFromBlock(b, w);
  } else {
    grantCoinFromBlock(w, b.x + TILE / 2, b.y + TILE / 2);
  }
  b.gfx.removeChildren();
  b.gfx.addChild(createUsedBlockSprite(w.smbTextures));
}

export function breakBrickBlock(id: number, w: MarioBlockWorld): void {
  const b = w.blocks[id];
  if (!b || !b.active || b.kind !== "brick") return;
  if (b.brickCoinHitsMax > 0) return;
  spawnBrickDebris(w.world, w.brickParticles, b.x + TILE / 2, b.y + TILE / 2);
  b.active = false;
  b.bump = 0;
  b.gfx.visible = false;
  w.rebuildBlockSolids();
  w.economy.score += 50;
}

export function spawnMushroomFromBlock(b: BlockData, w: MarioBlockWorld): void {
  const m: MushroomData = {
    alive: true,
    x: b.x + (TILE - MUSHROOM_W) / 2,
    y: b.y - MUSHROOM_H - 2,
    vx: 0.88,
    vy: 0,
    gfx: new Container(),
  };
  m.gfx.addChild(createMushroomSprite(w.smbTextures));
  m.gfx.position.set(m.x, m.y);
  w.world.addChild(m.gfx);
  w.mushrooms.push(m);
}
