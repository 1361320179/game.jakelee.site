import React from "react";
import { TopHUD } from "./TopHUD";
import { DashMeter } from "./DashMeter";
import { KeyPrompts } from "./KeyPrompts";
import "./game-ui.css";

interface GameOverlayProps {
  levelName?: string;
  timeElapsed?: number;
  dashCooldownProgress?: number;
  showPrompts?: boolean;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  levelName = "L1-1 初始试炼",
  timeElapsed = 0,
  dashCooldownProgress = 1,
  showPrompts = true,
}) => {
  return (
    <div className="game-overlay font-cartoon">
      <div className="game-overlay-inner">
        <TopHUD levelName={levelName} timeElapsed={timeElapsed} />
        <div className="game-hud-bottom">
          <KeyPrompts visible={showPrompts} />
          <DashMeter progress={dashCooldownProgress} />
        </div>
      </div>
    </div>
  );
};
