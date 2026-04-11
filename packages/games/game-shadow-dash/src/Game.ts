/**
 * Shadow Dash L1 — SMB1 World 1-1 style homage (fan recreation, not official assets).
 * Walk / jump / stomp / ? blocks / flag; no dash.
 */
import {
  Application,
  Circle,
  Container,
  Graphics,
  Point,
  Rectangle,
  Ticker,
  Text,
  TextStyle,
} from "pixi.js";
import levelData from "../../../content/games/shadow-dash/levels/level-1.json";
import {
  GOOMBA_H,
  GOOMBA_W,
  MUSHROOM_H,
  MUSHROOM_W,
  PLAYER_BIG_H,
  PLAYER_BIG_W,
  PLAYER_H,
  PLAYER_W,
  PIRANHA_H,
  PIRANHA_W,
  TILE,
  createBrickBlock,
  createFlagAssembly,
  createGoombaGraphics,
  createGroundTile,
  createMarioVisual,
  createMushroomGraphics,
  createPipe,
  createPiranhaPlant,
  createQuestionBlock,
  createSMBSkyBackdrop,
  createUsedBlock,
  drawMarioBig,
  drawMarioSmall,
  drawPiranhaHead,
} from "./marioAssets";

export type MarioHudState = {
  score: number;
  coins: number;
  lives: number;
  world: string;
  time: number;
};

type Rect = { x: number; y: number; w: number; h: number };

type SolidKind = "ground" | "pipe" | "block";

type SolidRef = Rect & { kind: SolidKind; blockId?: number };

type BlockData = {
  x: number;
  y: number;
  kind: "brick" | "question";
  /** 仅问号砖有效：金币或蘑菇 */
  loot: "coin" | "mushroom";
  used: boolean;
  bump: number;
  gfx: Container;
};

type GoombaData = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gfx: Container;
};

type MushroomData = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gfx: Container;
};

type PiranhaData = {
  gfx: Container;
  head: Graphics;
  baseX: number;
  pipeTop: number;
  emergeMax: number;
  phase: number;
};

type DeathParticle = {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
};

const physics = {
  walkAccel: 0.55,
  walkMax: 5.4,
  friction: 0.48,
  gravity: 0.52,
  jumpVel: -12.8,
  jumpCut: 0.52,
  stompBounce: -6.2,
  goombaSpeed: 1.15,
};

export class ShadowDashGame {
  public app: Application;
  private container!: HTMLElement;
  private bgLayer: Container;
  private world: Container;
  private uiLayer: Container;

  private player!: Container;
  private playerVis!: ReturnType<typeof createMarioVisual>;
  private facing: 1 | -1 = 1;
  private animTick = 0;

  private solids: SolidRef[] = [];
  private blocks: BlockData[] = [];
  private goombas: GoombaData[] = [];
  private mushrooms: MushroomData[] = [];
  private piranhas: PiranhaData[] = [];
  private flagTouch!: Rect;
  private flagRoot!: Container;

  private isBig = false;
  private iframes = 0;
  private deathSequenceMs = 0;
  private deathParticles: DeathParticle[] = [];

  private vx = 0;
  private vy = 0;
  private isGrounded = false;
  private jumpQueued = false;
  private jumpCutDone = false;

  private keys: Record<string, boolean> = {};
  private prevJump = false;
  /** 移动端虚拟跳跃键 */
  private touchInputs = { jump: false };
  /** 虚拟摇杆水平分量 [-1, 1]，仅移动端使用 */
  private touchAxisX = 0;
  private stickDragCleanup: (() => void) | null = null;

  private score = 0;
  private coins = 0;
  private lives = 3;
  private timeLeft: number;
  private timeAccMs = 0;

  private won = false;
  private frozen = false;

  private lastHudEmit = 0;
  public onHudUpdate?: (s: MarioHudState) => void;
  public onLevelComplete?: () => void;
  public onGameOver?: () => void;

  private resizeUiHandler: (() => void) | null = null;

  /**
   * 仅在「非典型 PC」环境显示虚拟摇杆：粗指针（手指）或不可悬停的小屏。
   * 典型桌面（精细指针 + hover）一律隐藏，避免触屏笔记本在接鼠标时仍出现轮盘。
   */
  private useMobileTouchUi(): boolean {
    if (typeof window === "undefined") return false;
    const desktopLike =
      window.matchMedia("(pointer: fine)").matches &&
      window.matchMedia("(hover: hover)").matches;
    if (desktopLike) return false;

    const touchCapable =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!touchCapable) return false;

