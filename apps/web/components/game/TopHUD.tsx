import React from "react";

interface TopHUDProps {
  levelName: string;
  timeElapsed: number;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
};

export const TopHUD: React.FC<TopHUDProps> = ({ levelName, timeElapsed }) => {
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
