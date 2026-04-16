# Super Mario（超级马里奥）— 第一关设计文档（GDD）

> 本文档描述 **当前仓库已实现** 的第一关（`level-1.json` + `SuperMarioGame`）行为与数据，便于策划对齐、后续关卡扩展与联调。素材为原创同人像素/矢量，**非任天堂 ROM 提取**。

---

## 一、产品定位

| 项         | 说明                                                     |
| ---------- | -------------------------------------------------------- |
| 类型       | 横版平台跳跃（SMB1 World 1-1 风格致敬）                  |
| 平台       | Web（H5）：桌面键盘 + 移动端虚拟摇杆/跳跃                |
| 渲染       | **PixiJS v8**（`packages/games/super-mario`）            |
| 宿主       | **Next.js** 页面挂载 Canvas（`apps/web`）                |
| 核心循环   | 跑跳、踩踏敌人、顶方块、拾金币/蘑菇、触旗杆通关          |
| **未实现** | 冲刺（Dash）、滑铲、存盘选关等（代码注释明确 _no dash_） |

---

## 二、关卡数据与空间范围

关卡数据文件：`packages/content/games/super-mario/levels/level-1.json`。

### 2.1 世界尺寸与出生点

| 字段              | 值          | 说明                                  |
| ----------------- | ----------- | ------------------------------------- |
| `width`           | 4096        | 关卡世界宽度（像素）                  |
| `height`          | 480         | 关卡世界高度（像素）                  |
| `groundY`         | 400         | 地表顶线 Y（玩家站在 `groundY - ph`） |
| `groundThickness` | 160         | 地面碰撞体厚度（向下延伸）            |
| `spawn`           | `(64, 368)` | 玩家初始位置（小马里奥时脚底贴地）    |
| `timeLimit`       | 400         | 倒计时秒数；归零触发死亡流程          |

### 2.2 地面分段（含裂谷）

`groundSegments` 为 **多段矩形固体**，段与段之间 **无碰撞**，形成可坠入的裂谷：

- `[0, 1984)`、`[2128, 2704)`、`[2768, 4096)` 三段（宽度见 JSON）。
- 中间空隙为 **即死区** 的一部分：`player.y > level.height + 120` 时触发死亡（见 `Game.ts`）。

### 2.3 管道（固体 + 可选食人花）

`pipes`：每根为轴对齐矩形固体，顶部在 `groundY - h`。部分条目带 `"plant": true`，会在管口生成 **食人花（Piranha）**，周期性伸出；与玩家碰撞造成伤害逻辑（见战斗模块）。

### 2.4 终点旗杆

| 字段    | 值   |
| ------- | ---- |
| `flagX` | 3968 |
| `poleH` | 168  |

玩家 AABB 与旗杆触发盒重叠后进入 **抓杆下滑** 状态，滑至 `groundY` 后结算通关（加分、回调 `onLevelComplete`）。

---

## 三、玩家能力与控制

### 3.1 体型与碰撞盒

定义于 `marioAssets.ts`（与渲染缩放一致）：

| 状态     | 宽 × 高 |
| -------- | ------- |
| 小马里奥 | 28 × 32 |
| 大马里奥 | 32 × 44 |

### 3.2 水平移动与跳跃

物理常量集中在 `mario/core/marioGameTypes.ts` 的 `marioPhysics`：

- **行走**：加速度 `walkAccel`、最大速度 `walkMax`、摩擦 `friction`；反向输入有 `reverseAccelMult` 强化减速。
- **跳跃**：初速度 `jumpVel`（向上为负）；按住跳跃在上升前半段使用较小重力 `gravityRiseHeld`，否则 `gravityRise`；下落 `gravityFall`；松键短跳衰减 `jumpCut`。
- **最大下落速度**：`maxFallVel`。
- **物理步长**：固定 **60Hz** 子步（`MARIO_PHYSICS_STEP_MS`），与高刷解耦。

### 3.3 碰撞解析（与关卡体验强相关）

`mario/player/marioGamePlayerResolve.ts`：

- **先横向位移 → 横向解析**，使用 **严格 AABB** 与固体相交，避免「脚底贴地容差」误判侧向阻挡。
- **再纵向位移 → 纵向解析**；地面检测对固体使用 `rectsPlayerVsSolid`（带少量脚底容差，防穿地）。
- **隐藏砖**：仅在上升（`vy < 0`）时用严格相交顶开；显形后重建方块固体列表。

### 3.4 输入

- **键盘**：`ArrowLeft` / `KeyA` 左，`ArrowRight` / `KeyD` 右；`Space` / `ArrowUp` / `KeyW` 跳跃（`keydown` 时对 Space/上/W 有 `preventDefault`）。
- **触摸**：`MarioMobileTouchUi` 在检测到移动设备时绘制虚拟摇杆 + 跳跃键；跳跃命中区为矩形扩展（便于点击）。

---

## 四、方块与关卡交互

方块由 `level-1.json` 的 `blocks` 数组描述，运行时转为 `BlockData`（见 `marioGameTypes.ts`）。

### 4.1 类型

