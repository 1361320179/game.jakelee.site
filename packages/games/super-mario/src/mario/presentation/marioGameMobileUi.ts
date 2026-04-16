/**
 * 移动端虚拟摇杆与跳跃键（含 CSS 旋转画布下的坐标映射）。
 */
import {
  Application,
  Container,
  Graphics,
  Point,
  Text,
  TextStyle,
} from "pixi.js";

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

function useMobileTouchUi(): boolean {
  if (typeof window === "undefined") return false;
  if (navigator.maxTouchPoints > 0) return true;
  if ("ontouchstart" in window) return true;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  /** 典型键鼠桌面；横屏平板若误报 fine+hover，上面 maxTouchPoints 已放行 */
  if (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(hover: hover)").matches
  ) {
    return false;
  }
  return true;
}

type StickRefs = {
  joystickRoot: Container;
  knob: Graphics;
  outerR: number;
  maxDrag: number;
  deadPx: number;
};

type TouchZones = {
  stickCx: number;
  stickCy: number;
  stickR: number;
  jumpCx: number;
  jumpCy: number;
  jumpHitHalfW: number;
  jumpHitHalfH: number;
};

export class MarioMobileTouchUi {
  readonly touch = { jump: false, axisX: 0 };

  private readonly app: Application;
  private readonly uiLayer: Container;

  private stickDragCleanup: (() => void) | null = null;
  private mobileStickPointerId: number | null = null;
  private mobileStickRefs: StickRefs | null = null;
  private mobileZones: TouchZones | null = null;
  private resizeUiHandler: (() => void) | null = null;
  private containerResizeObs: ResizeObserver | null = null;
  private canvasPointerDownCapture: ((ev: PointerEvent) => void) | null = null;
  private viewportSyncCleanup: (() => void) | null = null;
  private parentResizeObs: ResizeObserver | null = null;
  private resizeDebounceTimer: ReturnType<typeof window.setTimeout> | null = null;
  private hostEl: HTMLElement | null = null;

  private readonly onWindowResizeQueued = (): void => {
    this.queueTouchUiResize();
  };

  private readonly onPageShowForLayout = (): void => {
    this.bumpTouchUiResize();
  };

  constructor(app: Application, uiLayer: Container) {
    this.app = app;
    this.uiLayer = uiLayer;
  }

  init(container: HTMLElement): void {
    this.hostEl = container;
    this.setupVirtualJoystick();
    this.containerResizeObs = new ResizeObserver(() => {
      this.queueTouchUiResize();
    });
    this.containerResizeObs.observe(container);
    const parent = container.parentElement;
    if (parent) {
      this.parentResizeObs = new ResizeObserver(() => {
        this.queueTouchUiResize();
      });
      this.parentResizeObs.observe(parent);
    }
  }

  /** 宿主布局就绪后再算一次（横屏 / 手动旋转 / 微信全屏后常晚于 Pixi） */
  scheduleLayout(): void {
    this.bumpTouchUiResize();
  }

  private queueTouchUiResize(): void {
    if (this.resizeDebounceTimer != null) {
      clearTimeout(this.resizeDebounceTimer);
    }
    this.resizeDebounceTimer = window.setTimeout(() => {
      this.resizeDebounceTimer = null;
      this.resizeUiHandler?.();
    }, 130);
  }

  /** 立即一帧 + 防抖再算，避免微信里连发 0 尺寸 resize 把控件清空后不再建 */
  private bumpTouchUiResize(): void {
    this.resizeUiHandler?.();
    this.queueTouchUiResize();
  }

