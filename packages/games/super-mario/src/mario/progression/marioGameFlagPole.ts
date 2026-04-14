/**
 * 旗杆抓取高度对应加分（SMB1 式阶梯分，同人近似非逐帧复刻）。
 */
export function computeFlagPoleGrabPoints(
  playerY: number,
  playerH: number,
  poleTopY: number,
  poleHeight: number,
): number {
  const chestY = playerY + playerH * 0.28;
  const t = Math.max(0, Math.min(1, (chestY - poleTopY) / poleHeight));
  const scores = [5000, 2000, 800, 400, 200, 100, 50];
  return scores[Math.min(scores.length - 1, Math.floor(t * scores.length))]!;
}

/** 沿旗杆下滑一帧；`landed` 为 true 时应结算通关并停止滑杆逻辑 */
export function tickFlagSlidePlayerPosition(o: {
  playerX: number;
  playerY: number;
  ph: number;
  flagX: number;
  groundY: number;
}): { x: number; y: number; landed: boolean } {
  const poleX = o.flagX + 2;
  const x = o.playerX + (poleX - o.playerX) * 0.2;
  const y = o.playerY + 3;
  const landed = y + o.ph >= o.groundY;
  return {
    x,
    y: landed ? o.groundY - o.ph : y,
    landed,
  };
}
