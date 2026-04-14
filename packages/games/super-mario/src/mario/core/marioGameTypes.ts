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

/**
 * SMB1 风格：水平加速度/摩擦接近 1.5px/f、0.0547px/f² 在 16px 砖下的 2× 缩放；
 * 竖直方向用「起跳按住时较小重力、下落/松键较大重力」近似原版滞空与落地感。
 */
export const marioPhysics = {
  walkAccel: 0.11,
  walkMax: 3.0,
  friction: 0.11,
  /** 反向输入时的额外减速（近似原版 skid） */
  reverseAccelMult: 2.35,
  gravityRiseHeld: 0.24,
  gravityRise: 0.38,
  gravityFall: 0.62,
  /** vy 高于此值（负得较少）时视为已过顶点附近，用较大重力 */
  jumpGravityBlendVy: -3.25,
  jumpVel: -10.15,
  /** 松开跳跃键时对上升速度的衰减（仍略保留短跳） */
  jumpCut: 0.42,
  stompBounce: -5.45,
  maxFallVel: 8.75,
  goombaSpeed: 0.78,
  koopaWalkSpeed: 0.72,
  shellSlideSpeed: 4.25,
  /** 敌人、蘑菇等：单一大小的下落加速度 */
  entityGravity: 0.62,
} as const;

/** 与原版 NES 60Hz 对齐的固定物理步长（秒） */
export const MARIO_PHYSICS_HZ = 60;
export const MARIO_PHYSICS_STEP_MS = 1000 / MARIO_PHYSICS_HZ;
