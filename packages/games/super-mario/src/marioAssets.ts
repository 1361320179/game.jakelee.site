/**
 * SMB1 World 1-1–style visuals (fan homage — not Nintendo assets).
 * Tiles, parallax, and characters use canvas-backed pixel textures; pipes / HUD accents use vectors.
 */
import { Container, Graphics, Sprite, Texture, TilingSprite } from "pixi.js";

/** 空中金币拾取盒（略小于砖格） */
export const FLOATING_COIN_W = 16;
export const FLOATING_COIN_H = 20;
import type { Smb1TextureSet } from "./smb1PixelArt";
import { createSmb1TextureSet } from "./smb1PixelArt";

export type { Smb1TextureSet };
export { createSmb1TextureSet };

export const PLAYER_W = 28;
export const PLAYER_H = 32;
export const PLAYER_BIG_W = 32;
export const PLAYER_BIG_H = 44;
export const TILE = 32;
export const GOOMBA_W = 30;
export const GOOMBA_H = 28;
export const KOOPA_W = 30;
export const KOOPA_H = 32;
export const MUSHROOM_W = 26;
export const MUSHROOM_H = 26;
export const PIRANHA_W = 34;
export const PIRANHA_H = 48;

/** Sky + parallax hills + bushes + clouds (pixel textures) */
export function createSMBSkyBackdrop(
  levelWidth: number,
  levelHeight: number,
  groundY: number,
  tex: Smb1TextureSet,
): Container {
  const root = new Container();

  const skyC = document.createElement("canvas");
  skyC.width = 8;
  skyC.height = 8;
  const sctx = skyC.getContext("2d");
  if (sctx) {
    sctx.fillStyle = "#5c94fc";
    sctx.fillRect(0, 0, 8, 8);
  }
  const skyTex = Texture.from(skyC);
  const src = skyTex.source;
  if (src && "scaleMode" in src) {
    (src as { scaleMode: string }).scaleMode = "nearest";
  }

  const sky = new TilingSprite({
    texture: skyTex,
    width: levelWidth + 800,
    height: levelHeight + 400,
  });
  sky.position.set(-400, -200);
  root.addChild(sky);

  const hillTile = new TilingSprite({
    texture: tex.hills,
    width: levelWidth + 600,
    height: 120,
  });
  hillTile.position.set(-300, groundY - 36);
  root.addChild(hillTile);

  for (let bx = 200; bx < levelWidth - 200; bx += 380) {
    const bush = new Sprite(tex.bush);
    bush.anchor.set(0.5, 1);
    bush.position.set(bx, groundY + 52);
    bush.scale.set(2.2);
    root.addChild(bush);
  }

  for (let cx = 120; cx < levelWidth; cx += 320) {
    const cl = new Sprite(tex.cloud);
    cl.position.set(cx, 72 + (cx % 170) * 0.28);
    cl.scale.set(2.4);
    root.addChild(cl);
  }

  return root;
}

export function createGroundTiling(
  segmentW: number,
  thickness: number,
  tex: Smb1TextureSet,
): TilingSprite {
  return new TilingSprite({
    texture: tex.ground,
    width: segmentW,
    height: thickness,
  });
}

function blockSprite(texture: Texture): Sprite {
  const s = new Sprite(texture);
  s.setSize(TILE, TILE);
  return s;
}

export function createBrickSprite(tex: Smb1TextureSet): Sprite {
  return blockSprite(tex.brick);
}

export function createQuestionSprite(tex: Smb1TextureSet): Sprite {
  return blockSprite(tex.question);
}

export function createUsedBlockSprite(tex: Smb1TextureSet): Sprite {
  return blockSprite(tex.usedBlock);
}

const P = {
  pipeLight: 0x00a844,
  pipeDark: 0x006818,
  pipeStroke: 0x003018,
};

/** Green pipe with wider lip (vector — matches SMB silhouette) */
export function createPipe(w: number, h: number): Graphics {
  const g = new Graphics();
  g.rect(0, 0, w, h).fill(P.pipeDark);
  g.rect(3, 0, w - 6, h).fill(P.pipeLight);
  g.rect(0, 0, w, h).stroke({ width: 2, color: P.pipeStroke });
  const lip = 4;
  g.rect(-lip, 0, w + lip * 2, 28).fill(P.pipeDark);
  g.rect(-lip + 3, 0, w + lip * 2 - 6, 28).fill(P.pipeLight);
  g.rect(-lip, 0, w + lip * 2, 28).stroke({ width: 2, color: P.pipeStroke });
  return g;
}

