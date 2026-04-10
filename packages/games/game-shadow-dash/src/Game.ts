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

const config = {
  speed: 5,
  jumpForce: 12,
  gravity: 0.6,
  dashSpeed: 15,
  dashDuration: 12,
  dashCooldown: 60,
};

const GOAL_W = 44;
const GOAL_H = 64;

type Rect = { x: number; y: number; w: number; h: number };

export class ShadowDashGame {
  public app: Application;
  private container!: HTMLElement;
  private bgLayer: Container;
  private world: Container;
  private uiLayer: Container;

  private player!: Container;
  private playerVis!: ReturnType<typeof createPlayerVisual>;
  private facing: 1 | -1 = 1;
  private animTick = 0;

  private platformRects: Rect[] = [];
  private spikeRects: Rect[] = [];
  private goalRect!: Rect;

  private goalPortal!: Graphics;

  // Player state
  private vx = 0;
  private vy = 0;
  private isGrounded = false;
  private isDashing = false;
  private dashTimer = 0;
  private dashCooldownTimer = 0;

  private keys: { [key: string]: boolean } = {};
  private touchInputs = { left: false, right: false, jump: false, dash: false };

  public onDashCooldownUpdate?: (progress: number) => void;
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

  private setupPlayer() {
    this.playerVis = createPlayerVisual();
    this.player = this.playerVis.root;
    this.respawn();
    this.world.addChild(this.player);
  }

  private respawn() {
    this.player.position.set(levelData.spawn.x, levelData.spawn.y);
    this.vx = 0;
    this.vy = 0;
    this.isDashing = false;
    this.dashTimer = 0;
  }

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

  private jump() {
    if (this.isGrounded && !this.isDashing) {
      this.vy = -config.jumpForce;
      this.isGrounded = false;
    }
  }

  private dash() {
    if (this.dashCooldownTimer <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = config.dashDuration;
      this.dashCooldownTimer = config.dashCooldown;
      this.vy = 0;
    }
  }

  private rectsOverlap(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    b: Rect,
  ): boolean {
    return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
  }

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
    this.checkPlatformCollisions(false);

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

  public destroy() {
    this.app.destroy(true, { children: true });
  }
}