    if (window.matchMedia("(pointer: coarse)").matches) return true;
    return (
      window.matchMedia("(hover: none)").matches &&
      window.matchMedia("(max-width: 1024px)").matches
    );
  }

  private clearStickDragListeners() {
    this.stickDragCleanup?.();
    this.stickDragCleanup = null;
  }

  /** 浏览器坐标 → 与 app.screen 一致的像素坐标 */
  private clientToScreen(clientX: number, clientY: number): Point {
    const rect = this.app.canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * this.app.screen.width;
    const y = ((clientY - rect.top) / rect.height) * this.app.screen.height;
    return new Point(x, y);
  }

  constructor() {
    this.app = new Application();
    this.bgLayer = new Container();
    this.world = new Container();
    this.uiLayer = new Container();
    this.timeLeft = levelData.timeLimit;
  }

  public async init(container: HTMLElement) {
    this.container = container;

    await this.app.init({
      resizeTo: container,
      backgroundColor: 0x5c94fc,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    container.appendChild(this.app.canvas);
    this.app.stage.addChild(this.bgLayer);
    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.uiLayer);

    this.setupBackground();
    this.buildLevel();
    this.setupPlayer();
    this.setupControls();
    this.setupVirtualJoystick();
    this.emitHud(true);

    this.app.ticker.add(this.update.bind(this));
  }

  private setupBackground() {
    const backdrop = createSMBSkyBackdrop(
      levelData.width,
      levelData.height,
      levelData.groundY,
    );
    this.bgLayer.addChild(backdrop);
  }

  private buildLevel() {
    const gy = levelData.groundY;
    const th = levelData.groundThickness;
    this.solids = [];

    for (const seg of levelData.groundSegments) {
      const r: Rect = { x: seg.x, y: gy, w: seg.w, h: th };
      this.solids.push({ ...r, kind: "ground" });
      const g = createGroundTile(seg.w, th);
      g.position.set(seg.x, gy);
      this.world.addChild(g);
    }

    this.piranhas = [];
    let plantIdx = 0;
    for (const p of levelData.pipes) {
      const top = gy - p.h;
      const r: Rect = { x: p.x, y: top, w: p.w, h: p.h };
      this.solids.push({ ...r, kind: "pipe" });
      const pipe = createPipe(p.w, p.h);
      pipe.position.set(p.x, top);
      this.world.addChild(pipe);

      const raw = p as { plant?: boolean };
      if (raw.plant) {
        const pv = createPiranhaPlant();
        const baseX = p.x + p.w / 2 - PIRANHA_W / 2;
        pv.root.position.set(baseX, top - PIRANHA_H);
        drawPiranhaHead(pv.head, 0);
        this.world.addChild(pv.root);
        this.piranhas.push({
          gfx: pv.root,
          head: pv.head,
          baseX,
          pipeTop: top,
          emergeMax: Math.min(56, p.h * 0.55),
          phase: plantIdx++ * 1.9,
        });
      }
    }

    this.blocks = [];
    this.mushrooms = [];
    let blockId = 0;
    for (const b of levelData.blocks) {
      const raw = b as { loot?: string };
      const loot: "coin" | "mushroom" =
        raw.loot === "mushroom" ? "mushroom" : "coin";
      const gfx = new Container();
      const inner = b.kind === "question" ? createQuestionBlock() : createBrickBlock();
      gfx.addChild(inner);
      gfx.position.set(b.x, b.y);
      this.world.addChild(gfx);
      this.blocks.push({
        x: b.x,
        y: b.y,
        kind: b.kind as "brick" | "question",
        loot: b.kind === "question" ? loot : "coin",
        used: false,
        bump: 0,
        gfx,
      });
      this.solids.push({
        x: b.x,
        y: b.y,
        w: TILE,
        h: TILE,
        kind: "block",
        blockId: blockId++,
      });
    }

    this.goombas = [];
    for (const g of levelData.goombas) {
      const gfx = new Container();
      gfx.addChild(createGoombaGraphics());
      gfx.position.set(g.x, g.y);
      this.world.addChild(gfx);
      this.goombas.push({
        alive: true,
        x: g.x,
        y: g.y,
        vx: -physics.goombaSpeed,
        vy: 0,
        gfx,
      });
    }

    const { root } = createFlagAssembly(levelData.poleH, gy);
    this.flagRoot = root;
    root.position.set(levelData.flagX, 0);
    this.world.addChild(root);

    this.flagTouch = {
      x: levelData.flagX,
      y: gy - levelData.poleH,
      w: 14,
      h: levelData.poleH,
    };
  }

  private setupPlayer() {
    this.playerVis = createMarioVisual();
    this.player = this.playerVis.root;
    this.respawn(false);
    this.world.addChild(this.player);
  }

  private pw() {
    return this.isBig ? PLAYER_BIG_W : PLAYER_W;
  }

  private ph() {
    return this.isBig ? PLAYER_BIG_H : PLAYER_H;
  }

  private respawn(resetVel: boolean) {
    this.player.position.set(levelData.spawn.x, levelData.spawn.y);
    if (resetVel) {
      this.vx = 0;
      this.vy = 0;
    }
    this.isGrounded = false;
  }

  private setupControls() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  private setupVirtualJoystick() {
    if (!this.useMobileTouchUi()) return;

    const outerR = 56;
    const innerR = 22;
    const maxDrag = 34;
    const deadPx = 10;

    const jumpR = 50;
    const jumpLabelStyle = new TextStyle({
      fontFamily: "system-ui, sans-serif",
      fontSize: 22,
      fontWeight: "900",
      fill: 0xffffff,
      dropShadow: {
        alpha: 0.4,
        angle: Math.PI / 4,
        blur: 2,
        color: 0x000000,
        distance: 2,
      },
    });

    const resizeUI = () => {
      this.clearStickDragListeners();
      this.touchAxisX = 0;
      this.uiLayer.removeChildren();

      const w = this.app.screen.width;
      const h = this.app.screen.height;
      const pad = Math.max(14, Math.min(26, w * 0.035));
      const safeBottom =
        typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("bottom", "env(safe-area-inset-bottom)")
          ? 28
          : 18;
      const bottomY = h - pad - safeBottom - outerR * 2;

      const joystickRoot = new Container();
      joystickRoot.position.set(pad, bottomY);

      const base = new Graphics();
      base
        .circle(outerR, outerR, outerR)
        .fill({ color: 0x0f172a, alpha: 0.52 })
        .stroke({ width: 3, color: 0x475569 });

      const knob = new Graphics();
      knob
        .circle(0, 0, innerR)
        .fill({ color: 0xf8fafc, alpha: 0.94 })
        .stroke({ width: 2, color: 0x64748b });
      knob.position.set(outerR, outerR);

      joystickRoot.addChild(base);
      joystickRoot.addChild(knob);
      joystickRoot.eventMode = "static";
      joystickRoot.cursor = "pointer";
      joystickRoot.hitArea = new Circle(outerR, outerR, outerR + 14);

      const applyStick = (lx: number, ly: number) => {
        const cx = outerR;
        const cy = outerR;
        let dx = lx - cx;
        let dy = ly - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < deadPx) {
          dx = 0;
          dy = 0;
        } else if (dist > maxDrag) {
          dx = (dx / dist) * maxDrag;
          dy = (dy / dist) * maxDrag;
        }
        knob.position.set(cx + dx, cy + dy);
        this.touchAxisX =
          dist < deadPx ? 0 : Math.max(-1, Math.min(1, dx / maxDrag));
      };

      let stickPointerId: number | null = null;

      const endStick = (ev: PointerEvent) => {
        if (stickPointerId !== null && ev.pointerId !== stickPointerId) return;
        stickPointerId = null;
        knob.position.set(outerR, outerR);
        this.touchAxisX = 0;
        this.clearStickDragListeners();
        try {
          this.app.canvas.releasePointerCapture(ev.pointerId);
        } catch {
          /* not captured */
        }
      };

      const onWindowMove = (ev: PointerEvent) => {
        if (stickPointerId === null || ev.pointerId !== stickPointerId) return;
        const screenPt = this.clientToScreen(ev.clientX, ev.clientY);
        const local = joystickRoot.toLocal(screenPt, this.app.stage);
        applyStick(local.x, local.y);
      };

      const onWindowUp = (ev: PointerEvent) => {
        endStick(ev);
      };

      joystickRoot.on("pointerdown", (e) => {
        if (stickPointerId !== null) return;
        stickPointerId = e.pointerId;
        try {
          this.app.canvas.setPointerCapture(e.pointerId);
        } catch {
          /* */
        }
        const local = joystickRoot.toLocal(e.global, this.app.stage);
        applyStick(local.x, local.y);
        window.addEventListener("pointermove", onWindowMove);
        window.addEventListener("pointerup", onWindowUp);
        window.addEventListener("pointercancel", onWindowUp);
        this.stickDragCleanup = () => {
          window.removeEventListener("pointermove", onWindowMove);
          window.removeEventListener("pointerup", onWindowUp);
          window.removeEventListener("pointercancel", onWindowUp);
        };
      });

      this.uiLayer.addChild(joystickRoot);

      const jumpWrap = new Container();
      jumpWrap.position.set(w - pad - jumpR * 2, bottomY + outerR * 2 - jumpR * 2);

      const jumpFace = new Graphics();
      jumpFace
        .circle(jumpR, jumpR, jumpR)
        .fill({ color: 0x22c55e, alpha: 0.88 })
        .stroke({ width: 3, color: 0x14532d });
      const jumpHi = new Graphics();
      jumpHi
        .circle(jumpR, jumpR - 2, jumpR * 0.55)
        .fill({ color: 0xffffff, alpha: 0.15 });

      const jumpTxt = new Text({ text: "A", style: jumpLabelStyle });
      jumpTxt.anchor.set(0.5);
      jumpTxt.position.set(jumpR, jumpR);

      jumpWrap.addChild(jumpFace);
      jumpWrap.addChild(jumpHi);
      jumpWrap.addChild(jumpTxt);
      jumpWrap.eventMode = "static";
      jumpWrap.cursor = "pointer";
      jumpWrap.hitArea = new Circle(jumpR, jumpR, jumpR);

      const jumpDown = (e: { pointerId: number }) => {
        try {
          this.app.canvas.setPointerCapture(e.pointerId);
        } catch {
          /* */
        }
        this.touchInputs.jump = true;
      };
      const jumpUp = (e: { pointerId: number }) => {
        try {
          this.app.canvas.releasePointerCapture(e.pointerId);
        } catch {
          /* */
        }
        this.touchInputs.jump = false;
      };

      jumpWrap.on("pointerdown", (e) => jumpDown(e));
      jumpWrap.on("pointerup", (e) => jumpUp(e));
      jumpWrap.on("pointerupoutside", (e) => jumpUp(e));
      jumpWrap.on("pointercancel", (e) => jumpUp(e));

      this.uiLayer.addChild(jumpWrap);
    };

    resizeUI();
    this.resizeUiHandler = resizeUI;
    window.addEventListener("resize", resizeUI);
  }

  private rectsOverlap(ax: number, ay: number, aw: number, ah: number, b: Rect): boolean {
    return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
  }

  private resolvePlayerAxis(horizontal: boolean) {
    const pw = this.pw();
    const ph = this.ph();
    let px = this.player.x;
    let py = this.player.y;

    for (let iter = 0; iter < 6; iter++) {
      let moved = false;
      for (const s of this.solids) {
        if (!this.rectsOverlap(px, py, pw, ph, s)) continue;

        if (horizontal) {
          if (this.vx > 0) {
            px = s.x - pw;
          } else if (this.vx < 0) {
            px = s.x + s.w;
          }
          this.vx = 0;
          moved = true;
        } else {
          if (this.vy > 0) {
            py = s.y - ph;
            this.isGrounded = true;
          } else if (this.vy < 0) {
            py = s.y + s.h;
            if (s.kind === "block" && s.blockId !== undefined) {
              this.hitBlockFromBelow(s.blockId);
            }
          }
          this.vy = 0;
          moved = true;
        }
      }
      if (!moved) break;
    }

    this.player.x = px;
    this.player.y = py;
  }

  private hitBlockFromBelow(id: number) {
    const b = this.blocks[id];
    if (!b || b.bump > 0) return;

    b.bump = 1;
    if (b.kind === "question" && !b.used) {
      b.used = true;
      if (b.loot === "mushroom") {
        this.spawnMushroomFromBlock(b);
      } else {
        this.coins += 1;
        this.score += 200;
        if (this.coins >= 100) {
          this.coins -= 100;
          this.lives += 1;
        }
      }
      b.gfx.removeChildren();
      b.gfx.addChild(createUsedBlock());
    }
  }

  private spawnMushroomFromBlock(b: BlockData) {
    const m: MushroomData = {
      alive: true,
      x: b.x + (TILE - MUSHROOM_W) / 2,
      y: b.y - MUSHROOM_H - 2,
      vx: 1.25,
      vy: 0,
      gfx: new Container(),
    };
    m.gfx.addChild(createMushroomGraphics());
    m.gfx.position.set(m.x, m.y);
    this.world.addChild(m.gfx);
    this.mushrooms.push(m);
  }

  private updateBlockBumps(ticker: Ticker) {
    const dt = ticker.deltaMS / 16.67;
    for (const b of this.blocks) {
      if (b.bump <= 0) continue;
      b.bump -= 0.14 * dt;
      const amp = Math.max(0, b.bump);
      b.gfx.y = b.y - Math.sin(amp * Math.PI) * 10;
      if (b.bump <= 0) {
        b.bump = 0;
        b.gfx.y = b.y;
      }
    }
  }

  private moveGoomba(g: GoombaData) {
    if (!g.alive) return;

    g.vy += physics.gravity;
    g.x += g.vx;
    this.resolveMobHorizontal(g, GOOMBA_W, GOOMBA_H);

    g.y += g.vy;
    this.resolveMobVertical(g, GOOMBA_W, GOOMBA_H);

    if (g.y > levelData.height + 60) {
      g.alive = false;
      g.gfx.visible = false;
    }

    g.gfx.position.set(g.x, g.y);
  }

  private resolveMobHorizontal(g: GoombaData, w: number, h: number) {
    for (let iter = 0; iter < 5; iter++) {
      let hit = false;
      for (const s of this.solids) {
        if (!this.rectsOverlap(g.x, g.y, w, h, s)) continue;
        if (g.vx > 0) {
          g.x = s.x - w;
          g.vx = -Math.abs(g.vx);
          hit = true;
        } else if (g.vx < 0) {
          g.x = s.x + s.w;
          g.vx = Math.abs(g.vx);
        }
      }
      if (!hit) break;
    }
  }

  private resolveMobVertical(g: GoombaData, w: number, h: number) {
    for (let iter = 0; iter < 5; iter++) {
      let hit = false;
      for (const s of this.solids) {
        if (!this.rectsOverlap(g.x, g.y, w, h, s)) continue;
        if (g.vy > 0) {
          g.y = s.y - h;
          g.vy = 0;
          hit = true;
        } else if (g.vy < 0) {
          g.y = s.y + s.h;
          g.vy = 0;
          hit = true;
        }
      }
      if (!hit) break;
    }
  }

  private checkStompAndDamage() {
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.pw();
    const ph = this.ph();

    for (const g of this.goombas) {
      if (!g.alive) continue;
      if (!this.rectsOverlap(px, py, pw, ph, { x: g.x, y: g.y, w: GOOMBA_W, h: GOOMBA_H }))
        continue;

      const stomp =
        this.vy > 0.35 &&
        py + ph <= g.y + GOOMBA_H * 0.55;

      if (stomp) {
        g.alive = false;
        g.gfx.visible = false;
        this.score += 100;
        this.vy = physics.stompBounce;
        this.isGrounded = false;
      } else if (!this.won && !this.frozen && this.deathSequenceMs <= 0) {
        this.hitByEnemy();
        break;
      }
    }
  }

  private checkPiranhaHits() {
    if (this.won || this.frozen || this.deathSequenceMs > 0 || this.iframes > 0) return;
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.pw();
    const ph = this.ph();

    for (const pr of this.piranhas) {
      const up = (Math.sin(this.animTick * 0.042 + pr.phase) + 1) / 2;
      if (up < 0.3) continue;
      const plantY = pr.pipeTop - up * pr.emergeMax - PIRANHA_H;
      const hurt: Rect = {
        x: pr.baseX + 8,
        y: plantY + 18,
        w: PIRANHA_W - 16,
        h: PIRANHA_H - 22,
      };
      if (this.rectsOverlap(px, py, pw, ph, hurt)) {
        this.hitByEnemy();
        break;
      }
    }
  }

  private hitByEnemy() {
    if (this.iframes > 0) return;
    if (this.isBig) {
      this.isBig = false;
      this.player.y += PLAYER_BIG_H - PLAYER_H;
      this.iframes = 110;
      return;
    }
    this.triggerDeath();
  }

  private triggerDeath() {
    if (this.deathSequenceMs > 0 || this.won) return;
    this.vx = 0;
    this.vy = 0;
    this.startDeathSequence();
  }

  private startDeathSequence() {
    this.deathSequenceMs = 880;
    const cx = this.player.x + this.pw() / 2;
    const cy = this.player.y + this.ph() / 2;
    const colors = [0xe01010, 0x2060d0, 0xf8b890, 0xffd54f, 0xffffff];
    for (let i = 0; i < 16; i++) {
      const g = new Graphics();
      g.roundRect(-4, -4, 8, 8, 2).fill(colors[i % colors.length]!);
      g.position.set(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 16);
      this.world.addChild(g);
      this.deathParticles.push({
        g,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 1.5,
        life: 1,
      });
    }
    this.player.visible = false;
  }

  private updateDeathSequence(ticker: Ticker) {
    this.deathSequenceMs -= ticker.deltaMS;
    const dt = ticker.deltaMS / 16.67;
    for (const p of this.deathParticles) {
      p.life -= 0.011 * dt;
      p.g.x += p.vx * dt;
      p.g.y += p.vy * dt;
      p.vy += 0.34 * dt;
      p.g.alpha = Math.max(0, p.life);
      p.g.rotation += 0.12 * dt;
    }
    this.deathParticles = this.deathParticles.filter((p) => p.life > 0.02);

    if (this.deathSequenceMs <= 0) {
      this.clearDeathParticles();
      this.player.visible = true;
      this.applyLifeLossAndRespawn();
    }
  }

  private clearDeathParticles() {
    for (const p of this.deathParticles) {
      this.world.removeChild(p.g);
      p.g.destroy();
    }
    this.deathParticles = [];
  }

  private applyLifeLossAndRespawn() {
    this.lives -= 1;
    this.score = Math.max(0, this.score - 200);
    this.isBig = false;
    if (this.lives <= 0) {
      this.frozen = true;
      this.lives = 0;
      if (this.onGameOver) this.onGameOver();
      this.lives = 3;
      this.timeLeft = levelData.timeLimit;
      this.score = 0;
      this.coins = 0;
      this.frozen = false;
      this.won = false;
      this.resetLevelEntities();
      this.respawn(true);
      return;
    }
    this.timeLeft = levelData.timeLimit;
    this.respawn(true);
  }

  private moveMushroom(m: MushroomData) {
    if (!m.alive) return;
    m.vy += physics.gravity;
    m.x += m.vx;
    this.resolveMushroomHorizontal(m);
    m.y += m.vy;
    this.resolveMushroomVertical(m);
    if (m.y > levelData.height + 60) {
      m.alive = false;
      m.gfx.visible = false;
    }
    m.gfx.position.set(m.x, m.y);
  }

  private resolveMushroomHorizontal(m: MushroomData) {
    for (let iter = 0; iter < 5; iter++) {
      let hit = false;
      for (const s of this.solids) {
        if (!this.rectsOverlap(m.x, m.y, MUSHROOM_W, MUSHROOM_H, s)) continue;
        if (m.vx > 0) {
          m.x = s.x - MUSHROOM_W;
          m.vx = -Math.abs(m.vx);
          hit = true;
        } else if (m.vx < 0) {
          m.x = s.x + s.w;
          m.vx = Math.abs(m.vx);
        }
      }
      if (!hit) break;
    }
  }

  private resolveMushroomVertical(m: MushroomData) {
    for (let iter = 0; iter < 5; iter++) {
      let hit = false;
      for (const s of this.solids) {
        if (!this.rectsOverlap(m.x, m.y, MUSHROOM_W, MUSHROOM_H, s)) continue;
        if (m.vy > 0) {
          m.y = s.y - MUSHROOM_H;
          m.vy = 0;
          hit = true;
        } else if (m.vy < 0) {
          m.y = s.y + s.h;
          m.vy = 0;
          hit = true;
        }
      }
      if (!hit) break;
    }
  }

  private checkMushroomPickup() {
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.pw();
    const ph = this.ph();
    for (const m of this.mushrooms) {
      if (!m.alive) continue;
      if (
        !this.rectsOverlap(px, py, pw, ph, {
          x: m.x,
          y: m.y,
          w: MUSHROOM_W,
          h: MUSHROOM_H,
        })
      )
        continue;
      m.alive = false;
      m.gfx.visible = false;
      this.score += 1000;
      if (!this.isBig) {
        this.isBig = true;
        this.player.y -= PLAYER_BIG_H - PLAYER_H;
      }
    }
  }

  private updatePiranhaGraphics() {
    for (const pr of this.piranhas) {
      drawPiranhaHead(pr.head, this.animTick + pr.phase * 10);
      const up = (Math.sin(this.animTick * 0.042 + pr.phase) + 1) / 2;
      const plantY = pr.pipeTop - up * pr.emergeMax - PIRANHA_H;
      pr.gfx.position.set(pr.baseX, plantY);
    }
  }

  private resetLevelEntities() {
    for (const m of this.mushrooms) {
      this.world.removeChild(m.gfx);
      m.gfx.destroy({ children: true });
    }
    this.mushrooms = [];

    for (const b of this.blocks) {
      b.used = false;
      b.bump = 0;
      b.gfx.y = b.y;
      b.gfx.removeChildren();
      b.gfx.addChild(b.kind === "question" ? createQuestionBlock() : createBrickBlock());
    }
    let i = 0;
    for (const g of levelData.goombas) {
      const gd = this.goombas[i++];
      if (!gd) continue;
      gd.alive = true;
      gd.gfx.visible = true;
      gd.x = g.x;
      gd.y = g.y;
      gd.vx = -physics.goombaSpeed;
      gd.vy = 0;
      gd.gfx.position.set(g.x, g.y);
    }
  }

  private drawPlayerCharacter() {
    if (!this.player.visible) return;
    if (this.iframes > 0 && this.deathSequenceMs <= 0) {
      this.player.alpha = 0.28 + Math.abs(Math.sin(this.animTick * 0.88)) * 0.72;
    } else {
      this.player.alpha = 1;
    }
    if (this.isBig) {
      drawMarioBig(this.playerVis.body, this.facing, this.isGrounded, this.animTick);
    } else {
      drawMarioSmall(this.playerVis.body, this.facing, this.isGrounded, this.animTick);
    }
  }

  private update(ticker: Ticker) {
    this.animTick += ticker.deltaMS * 0.08;
    this.updatePiranhaGraphics();

    if (this.won) {
      this.updateBlockBumps(ticker);
      this.updateCamera();
      this.drawPlayerCharacter();
      return;
    }

    if (this.deathSequenceMs > 0) {
      this.updateDeathSequence(ticker);
      this.updateCamera();
      return;
    }

    if (this.frozen) {
      this.drawPlayerCharacter();
      return;
    }

    if (this.iframes > 0) this.iframes--;

    const stickDead = 0.14;
    const touchLeft = this.touchAxisX < -stickDead;
    const touchRight = this.touchAxisX > stickDead;
    const left = this.keys["ArrowLeft"] || this.keys["KeyA"] || touchLeft;
    const right = this.keys["ArrowRight"] || this.keys["KeyD"] || touchRight;
    const jumpHeld =
      this.keys["Space"] || this.keys["ArrowUp"] || this.keys["KeyW"] || this.touchInputs.jump;

    const jumpEdge = jumpHeld && !this.prevJump;
    this.prevJump = jumpHeld;

    if (jumpEdge && this.isGrounded) {
      this.jumpQueued = true;
    }

    const kbOnlyLeft = this.keys["ArrowLeft"] || this.keys["KeyA"];
    const kbOnlyRight = this.keys["ArrowRight"] || this.keys["KeyD"];
    const input = (right ? 1 : 0) - (left ? 1 : 0);
    const touchAnalog =
      !kbOnlyLeft &&
      !kbOnlyRight &&
      Math.abs(this.touchAxisX) > stickDead
        ? Math.min(1, Math.abs(this.touchAxisX))
        : 1;
    if (input !== 0) {
      this.facing = input > 0 ? 1 : -1;
      this.vx += input * physics.walkAccel * touchAnalog;
      if (Math.abs(this.vx) > physics.walkMax) {
        this.vx = Math.sign(this.vx) * physics.walkMax;
      }
      if (this.vx * input < 0) {
        this.vx += input * physics.walkAccel * 0.55 * touchAnalog;
      }
    } else {
      const slip = Math.min(Math.abs(this.vx), physics.friction);
      this.vx -= Math.sign(this.vx || 1) * slip;
      if (Math.abs(this.vx) < 0.04) this.vx = 0;
    }

    if (this.jumpQueued && this.isGrounded) {
      this.vy = physics.jumpVel;
      this.isGrounded = false;
      this.jumpQueued = false;
      this.jumpCutDone = false;
    }

    this.vy += physics.gravity;
    if (!jumpHeld && !this.jumpCutDone && this.vy < -3) {
      this.vy *= physics.jumpCut;
      this.jumpCutDone = true;
    }
    const maxFall = 14;
    if (this.vy > maxFall) this.vy = maxFall;

    this.player.x += this.vx;
    this.resolvePlayerAxis(true);

    this.player.y += this.vy;
    this.isGrounded = false;
    this.resolvePlayerAxis(false);

    if (this.isGrounded) {
      this.jumpCutDone = false;
    }

    for (const g of this.goombas) {
      this.moveGoomba(g);
    }

    for (const m of this.mushrooms) {
      this.moveMushroom(m);
    }

    this.checkStompAndDamage();
    this.checkPiranhaHits();
    this.checkMushroomPickup();

    this.updateBlockBumps(ticker);

    if (
      this.rectsOverlap(
        this.player.x,
        this.player.y,
        this.pw(),
        this.ph(),
        this.flagTouch,
      )
    ) {
      if (!this.won) {
        this.won = true;
        this.score += 5000;
        const bonus = Math.max(0, this.timeLeft) * 50;
        this.score += bonus;
        this.timeLeft = 0;
        if (this.onLevelComplete) this.onLevelComplete();
      }
    }

    if (this.player.y > levelData.height + 120) {
      this.triggerDeath();
    }

    this.timeAccMs += ticker.deltaMS;
    if (this.timeAccMs >= 1000) {
      this.timeAccMs -= 1000;
      if (this.timeLeft > 0) {
        this.timeLeft -= 1;
        if (this.timeLeft <= 0) {
          this.triggerDeath();
        }
      }
    }

    this.updateCamera();
    this.drawPlayerCharacter();
    this.emitHud(false);
  }

  private emitHud(force: boolean) {
    if (!this.onHudUpdate) return;
    const now = performance.now();
    if (!force && now - this.lastHudEmit < 120) return;
    this.lastHudEmit = now;
    this.onHudUpdate({
      score: this.score,
      coins: this.coins,
      lives: this.lives,
      world: "WORLD 1-1",
      time: this.timeLeft,
    });
  }

  private updateCamera() {
    const margin = 96;
    const targetCamX = -this.player.x + this.app.screen.width / 2 - margin * 0.35;
    const minX = -(levelData.width - this.app.screen.width);
    const maxX = 0;
    this.world.x += (targetCamX - this.world.x) * 0.14;
    this.world.x = Math.min(maxX, Math.max(minX, this.world.x));

    const targetCamY = -this.player.y + this.app.screen.height * 0.52;
    const minY = -(levelData.height - this.app.screen.height) - 40;
    const maxY = 80;
    this.world.y += (targetCamY - this.world.y) * 0.12;
    this.world.y = Math.min(maxY, Math.max(minY, this.world.y));

    this.bgLayer.x = this.world.x * 0.12;
    this.bgLayer.y = this.world.y * 0.08;
  }

  public destroy() {
    this.clearStickDragListeners();
    this.clearDeathParticles();
    if (this.resizeUiHandler) {
      window.removeEventListener("resize", this.resizeUiHandler);
    }
    this.app.destroy(true, { children: true });
  }
}
