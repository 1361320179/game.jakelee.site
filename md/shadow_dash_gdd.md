# Shadow Dash（影跃）- 第一关完整设计文档（GDD）

## 一、项目概述

- 游戏类型：横版平台跳跃（Platformer）
- 平台：Web（H5）
- 技术建议：React 19 + Next.js + PixiJS
- 视觉风格：复古像素风 (Retro Pixel Art)
- 核心玩法：移动 / 跳跃 / 冲刺（Dash）

## 二、核心玩法机制

### 玩家能力

- 左右移动
- 单段跳
- 冲刺（Dash，带CD）

### 操作

- PC：A/D 移动，Space 跳跃，Shift 冲刺
- 移动端：虚拟按钮

---

## 三、第一关设计（L1-1 初始试炼）

### 关卡目标

从起点移动至终点门

### 难度

⭐ 新手教学关

### 分段设计

#### 1. 教学移动区

- 平地 + 小台阶
- 无危险

#### 2. 跳跃练习区

- 多个间隔平台
- 掉落不死亡

#### 3. 危险机制区

- 地刺
- 碰到即死亡

#### 4. Dash 教学区

- 必须冲刺通过

#### 5. 终点

- 门 + 光效

---

## 四、关卡数据（JSON）

```json
{
  "level": 1,
  "width": 2000,
  "height": 600,
  "spawn": { "x": 100, "y": 400 },
  "goal": { "x": 1850, "y": 400 },
  "platforms": [
    { "x": 0, "y": 500, "w": 600, "h": 50 },
    { "x": 700, "y": 450, "w": 120, "h": 20 },
    { "x": 900, "y": 400, "w": 120, "h": 20 },
    { "x": 1100, "y": 350, "w": 120, "h": 20 },
    { "x": 1400, "y": 500, "w": 400, "h": 50 }
  ],
  "spikes": [{ "x": 1200, "y": 480, "w": 100, "h": 20 }],
  "checkpoints": [{ "x": 800, "y": 400 }]
}
```

---

## 五、玩家参数

```ts
const playerConfig = {
  speed: 4,
  jumpForce: 12,
  gravity: 0.5,
  dashSpeed: 10,
  dashDuration: 200,
  dashCooldown: 1000,
};
```

---

## 六、碰撞规则

- 平台：站立
- 地刺：死亡
- 掉落：回到检查点
- 终点：通关

---

## 七、UI设计与视觉规范

### 视觉规范

- **风格**：复古像素风 (Retro Pixel Art)
- **字体**：像素字体（如 Press Start 2P 或 VT323）
- **配色**：
  - 主背景：深邃暗色（如 `#1a1c2c`）
  - 强调色：高饱和像素色（如 `#ff0044` 红色危险区，`#00ffcc` 青色冲刺高亮）
  - UI 边框：经典的 2px/4px 粗糙像素边框

### 核心UI组件

- **GameOverlay**：游戏 UI 主容器，绝对定位覆盖在 Canvas 上，背景透明。
- **TopHUD**：
  - 左侧：关卡名称（带像素文字阴影）
  - 右侧：复古电子计时器（如 `00:14:59`）
- **DashMeter**：冲刺冷却指示器。使用分段像素格或充能条，冷却时呈现灰色，就绪时闪烁青色光芒。
- **KeyPrompts**：屏幕中下方的操作提示，使用像素风格的键盘按键图标（[A] [D] 移动, [Space] 跳跃, [Shift] 冲刺），在教学区动态淡入淡出。

---

## 八、音效

- jump.wav
- dash.wav
- hit.wav
- clear.wav

---

## 九、开发结构建议

采用 UI 层与渲染层分离的 Monorepo 架构：

- **React 负责 HUD**（如 TopHUD, DashMeter 等，位于 `apps/web`）
- **PixiJS 负责游戏世界渲染**（完全独立的包，位于 `packages/games`）
- **关卡数据与文案**（内容分离，位于 `packages/content`）

```text
/apps/web/components/game
  GameOverlay.tsx    # React UI 主容器
  TopHUD.tsx         # 顶部状态栏
  DashMeter.tsx      # Dash 冷却条
  KeyPrompts.tsx     # 操作提示

/packages/games/game-shadow-dash
  package.json       # 独立依赖 (PixiJS)
  /src
    index.ts         # 暴露 mountGame(containerId)
    /scenes          # 游戏场景
    /entities        # 玩家、地刺、平台
    /systems         # 物理碰撞、重力计算、Dash状态机
    /config          # 玩家移动速度、跳跃力度等参数

/packages/content/games/shadow-dash
  metadata.json      # 游戏标题、简介、封面
  /levels
    level-1.json     # 关卡平台和地刺坐标数据
```

---

## 十、核心循环

```ts
function update() {
  applyGravity(player);
  movePlayer(player);
  checkCollision(player, platforms);

  if (hitSpike(player)) respawn();
  if (reachGoal(player)) win();
}
```

---

## 十一、MVP开发顺序

1.  移动
2.  跳跃
3.  碰撞
4.  摄像机
5.  地刺
6.  Dash
7.  UI

---

## 十二、扩展方向

- 二段跳
- 敌人AI
- 多关卡
- 收集系统

---

生成时间：2026-04-10 02:50:34.339352
