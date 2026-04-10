/**
 * Shadow Dash 卡通风格矢量素材：天空、地形、机关与玩家均由 Graphics 绘制。
 * 配色集中在 C 对象，便于统一调整画风。
 */
import { Container, Graphics } from "pixi.js";

/** 玩家碰撞盒宽高，须与 Game 中物理判定一致 */
export const PLAYER_W = 28;
export const PLAYER_H = 32;

/** 主题色板（天空、地形、尖刺、门、角色等） */
const C = {
  skyTop: 0x7dd3fc,
  skyBottom: 0xb8e9ff,
  hill: 0x6bc96f,
  hillDark: 0x4a9e52,
  cloud: 0xffffff,
  stone: 0xd4a574,
  stoneDark: 0xa67c52,
  stoneStroke: 0x5c3d2e,
  grass: 0x5ad66a,
  grassDark: 0x2f8f45,
  spike: 0xff4b6e,
  spikeLight: 0xff8fa3,
  spikeStroke: 0x8b1c3f,
  doorWood: 0x8b5a3c,
  doorWoodDark: 0x5c3a26,
  portal: 0x7c4dff,
  portalGlow: 0xb388ff,
  playerBody: 0xffb74d,
  playerBodyDark: 0xf57c00,
  playerCheek: 0xff8a80,
  playerEye: 0xffffff,
  playerPupil: 0x263238,
  dashTrail: 0x40e0d0,
};

/** 纵向渐变天空条带，宽度覆盖关卡并留边距；含柔和太阳 */
export function createSkyStrip(levelWidth: number, levelHeight: number): Graphics {
  const g = new Graphics();
  const pad = 800;
  const w = levelWidth + pad * 2;
  const h = Math.max(levelHeight + 400, 900);
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(0x7d + (0xb8 - 0x7d) * t);
    const gg = Math.round(0xd3 + (0xe9 - 0xd3) * t);
    const b = Math.round(0xfc + (0xff - 0xfc) * t);
    const color = (r << 16) | (gg << 8) | b;
    const y0 = (i / steps) * h;
    const y1 = ((i + 1) / steps) * h;
    g.rect(-pad, y0, w, y1 - y0 + 1).fill(color);
  }
  // 柔和太阳光晕
  g.circle(levelWidth * 0.35, 120, 72).fill({ color: 0xfff59d, alpha: 0.55 });
  g.circle(levelWidth * 0.35, 120, 48).fill({ color: 0xffecb3, alpha: 0.7 });
  return g;
}

/** 一朵装饰云，原点为局部坐标，由调用方 set position */
export function createCloudPuff(x: number, y: number, scale: number): Graphics {
  const g = new Graphics();
  const s = scale;
  g.circle(0, 0, 22 * s).fill({ color: C.cloud, alpha: 0.95 });
  g.circle(28 * s, -4 * s, 18 * s).fill({ color: C.cloud, alpha: 0.95 });
  g.circle(52 * s, 2 * s, 20 * s).fill({ color: C.cloud, alpha: 0.95 });
  g.circle(24 * s, 8 * s, 16 * s).fill({ color: C.cloud, alpha: 0.92 });
  g.position.set(x, y);
  return g;
}

/** 远景双层丘陵轮廓，baseY 由关卡地面高度推导 */
export function createHillSilhouette(levelWidth: number, groundY: number): Graphics {
  const g = new Graphics();
  const baseY = groundY + 40;
  const w = levelWidth + 1200;
  const step = 48;

  g.moveTo(-400, baseY + 220);
  for (let x = -400; x <= w; x += step) {
    const bump = 22 + ((x * 0.31) % 37);
    g.lineTo(x, baseY - bump);
  }
  g.lineTo(w, baseY + 280);
  g.lineTo(-400, baseY + 280);
  g.closePath();
  g.fill(C.hillDark);

  g.moveTo(-240, baseY + 140);
  for (let x = -240; x <= w; x += step) {
    const bump = 32 + ((x * 0.21) % 52);
    g.lineTo(x, baseY + 36 - bump);
  }
  g.lineTo(w, baseY + 280);
  g.lineTo(-240, baseY + 280);
  g.closePath();
  g.fill(C.hill);
  return g;
}

/** 圆角石台 + 顶部草丛与草叶细节 */
export function createCartoonPlatform(w: number, h: number): Graphics {
  const g = new Graphics();
  const r = Math.min(14, h * 0.35);
  g.roundRect(6, 8, w, h, r).fill({ color: 0x1a0f0a, alpha: 0.22 });
  g.roundRect(0, 0, w, h, r).fill(C.stone).stroke({ width: 3, color: C.stoneStroke });
  g.roundRect(10, 10, 7, h - 22, 3).fill({ color: 0xffffff, alpha: 0.18 });
  const grassH = Math.min(18, h * 0.45);
  g.roundRect(-3, -grassH + 4, w + 6, grassH, 10)
    .fill(C.grass)
    .stroke({ width: 2, color: C.grassDark });
  for (let i = 10; i < w - 8; i += 22) {
    g.moveTo(i, -grassH + 6);
    g.lineTo(i + 5, -grassH - 2);
    g.lineTo(i + 10, -grassH + 5);
    g.stroke({ width: 2, color: C.grassDark, alpha: 0.6 });
  }
  return g;
}

