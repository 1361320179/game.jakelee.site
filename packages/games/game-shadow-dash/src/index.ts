import { ShadowDashGame } from './Game';

let activeGame: ShadowDashGame | null = null;

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

export const unmountGame = () => {
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
    console.log("Unmounted Shadow Dash game");
  }
};
