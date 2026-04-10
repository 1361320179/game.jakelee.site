/**
 * Shadow Dash：横版平台跳跃 + 冲刺。
 * 使用 PixiJS 分层渲染（远景 / 关卡与角色 / 触屏 UI），每帧更新物理与相机。
 */
import {
  Application,
  Container,
  Graphics,
  Rectangle,
  Ticker,
  Text,
  TextStyle,
} from "pixi.js";
import levelData from "../../../content/games/shadow-dash/levels/level-1.json";
import {
  PLAYER_H,
  PLAYER_W,
  createCartoonGoal,
  createCartoonPlatform,
  createCartoonSpikeField,
  createCloudPuff,
  createHillSilhouette,
  createPlayerVisual,
  createSkyStrip,
  drawPlayerBody,
} from "./cartoonAssets";

/** 手感相关常量（速度、跳跃、重力、冲刺时长与冷却，单位与帧 tick 一致） */
const config = {
  speed: 5,
  jumpForce: 12,
  gravity: 0.6,
  dashSpeed: 15,
  dashDuration: 12,
  dashCooldown: 60,
};

/** 终点传送门逻辑碰撞盒（与 createCartoonGoal 视觉大致对齐） */
const GOAL_W = 44;
const GOAL_H = 64;

/** 关卡中平台、尖刺等使用的轴对齐矩形 */
type Rect = { x: number; y: number; w: number; h: number };

export class ShadowDashGame {
  public app: Application;
  private container!: HTMLElement;
  /** 远景：天空、云、山，相机移动时做较小视差 */
  private bgLayer: Container;
  /** 平台、障碍、玩家、终点等游戏世界内容 */
  private world: Container;
  /** 虚拟按键等叠在画布上的 UI */
  private uiLayer: Container;

  private player!: Container;
  private playerVis!: ReturnType<typeof createPlayerVisual>;
  /** 面朝方向，冲刺无输入时沿用上次朝向 */
  private facing: 1 | -1 = 1;
  /** 累计时间，供角色动画与终点光效使用 */
  private animTick = 0;

  private platformRects: Rect[] = [];
  private spikeRects: Rect[] = [];
  private goalRect!: Rect;

  /** 终点门内发光层，用于呼吸透明度动画 */
  private goalPortal!: Graphics;

  // 玩家运动状态
  private vx = 0;
  private vy = 0;
  private isGrounded = false;
  private isDashing = false;
  private dashTimer = 0;
  private dashCooldownTimer = 0;

  private keys: { [key: string]: boolean } = {};
  private touchInputs = { left: false, right: false, jump: false, dash: false };

  /** 冲刺冷却 0→1，供外层 UI（如进度条）同步 */
  public onDashCooldownUpdate?: (progress: number) => void;
  /** 进入终点碰撞盒时触发 */
  public onLevelComplete?: () => void;

  constructor() {
    this.app = new Application();
    this.bgLayer = new Container();
    this.world = new Container();
    this.uiLayer = new Container();
  }

