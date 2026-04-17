/**
 * Super Mario（超级马里奥）卡通风格矢量素材：天空、地形、机关与玩家均由 Graphics 绘制。
 * 配色集中在 C 对象，便于统一调整画风。
 */
import { Container, Graphics } from "pixi.js";

/** 玩家碰撞盒宽高，须与 Game 中物理判定一致 */
export const PLAYER_W = 28;
export const PLAYER_H = 32;

/** 主题色板（天空、地形、尖刺、门、角色等） */
const C = {
  skyTop: 0x5c94fc,
  skyBottom: 0x5c94fc,
  hill: 0x00a800,
  hillDark: 0x008800,
  cloud: 0xffffff,
  stone: 0xc84c0c,
  stoneDark: 0x882c00,
  stoneStroke: 0x000000,
  grass: 0x00a800,
  grassDark: 0x008800,
  spike: 0xf83800,
  spikeLight: 0xffa088,
  spikeStroke: 0x000000,
  doorWood: 0xc84c0c,
  doorWoodDark: 0x882c00,
  portal: 0x000000,
  portalGlow: 0x5c94fc,
  playerHat: 0xf83800,
  playerOveralls: 0x0058f8,
  playerSkin: 0xffcc99,
  playerShoe: 0x882c00,
  playerEye: 0x000000,
  dashTrail: 0xffffff,
};

/** 纵向渐变天空条带，宽度覆盖关卡并留边距；含柔和太阳 */
export function createSkyStrip(levelWidth: number, levelHeight: number): Graphics {
  const g = new Graphics();
  const pad = 800;
  const w = levelWidth + pad * 2;
  const h = Math.max(levelHeight + 400, 900);
  g.rect(-pad, 0, w, h).fill(C.skyTop);
  return g;
}

/** 一朵装饰云，原点为局部坐标，由调用方 set position */
export function createCloudPuff(x: number, y: number, scale: number): Graphics {
  const g = new Graphics();
  const s = scale;
  
  // Draw cloud shape
  g.circle(0, 0, 16 * s).fill(C.cloud).stroke({ width: 2, color: 0x000000 });
  g.circle(20 * s, -8 * s, 20 * s).fill(C.cloud).stroke({ width: 2, color: 0x000000 });
  g.circle(40 * s, 0, 16 * s).fill(C.cloud).stroke({ width: 2, color: 0x000000 });
  
  // Fill the bottom to make it flat and hide inner strokes
  g.rect(-16 * s, -4 * s, 72 * s, 20 * s).fill(C.cloud);
  
  // Bottom line
  g.moveTo(-16 * s, 16 * s);
  g.lineTo(56 * s, 16 * s);
  g.stroke({ width: 2, color: 0x000000 });

  g.position.set(x, y);
  return g;
}

/** 远景双层丘陵轮廓，baseY 由关卡地面高度推导 */
export function createHillSilhouette(levelWidth: number, groundY: number): Graphics {
  const g = new Graphics();
  const baseY = groundY + 40;
  const w = levelWidth + 1200;
  
  // Draw a large hill
  g.moveTo(-200, baseY + 280);
  g.lineTo(-200, baseY + 100);
  g.quadraticCurveTo(w * 0.2, baseY - 150, w * 0.5, baseY + 100);
  g.lineTo(w * 0.5, baseY + 280);
  g.fill(C.hill).stroke({ width: 3, color: 0x000000 });

  // Draw another hill
  g.moveTo(w * 0.3, baseY + 280);
  g.lineTo(w * 0.3, baseY + 150);
  g.quadraticCurveTo(w * 0.6, baseY - 50, w * 0.9, baseY + 150);
  g.lineTo(w * 0.9, baseY + 280);
  g.fill(C.hillDark).stroke({ width: 3, color: 0x000000 });

  return g;
}

