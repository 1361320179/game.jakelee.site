/**
 * 供 Next 等宿主动态加载：在指定 DOM 节点挂载 / 卸载 Pixi 游戏实例。
 * 同时只允许一个活跃实例，避免重复 init。
 */
import type { MarioHudState } from "./Game";
import { ShadowDashGame } from "./Game";

export type { MarioHudState };

let activeGame: ShadowDashGame | null = null;

export const mountGame = async (
  containerId: string,
  callbacks?: {
    onHudUpdate?: (s: MarioHudState) => void;
    onLevelComplete?: () => void;
    onGameOver?: () => void;
  },
) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found`);
    return;
  }

  activeGame = new ShadowDashGame();
  if (callbacks) {
    activeGame.onHudUpdate = callbacks.onHudUpdate;
    activeGame.onLevelComplete = callbacks.onLevelComplete;
    activeGame.onGameOver = callbacks.onGameOver;
  }

  await activeGame.init(container);
  console.log(`Mounted Shadow Dash game to ${containerId}`);
};

export const unmountGame = () => {
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
    console.log("Unmounted Shadow Dash game");
  }
};
