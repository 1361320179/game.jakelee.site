/**
 * SMB1-inspired visuals (original fan homage — not Nintendo assets).
 * All drawn with Pixi Graphics for crisp scaling.
 */
import { Container, Graphics } from "pixi.js";

export const PLAYER_W = 28;
export const PLAYER_H = 32;
/** 大马里奥碰撞与绘制尺寸 */
export const PLAYER_BIG_W = 32;
export const PLAYER_BIG_H = 44;
export const TILE = 32;
export const GOOMBA_W = 30;
export const GOOMBA_H = 28;
export const MUSHROOM_W = 26;
export const MUSHROOM_H = 26;
export const PIRANHA_W = 34;
export const PIRANHA_H = 48;

const C = {
  sky: 0x5c94fc,
  bush: 0x00a800,
  bushDark: 0x006800,
  groundTop: 0xc84c0c,
  groundFill: 0xfcb468,
  groundDark: 0x8b4513,
  brickLight: 0xb53120,
  brickDark: 0x6b1808,
  brickMortar: 0x4a1510,
  qOrange: 0xfc9838,
  qStroke: 0x682008,
  qMark: 0xfcf4a8,
  usedBlock: 0x885818,
  pipeLight: 0x00a844,
  pipeDark: 0x006818,
  pipeStroke: 0x003018,
  pole: 0x206010,
  poleBall: 0x00a800,
  flag: 0xfc2020,
  castle: 0x383838,
  castleBrick: 0x585858,
  marioHat: 0xe01010,
  marioOveralls: 0x2060d0,
  marioSkin: 0xf8b890,
  marioHair: 0x502010,
  goombaBrown: 0x885010,
  goombaDark: 0x502008,
  goombaEye: 0xf8f8f8,
  cloud: 0xf8fcf8,
  cloudShadow: 0xb8c4d8,
};

/** NES-like sky + distant hills/bushes (static decoration) */
export function createSMBSkyBackdrop(
  levelWidth: number,
  levelHeight: number,
  groundY: number,
): Container {
  const root = new Container();
  const sky = new Graphics();
  sky.rect(0, 0, levelWidth + 800, levelHeight + 400).fill(C.sky);
  sky.position.set(-400, -200);
  root.addChild(sky);

  const hills = new Graphics();
  const base = groundY + 80;
  for (let i = -200; i < levelWidth + 400; i += 140) {
    const h = 36 + (i % 200) * 0.15;
    hills
      .moveTo(i, base + 120)
      .lineTo(i + 70, base - h)
      .lineTo(i + 140, base + 120)
      .closePath()
      .fill({ color: 0x00a844, alpha: 0.35 });
  }
  root.addChild(hills);

  const bushes = new Graphics();
  for (let bx = 200; bx < levelWidth - 200; bx += 380) {
    drawBushPile(bushes, bx, groundY + 52, 1);
  }
  root.addChild(bushes);

  const clouds = new Graphics();
  for (let cx = 120; cx < levelWidth; cx += 320) {
    drawCloud(clouds, cx, 80 + (cx % 170) * 0.3, 1);
  }
  root.addChild(clouds);

  return root;
}

function drawBushPile(g: Graphics, x: number, y: number, s: number) {
  g.circle(x, y, 22 * s).fill(C.bushDark);
  g.circle(x + 28 * s, y - 4 * s, 20 * s).fill(C.bushDark);
  g.circle(x + 52 * s, y, 18 * s).fill(C.bushDark);
  g.circle(x + 12 * s, y - 6 * s, 18 * s).fill(C.bush);
  g.circle(x + 36 * s, y - 8 * s, 20 * s).fill(C.bush);
  g.circle(x + 58 * s, y - 4 * s, 14 * s).fill(C.bush);
}

function drawCloud(g: Graphics, x: number, y: number, s: number) {
  g.circle(x, y, 20 * s).fill(C.cloudShadow);
  g.circle(x + 26 * s, y - 2 * s, 24 * s).fill(C.cloudShadow);
  g.circle(x + 52 * s, y, 18 * s).fill(C.cloudShadow);
  g.circle(x + 8 * s, y - 4 * s, 18 * s).fill(C.cloud);
  g.circle(x + 32 * s, y - 6 * s, 22 * s).fill(C.cloud);
  g.circle(x + 54 * s, y - 2 * s, 16 * s).fill(C.cloud);
}

