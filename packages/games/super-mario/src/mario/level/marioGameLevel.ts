/**
 * 关卡静态几何与敌人初始摆放（与 SuperMarioGame 拆分）。
 */
import { Container } from "pixi.js";
import levelData from "../../../../../content/games/super-mario/levels/level-1.json";
import {
  PIRANHA_H,
  PIRANHA_W,
  TILE,
  createBrickSprite,
  createFlagAssembly,
  createFloatingCoinGfx,
  createGoombaSprite,
  createGroundTiling,
  createKoopaSprite,
  createPipe,
  createPiranhaPlant,
  createQuestionSprite,
  createSMBSkyBackdrop,
  type Smb1TextureSet,
} from "../../marioAssets";
import type {
  BlockData,
  FloatingCoinData,
  GoombaData,
  KoopaData,
  PiranhaData,
  Rect,
  SolidRef,
} from "../core/marioGameTypes";
import { marioPhysics } from "../core/marioGameTypes";

export type MarioBuiltLevel = {
  solids: SolidRef[];
  blocks: BlockData[];
  floatingCoins: FloatingCoinData[];
  goombas: GoombaData[];
  koopas: KoopaData[];
  piranhas: PiranhaData[];
  flagTouch: Rect;
  flagRoot: Container;
};

export function addMarioSkyBackdrop(
  bgLayer: Container,
  smbTextures: Smb1TextureSet,
): void {
  const backdrop = createSMBSkyBackdrop(
    levelData.width,
    levelData.height,
    levelData.groundY,
    smbTextures,
  );
  bgLayer.addChild(backdrop);
}

export function rebuildBlockSolidsInPlace(
  solids: SolidRef[],
  blocks: BlockData[],
  tile: number,
): void {
  let i = solids.length;
  while (i--) {
    if (solids[i]!.kind === "block") solids.splice(i, 1);
  }
  blocks.forEach((b, id) => {
    if (!b.active) return;
    if (b.hidden && !b.revealed) return;
    solids.push({
      x: b.x,
      y: b.y,
      w: tile,
      h: tile,
      kind: "block",
      blockId: id,
    });
  });
}

export function buildMarioLevel(
  world: Container,
  smbTextures: Smb1TextureSet,
): MarioBuiltLevel {
  const gy = levelData.groundY;
  const th = levelData.groundThickness;
  const solids: SolidRef[] = [];

  for (const seg of levelData.groundSegments) {
    const r: Rect = { x: seg.x, y: gy, w: seg.w, h: th };
    solids.push({ ...r, kind: "ground" });
    const g = createGroundTiling(seg.w, th, smbTextures);
    g.position.set(seg.x, gy);
    world.addChild(g);
  }

  const piranhas: PiranhaData[] = [];
  let plantIdx = 0;
  for (const p of levelData.pipes) {
    const top = gy - p.h;
    const r: Rect = { x: p.x, y: top, w: p.w, h: p.h };
    solids.push({ ...r, kind: "pipe" });
    const pipe = createPipe(p.w, p.h);
    pipe.position.set(p.x, top);
    world.addChild(pipe);

    const raw = p as { plant?: boolean };
    if (raw.plant) {
      const pv = createPiranhaPlant(smbTextures);
      const baseX = p.x + p.w / 2 - PIRANHA_W / 2;
      pv.root.position.set(baseX, top - PIRANHA_H);
      world.addChild(pv.root);
      piranhas.push({
        gfx: pv.root,
        head: pv.head,
        baseX,
        pipeTop: top,
        emergeMax: Math.min(56, p.h * 0.55),
        phase: plantIdx++ * 1.9,
      });
    }
  }

  const blocks: BlockData[] = [];
  for (const b of levelData.blocks) {
    const raw = b as { loot?: string; hidden?: boolean; coinHits?: number };
    const loot: "coin" | "mushroom" =
      raw.loot === "mushroom" ? "mushroom" : "coin";
    const isHidden = raw.hidden === true;
    const rawHits = raw.coinHits;
    const coinHits =
      b.kind === "brick" &&
      typeof rawHits === "number" &&
      rawHits > 0 &&
      Number.isFinite(rawHits)
        ? Math.min(20, Math.floor(rawHits))
        : 0;
    const gfx = new Container();
    const inner =
      b.kind === "question"
        ? createQuestionSprite(smbTextures)
        : createBrickSprite(smbTextures);
    gfx.addChild(inner);
    gfx.position.set(b.x, b.y);
    gfx.visible = !isHidden;
    world.addChild(gfx);
    blocks.push({
      x: b.x,
      y: b.y,
      kind: b.kind as "brick" | "question",
      loot: b.kind === "question" ? loot : "coin",
      used: false,
      active: true,
      hidden: isHidden,
      revealed: !isHidden,
      brickCoinHitsMax: coinHits,
      brickCoinHitsRemaining: coinHits,
      bump: 0,
      gfx,
    });
  }
  rebuildBlockSolidsInPlace(solids, blocks, TILE);

  const floatingCoins: FloatingCoinData[] = [];
  const coinSpawns =
    (levelData as { floatingCoins?: { x: number; y: number }[] })
      .floatingCoins ?? [];
  for (const c of coinSpawns) {
    const gfx = createFloatingCoinGfx();
    gfx.position.set(c.x, c.y);
    world.addChild(gfx);
    floatingCoins.push({
      alive: true,
      spawnX: c.x,
      spawnY: c.y,
      gfx,
    });
  }

  const goombas: GoombaData[] = [];
  for (const g of levelData.goombas) {
    const gfx = new Container();
    gfx.addChild(createGoombaSprite(smbTextures));
    gfx.position.set(g.x, g.y);
    world.addChild(gfx);
    goombas.push({
      alive: true,
      x: g.x,
      y: g.y,
      vx: -marioPhysics.goombaSpeed,
      vy: 0,
      gfx,
    });
  }

  const koopas: KoopaData[] = [];
  const koopaSpawns =
    (levelData as { koopas?: { x: number; y: number }[] }).koopas ?? [];
  for (const kp of koopaSpawns) {
    const spr = createKoopaSprite(smbTextures);
    const gfx = new Container();
    gfx.addChild(spr);
    gfx.position.set(kp.x, kp.y);
    world.addChild(gfx);
    koopas.push({
      alive: true,
      mode: "walk",
      x: kp.x,
      y: kp.y,
      vx: -marioPhysics.koopaWalkSpeed,
      vy: 0,
      gfx,
      sprite: spr,
    });
  }

  const { root } = createFlagAssembly(smbTextures, levelData.poleH, gy);
  root.position.set(levelData.flagX, 0);
  world.addChild(root);

  const flagTouch: Rect = {
    x: levelData.flagX,
    y: gy - levelData.poleH,
    w: 14,
    h: levelData.poleH,
  };

  return {
    solids,
    blocks,
    floatingCoins,
    goombas,
    koopas,
    piranhas,
    flagTouch,
    flagRoot: root,
  };
}
