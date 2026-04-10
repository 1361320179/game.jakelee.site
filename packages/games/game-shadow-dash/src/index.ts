/**
 * 供 Next 等宿主动态加载：在指定 DOM 节点挂载 / 卸载 Pixi 游戏实例。
 * 同时只允许一个活跃实例，避免重复 init。
 */
import { ShadowDashGame } from './Game';

let activeGame: ShadowDashGame | null = null;

/** 在 `containerId` 对应元素内初始化画布并开始游戏循环 */
export const mountGame = async (
  containerId: string, 
  callbacks?: { 
    onDashCooldownUpdate?: (progress: number) => void,
    onLevelComplete?: () => void
  }
) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found`);
    return;
  }

  activeGame = new ShadowDashGame();
  if (callbacks) {
    activeGame.onDashCooldownUpdate = callbacks.onDashCooldownUpdate;
    activeGame.onLevelComplete = callbacks.onLevelComplete;
  }
  
  await activeGame.init(container);
  console.log(`Mounted Shadow Dash game to ${containerId}`);
};

/** 销毁当前实例并释放 WebGL / Canvas 资源 */
export const unmountGame = () => {
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
    console.log("Unmounted Shadow Dash game");
  }
};