/** 圆角石台 + 顶部草丛与草叶细节 */
export function createCartoonPlatform(w: number, h: number): Graphics {
  const g = new Graphics();
  
  // Base block
  g.rect(0, 0, w, h).fill(C.stone).stroke({ width: 2, color: C.stoneStroke });
  
  // Brick-like pattern or ground pattern
  // Draw some horizontal and vertical lines to simulate blocks
  const blockSize = 32;
  for (let y = 0; y < h; y += blockSize) {
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke({ width: 2, color: C.stoneDark });
    
    const offset = (y / blockSize) % 2 === 0 ? 0 : blockSize / 2;
    for (let x = offset; x < w; x += blockSize) {
      g.moveTo(x, y);
      g.lineTo(x, Math.min(y + blockSize, h));
      g.stroke({ width: 2, color: C.stoneDark });
    }
  }

  return g;
}

/** 横向铺满的三角尖刺带，数量随宽度变化；与关卡 JSON 中的 w/h 对齐 */
export function createCartoonSpikeField(w: number, h: number): Graphics {
  const g = new Graphics();
  const teeth = Math.max(3, Math.floor(w / 16));
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
    
    // Inner lighter triangle
    g.moveTo(x0 + tw * 0.3, h - 2);
    g.lineTo(mid, h * 0.3);
    g.lineTo(x1 - tw * 0.3, h - 2);
    g.closePath();
    g.fill(C.spikeLight);
  }
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
  
  // Castle door frame (brick-like)
  frame.rect(-8, -8, doorW + 16, doorH + 8).fill(C.stone).stroke({ width: 2, color: 0x000000 });
  
  // Door opening (black)
  const portal = new Graphics();
  portal.rect(0, 0, doorW, doorH).fill(0x000000);

  // Top arch
  frame.moveTo(-8, 0);
  frame.quadraticCurveTo(doorW / 2, -30, doorW + 8, 0);
  frame.fill(C.stone).stroke({ width: 2, color: 0x000000 });
  
  portal.moveTo(0, 0);
  portal.quadraticCurveTo(doorW / 2, -20, doorW, 0);
  portal.fill(0x000000);

  root.addChild(frame);
  root.addChild(portal);
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
  const w = PLAYER_W;
  const h = PLAYER_H - 4 + (1 - squash) * 4;

  // Shoes (Brown)
  body.rect(2, by + h - 6, w / 2 - 2, 6).fill(C.playerShoe);
  body.rect(w / 2 + 2, by + h - 6, w / 2 - 2, 6).fill(C.playerShoe);

  // Overalls (Blue)
  body.rect(4, by + 14, w - 8, h - 20).fill(C.playerOveralls);
  
  // Shirt (Red)
  body.rect(4, by + 10, w - 8, 8).fill(C.playerHat);
  
  // Arms (Red)
  body.rect(0, by + 12, 6, 8).fill(C.playerHat);
  body.rect(w - 6, by + 12, 6, 8).fill(C.playerHat);

  // Hands (Skin)
  body.rect(0, by + 20, 6, 4).fill(C.playerSkin);
  body.rect(w - 6, by + 20, 6, 4).fill(C.playerSkin);

  // Face/Head (Skin)
  face.rect(4, by + 4, w - 8, 8).fill(C.playerSkin);
  
  // Hat (Red)
  face.rect(4, by, w - 8, 4).fill(C.playerHat);
  // Hat brim
  if (facing === 1) {
    face.rect(w - 8, by + 4, 8, 2).fill(C.playerHat);
  } else {
    face.rect(0, by + 4, 8, 2).fill(C.playerHat);
  }

  // Eye
  const eyeX = facing === 1 ? w - 10 : 6;
  face.rect(eyeX, by + 6, 4, 4).fill(C.playerEye);

  // Mustache
  const stacheX = facing === 1 ? w - 8 : 2;
  face.rect(stacheX, by + 10, 6, 2).fill(0x000000);

  if (isDashing) {
    const pulse = 0.35 + Math.sin(tick * 0.35) * 0.12;
    dashAura
      .roundRect(-8, -8, PLAYER_W + 16, PLAYER_H + 16, 18)
      .fill({ color: C.dashTrail, alpha: pulse });
  }
}