/** 横向铺满的三角尖刺带，数量随宽度变化；与关卡 JSON 中的 w/h 对齐 */
export function createCartoonSpikeField(w: number, h: number): Graphics {
  const g = new Graphics();
  const teeth = Math.max(3, Math.floor(w / 14));
  const tw = w / teeth;
  for (let i = 0; i < teeth; i++) {
    const x0 = i * tw;
    const mid = x0 + tw * 0.5;
    const x1 = x0 + tw;
    g.moveTo(x0, h);
    g.lineTo(mid, 0);
    g.lineTo(x1, h);
    g.closePath();
    g.fill(C.spike).stroke({ width: 2, color: C.spikeStroke });
    g.moveTo(x0 + tw * 0.35, h * 0.55);
    g.lineTo(mid - 1, h * 0.12);
    g.lineTo(mid + tw * 0.15, h * 0.5);
    g.closePath();
    g.fill({ color: C.spikeLight, alpha: 0.55 });
  }
  g.rect(0, h - 4, w, 6).fill(C.spikeStroke);
  return g;
}

/**
 * 终点木门框 + 内部传送门（portal 单独引用以便做 alpha 动画）+ 顶部星星
 */
export function createCartoonGoal(
  doorW: number,
  doorH: number,
): { root: Container; portal: Graphics } {
  const root = new Container();
  const frame = new Graphics();
  const pad = 10;
  frame
    .roundRect(-pad, -pad, doorW + pad * 2, doorH + pad * 2, 12)
    .fill(C.doorWoodDark)
    .stroke({ width: 3, color: 0x3e2723 });
  frame
    .roundRect(-4, -4, doorW + 8, doorH + 8, 8)
    .fill(C.doorWood)
    .stroke({ width: 2, color: 0x4e342e });

  const portal = new Graphics();
  portal
    .roundRect(4, 4, doorW - 8, doorH - 8, 14)
    .fill({ color: C.portal, alpha: 0.85 });
  portal
    .roundRect(10, 10, doorW - 20, doorH - 20, 10)
    .fill({ color: 0xffffff, alpha: 0.15 });

  const star = new Graphics();
  const cx = doorW / 2;
  star.moveTo(cx, -28);
  star.lineTo(cx + 8, -12);
  star.lineTo(cx + 22, -8);
  star.lineTo(cx + 10, 4);
  star.lineTo(cx + 14, 22);
  star.lineTo(cx, 12);
  star.lineTo(cx - 14, 22);
  star.lineTo(cx - 10, 4);
  star.lineTo(cx - 22, -8);
  star.lineTo(cx - 8, -12);
  star.closePath();
  star.fill(0xffe082).stroke({ width: 2, color: 0xf9a825 });

  root.addChild(frame);
  root.addChild(portal);
  root.addChild(star);
  return { root, portal };
}

/** createPlayerVisual 返回的节点引用，供每帧 drawPlayerBody 重绘 */
export type PlayerVisual = {
  root: Container;
  shadow: Graphics;
  dashAura: Graphics;
  body: Graphics;
  face: Graphics;
};

/** 组装玩家根节点：脚底椭圆阴影、冲刺光晕、身体与面部（面部与身体分 Graphics 便于分层绘制） */
export function createPlayerVisual(): PlayerVisual {
  const root = new Container();
  const shadow = new Graphics();
  shadow.ellipse(PLAYER_W / 2, PLAYER_H + 2, 14, 5).fill({ color: 0x000000, alpha: 0.22 });

  const dashAura = new Graphics();
  dashAura.roundRect(-6, -6, PLAYER_W + 12, PLAYER_H + 12, 16).fill({
    color: C.dashTrail,
    alpha: 0,
  });

  const body = new Graphics();
  const face = new Graphics();

  root.addChild(shadow);
  root.addChild(dashAura);
  root.addChild(body);
  root.addChild(face);

  return { root, shadow, dashAura, body, face };
}

/**
 * 每帧根据状态清空并重绘：空中略压扁、眼睛随朝向偏移、冲刺时绘制光晕。
 */
export function drawPlayerBody(
  body: Graphics,
  face: Graphics,
  dashAura: Graphics,
  facing: 1 | -1,
  isGrounded: boolean,
  isDashing: boolean,
  tick: number,
): void {
  body.clear();
  face.clear();
  dashAura.clear();

  const squash = isGrounded ? 1 : 0.94;
  const by = (1 - squash) * 8;
  body.roundRect(2, by, PLAYER_W - 4, PLAYER_H - 4 + (1 - squash) * 4, 14).fill(C.playerBodyDark);
  body
    .roundRect(3, by + 1, PLAYER_W - 6, PLAYER_H - 8 + (1 - squash) * 4, 12)
    .fill(C.playerBody)
    .stroke({ width: 2, color: 0xe65100 });
  body.circle(8, by + 18, 4).fill({ color: C.playerCheek, alpha: 0.65 });
  body.circle(PLAYER_W - 8, by + 18, 4).fill({ color: C.playerCheek, alpha: 0.65 });

  const eyeY = by + 11;
  const eyeXo = facing === 1 ? 1 : -1;
  face.circle(9, eyeY, 5).fill(C.playerEye).stroke({ width: 1, color: 0xb0bec5 });
  face.circle(PLAYER_W - 9, eyeY, 5).fill(C.playerEye).stroke({ width: 1, color: 0xb0bec5 });
  face.circle(9 + eyeXo * 1.5, eyeY + 0.5, 2.2).fill(C.playerPupil);
  face.circle(PLAYER_W - 9 + eyeXo * 1.5, eyeY + 0.5, 2.2).fill(C.playerPupil);

  if (isDashing) {
    const pulse = 0.35 + Math.sin(tick * 0.35) * 0.12;
    dashAura
      .roundRect(-8, -8, PLAYER_W + 16, PLAYER_H + 16, 18)
      .fill({ color: C.dashTrail, alpha: pulse });
  }
}