| JSON `kind` | 行为概要                                                                     |
| ----------- | ---------------------------------------------------------------------------- |
| `question`  | 顶一次出奖：`loot` 为 `coin` 或 `mushroom`；用后变「已用砖」外观且不可再出奖 |
| `brick`     | 小马里奥：**顶动**；大马里奥：**可顶碎**（碎粒子 + 固体重建）                |

### 4.2 特殊砖规则（与实现一致）

- **`coinHits`（仅 brick）**：带数值时该砖可 **多次顶出金币**（每次经济 +1 币、+200 分等），次数耗尽后换「空砖」外观且不再产币（见 `marioGameBlockActions.ts`）。
- **`hidden: true`**：未顶开前 **无碰撞、不可见**；从下方顶开后显形并走与普通砖/问号相同的顶击逻辑（隐藏问号蘑菇等）。

### 4.3 经济规则（方块产币）

- 顶出金币：`coins += 1`，`score += 200`，并播放金币火花粒子。
- **100 币加 1 命**：`coins >= 100` 时减 100 币、`lives += 1`。

---

## 五、敌人与战斗

### 5.1 栗宝宝（Goomba）

- 关卡内多个出生点（`goombas`）。
- **踩踏**：玩家下落踩中则消灭敌人并得分（具体分数见 `marioGameCombat.ts`）；可顺带修正玩家竖直速度（弹跳感）。

### 5.2 乌龟（Koopa）

- 多个出生点（`koopas`）。
- 支持 **行走 / 缩壳 / 壳滑动** 等模式切换；与玩家碰撞有踩踏与受伤分支。

### 5.3 食人花（Piranha Plant）

- 仅标记 `plant: true` 的管道生成。
- 与玩家碰撞在可玩状态下造成伤害（与无敌帧等逻辑联动）。

### 5.4 受伤与死亡

- **大马里奥受伤**：缩小为小马里奥，短暂无敌帧（闪烁透明度）。
- **小马里奥受伤 / 食人花等即死**：进入死亡序列（粒子、短暂禁用操作），扣命并复位关卡实体或 Game Over 流程（见 `Game.ts`：`triggerDeath`、`applyLifeLossAndRespawn`）。
- **无敌帧**：`iframes` 递减，期间可被绘制为半透明闪烁。

---

## 六、道具与收集物

### 6.1 蘑菇

- 从问号砖 `loot: "mushroom"` 顶出后进入 `mushrooms` 列表，受重力与固体碰撞，玩家拾取后 **变大**（碰撞盒切换为大马里奥）。

### 6.2 空中固定金币

- `floatingCoins`：世界坐标生成，带轻微浮动动画；玩家接触拾取，影响金币与分数（见 `marioGameCollectibles.ts`）。

---

## 七、通关与计分

### 7.1 旗杆

1. 玩家与旗杆触发矩形重叠 → `beginFlagSlide()`。
2. **抓杆高度** 通过 `computeFlagPoleGrabPoints` 计算一次性奖励分（阶梯分档，近似 SMB1 手感，非逐帧复刻任天堂）。
3. `tickFlagSlidePlayerPosition`：沿杆下滑至地面，`landed` 后 `finishFlagSequence()`：`won = true`，时间奖励分，`onLevelComplete` 回调。

### 7.2 HUD

`MarioHudState`（经 `tryEmitMarioHud` 推送到 React）：**分数、金币、生命、WORLD 标签、剩余时间** 等（具体字段见 `marioGameTypes.ts`）。

---

## 八、关卡内容清单（数据驱动）

以下为 `level-1.json` 内数组 **元素个数**（便于验收对照，非玩法剧透文案）：

| 内容                |                    数量 |
| ------------------- | ----------------------: |
| 地面段              |                       3 |
| 管道                | 10（其中 4 根含食人花） |
| 砖块/问号（含隐藏） |                      57 |
| 空中浮动金币点      |                      23 |
| 栗宝宝              |                       9 |
| 乌龟                |                       6 |

（具体坐标以 JSON 为准。）

---

## 九、工程结构（与本文档对应的代码入口）

```text
packages/content/games/super-mario/levels/level-1.json   # 关卡数据
packages/games/super-mario/src/Game.ts                   # SuperMarioGame 主循环 / 胜负 / 物理累加器
packages/games/super-mario/src/mario/                    # 按领域拆分：collision、combat、level、entities…
packages/games/super-mario/src/index.ts                  # mountGame / unmountGame
apps/web/components/game/super-mario/                    # React HUD 覆盖层（如 TopHUD、金币图标等）
```

---

## 十、扩展与维护建议

1. **新关卡**：复制 `level-1.json` 结构，调整 `width`、`groundSegments`、`blocks` 等；宿主需加载对应 JSON（当前 `Game.ts` 静态 import 单文件，扩展时建议改为参数化加载）。
2. **新敌人类型**：在 `mario/entities` 增加数据与移动解析，在 `Game.ts` 主循环挂载 tick。
3. **数值平衡**：优先只改 `marioPhysics` 与关卡 JSON，避免在 `Game.ts` 内散落魔法数。
4. **合规表述**：对外文案保持「同人致敬 / 非 ROM」定位，避免暗示官方授权。

---

_文档版本：与仓库实现同步整理；若代码与本文冲突，以源码为准。_