  private readLayoutWidthHeight(): { w: number; h: number } {
    let w = this.app.screen.width;
    let h = this.app.screen.height;
    const rw = this.app.renderer.width;
    const rh = this.app.renderer.height;
    if (w < 2 || h < 2) {
      w = rw;
      h = rh;
    }
    const canvas = this.app.canvas;
    if ((w < 2 || h < 2) && canvas) {
      const br = canvas.getBoundingClientRect();
      if (br.width >= 2 && br.height >= 2) {
        w = br.width;
        h = br.height;
      }
    }
    const el = this.hostEl;
    if ((w < 2 || h < 2) && el) {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw >= 2 && ch >= 2) {
        w = cw;
        h = ch;
      }
    }
    return { w, h };
  }

  destroy(): void {
    this.clearStickDragListeners();
    if (this.resizeDebounceTimer != null) {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = null;
    }
    this.containerResizeObs?.disconnect();
    this.containerResizeObs = null;
    this.parentResizeObs?.disconnect();
    this.parentResizeObs = null;
    this.viewportSyncCleanup?.();
    this.viewportSyncCleanup = null;
    window.removeEventListener("resize", this.onWindowResizeQueued);
    window.removeEventListener("pageshow", this.onPageShowForLayout);
    if (this.resizeUiHandler) {
      this.resizeUiHandler = null;
    }
    if (this.canvasPointerDownCapture && this.app.canvas) {
      this.app.canvas.removeEventListener("pointerdown", this.canvasPointerDownCapture, {
        capture: true,
      });
      this.canvasPointerDownCapture = null;
    }
    this.mobileStickRefs = null;
    this.mobileZones = null;
  }

  private clearStickDragListeners() {
    this.stickDragCleanup?.();
    this.stickDragCleanup = null;
    this.mobileStickPointerId = null;
    const r = this.mobileStickRefs;
    if (r) {
      r.knob.position.set(r.outerR, r.outerR);
    }
    this.touch.axisX = 0;
  }

  private clientToScreen(clientX: number, clientY: number): Point {
    const rect = this.app.canvas.getBoundingClientRect();
    const W = this.app.screen.width;
    const H = this.app.screen.height;
    if (rect.width < 2 || rect.height < 2) {
      return new Point(0, 0);
    }

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const sx = clientX - cx;
    const sy = clientY - cy;

    const looksCssRotated90 = W > H && rect.width < rect.height;

    if (looksCssRotated90) {
      const lx = sy * (W / rect.height);
      const ly = -sx * (H / rect.width);
      return new Point(lx + W / 2, ly + H / 2);
    }

    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;
    return new Point(x, y);
  }

  private applyMobileStickLocal(lx: number, ly: number) {
    const r = this.mobileStickRefs;
    if (!r) return;
    const { outerR, maxDrag, deadPx } = r;
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
    r.knob.position.set(cx + dx, cy + dy);
    this.touch.axisX =
      dist < deadPx ? 0 : Math.max(-1, Math.min(1, dx / maxDrag));
  }

  private onCanvasPointerDownCapture = (ev: PointerEvent) => {
    if (!this.mobileZones || !this.mobileStickRefs) return;

    const p = this.clientToScreen(ev.clientX, ev.clientY);
    const z = this.mobileZones;

    const inJumpBounds =
      Math.abs(p.x - z.jumpCx) <= z.jumpHitHalfW &&
      Math.abs(p.y - z.jumpCy) <= z.jumpHitHalfH;
    if (inJumpBounds) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      try {
        this.app.canvas.setPointerCapture(ev.pointerId);
      } catch {
        /* */
      }
      this.touch.jump = true;
      const up = (e: PointerEvent) => {
        if (e.pointerId !== ev.pointerId) return;
        this.touch.jump = false;
        try {
          this.app.canvas.releasePointerCapture(ev.pointerId);
        } catch {
          /* */
        }
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      };
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      return;
    }

    const ds = Math.hypot(p.x - z.stickCx, p.y - z.stickCy);
    if (ds > z.stickR) return;

    ev.preventDefault();
    ev.stopImmediatePropagation();

    if (this.mobileStickPointerId !== null) return;
    this.mobileStickPointerId = ev.pointerId;
    try {
      this.app.canvas.setPointerCapture(ev.pointerId);
    } catch {
      /* */
    }

    const r = this.mobileStickRefs;
    const local = r.joystickRoot.toLocal(p, this.app.stage);
    this.applyMobileStickLocal(local.x, local.y);

    const onWindowMove = (e: PointerEvent) => {
      if (this.mobileStickPointerId !== e.pointerId) return;
      const pt = this.clientToScreen(e.clientX, e.clientY);
      const loc = r.joystickRoot.toLocal(pt, this.app.stage);
      this.applyMobileStickLocal(loc.x, loc.y);
    };

    const onWindowUp = (e: PointerEvent) => {
      if (this.mobileStickPointerId !== e.pointerId) return;
      this.mobileStickPointerId = null;
      r.knob.position.set(r.outerR, r.outerR);
      this.touch.axisX = 0;
      this.stickDragCleanup?.();
      this.stickDragCleanup = null;
      try {
        this.app.canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
    };

    window.addEventListener("pointermove", onWindowMove);
    window.addEventListener("pointerup", onWindowUp);
    window.addEventListener("pointercancel", onWindowUp);

    this.stickDragCleanup = () => {
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);
    };
  };

  private setupVirtualJoystick() {
    if (!useMobileTouchUi()) return;

    const outerR = 56;
    const innerR = 22;
    const maxDrag = 34;
    const deadPx = 10;
    const jumpR = 50;
    const jumpHitPad = 14;

    const resizeUI = () => {
      const { w, h } = this.readLayoutWidthHeight();
      /** 仅当确实没有画布尺寸时才跳过；不要用过大阈值，否则小视口或 dpr 下永远不建 UI */
      if (w < 2 || h < 2) {
        return;
      }

      this.clearStickDragListeners();
      this.uiLayer.removeChildren();

      const landscape = w > h;
      const pad = Math.max(landscape ? 20 : 14, Math.min(26, w * 0.035));
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
      joystickRoot.eventMode = "none";

      this.mobileStickRefs = {
        joystickRoot,
        knob,
        outerR,
        maxDrag,
        deadPx,
      };

      this.mobileZones = {
        stickCx: pad + outerR,
        stickCy: bottomY + outerR,
        stickR: outerR + 14,
        jumpCx: w - pad - jumpR,
        jumpCy: bottomY + outerR * 2 - jumpR,
        jumpHitHalfW: jumpR + jumpHitPad,
        jumpHitHalfH: jumpR + jumpHitPad,
      };

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
      jumpWrap.eventMode = "none";

      this.uiLayer.addChild(jumpWrap);
    };

    this.resizeUiHandler = resizeUI;
    resizeUI();
    window.addEventListener("resize", this.onWindowResizeQueued);
    window.addEventListener("pageshow", this.onPageShowForLayout);

    const nudgeLayout = () => {
      this.bumpTouchUiResize();
    };
    window.addEventListener("orientationchange", nudgeLayout);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", nudgeLayout);
    this.viewportSyncCleanup = () => {
      window.removeEventListener("orientationchange", nudgeLayout);
      vv?.removeEventListener("resize", nudgeLayout);
    };

    this.bumpTouchUiResize();
    requestAnimationFrame(() => {
      requestAnimationFrame(nudgeLayout);
    });
    window.setTimeout(nudgeLayout, 160);
    window.setTimeout(nudgeLayout, 420);

    if (!this.canvasPointerDownCapture) {
      this.canvasPointerDownCapture = this.onCanvasPointerDownCapture;
      this.app.canvas.addEventListener("pointerdown", this.canvasPointerDownCapture, {
        capture: true,
      });
    }
  }
}
