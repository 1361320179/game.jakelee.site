/**
 * 跟随玩家的横向/纵向相机与远景视差（与关卡尺寸解耦）。
 */
import type { Container } from "pixi.js";

export type MarioCameraTickOpts = {
  world: Container;
  bgLayer: Container;
  playerX: number;
  playerY: number;
  screenW: number;
  screenH: number;
  levelWidth: number;
  levelHeight: number;
};

export function tickMarioFollowCamera(o: MarioCameraTickOpts): void {
  const margin = 96;
  const targetCamX = -o.playerX + o.screenW / 2 - margin * 0.35;
  const minX = -(o.levelWidth - o.screenW);
  const maxX = 0;
  o.world.x += (targetCamX - o.world.x) * 0.14;
  o.world.x = Math.min(maxX, Math.max(minX, o.world.x));

  const targetCamY = -o.playerY + o.screenH * 0.52;
  const minY = -(o.levelHeight - o.screenH) - 40;
  const maxY = 80;
  o.world.y += (targetCamY - o.world.y) * 0.12;
  o.world.y = Math.min(maxY, Math.max(minY, o.world.y));

  o.bgLayer.x = o.world.x * 0.12;
  o.bgLayer.y = o.world.y * 0.08;
}