  public async init(container: HTMLElement) {
    this.container = container;

    await this.app.init({
      resizeTo: container,
      backgroundColor: 0x7dd3fc,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    container.appendChild(this.app.canvas);
    this.app.stage.addChild(this.bgLayer);
    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.uiLayer);

    this.setupBackground();
    this.setupLevel();
    this.setupPlayer();
    this.setupControls();
    this.setupVirtualJoystick();

    this.app.ticker.add(this.update.bind(this));
  }

  /** 根据关卡尺寸铺天空渐变、装饰云与远山（与平台最高点对齐山脚） */
  private setupBackground() {
    const groundY = Math.max(...levelData.platforms.map((p) => p.y));
    const sky = createSkyStrip(levelData.width, levelData.height);
    sky.position.set(-400, -120);
    this.bgLayer.addChild(sky);

    const clouds = new Container();
    clouds.addChild(createCloudPuff(180, 90, 1.1));
    clouds.addChild(createCloudPuff(520, 140, 0.85));
    clouds.addChild(createCloudPuff(980, 80, 1));
    clouds.addChild(createCloudPuff(1420, 160, 0.9));
    clouds.addChild(createCloudPuff(1750, 100, 1.05));
    this.bgLayer.addChild(clouds);

    const hills = createHillSilhouette(levelData.width, groundY);
    hills.position.set(-400, 0);
    this.bgLayer.addChild(hills);
  }

  /** 从 JSON 生成平台、尖刺与终点，并缓存用于物理的矩形 */
  private setupLevel() {
    this.platformRects = [];
    levelData.platforms.forEach((p) => {
      this.platformRects.push({ x: p.x, y: p.y, w: p.w, h: p.h });
      const platform = createCartoonPlatform(p.w, p.h);
      platform.position.set(p.x, p.y);
      this.world.addChild(platform);
    });

    this.spikeRects = [];
    levelData.spikes.forEach((s) => {
      this.spikeRects.push({ x: s.x, y: s.y, w: s.w, h: s.h });
      const spike = createCartoonSpikeField(s.w, s.h);
      spike.position.set(s.x, s.y);
      this.world.addChild(spike);
    });

    const goalTopY = levelData.goal.y - GOAL_H;
    this.goalRect = {
      x: levelData.goal.x,
      y: goalTopY,
      w: GOAL_W,
      h: GOAL_H,
    };
    const { root: goalRoot, portal } = createCartoonGoal(GOAL_W, GOAL_H);
    this.goalPortal = portal;
    goalRoot.position.set(this.goalRect.x, this.goalRect.y);
    this.world.addChild(goalRoot);
  }

  /** 创建玩家显示节点并放到出生点 */
  private setupPlayer() {
    this.playerVis = createPlayerVisual();
    this.player = this.playerVis.root;
    this.respawn();
    this.world.addChild(this.player);
  }

  /** 落坑、碰刺或通关后重置位置与速度 */
  private respawn() {
    this.player.position.set(levelData.spawn.x, levelData.spawn.y);
    this.vx = 0;
    this.vy = 0;
    this.isDashing = false;
    this.dashTimer = 0;
  }

  /** 键盘：方向/WASD 移动，空格/上/W 跳，Shift/K 冲刺 */
  private setupControls() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        this.jump();
      }
      if (
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight" ||
        e.code === "KeyK"
      ) {
        this.dash();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  /**
   * 触屏设备在画面底部绘制虚拟方向键与跳/冲按钮；
   * 窗口尺寸变化时重建按钮位置。
   */
  private setupVirtualJoystick() {
    if (!("ontouchstart" in window)) return;

    const labelStyle = new TextStyle({
      fontFamily: "system-ui, sans-serif",
      fontSize: 18,
      fontWeight: "800",
      fill: 0xffffff,
      dropShadow: {
        alpha: 0.45,
        angle: Math.PI / 4,
        blur: 3,
        color: 0x000000,
        distance: 2,
      },
    });

    const mkBtn = (
      x: number,
      y: number,
      label: string,
      colors: { fill: number; stroke: number },
      onDown: () => void,
      onUp: () => void,
    ) => {
      const wrap = new Container();
      wrap.position.set(x, y);
      const shadow = new Graphics();
      shadow.roundRect(4, 6, 88, 88, 22).fill({ color: 0x000000, alpha: 0.2 });
      const face = new Graphics();
      face
        .roundRect(0, 0, 88, 88, 22)
        .fill(colors.fill)
        .stroke({ width: 3, color: colors.stroke });
      const hi = new Graphics();
      hi.roundRect(10, 8, 68, 22, 12).fill({ color: 0xffffff, alpha: 0.22 });
      const t = new Text({ text: label, style: labelStyle });
      t.anchor.set(0.5);
      t.position.set(44, 46);
      wrap.addChild(shadow);
      wrap.addChild(face);
      wrap.addChild(hi);
      wrap.addChild(t);
      wrap.eventMode = "static";
      wrap.cursor = "pointer";
      wrap.hitArea = new Rectangle(0, 0, 88, 88);
      wrap.on("pointerdown", onDown);
      wrap.on("pointerup", onUp);
      wrap.on("pointerupoutside", onUp);
      wrap.on("pointercancel", onUp);
      this.uiLayer.addChild(wrap);
    };

    const resizeUI = () => {
      const w = this.app.screen.width;
      const h = this.app.screen.height;
      this.uiLayer.removeChildren();

      mkBtn(
        16,
        h - 108,
        "◀",
        { fill: 0x64b5f6, stroke: 0x1565c0 },
        () => (this.touchInputs.left = true),
        () => (this.touchInputs.left = false),
      );
      mkBtn(
        112,
        h - 108,
        "▶",
        { fill: 0x64b5f6, stroke: 0x1565c0 },
        () => (this.touchInputs.right = true),
        () => (this.touchInputs.right = false),
      );

      mkBtn(
        w - 104,
        h - 108,
        "跳",
        { fill: 0x81c784, stroke: 0x2e7d32 },
        () => {
          this.touchInputs.jump = true;
          this.jump();
        },
        () => (this.touchInputs.jump = false),
      );
      mkBtn(
        w - 204,
        h - 108,
        "冲",
        { fill: 0xffb74d, stroke: 0xef6c00 },
        () => {
          this.touchInputs.dash = true;
          this.dash();
        },
        () => (this.touchInputs.dash = false),
      );
    };

    resizeUI();
    window.addEventListener("resize", resizeUI);
  }

  /** 仅在地面上且非冲刺中可起跳 */
  private jump() {
    if (this.isGrounded && !this.isDashing) {
      this.vy = -config.jumpForce;
      this.isGrounded = false;
    }
  }

  /** 触发冲刺并进入冷却；冷却中或已在冲刺中则忽略 */
  private dash() {
    if (this.dashCooldownTimer <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = config.dashDuration;
      this.dashCooldownTimer = config.dashCooldown;
      this.vy = 0;
    }
  }

  /** 轴对齐矩形相交检测 */
  private rectsOverlap(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    b: Rect,
  ): boolean {
    return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
  }

  /**
   * 单帧：输入 → 冲刺/重力 → 先水平位移并解水平碰撞，再垂直位移解垂直碰撞，
   * 然后 hazard/终点/摔落判定，最后平滑跟随相机与绘制。
   */
  private update(ticker: Ticker) {
    this.animTick += ticker.deltaMS * 0.06;

    let targetVx = 0;
    if (this.keys["ArrowLeft"] || this.keys["KeyA"] || this.touchInputs.left)
      targetVx -= config.speed;
    if (this.keys["ArrowRight"] || this.keys["KeyD"] || this.touchInputs.right)
      targetVx += config.speed;

    if (targetVx > 0) this.facing = 1;
    else if (targetVx < 0) this.facing = -1;

    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer--;
      if (this.onDashCooldownUpdate) {
        this.onDashCooldownUpdate(
          1 - this.dashCooldownTimer / config.dashCooldown,
        );
      }
    }

    if (this.isDashing) {
      this.dashTimer--;
      const dashDir = targetVx !== 0 ? Math.sign(targetVx) : this.facing;
      this.vx = dashDir * config.dashSpeed;
      this.vy = 0;
      if (this.dashTimer <= 0) this.isDashing = false;
    } else {
      this.vx = targetVx;
      this.vy += config.gravity;
    }

    this.player.x += this.vx;
    this.checkPlatformCollisions(true);

    this.player.y += this.vy;
    this.isGrounded = false;
    this.checkPlatformCollisions(false); // 落地时在此将 isGrounded 置 true

    if (this.checkHazardOverlap()) this.respawn();

    if (
      this.rectsOverlap(
        this.player.x,
        this.player.y,
        PLAYER_W,
        PLAYER_H,
        this.goalRect,
      )
    ) {
      if (this.onLevelComplete) this.onLevelComplete();
      this.respawn();
    }

    if (this.player.y > levelData.height + 200) this.respawn();

    // 通过移动 world 实现相机：目标为玩家居中，略偏下；X 轴钳制在关卡范围内
    const targetCamX = -this.player.x + this.app.screen.width / 2;
    const targetCamY = -this.player.y + this.app.screen.height / 2 + 100;
    this.world.x += (targetCamX - this.world.x) * 0.1;
    this.world.y += (targetCamY - this.world.y) * 0.1;
    this.world.x = Math.min(
      0,
      Math.max(this.world.x, -(levelData.width - this.app.screen.width)),
    );

    this.bgLayer.x = this.world.x * 0.18;
    this.bgLayer.y = this.world.y * 0.12;

    const portalPulse = 0.78 + Math.sin(this.animTick * 0.08) * 0.12;
    this.goalPortal.alpha = portalPulse;

    drawPlayerBody(
      this.playerVis.body,
      this.playerVis.face,
      this.playerVis.dashAura,
      this.facing,
      this.isGrounded,
      this.isDashing,
      this.animTick,
    );
    this.playerVis.shadow.scale.x = 1 + Math.min(1, Math.abs(this.vx) / 12) * 0.12;
  }