/** Ground chunk (brown dirt + orange top stripe) */
export function createGroundTile(w: number, h: number): Graphics {
  const g = new Graphics();
  g.rect(0, 0, w, h).fill(C.groundDark);
  const stripe = 6;
  for (let y = 16; y < h; y += stripe) {
    g.rect(4, y, w - 8, 2).fill({ color: 0x000000, alpha: 0.12 });
  }
  g.rect(0, 0, w, 14).fill(C.groundTop);
  g.rect(0, 10, w, 4).fill(C.groundFill);
  g.rect(0, 0, w, 14).stroke({ width: 2, color: 0x000000, alpha: 0.25 });
  return g;
}

export function createBrickBlock(): Graphics {
  const g = new Graphics();
  const s = TILE;
  g.rect(0, 0, s, s).fill(C.brickDark);
  g.rect(1, 1, s - 2, s - 2).fill(C.brickLight);
  g.moveTo(s / 2, 1).lineTo(s / 2, s - 1).stroke({ width: 1, color: C.brickMortar });
  g.moveTo(1, s / 2).lineTo(s - 1, s / 2).stroke({ width: 1, color: C.brickMortar });
  g.moveTo(1, s / 4).lineTo(s - 1, s / 4).stroke({ width: 1, color: C.brickMortar });
  g.moveTo(1, (3 * s) / 4).lineTo(s - 1, (3 * s) / 4).stroke({ width: 1, color: C.brickMortar });
  g.rect(0, 0, s, s).stroke({ width: 2, color: 0x000000, alpha: 0.35 });
  return g;
}

export function createQuestionBlock(): Graphics {
  const g = new Graphics();
  const s = TILE;
  g.rect(0, 0, s, s).fill(C.qStroke);
  g.rect(2, 2, s - 4, s - 4).fill(C.qOrange);
  g.rect(5, 5, s - 10, s - 10).fill({ color: 0xfcb058, alpha: 0.9 });
  const cx = s / 2;
  const cy = s / 2;
  g.roundRect(cx - 7, cy - 9, 14, 18, 2).fill(C.qMark);
  g.rect(0, 0, s, s).stroke({ width: 2, color: 0x000000, alpha: 0.4 });
  return g;
}

export function createUsedBlock(): Graphics {
  const g = new Graphics();
  const s = TILE;
  g.rect(0, 0, s, s).fill(0x3a2810);
  g.rect(2, 2, s - 4, s - 4).fill(C.usedBlock);
  g.moveTo(6, 10).lineTo(s - 6, s - 10).stroke({ width: 2, color: 0x402010, alpha: 0.5 });
  g.moveTo(s - 6, 10).lineTo(6, s - 10).stroke({ width: 2, color: 0x402010, alpha: 0.5 });
  g.rect(0, 0, s, s).stroke({ width: 2, color: 0x000000, alpha: 0.35 });
  return g;
}

export function createPipe(w: number, h: number): Graphics {
  const g = new Graphics();
  g.rect(0, 0, w, h).fill(C.pipeDark);
  g.rect(3, 0, w - 6, h).fill(C.pipeLight);
  g.rect(0, 0, w, h).stroke({ width: 2, color: C.pipeStroke });
  const lip = 4;
  g.rect(-lip, 0, w + lip * 2, 28).fill(C.pipeDark);
  g.rect(-lip + 3, 0, w + lip * 2 - 6, 28).fill(C.pipeLight);
  g.rect(-lip, 0, w + lip * 2, 28).stroke({ width: 2, color: C.pipeStroke });
  return g;
}

export type PlayerVisual = {
  root: Container;
  body: Graphics;
};

export function createMarioVisual(): PlayerVisual {
  const root = new Container();
  const body = new Graphics();
  root.addChild(body);
  return { root, body };
}