export function createGoombaSprite(tex: Smb1TextureSet): Sprite {
  const s = new Sprite(tex.goomba);
  s.setSize(GOOMBA_W, GOOMBA_H);
  return s;
}

export function createKoopaSprite(tex: Smb1TextureSet): Sprite {
  const s = new Sprite(tex.koopaWalk[0]);
  s.setSize(KOOPA_W, KOOPA_H);
  return s;
}

export function createMushroomSprite(tex: Smb1TextureSet): Sprite {
  const s = new Sprite(tex.mushroom);
  s.setSize(MUSHROOM_W, MUSHROOM_H);
  return s;
}

/** 简易像素风椭圆金币（非 ROM 贴图） */
export function createFloatingCoinGfx(): Container {
  const root = new Container();
  const g = new Graphics();
  g.ellipse(0, 0, 8, 9).fill(0xfcd020).stroke({ width: 2, color: 0xc49008 });
  g.ellipse(-2, -3, 3, 3).fill({ color: 0xfff8a8, alpha: 0.55 });
  root.addChild(g);
  return root;
}

export type PlayerVisual = {
  root: Container;
  sprite: Sprite;
};

export function createMarioPlayerVisual(tex: Smb1TextureSet): PlayerVisual {
  const root = new Container();
  const sprite = new Sprite(tex.marioSmall[0]);
  root.addChild(sprite);
  return { root, sprite };
}

export function syncMarioPlayer(
  vis: PlayerVisual,
  tex: Smb1TextureSet,
  opts: {
    big: boolean;
    facing: 1 | -1;
    grounded: boolean;
    vx: number;
    tick: number;
  },
): void {
  const { big, facing, grounded, vx, tick } = opts;
  const frames = big ? tex.marioBig : tex.marioSmall;
  let fi = 0;
  if (!grounded) fi = 3;
  else if (Math.abs(vx) > 0.32) fi = 1 + (Math.floor(tick * 1.75) % 2);
  vis.sprite.texture = frames[fi] ?? frames[0];

  const w = big ? PLAYER_BIG_W : PLAYER_W;
  const h = big ? PLAYER_BIG_H : PLAYER_H;
  const nw = vis.sprite.texture.width;
  const nh = vis.sprite.texture.height;
  vis.sprite.scale.x = facing * (w / nw);
  vis.sprite.scale.y = h / nh;
}

export type PiranhaVisual = { root: Container; head: Sprite };

export function createPiranhaPlant(tex: Smb1TextureSet): PiranhaVisual {
  const root = new Container();
  const stem = new Graphics();
  stem.rect(PIRANHA_W / 2 - 6, PIRANHA_H - 28, 12, 28).fill(0x2e7d32).stroke({ width: 1, color: 0x1b5e20 });
  const head = new Sprite(tex.piranhaHead[0]);
  head.position.set(0, 2);
  head.setSize(PIRANHA_W, 34);
  root.addChild(stem);
  root.addChild(head);
  return { root, head };
}

export function createFlagAssembly(
  tex: Smb1TextureSet,
  poleH: number,
  groundY: number,
): { root: Container; poleTopY: number } {
  const root = new Container();
  const poleW = 8;
  const topY = groundY - poleH;

  const poleBody = new TilingSprite({
    texture: tex.flagPoleSeg,
    width: poleW,
    height: poleH,
  });
  poleBody.position.set(0, topY);
  root.addChild(poleBody);

  const orb = new Sprite(tex.flagOrb);
  orb.anchor.set(0.5, 0.5);
  orb.position.set(poleW / 2, topY - 10);
  orb.setSize(20, 20);
  root.addChild(orb);

  const flagY = topY + 24;
  const cloth = new Sprite(tex.flagCloth);
  cloth.position.set(poleW, flagY);
  cloth.setSize(44, 28);
  root.addChild(cloth);

  const castleSpr = new Sprite(tex.castle);
  castleSpr.position.set(48, groundY - 72);
  castleSpr.setSize(80, 72);
  root.addChild(castleSpr);

  return { root, poleTopY: topY };
}