  /**
   * 与所有平台依次解析重叠：水平阶段修正 X 并清零 vx；垂直阶段修正 Y、清零 vy，
   * 自下而上碰撞时标记落地。
   */
  private checkPlatformCollisions(isHorizontal: boolean) {
    const px = this.player.x;
    const py = this.player.y;
    const pw = PLAYER_W;
    const ph = PLAYER_H;

    for (const plat of this.platformRects) {
      if (!this.rectsOverlap(px, py, pw, ph, plat)) continue;

      if (isHorizontal) {
        if (this.vx > 0) this.player.x = plat.x - pw;
        else if (this.vx < 0) this.player.x = plat.x + plat.w;
        this.vx = 0;
      } else {
        if (this.vy > 0) {
          this.player.y = plat.y - ph;
          this.isGrounded = true;
        } else if (this.vy < 0) {
          this.player.y = plat.y + plat.h;
        }
        this.vy = 0;
      }
    }
  }

  /** 与尖刺逻辑盒重叠则视为死亡，由调用方 respawn */
  private checkHazardOverlap(): boolean {
    for (const s of this.spikeRects) {
      if (
        this.rectsOverlap(
          this.player.x,
          this.player.y,
          PLAYER_W,
          PLAYER_H,
          s,
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /** 卸载画布与 Pixi 资源 */
  public destroy() {
    this.app.destroy(true, { children: true });
  }
}
