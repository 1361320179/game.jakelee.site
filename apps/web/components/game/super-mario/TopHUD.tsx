import React from "react";
import type { MarioHudState } from "@game/super-mario";

interface TopHUDProps {
  levelName: string;
  timeElapsed: number;
  marioHud?: MarioHudState | null;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
};

const padScore = (n: number) =>
  Math.min(999999, Math.max(0, n)).toString().padStart(6, "0");

const padTime = (n: number) =>
  Math.min(999, Math.max(0, n)).toString().padStart(3, "0");

export const TopHUD: React.FC<TopHUDProps> = ({
  levelName,
  timeElapsed,
  marioHud,
}) => {
  if (marioHud) {
    return (
      <div className="top-hud top-hud--mario">
        <div className="mario-hud" aria-live="polite">
          <div className="mario-hud-col">
            <span className="mario-hud-label">MARIO</span>
            <span className="mario-hud-value">{padScore(marioHud.score)}</span>
          </div>
          <div className="mario-hud-col mario-hud-col--coin">
            <span className="mario-hud-label" aria-hidden>
              <img
                className="mario-hud-coin"
                src="/games/super-mario/hud-coin.svg"
                width={16}
                height={16}
                alt=""
              />
            </span>
            <span className="mario-hud-value">×{marioHud.coins.toString().padStart(2, "0")}</span>
          </div>
          <div className="mario-hud-col mario-hud-col--world">
            <span className="mario-hud-label">WORLD</span>
            <span className="mario-hud-value">
              {marioHud.world.replace(/^WORLD\s+/i, "").trim() || "1-1"}
            </span>
          </div>
          <div className="mario-hud-col mario-hud-col--time">
            <span className="mario-hud-label">TIME</span>
            <span className="mario-hud-value">{padTime(marioHud.time)}</span>
          </div>
          <div className="mario-hud-col mario-hud-col--lives">
            <span className="mario-hud-label">♥</span>
            <span className="mario-hud-value">×{marioHud.lives}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="top-hud">
      <div className="level-card">
        <span className="level-eyebrow">关卡</span>
        <div className="level-name">{levelName}</div>
        <div className="level-tags" aria-hidden>
          <span className="level-tag">平台跳跃</span>
          <span className="level-tag">冲刺</span>
        </div>
      </div>
      <div className="timer-card">
        <span className="timer-label">用时</span>
        <span className="game-timer">{formatTime(timeElapsed)}</span>
      </div>
    </div>
  );
};
