import React from "react";
import type { MarioHudState } from "@game/shadow-dash";
import { TopHUD } from "./TopHUD";
import { DashMeter } from "./DashMeter";
import { KeyPrompts } from "./KeyPrompts";
import "./game-ui.css";

interface GameOverlayProps {
  levelName?: string;
  timeElapsed?: number;
  dashCooldownProgress?: number;
  showPrompts?: boolean;
  /** SMB-style HUD when playing Shadow Dash L1 */
  marioHud?: MarioHudState | null;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  levelName = "L1-1 初始试炼",
  timeElapsed = 0,
  dashCooldownProgress = 1,
  showPrompts = true,
  marioHud = null,
}) => {
  const isMario = marioHud != null;

  return (
    <div
      className={`game-overlay ${isMario ? "game-overlay--mario game-overlay--touch-game" : ""} font-cartoon`}
    >
      <div className="game-overlay-inner">
        <TopHUD
          levelName={levelName}
          timeElapsed={timeElapsed}
          marioHud={marioHud}
        />
        <div className="game-hud-bottom">
          <KeyPrompts
            visible={showPrompts}
            variant={isMario ? "mario" : "dash"}
          />
          {!isMario && <DashMeter progress={dashCooldownProgress} />}
        </div>
      </div>
    </div>
  );
};
