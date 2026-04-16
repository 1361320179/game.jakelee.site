/**
 * Shadow Dash L1 — SMB1 World 1-1 style homage (original fan pixel art + vectors, not Nintendo ROM assets).
 * Walk / jump / stomp / ? blocks / flag; no dash. 关卡与系统逻辑见 `mario/` 下按功能分类的模块。
 */
import { Application, Container, Ticker } from "pixi.js";
import levelData from "../../../content/games/super-mario/levels/level-1.json";
import {
  PLAYER_BIG_H,
  PLAYER_BIG_W,
  PLAYER_H,
  PLAYER_W,
  TILE,
  createMarioPlayerVisual,
  createSmb1TextureSet,
  syncMarioPlayer,
  type Smb1TextureSet,
} from "./marioAssets";
import {
  hitBlockFromBelow,
  type MarioBlockWorld,
} from "./mario/blocks/marioGameBlockActions";
import {
  tickBlockBumpOffsets,
  tickQuestionBlocksBlink,
} from "./mario/blocks/marioGameBlocksVisual";
import {
  applyGoombaStompAndDamage,
  applyKoopaStompAndDamage,
  checkPiranhaPlantHits,
  tryShrinkMarioFromHit,
  type StompScratch,
} from "./mario/combat/marioGameCombat";
import {
  tickFloatingCoinsAnim,
  tryCollectFloatingCoins,
} from "./mario/entities/marioGameCollectibles";
import { rectsOverlap } from "./mario/collision/marioGameCollision";
import { tickMarioFollowCamera } from "./mario/presentation/marioGameCamera";
import {
  clearDeathParticlesGfx,
  pruneDeadParticles,
  spawnMarioDeathParticles,
  tickMarioDeathParticles,
} from "./mario/fx/marioGameDeath";
import {
  moveGoombaEntity,
  moveKoopaEntity,
} from "./mario/entities/marioGameEnemies";
import {
  computeFlagPoleGrabPoints,
  tickFlagSlidePlayerPosition,
} from "./mario/progression/marioGameFlagPole";
import { tryEmitMarioHud } from "./mario/presentation/marioGameHud";
import {
  addMarioSkyBackdrop,
  buildMarioLevel,
  rebuildBlockSolidsInPlace,
} from "./mario/level/marioGameLevel";
import { resetDynamicLevelEntities } from "./mario/level/marioGameLevelReset";
import { MarioMobileTouchUi } from "./mario/presentation/marioGameMobileUi";
import { tickPiranhaPlantGraphics } from "./mario/entities/marioGamePiranha";
import {
  clearBrickParticles,
  updateBrickParticles,
} from "./mario/fx/marioGameParticles";
import {
  moveMushroomEntity,
  tryPickupMushrooms,
} from "./mario/entities/marioGamePowerups";
import {
  resolveMarioPlayerHorizontalCollisions,
  resolveMarioPlayerVerticalCollisions,
  type PlayerColliderState,
} from "./mario/player/marioGamePlayerResolve";
import type {
  BlockData,
  BrickParticle,
  DeathParticle,
  FloatingCoinData,
  GoombaData,
  KoopaData,
  MarioHudState,
  MushroomData,
  PiranhaData,
  Rect,
  SolidRef,
} from "./mario/core/marioGameTypes";
import {
  MARIO_PHYSICS_STEP_MS,
  marioPhysics,
} from "./mario/core/marioGameTypes";

export class ShadowDashGame {
  public app: Application;
  private container!: HTMLElement;
  private bgLayer: Container;
  private world: Container;
  private uiLayer: Container;

  private player!: Container;
  private playerVis!: ReturnType<typeof createMarioPlayerVisual>;
  private smbTextures!: Smb1TextureSet;
  private facing: 1 | -1 = 1;
  private animTick = 0;

  private solids: SolidRef[] = [];
  private blocks: BlockData[] = [];
  private goombas: GoombaData[] = [];
  private koopas: KoopaData[] = [];
  private mushrooms: MushroomData[] = [];
  private floatingCoins: FloatingCoinData[] = [];
  private piranhas: PiranhaData[] = [];
  private flagTouch!: Rect;
  private flagRoot!: Container;

  private isBig = false;
  private iframes = 0;
  private deathSequenceMs = 0;
  private deathParticles: DeathParticle[] = [];
  private brickParticles: BrickParticle[] = [];

  private vx = 0;
  private vy = 0;
  private isGrounded = false;
  private jumpQueued = false;
  private jumpCutDone = false;