export function drawMarioSmall(
  body: Graphics,
  facing: 1 | -1,
  isGrounded: boolean,
  tick: number,
): void {
  body.clear();
  const f = facing;
  const bob = isGrounded ? Math.sin(tick * 0.9) * 0.4 : 0;
  const by = bob;
  const w = PLAYER_W;
  const h = PLAYER_H;

  body.rect(6, by + 18, w - 12, 10).fill(C.marioOveralls);
  body.rect(7, by + 19, w - 14, 3).fill(0x103878);
  body.rect(5, by + 10, w - 10, 12).fill(C.marioHat);
  body.rect(8, by + 14, w - 16, 6).fill(C.marioSkin);
  if (f === 1) {
    body.rect(w - 10, by + 12, 5, 4).fill(C.marioSkin);
    body.rect(w - 9, by + 13, 2, 2).fill(0x000000);
  } else {
    body.rect(5, by + 12, 5, 4).fill(C.marioSkin);
    body.rect(7, by + 13, 2, 2).fill(0x000000);
  }
  body.rect(6, by + 22, 5, 8).fill(C.marioOveralls);
  body.rect(w - 11, by + 22, 5, 8).fill(C.marioOveralls);
  body.rect(7, by + 4, w - 14, 8).fill(C.marioHat);
  body.rect(9, by + 6, w - 18, 3).fill(0x000000, 0.25);
  body.rect(10, by + 26, 4, 4).fill(0x402010);
  body.rect(w - 14, by + 26, 4, 4).fill(0x402010);
}

/** 大马里奥：更高、肩更宽、胡子块 */
export function drawMarioBig(
  body: Graphics,
  facing: 1 | -1,
  isGrounded: boolean,
  tick: number,
): void {
  body.clear();
  const f = facing;
  const bob = isGrounded ? Math.sin(tick * 0.85) * 0.35 : 0;
  const by = bob;
  const w = PLAYER_BIG_W;
  const h = PLAYER_BIG_H;

  body.rect(5, by + 26, w - 10, 14).fill(C.marioOveralls);
  body.rect(6, by + 27, w - 12, 4).fill(0x103878);
  body.rect(4, by + 14, w - 8, 16).fill(C.marioHat);
  body.rect(7, by + 18, w - 14, 10).fill(C.marioSkin);
  body.rect(8, by + 28, w - 16, 6).fill(0xf8d8c8);
  if (f === 1) {
    body.rect(w - 11, by + 16, 6, 5).fill(C.marioSkin);
    body.rect(w - 10, by + 17, 3, 3).fill(0x000000);
    body.rect(9, by + 22, 10, 4).fill(0x5d4037);
  } else {
    body.rect(5, by + 16, 6, 5).fill(C.marioSkin);
    body.rect(7, by + 17, 3, 3).fill(0x000000);
    body.rect(w - 19, by + 22, 10, 4).fill(0x5d4037);
  }
  body.rect(5, by + 32, 6, 10).fill(C.marioOveralls);
  body.rect(w - 11, by + 32, 6, 10).fill(C.marioOveralls);
  body.rect(6, by + 4, w - 12, 12).fill(C.marioHat);
  body.rect(8, by + 7, w - 16, 4).fill(0x000000, 0.22);
  body.rect(8, by + 38, 5, 4).fill(0x402010);
  body.rect(w - 13, by + 38, 5, 4).fill(0x402010);
}

/** 超级蘑菇：红盖白点 + 米色柄 */
export function createMushroomGraphics(): Graphics {
  const g = new Graphics();
  const w = MUSHROOM_W;
  const h = MUSHROOM_H;
  const cx = w / 2;
  g.rect(cx - 7, h - 10, 14, 10).fill(0xf5e6c8).stroke({ width: 1, color: 0x8b7355 });
  g.ellipse(cx, h - 18, w / 2 - 2, 11).fill(0xc62828).stroke({ width: 2, color: 0x7f1010 });
  g.circle(cx - 7, h - 20, 4).fill(0xfff8f0);
  g.circle(cx + 8, h - 22, 3.5).fill(0xfff8f0);
  g.circle(cx + 2, h - 26, 3).fill(0xfff8f0);
  return g;
}

export type PiranhaVisual = { root: Container; head: Graphics };

/** 食人花：绿茎 + 红花冠 + 白牙（嘴张合由 head 重绘或缩放） */
export function createPiranhaPlant(): PiranhaVisual {
  const root = new Container();
  const stem = new Graphics();
  stem.rect(PIRANHA_W / 2 - 6, PIRANHA_H - 28, 12, 28).fill(0x2e7d32).stroke({ width: 1, color: 0x1b5e20 });
  const head = new Graphics();
  root.addChild(stem);
  root.addChild(head);
  return { root, head };
}

