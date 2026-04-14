/**
 * SMB1 风格关卡逻辑共享类型与物理常量（与 Game 拆分，控制单文件体量）。
 */
import type { Container, Graphics, Sprite } from "pixi.js";

export type MarioHudState = {
  score: number;
  coins: number;
  lives: number;
  world: string;
  time: number;
};

export type Rect = { x: number; y: number; w: number; h: number };

export type SolidKind = "ground" | "pipe" | "block";

export type SolidRef = Rect & { kind: SolidKind; blockId?: number };

export type BlockData = {
  x: number;
  y: number;
  kind: "brick" | "question";
  /** 仅问号砖有效：金币或蘑菇 */
  loot: "coin" | "mushroom";
  used: boolean;
  /** 大马里奥顶碎的砖为 false，固体重建时跳过 */
  active: boolean;
  /** 隐藏砖：顶开前无碰撞且不可见 */
  hidden: boolean;
  /** 已从下方顶出（仅当 hidden 时有意义） */
  revealed: boolean;
  /** 砖块：可反复顶出的金币次数上限；0 表示普通砖 */
  brickCoinHitsMax: number;
  /** 砖块：剩余可顶出金币；归零后变为「空砖」外观且不可再顶出金币 */
  brickCoinHitsRemaining: number;
  bump: number;
  gfx: Container;
};

/** 空中固定位置金币（轻微上下浮动） */
export type FloatingCoinData = {
  alive: boolean;
  spawnX: number;
  spawnY: number;
  gfx: Container;
};

export type KoopaData = {
  alive: boolean;
  mode: "walk" | "shell" | "slide";
  x: number;
  y: number;
  vx: number;
  vy: number;
  gfx: Container;
  sprite: Sprite;
};

export type GoombaData = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gfx: Container;
};

export type MobBody = { x: number; y: number; vx: number; vy: number };

export type MushroomData = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gfx: Container;
};

export type PiranhaData = {
  gfx: Container;
  head: Sprite;
  baseX: number;
  pipeTop: number;
  emergeMax: number;
  phase: number;
};

export type BrickParticle = {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
  av: number;
};

export type DeathParticle = {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
};

export const marioPhysics = {
  walkAccel: 0.34,
  walkMax: 3.45,
  friction: 0.36,
  gravity: 0.52,
  jumpVel: -12.8,
  jumpCut: 0.52,
  stompBounce: -6.2,
  goombaSpeed: 0.78,
  koopaWalkSpeed: 0.72,
  shellSlideSpeed: 4.25,
} as const;