  private keys: Record<string, boolean> = {};
  private prevJump = false;

  private score = 0;
  private coins = 0;
  private lives = 3;
  private timeLeft: number;
  private timeAccMs = 0;

  private won = false;
  /** 抓住旗杆后沿杆滑下至地面，再结算通关 */
  private flagSliding = false;
  private frozen = false;

  private lastHudEmit = 0;
  /** 与 NES 60Hz 对齐的固定物理累加器（避免高刷屏下位移/碰撞放大） */
  private physicsAccumMs = 0;
  public onHudUpdate?: (s: MarioHudState) => void;
  public onLevelComplete?: () => void;
  public onGameOver?: () => void;

  private mobileTouch!: MarioMobileTouchUi;

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
    this.smbTextures = createSmb1TextureSet();
    this.app.stage.sortableChildren = true;
    this.bgLayer.zIndex = 0;
    this.world.zIndex = 1;
    this.uiLayer.zIndex = 10;
    this.app.stage.addChild(this.bgLayer);
    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.uiLayer);

    this.setupBackground();
    this.buildLevel();
    this.setupPlayer();
    this.setupControls();

    this.mobileTouch = new MarioMobileTouchUi(this.app, this.uiLayer);
    this.mobileTouch.init(this.container);
    requestAnimationFrame(() => {
      this.mobileTouch.scheduleLayout();
      requestAnimationFrame(() => this.mobileTouch.scheduleLayout());
    });
    window.setTimeout(() => this.mobileTouch.scheduleLayout(), 200);
    window.setTimeout(() => this.mobileTouch.scheduleLayout(), 500);

    this.emitHud(true);

    this.app.ticker.add(this.update.bind(this));
  }

  private setupBackground() {
    addMarioSkyBackdrop(this.bgLayer, this.smbTextures);
  }

  private buildLevel() {
    const built = buildMarioLevel(this.world, this.smbTextures);
    this.solids = built.solids;
    this.blocks = built.blocks;
    this.goombas = built.goombas;
    this.koopas = built.koopas;
    this.piranhas = built.piranhas;
    this.flagTouch = built.flagTouch;
    this.flagRoot = built.flagRoot;
    this.floatingCoins = built.floatingCoins;
    this.mushrooms = [];
  }

  private setupPlayer() {
    this.playerVis = createMarioPlayerVisual(this.smbTextures);
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

  private getBlockWorld(): MarioBlockWorld {
    const self = this;
    return {
      world: self.world,
      brickParticles: self.brickParticles,
      smbTextures: self.smbTextures,
      blocks: self.blocks,
      mushrooms: self.mushrooms,
      rebuildBlockSolids: () => self.rebuildBlockSolids(),
      getIsBig: () => self.isBig,
      economy: {
        get coins() {
          return self.coins;
        },
        set coins(v: number) {
          self.coins = v;
        },
        get score() {
          return self.score;
        },
        set score(v: number) {
          self.score = v;
        },
        get lives() {
          return self.lives;
        },
        set lives(v: number) {
          self.lives = v;
        },
      },
    };
  }

  private resolvePlayerHorizontalCollisions() {
    const p: PlayerColliderState = {
      x: this.player.x,
      y: this.player.y,
      vx: this.vx,
      vy: this.vy,
      isGrounded: this.isGrounded,
    };
    resolveMarioPlayerHorizontalCollisions(p, {
      pw: this.pw(),
      ph: this.ph(),
      solids: this.solids,
      blocks: this.blocks,
      tile: TILE,
      onHeadHitSolidBlock: (id) => hitBlockFromBelow(id, this.getBlockWorld()),
      rebuildBlockSolids: () => this.rebuildBlockSolids(),
      onHiddenBlockHeadBump: (id) => {
        hitBlockFromBelow(id, this.getBlockWorld());
      },
    });
    this.player.x = p.x;
    this.vx = p.vx;
  }

  private resolvePlayerVerticalCollisions() {
    const p: PlayerColliderState = {
      x: this.player.x,
      y: this.player.y,
      vx: this.vx,
      vy: this.vy,
      isGrounded: this.isGrounded,
    };
    resolveMarioPlayerVerticalCollisions(p, {
      pw: this.pw(),
      ph: this.ph(),
      solids: this.solids,
      blocks: this.blocks,
      tile: TILE,
      onHeadHitSolidBlock: (id) => hitBlockFromBelow(id, this.getBlockWorld()),
      rebuildBlockSolids: () => this.rebuildBlockSolids(),
      onHiddenBlockHeadBump: (id) => {
        hitBlockFromBelow(id, this.getBlockWorld());
      },
    });
    this.player.y = p.y;
    this.vy = p.vy;
    this.isGrounded = p.isGrounded;
  }

  private simulatePhysicsSubstep(opts: {
    left: boolean;
    right: boolean;
    jumpHeld: boolean;
    queueJumpFromEdge: boolean;
    touchAnalog: number;
  }): void {
    const { left, right, jumpHeld, queueJumpFromEdge, touchAnalog } = opts;

    if (queueJumpFromEdge && this.isGrounded) {
      this.jumpQueued = true;
    }

    const input = (right ? 1 : 0) - (left ? 1 : 0);
    if (input !== 0) {
      this.facing = input > 0 ? 1 : -1;
      if (this.vx * input < 0) {
        this.vx +=
          input *
          marioPhysics.walkAccel *
          marioPhysics.reverseAccelMult *
          touchAnalog;
      } else {
        this.vx += input * marioPhysics.walkAccel * touchAnalog;
      }
      if (Math.abs(this.vx) > marioPhysics.walkMax) {
        this.vx = Math.sign(this.vx) * marioPhysics.walkMax;
      }
    } else {
      const slip = Math.min(Math.abs(this.vx), marioPhysics.friction);
      this.vx -= Math.sign(this.vx || 1) * slip;
      if (Math.abs(this.vx) < 0.04) this.vx = 0;
    }

    if (this.jumpQueued && this.isGrounded) {
      this.vy = marioPhysics.jumpVel;
      this.isGrounded = false;
      this.jumpQueued = false;
      this.jumpCutDone = false;
    }

    if (this.vy < marioPhysics.jumpGravityBlendVy && jumpHeld) {
      this.vy += marioPhysics.gravityRiseHeld;
    } else if (this.vy < 0) {
      this.vy += marioPhysics.gravityRise;
    } else {
      this.vy += marioPhysics.gravityFall;
    }

    if (!jumpHeld && !this.jumpCutDone && this.vy < -2.85) {
      this.vy *= marioPhysics.jumpCut;
      this.jumpCutDone = true;
    }
    if (this.vy > marioPhysics.maxFallVel) {
      this.vy = marioPhysics.maxFallVel;
    }

    this.player.x += this.vx;
    this.resolvePlayerHorizontalCollisions();
    this.player.y += this.vy;
    this.isGrounded = false;
    this.resolvePlayerVerticalCollisions();

    if (this.isGrounded) {
      this.jumpCutDone = false;
    }

    for (const g of this.goombas) {
      this.moveGoomba(g);
    }

    for (const k of this.koopas) {
      this.moveKoopa(k);
    }

    for (const m of this.mushrooms) {
      moveMushroomEntity(m, this.solids, levelData.height + 60);
    }

    this.processEnemyCollisions();
    checkPiranhaPlantHits(
      this.piranhas,
      this.animTick,
      this.player.x,
      this.player.y,
      this.pw(),
      this.ph(),
      {
        won: this.won,
        frozen: this.frozen,
        deathSequenceMs: this.deathSequenceMs,
        iframes: this.iframes,
        flagSliding: this.flagSliding,
      },
      () => this.hitByEnemy(),
    );
    if (!this.flagSliding) {
      const pick = tryPickupMushrooms(
        this.mushrooms,
        this.player.x,
        this.player.y,
        this.pw(),
        this.ph(),
        this.isBig,
        this.player.y,
      );
      this.score += pick.scoreAdd;
      this.isBig = pick.isBig;
      this.player.y = pick.playerY;
    }
  }

  private rebuildBlockSolids() {
    rebuildBlockSolidsInPlace(this.solids, this.blocks, TILE);
  }

  private moveGoomba(g: GoombaData) {
    moveGoombaEntity(g, this.solids, levelData.height + 60);
  }

  private moveKoopa(k: KoopaData) {
    this.score += moveKoopaEntity(
      k,
      this.solids,
      this.goombas,
      this.koopas,
      this.smbTextures,
      this.animTick,
      levelData.height + 60,
    );
  }

  private processEnemyCollisions() {
    const stompScratch: StompScratch = {
      vy: this.vy,
      isGrounded: this.isGrounded,
      score: this.score,
    };
    const gate = {
      won: this.won,
      frozen: this.frozen,
      deathSequenceMs: this.deathSequenceMs,
      flagSliding: this.flagSliding,
    };
    applyGoombaStompAndDamage(
      this.goombas,
      this.player.x,
      this.player.y,
      this.pw(),
      this.ph(),
      stompScratch,
      gate,
      () => this.hitByEnemy(),
    );
    applyKoopaStompAndDamage(
      this.koopas,
      this.smbTextures,
      this.player.x,
      this.player.y,
      this.pw(),
      this.ph(),
      stompScratch,
      gate,
      () => this.hitByEnemy(),
    );
    this.vy = stompScratch.vy;
    this.isGrounded = stompScratch.isGrounded;
    this.score = stompScratch.score;
  }

  private hitByEnemy() {
    const r = tryShrinkMarioFromHit(this.iframes, this.isBig, this.player.y);
    if (r.needDeath) this.triggerDeath();
    else {
      this.iframes = r.iframes;
      this.isBig = r.isBig;
      this.player.y = r.playerY;
    }
  }

  private triggerDeath() {
    if (this.deathSequenceMs > 0 || this.won) return;
    this.vx = 0;
    this.vy = 0;
    this.startDeathSequence();
  }

  private startDeathSequence() {
    clearBrickParticles(this.world, this.brickParticles);
    this.deathSequenceMs = 880;
    const cx = this.player.x + this.pw() / 2;
    const cy = this.player.y + this.ph() / 2;
    spawnMarioDeathParticles(this.world, this.deathParticles, cx, cy);
    this.player.visible = false;
  }

  private updateDeathSequence(ticker: Ticker) {
    this.deathSequenceMs -= ticker.deltaMS;
    tickMarioDeathParticles(this.deathParticles, ticker);
    this.deathParticles = pruneDeadParticles(this.deathParticles);
    if (this.deathSequenceMs <= 0) {
      clearDeathParticlesGfx(this.world, this.deathParticles);
      this.player.visible = true;
      this.applyLifeLossAndRespawn();
    }
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
      this.flagSliding = false;
      this.resetLevelEntities();
      this.respawn(true);
      return;
    }
    this.timeLeft = levelData.timeLimit;
    this.flagSliding = false;
    this.resetLevelEntities();
    this.respawn(true);
  }

  private beginFlagSlide() {
    if (this.flagSliding || this.won) return;
    const poleTop = levelData.groundY - levelData.poleH;
    this.flagSliding = true;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.score += computeFlagPoleGrabPoints(
      this.player.y,
      this.ph(),
      poleTop,
      levelData.poleH,
    );
    this.player.x = levelData.flagX + 2;
  }

  private updateFlagSlide() {
    const next = tickFlagSlidePlayerPosition({
      playerX: this.player.x,
      playerY: this.player.y,
      ph: this.ph(),
      flagX: levelData.flagX,
      groundY: levelData.groundY,
    });
    this.player.x = next.x;
    this.player.y = next.y;
    if (next.landed) this.finishFlagSequence();
  }

  private finishFlagSequence() {
    this.flagSliding = false;
    this.won = true;
    this.score += 5000;
    const bonus = Math.max(0, this.timeLeft) * 50;
    this.score += bonus;
    this.timeLeft = 0;
    this.vx = 0;
    this.vy = 0;
    if (this.onLevelComplete) this.onLevelComplete();
  }

  private resetLevelEntities() {
    resetDynamicLevelEntities({
      world: this.world,
      brickParticles: this.brickParticles,
      mushrooms: this.mushrooms,
      blocks: this.blocks,
      floatingCoins: this.floatingCoins,
      goombas: this.goombas,
      koopas: this.koopas,
      smbTextures: this.smbTextures,
      level: {
        goombas: levelData.goombas,
        koopas: (levelData as { koopas?: { x: number; y: number }[] }).koopas,
      },
      rebuildBlockSolids: () => this.rebuildBlockSolids(),
    });
  }

  private drawPlayerCharacter() {
    if (!this.player.visible) return;
    if (this.iframes > 0 && this.deathSequenceMs <= 0) {
      this.player.alpha =
        0.28 + Math.abs(Math.sin(this.animTick * 0.88)) * 0.72;
    } else {
      this.player.alpha = 1;
    }
    syncMarioPlayer(this.playerVis, this.smbTextures, {
      big: this.isBig,
      facing: this.facing,
      grounded: this.isGrounded,
      vx: this.vx,
      tick: this.animTick,
    });
  }

  private update(ticker: Ticker) {
    this.animTick += ticker.deltaMS * 0.08;
    updateBrickParticles(this.world, this.brickParticles, ticker);
    tickQuestionBlocksBlink(this.blocks, this.animTick, this.smbTextures);
    tickPiranhaPlantGraphics(this.piranhas, this.smbTextures, this.animTick);

    if (this.won) {
      tickBlockBumpOffsets(this.blocks, ticker);
      this.tickCamera();
      this.drawPlayerCharacter();
      return;
    }

    if (this.flagSliding) {
      this.updateFlagSlide();
      this.tickCamera();
      this.drawPlayerCharacter();
      this.emitHud(false);
      return;
    }

    if (this.deathSequenceMs > 0) {
      this.updateDeathSequence(ticker);
      this.tickCamera();
      return;
    }

    if (this.frozen) {
      this.drawPlayerCharacter();
      return;
    }

    if (this.iframes > 0) this.iframes--;

    const t = this.mobileTouch.touch;
    const stickDead = 0.14;
    const touchLeft = t.axisX < -stickDead;
    const touchRight = t.axisX > stickDead;
    const left = this.keys["ArrowLeft"] || this.keys["KeyA"] || touchLeft;
    const right = this.keys["ArrowRight"] || this.keys["KeyD"] || touchRight;
    const jumpHeld =
      this.keys["Space"] || this.keys["ArrowUp"] || this.keys["KeyW"] || t.jump;

    const jumpEdge = jumpHeld && !this.prevJump;

    const kbOnlyLeft = this.keys["ArrowLeft"] || this.keys["KeyA"];
    const kbOnlyRight = this.keys["ArrowRight"] || this.keys["KeyD"];
    const touchAnalog =
      !kbOnlyLeft && !kbOnlyRight && Math.abs(t.axisX) > stickDead
        ? Math.min(1, Math.abs(t.axisX))
        : 1;

    this.physicsAccumMs += ticker.deltaMS;
    const maxPhysicsSteps = 6;
    let physicsSteps = 0;
    while (
      this.physicsAccumMs >= MARIO_PHYSICS_STEP_MS &&
      physicsSteps < maxPhysicsSteps
    ) {
      this.physicsAccumMs -= MARIO_PHYSICS_STEP_MS;
      physicsSteps++;
      this.simulatePhysicsSubstep({
        left,
        right,
        jumpHeld,
        queueJumpFromEdge: physicsSteps === 1 && jumpEdge,
        touchAnalog,
      });
    }

    this.prevJump = jumpHeld;

    tickFloatingCoinsAnim(this.floatingCoins, this.animTick);
    const coinHud = { coins: this.coins, score: this.score, lives: this.lives };
    tryCollectFloatingCoins(
      this.floatingCoins,
      this.player.x,
      this.player.y,
      this.pw(),
      this.ph(),
      this.world,
      this.brickParticles,
      coinHud,
    );
    this.coins = coinHud.coins;
    this.score = coinHud.score;
    this.lives = coinHud.lives;

    tickBlockBumpOffsets(this.blocks, ticker);

    if (
      rectsOverlap(
        this.player.x,
        this.player.y,
        this.pw(),
        this.ph(),
        this.flagTouch,
      )
    ) {
      this.beginFlagSlide();
    }

    if (!this.flagSliding && this.player.y > levelData.height + 120) {
      this.triggerDeath();
    }

    this.timeAccMs += ticker.deltaMS;
    if (this.timeAccMs >= 1000) {
      this.timeAccMs -= 1000;
      if (this.timeLeft > 0 && !this.flagSliding) {
        this.timeLeft -= 1;
        if (this.timeLeft <= 0) {
          this.triggerDeath();
        }
      }
    }

    this.tickCamera();
    this.drawPlayerCharacter();
    this.emitHud(false);
  }

  private emitHud(force: boolean) {
    this.lastHudEmit = tryEmitMarioHud(
      this.onHudUpdate,
      this.lastHudEmit,
      force,
      {
        score: this.score,
        coins: this.coins,
        lives: this.lives,
        worldLabel: "WORLD 1-1",
        time: this.timeLeft,
      },
    );
  }

  private tickCamera() {
    tickMarioFollowCamera({
      world: this.world,
      bgLayer: this.bgLayer,
      playerX: this.player.x,
      playerY: this.player.y,
      screenW: this.app.screen.width,
      screenH: this.app.screen.height,
      levelWidth: levelData.width,
      levelHeight: levelData.height,
    });
  }

  public destroy() {
    this.mobileTouch.destroy();
    clearBrickParticles(this.world, this.brickParticles);
    clearDeathParticlesGfx(this.world, this.deathParticles);
    this.app.destroy(true, { children: true });
  }
}