export function drawPiranhaHead(head: Graphics, tick: number): void {
  head.clear();
  const w = PIRANHA_W;
  const chomp = 0.55 + Math.sin(tick * 0.25) * 0.45;
  const mouthOpen = chomp * 10;
  const hx = w / 2;
  const hy = 20;
  head.circle(hx, hy, 16).fill(0xc62828).stroke({ width: 2, color: 0x7f1010 });
  head.ellipse(hx, hy + 2, 14, 10 + mouthOpen * 0.4).fill(0x8b0000);
  head.moveTo(hx - 10, hy + 6);
  head.lineTo(hx - 6, hy + 10 + mouthOpen);
  head.lineTo(hx - 2, hy + 6);
  head.lineTo(hx + 2, hy + 10 + mouthOpen);
  head.lineTo(hx + 6, hy + 6);
  head.lineTo(hx + 10, hy + 10 + mouthOpen);
  head.stroke({ width: 2, color: 0xfff8f0 });
  head.circle(hx - 6, hy - 4, 3).fill(0xffffff);
  head.circle(hx + 7, hy - 3, 3).fill(0xffffff);
  head.circle(hx - 5, hy - 4, 2).fill(0x000000);
  head.circle(hx + 8, hy - 3, 2).fill(0x000000);
  head.moveTo(hx, hy - 14);
  head.lineTo(hx - 5, hy - 22);
  head.lineTo(hx + 5, hy - 22);
  head.closePath().fill(0x43a047);
}

export function createGoombaGraphics(): Graphics {
  const g = new Graphics();
  const w = GOOMBA_W;
  const h = GOOMBA_H;
  g.ellipse(w / 2, h - 6, w / 2 - 2, 8).fill(C.goombaDark);
  g.ellipse(w / 2, h / 2 - 2, w / 2 - 4, h / 2 - 4).fill(C.goombaBrown);
  g.rect(4, h - 10, 8, 6).fill(C.goombaDark);
  g.rect(w - 12, h - 10, 8, 6).fill(C.goombaDark);
  g.rect(6, 8, 8, 6).fill(0x000000, 0.85);
  g.rect(w - 14, 8, 8, 6).fill(0x000000, 0.85);
  g.rect(8, 10, 4, 3).fill(C.goombaEye);
  g.rect(w - 12, 10, 4, 3).fill(C.goombaEye);
  g.moveTo(4, 4).lineTo(w / 2, 0).lineTo(w - 4, 4).closePath().fill(C.goombaDark);
  return g;
}

export function createFlagAssembly(
  poleH: number,
  groundY: number,
): { root: Container; poleTopY: number } {
  const root = new Container();
  const poleW = 8;
  const g = new Graphics();
  const topY = groundY - poleH;
  g.rect(0, topY, poleW, poleH).fill(C.pole).stroke({ width: 1, color: 0x000000, alpha: 0.4 });
  g.circle(poleW / 2, topY - 6, 10).fill(C.poleBall).stroke({ width: 2, color: 0x003010 });
  const flagY = topY + 24;
  g.rect(poleW, flagY, 44, 28).fill(C.flag);
  g.moveTo(poleW, flagY).lineTo(poleW + 44, flagY + 14).lineTo(poleW, flagY + 28).closePath().fill(
    { color: 0xfc4040, alpha: 0.9 },
  );
  g.rect(poleW, flagY, 44, 28).stroke({ width: 1, color: 0x000000, alpha: 0.5 });
  root.addChild(g);

  const castle = new Graphics();
  const cx = 48;
  const cy = groundY - 72;
  castle.rect(cx, cy, 80, 72).fill(C.castle);
  castle.rect(cx + 8, cy + 20, 20, 52).fill(C.castleBrick);
  castle.rect(cx + 52, cy + 20, 20, 52).fill(C.castleBrick);
  castle.rect(cx + 32, cy + 8, 16, 20).fill(0x202020);
  castle.rect(cx + 28, cy - 8, 24, 12).fill(C.castle);
  castle.rect(cx + 36, cy + 28, 8, 12).fill(0xf8d878);
  root.addChild(castle);

  return { root, poleTopY: topY };
}
