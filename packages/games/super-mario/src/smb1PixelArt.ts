/**
 * SMB1 World 1-1–style pixel art (original fan recreation — not Nintendo ROM tiles).
 * Renders to canvas → Pixi Texture for crisp nearest-neighbor scaling in-game.
 */
import { Texture } from "pixi.js";

const PX = 2; /* 16×16 NES cell → 32×32 game units */

function setNearest(tex: Texture): void {
  const src = tex.source;
  if (src && "scaleMode" in src) {
    (src as { scaleMode: string }).scaleMode = "nearest";
  }
}

function paintPixels(
  rows: string[],
  palette: Record<string, number>,
  scale: number,
): Texture {
  const w = Math.max(...rows.map((r) => r.length), 1);
  const norm = rows.map((r) => r.padEnd(w, "."));
  const h = norm.length;
  const cvs = document.createElement("canvas");
  cvs.width = w * scale;
  cvs.height = h * scale;
  const ctx = cvs.getContext("2d");
  if (!ctx) {
    throw new Error("2d context required for SMB textures");
  }
  for (let y = 0; y < h; y++) {
    const row = norm[y] ?? "";
    for (let x = 0; x < w; x++) {
      const ch = row[x] ?? ".";
      if (ch === "." || ch === " ") continue;
      const col = palette[ch];
      if (col === undefined) continue;
      ctx.fillStyle = `#${col.toString(16).padStart(6, "0")}`;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  const tex = Texture.from(cvs);
  setNearest(tex);
  return tex;
}

/* --- 16×16 tiles --- */
const PAL_GROUND: Record<string, number> = {
  ".": 0x000000,
  G: 0x00c800,
  g: 0x006800,
  D: 0xfcb468,
  d: 0xc84c0c,
  b: 0x883818,
  "#": 0x181008,
};

const GROUND_ROWS = [
  "gGGGGGGGGGGGGGGg",
  "gGGGGGGGGGGGGGGg",
  "#DDDDDDDDDDDDDD#",
  "#DDDDDDDDDDDDDD#",
  "#dddddddddddddd#",
  "#dbbbbbbbbbdddd#",
  "#dbbbbbbbbbdddd#",
  "#dddddddddddddd#",
  "#dddddddddddddd#",
  "#dbbbbbbbbbdddd#",
  "#dddddddddddddd#",
  "#dddddddddddddd#",
  "#dbbbbbbbbbdddd#",
  "#dddddddddddddd#",
  "#dddddddddddddd#",
  "#dddddddddddddd#",
];

const PAL_BRICK: Record<string, number> = {
  ".": 0x000000,
  r: 0xb53120,
  R: 0xd85838,
  m: 0x4a1510,
  "#": 0x201008,
};

const BRICK_ROWS = [
  "#rrrrrrrrrrrrrr#",
  "#rRRrRRrRRrRRr#",
  "#rmrmrmrmrmrmr#",
  "#rRRrRRrRRrRRr#",
  "#rmrmrmrmrmrmr#",
  "#rrrrrrrrrrrrrr#",
  "#rmrmrmrmrmrmr#",
  "#rRRrRRrRRrRRr#",
  "#rmrmrmrmrmrmr#",
  "#rrrrrrrrrrrrrr#",
  "#rRRrRRrRRrRRr#",
  "#rmrmrmrmrmrmr#",
  "#rrrrrrrrrrrrrr#",
  "#rmrmrmrmrmrmr#",
  "#rRRrRRrRRrRRr#",
  "#rrrrrrrrrrrrrr#",
];

const PAL_Q: Record<string, number> = {
  ".": 0x000000,
  o: 0xfc9838,
  O: 0xfce0a0,
  y: 0xfca018,
  b: 0x682008,
  "#": 0x301008,
  "?": 0x884010,
  "!": 0xf8f8c8,
};

const QUESTION_ROWS = [
  "################",
  "#bbbbbbbbbbbbbb#",
  "#byyyyyyyyyyyyb#",
  "#byOOOOOOOOOOyb#",
  "#byO????????Oyb#",
  "#byO?!!!!!!?Oyb#",
  "#byO?!!!!!!?Oyb#",
  "#byO?!!??!!?Oyb#",
  "#byO?!!??!!?Oyb#",
  "#byO?!!!!!!?Oyb#",
  "#byO?!!!!!!?Oyb#",
  "#byO????????Oyb#",
  "#byOOOOOOOOOOyb#",
  "#byyyyyyyyyyyyb#",
  "#bbbbbbbbbbbbbb#",
  "################",
];

/** Blink frame: same layout, warmer gold highlights */
const PAL_Q_ALT: Record<string, number> = {
  ...PAL_Q,
  o: 0xfca848,
  O: 0xfce8b8,
};

const PAL_USED: Record<string, number> = {
  ".": 0x000000,
  u: 0x885818,
  U: 0xa87830,
  m: 0x402010,
  "#": 0x201008,
};

const USED_ROWS = [
  "################",
  "#uuuuuuuuuuuuuu#",
  "#uUUuUUuUUuuuu#",
  "#umumumumumumu#",
  "#uuuuuuuuuuuuuu#",
  "#umumumumumumu#",
  "#uUUuUUuUUuuuu#",
  "#umumumumumumu#",
  "#uuuuuuuuuuuuuu#",
  "#umumumumumumu#",
  "#uUUuUUuUUuuuu#",
  "#umumumumumumu#",
  "#uuuuuuuuuuuuuu#",
  "#umumumumumumu#",
  "#uUUuUUuUUuuuu#",
  "################",
];

const PAL_CLOUD: Record<string, number> = {
  ".": 0x00000000,
  w: 0xf8fcf8,
  s: 0xb8c4d8,
};

const CLOUD_ROWS = [
  "....sswwww......",
  "..sswwwwwwss....",
  ".swwwwwwwwwws...",
  "swwwwwwwwwwwws..",
  "swwwwwwwwwwwwss.",
  "sswwwwwwwwwwwwss",
  ".ssssssssssssss.",
  "................",
];

const PAL_BUSH: Record<string, number> = {
  ".": 0x00000000,
  l: 0x00a800,
  L: 0x00c828,
  d: 0x006800,
};

const BUSH_ROWS = [
  ".....ddLLL......",
  "...ddLLLLLLdd...",
  "..dLLLLLLLLLLd..",
  ".dLLLLLLLLLLLLd.",
  "dLLLLLLLLLLLLLLd",
  "dLLLLLLLLLLLLLLd",
  ".dddddddddddddd.",
];

const PAL_GOOMBA: Record<string, number> = {
  ".": 0x00000000,
  b: 0x502008,
  B: 0x885010,
  e: 0xf8f8f8,
  x: 0x000000,
  w: 0xffffff,
};

const GOOMBA_ROWS = [
  ".....bbbbbb.....",
  "...bbbbbbbbbb...",
  "..bbbbbbbbbbbb..",
  ".bbbbbbbbbbbbbb.",
  "bbbbbbbbbbbbbbbb",
  "bbxxeeeeeexxbbbb",
  "bbxweeeeeewxbbbb",
  "bbbbbbbbbbbbbbbb",
  ".bbbbbbbbbbbbbb.",
  "..bbbbbbbbbbbb..",
  "...bbbbbbbbbb...",
  "....bbbbbbbb....",
  ".....bbbbbb.....",
  "................",
  "................",
  "................",
];

/* Green Koopa — fan pixel (walk ×2 + shell) */
const PAL_KOOPA: Record<string, number> = {
  ".": 0x00000000,
  G: 0x00c848,
  g: 0x006820,
  Y: 0xfce070,
  y: 0xc8a018,
  k: 0x101010,
  w: 0xf8f8f8,
  o: 0x402010,
};

const KOOPA_WALK_0 = [
  "................",
  "......GGGG......",
  ".....GGYYGG.....",
  "....GGyyyyGG....",
  "...GGyykkyyGG...",
  "..GGyywwwwyyGG..",
  "..GGyyyyyyyyGG..",
  "..GGooooooooGG..",
  "...GGooooooGG...",
  "....GGGGGGGG....",
  ".....gggggg.....",
  ".....gg..gg.....",
  "................",
  "................",
  "................",
  "................",
];

const KOOPA_WALK_1 = [
  "................",
  "......GGGG......",
  ".....GGYYGG.....",
  "....GGyyyyGG....",
  "...GGyykkyyGG...",
  "..GGyywwwwyyGG..",
  "..GGyyyyyyyyGG..",
  "..GGooooooooGG..",
  "...GGooooooGG...",
  "....GGGGGGGG....",
  "......gggg......",
  ".....gg..gg.....",
  "................",
  "................",
  "................",
  "................",
];

const KOOPA_SHELL = [
  "................",
  "................",
  "................",
  ".....GGGGGG.....",
  "....GGyyyyGG....",
  "...GGyykkyyGG...",
  "..GGyywwwwyyGG..",
  "..GGyyyyyyyyGG..",
  "..GGGGGGGGGGGG..",
  "...GGGGGGGGGG...",
  "....GGGGGGGG....",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const PAL_MUSH: Record<string, number> = {
  ".": 0x00000000,
  r: 0xc62828,
  R: 0xe04040,
  d: 0x7f1010,
  w: 0xfff8f0,
  s: 0xf5e6c8,
  o: 0x8b7355,
};

const MUSHROOM_ROWS = [
  "......dddd......",
  "....ddRRRRdd....",
  "...dRRRRRRRRd...",
  "..dRRwwRRwwRRd..",
  ".dRRwwwwwwwwRRd.",
  ".dRRwwwwwwwwRRd.",
  "..dRRRRRRRRRRd..",
  "...dssssssssd...",
  "....dssssssd....",
  ".....dssssd.....",
  "......dssd......",
  ".......ss.......",
  "................",
  "................",
  "................",
  "................",
];

/* Mario 14×16 small — frames: idle, walk1, walk2, jump */
const PAL_M: Record<string, number> = {
  ".": 0x00000000,
  R: 0xe01010,
  r: 0xa00808,
  B: 0x2060d0,
  b: 0x103878,
  S: 0xf8b890,
  s: 0xd08060,
  K: 0x000000,
  W: 0xffffff,
};

const MARIO_SMALL: string[][] = [
  /* idle */
  [
    ".....RRRRR.....",
    "....RRRRRRR....",
    "...SSSSSSSSS...",
    "..SSKSSSKSSS...",
    "..SSKSSSKSSS...",
    "...SSSSSSSS....",
    "...BBBBBBB.....",
    "..BBBBBBBBB....",
    "..BBBBBBBBB....",
    "..BBB...BBB....",
    ".BBB.....BBB...",
    "RRR.......RRR..",
    "SSS.......SSS..",
    "BBB.......BBB..",
    "................",
    "................",
  ],
  /* walk 1 — leg forward */
  [
    ".....RRRRR.....",
    "....RRRRRRR....",
    "...SSSSSSSSS...",
    "..SSKSSSKSSS...",
    "..SSKSSSKSSS...",
    "...SSSSSSSS....",
    "...BBBBBBB.....",
    "..BBBBBBBBB....",
    "..BBBBBBBBB....",
    "..BBB...BBB....",
    ".BBB.....BBB...",
    "RRR.......RRR..",
    "SSS.......SSS..",
    "BBB......BBB...",
    "..........BBB..",
    "................",
  ],
  /* walk 2 */
  [
    ".....RRRRR.....",
    "....RRRRRRR....",
    "...SSSSSSSSS...",
    "..SSKSSSKSSS...",
    "..SSKSSSKSSS...",
    "...SSSSSSSS....",
    "...BBBBBBB.....",
    "..BBBBBBBBB....",
    "..BBBBBBBBB....",
    "..BBB...BBB....",
    ".BBB.....BBB...",
    "RRR.......RRR..",
    "SSS.......SSS..",
    "..BBB.....BBB..",
    "..BBB...........",
    "................",
  ],
  /* jump */
  [
    ".....RRRRR.....",
    "....RRRRRRR....",
    "...SSSSSSSSS...",
    "..SSKSSSKSSS...",
    "..SSKSSSKSSS...",
    "...SSSSSSSS....",
    "...BBBBBBB.....",
    "..BBBBBBBBB....",
    ".BBB.BBB.BBB...",
    "BBB...BBB...BB.",
    "RRR...BBB...RR.",
    "SSS...BBB...SS.",
    "......BBB.......",
    "......BBB.......",
    "................",
    "................",
  ],
];

/* Big Mario 16×22 scaled to 32×44 with PX=2 */
const PAL_MB = { ...PAL_M, b: 0x103878, H: 0x5d4037 };

const MARIO_BIG: string[][] = [
  [
    "......RRRRRR......",
    ".....RRRRRRRR.....",
    "....SSSSSSSSSS....",
    "...SSKKSSKKSSSS...",
    "...SSKKSSKKSSSS...",
    "....SSSSSSSSSS....",
    "....RRRRRRRRRR....",
    "...SSSSSSSSSSSS...",
    "..SSSSSSSSSSSSSS..",
    "..SSSSHHHHHHSSSS..",
    "..SSSSHHHHHHSSSS..",
    "...SSSSSSSSSSSS...",
    "...BBBBBBBBBBBB...",
    "..BBBBBBBBBBBBBB..",
    "..BBBBBBBBBBBBBB..",
    "..BBB......BBB...",
    ".BBB........BBB..",
    "RRR..........RRR.",
    "BBB..........BBB.",
    "BBB..........BBB.",
    "SSS..........SSS.",
    "................",
    "................",
  ],
  [
    "......RRRRRR......",
    ".....RRRRRRRR.....",
    "....SSSSSSSSSS....",
    "...SSKKSSKKSSSS...",
    "...SSKKSSKKSSSS...",
    "....SSSSSSSSSS....",
    "....RRRRRRRRRR....",
    "...SSSSSSSSSSSS...",
    "..SSSSSSSSSSSSSS..",
    "..SSSSHHHHHHSSSS..",
    "..SSSSHHHHHHSSSS..",
    "...SSSSSSSSSSSS...",
    "...BBBBBBBBBBBB...",
    "..BBBBBBBBBBBBBB..",
    "..BBBBBBBBBBBBBB..",
    "..BBB......BBB...",
    ".BBB........BBB..",
    "RRR..........RRR.",
    "BBB..........BBB.",
    "BBB..........BBB.",
    "SSS..........SSS.",
    "................",
    "................",
  ],
  [
    "......RRRRRR......",
    ".....RRRRRRRR.....",
    "....SSSSSSSSSS....",
    "...SSKKSSKKSSSS...",
    "...SSKKSSKKSSSS...",
    "....SSSSSSSSSS....",
    "....RRRRRRRRRR....",
    "...SSSSSSSSSSSS...",
    "..SSSSSSSSSSSSSS..",
    "..SSSSHHHHHHSSSS..",
    "..SSSSHHHHHHSSSS..",
    "...SSSSSSSSSSSS...",
    "...BBBBBBBBBBBB...",
    "..BBBBBBBBBBBBBB..",
    "..BBBBBBBBBBBBBB..",
    "..BBB......BBB...",
    ".BBB........BBB..",
    "RRR..........RRR.",
    "BBB..........BBB.",
    "BBB..........BBB.",
    "SSS..........SSS.",
    "................",
    "................",
  ],
  [
    "......RRRRRR......",
    ".....RRRRRRRR.....",
    "....SSSSSSSSSS....",
    "...SSKKSSKKSSSS...",
    "...SSKKSSKKSSSS...",
    "....SSSSSSSSSS....",
    "....RRRRRRRRRR....",
    "...SSSSSSSSSSSS...",
    "..SSSSSSSSSSSSSS..",
    "..SSSSHHHHHHSSSS..",
    "..SSSSHHHHHHSSSS..",
    "...SSSSSSSSSSSS...",
    "...BBBBBBBBBBBB...",
    "..BBBBBBBBBBBBBB..",
    ".BBB.BBBB.BBB.BBB.",
    "BBB...BB...BB..BBB",
    "RRR...BB...BB..RRR",
    "SSS...BB...BB..SSS",
    "......BB...BB.....",
    "......BB...BB.....",
    "................",
    "................",
    "................",
  ],
];

/* --- Flag pole, banner, castle (goal) --- */
const PAL_POLE: Record<string, number> = {
  ".": 0x00000000,
  o: 0x1a3010,
  P: 0x3d6828,
  G: 0x5cb040,
};

const POLE_SEGMENT_ROWS = [
  ".oPPGGPPo.",
  ".oPPGGPPo.",
  ".oPPGGPPo.",
  ".oPPGGPPo.",
];

const POLE_ORB_ROWS = [
  "....GGGG....",
  "..GGGGGGGG..",
  ".GGGGGGGGGG.",
  ".GGGGGGGGGG.",
  "..GGGGGGGG..",
  "....GGGG....",
];

const PAL_FLAG: Record<string, number> = {
  ".": 0x00000000,
  R: 0xe02020,
  r: 0xa01010,
  W: 0xf8f8f8,
  "#": 0x301010,
};

const FLAG_CLOTH_ROWS = [
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRWWWWWWWWWWWWRRRRRR",
  "RRRRWWWWWWWWWWWWRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRRRRRRRR",
];

const PAL_CASTLE: Record<string, number> = {
  ".": 0x00000000,
  "#": 0x181818,
  B: 0x404040,
  b: 0x585858,
  w: 0x202020,
  Y: 0xf8d878,
  y: 0xc8a030,
};

const CASTLE_ROWS = [
  "####################",
  "#BBBBBBBBBBBBBBBBBB#",
  "#BwBwBwBwBwBwBwBwB#",
  "#BBBBBBBBBBBBBBBBBB#",
  "#BwBwBwBwBwBwBwBwB#",
  "#BBBBBBBBBBBBBBBBBB#",
  "#BBBBwwwwwwBBBBBBBB#",
  "#BBBBwwwwwwBBBBBBBB#",
  "#BBBBwwwwwwBBBBBBBB#",
  "#BBBBwwwwwwBBBBBBBB#",
  "#BBBBBBBBBBBBBBBBBB#",
  "#BByyyyyyyyyyyyyyBB#",
  "#BByyyyyyyyyyyyyyBB#",
  "#BBBBBBBBBBBBBBBBBB#",
  "####################",
  "....................",
];

/* --- Piranha head (two chomp frames) 16×16 --- */
const PAL_PIR: Record<string, number> = {
  ".": 0x00000000,
  r: 0xc62828,
  R: 0xe83838,
  d: 0x7f1010,
  w: 0xfff8f0,
  k: 0x101010,
  g: 0x43a047,
  G: 0x2e7d32,
};

const PIR_HEAD_CLOSED = [
  "................",
  ".......gg.......",
  "......rrrr......",
  ".....rrRRrr.....",
  "....rrRRRRrr....",
  "...rrRRRRRRrr...",
  "..rrRRwwwwRRrr..",
  "..rrRRkkkkRRrr..",
  "..rrRRRRRRRRrr..",
  "...rrrrrrrrrr...",
  "....rrrrrrrr....",
  ".....rrrrrr.....",
  "................",
  "................",
  "................",
  "................",
];

const PIR_HEAD_OPEN = [
  "................",
  ".......gg.......",
  "......rrrr......",
  ".....rrRRrr.....",
  "....rrRRRRrr....",
  "...rrRRwwwwRRrr.",
  "..rrRRwwwwwwRRrr",
  "..rrRRkkkkkkRRrr",
  "..rrRRwwwwwwRRrr",
  "...rrRRwwwwRRrr.",
  "....rrRRRRrr....",
  ".....rrrrrr.....",
  "................",
  "................",
  "................",
  "................",
];

/** Wide parallax hills (pixel steps) */
function paintHills(width: number, height: number): Texture {
  const cvs = document.createElement("canvas");
  cvs.width = width;
  cvs.height = height;
  const ctx = cvs.getContext("2d");
  if (!ctx) throw new Error("2d");
  ctx.clearRect(0, 0, width, height);
  const base = height - 8;
  for (let x = -40; x < width + 80; x += 120) {
    const h0 = 28 + ((x * 7) % 17);
    ctx.fillStyle = "#00a844";
    ctx.beginPath();
    ctx.moveTo(x, base + 40);
    ctx.lineTo(x + 60, base - h0);
    ctx.lineTo(x + 120, base + 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(0,104,0,0.45)";
    ctx.beginPath();
    ctx.moveTo(x + 10, base + 36);
    ctx.lineTo(x + 58, base - h0 + 10);
    ctx.lineTo(x + 106, base + 36);
    ctx.closePath();
    ctx.fill();
  }
  const tex = Texture.from(cvs);
  setNearest(tex);
  return tex;
}

export type Smb1TextureSet = {
  ground: Texture;
  brick: Texture;
  question: Texture;
  questionB: Texture;
  usedBlock: Texture;
  cloud: Texture;
  bush: Texture;
  hills: Texture;
  goomba: Texture;
  koopaWalk: [Texture, Texture];
  koopaShell: Texture;
  mushroom: Texture;
  marioSmall: Texture[];
  marioBig: Texture[];
  flagPoleSeg: Texture;
  flagOrb: Texture;
  flagCloth: Texture;
  castle: Texture;
  piranhaHead: [Texture, Texture];
};

export function createSmb1TextureSet(): Smb1TextureSet {
  const ground = paintPixels(GROUND_ROWS, PAL_GROUND, PX);
  const brick = paintPixels(BRICK_ROWS, PAL_BRICK, PX);
  const question = paintPixels(QUESTION_ROWS, PAL_Q, PX);
  const questionB = paintPixels(QUESTION_ROWS, PAL_Q_ALT, PX);
  const usedBlock = paintPixels(USED_ROWS, PAL_USED, PX);
  const cloud = paintPixels(CLOUD_ROWS, PAL_CLOUD, PX);
  const bush = paintPixels(BUSH_ROWS, PAL_BUSH, PX);
  const hills = paintHills(720, 120);
  const goomba = paintPixels(GOOMBA_ROWS, PAL_GOOMBA, PX);
  const koopaWalk: [Texture, Texture] = [
    paintPixels(KOOPA_WALK_0, PAL_KOOPA, PX),
    paintPixels(KOOPA_WALK_1, PAL_KOOPA, PX),
  ];
  const koopaShell = paintPixels(KOOPA_SHELL, PAL_KOOPA, PX);
  const mushroom = paintPixels(MUSHROOM_ROWS, PAL_MUSH, PX);

  const marioSmall = MARIO_SMALL.map((rows) => paintPixels(rows, PAL_M, PX));
  const marioBig = MARIO_BIG.map((rows) => paintPixels(rows, PAL_MB, PX));

  const flagPoleSeg = paintPixels(POLE_SEGMENT_ROWS, PAL_POLE, 2);
  const flagOrb = paintPixels(POLE_ORB_ROWS, PAL_POLE, 2);
  const flagCloth = paintPixels(FLAG_CLOTH_ROWS, PAL_FLAG, PX);
  const castle = paintPixels(CASTLE_ROWS, PAL_CASTLE, PX);
  const piranhaHead: [Texture, Texture] = [
    paintPixels(PIR_HEAD_CLOSED, PAL_PIR, PX),
    paintPixels(PIR_HEAD_OPEN, PAL_PIR, PX),
  ];

  return {
    ground,
    brick,
    question,
    questionB,
    usedBlock,
    cloud,
    bush,
    hills,
    goomba,
    koopaWalk,
    koopaShell,
    mushroom,
    marioSmall,
    marioBig,
    flagPoleSeg,
    flagOrb,
    flagCloth,
    castle,
    piranhaHead,
  };
}
