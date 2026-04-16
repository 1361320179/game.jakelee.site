export type SiteLocale = "en" | "zh";

export type HeroContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type Metric = {
  label: string;
  value: string;
};

export type FeaturedGame = {
  /** URL slug under /games/[slug] */
  slug: string;
  /** Public path e.g. /images/super-mario-cover.svg */
  coverImage: string;
  coverImageAlt: string;
  title: string;
  tagline: string;
  description: string;
  genre: string;
  status: string;
  tags: string[];
  metrics: Metric[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type GameCard = {
  slug: string;
  title: string;
  summary: string;
  genre: string;
  platform: string;
  status: string;
  /** Optional cover under public/, e.g. /images/super-mario-cover.svg */
  coverImage?: string;
  coverImageAlt?: string;
};

export type DevlogEntry = {
  slug: string;
  date: string;
  version: string;
  title: string;
  summary: string;
};

export type FooterContent = {
  title: string;
  copy: string;
  links: Array<{ label: string; href: string }>;
};

export type HomePageContent = {
  hero: HeroContent;
  featuredGame: FeaturedGame;
  games: GameCard[];
  devlogs: DevlogEntry[];
  footer: FooterContent;
};

const homePageContentByLocale: Record<SiteLocale, HomePageContent> = {
  en: {
    hero: {
      eyebrow: "Arcade Control Deck",
      title: "Build The Next Playable Signal",
      subtitle:
        "A React-based home for experimental H5 games. The visual shell is ready. Real releases, media, and devlogs can drop in without changing the structure.",
      primaryCta: {
        label: "Play Super Mario",
        href: "/games/super-mario",
      },
      secondaryCta: {
        label: "Browse Game Matrix",
        href: "#game-matrix",
      },
    },
    featuredGame: {
      slug: "super-mario",
      coverImage: "/images/super-mario-cover.svg",
      coverImageAlt: "Super Mario — SMB1-style homage remake screenshot",
      title: "Super Mario (超级马里奥)",
      tagline: "A Mario homage remake — playable on PC & mobile.",
      description:
        "致敬马里奥的网页复刻版：经典跑跳与关卡节奏，触控与键鼠皆可游玩。",
      genre: "Platformer",
      status: "Playable",
      tags: ["Mario", "Homage", "Mobile + PC"],
      metrics: [
        { label: "Session", value: "2–5 min" },
        { label: "Platform", value: "Mobile / PC" },
        { label: "Mode", value: "Solo" },
      ],
      primaryCta: {
        label: "Play now",
        href: "/games/super-mario",
      },
      secondaryCta: {
        label: "All games",
        href: "/games",
      },
    },
    games: [
      {
        slug: "super-mario",
        title: "Super Mario (超级马里奥)",
        summary:
          "致敬马里奥的复刻版平台跳跃：在浏览器里重温熟悉的跑跳手感。",
        genre: "Platformer",
        platform: "Web",
        status: "Playable",
        coverImage: "/images/super-mario-cover.svg",
        coverImageAlt: "Super Mario screenshot",
      },
      {
        slug: "signal-runner",
        title: "Signal Runner",
        summary: "Reserved card for your second game.",
        genre: "Runner",
        platform: "Web",
        status: "WIP",
      },
      {
        slug: "grid-breaker",
        title: "Grid Breaker",
        summary: "Reserved card for your third game.",
        genre: "Puzzle",
        platform: "Web",
        status: "Prototype",
      },
      {
        slug: "void-shift",
        title: "Void Shift",
        summary: "Reserved card with room for cover art and tags.",
        genre: "Action",
        platform: "Web",
        status: "Concept",
      },
      {
        slug: "chain-burst",
        title: "Chain Burst",
        summary: "Reserved card for future release pacing.",
        genre: "Casual",
        platform: "Web",
        status: "Concept",
      },
      {
        slug: "neon-vault",
        title: "Neon Vault",
        summary: "Reserved card for a later campaign or devlog reveal.",
        genre: "Roguelite",
        platform: "Web",
        status: "Concept",
      },
    ],
    devlogs: [
      {
        slug: "system-online",
        date: "2026-04-08",
        version: "LOG-001",
        title: "Homepage shell online",
        summary:
          "Hero, featured panel, game matrix, and devlog board now have final placeholder structure.",
      },
      {
        slug: "content-pipeline",
        date: "YYYY-MM-DD",
        version: "LOG-002",
        title: "Content slots reserved",
        summary:
          "Use this card for the first real project update once art, copy, and links are ready.",
      },
      {
        slug: "next-drop",
        date: "YYYY-MM-DD",
        version: "LOG-003",
        title: "Next milestone pending",
        summary:
          "Keep this card as a placeholder for the next development milestone or release teaser.",
      },
    ],
    footer: {
      title: "game.jakelee.site",
      copy: "A modular React home for H5 games, devlogs, and future playable experiments.",
      links: [
        { label: "Games", href: "/games" },
        { label: "Devlog", href: "/devlog" },
        { label: "GitHub", href: "#" },
      ],
    },
  },
  zh: {
    hero: {
      eyebrow: "Arcade Control Deck",
      title: "Build The Next Playable Signal",
      subtitle:
        "一个面向实验性 H5 游戏的 React 站点骨架已经就位。后续接入真实作品、媒体资源和开发日志时，不需要重做整体结构。",
      primaryCta: {
        label: "试玩 超级马里奥",
        href: "/games/super-mario",
      },
      secondaryCta: {
        label: "查看游戏矩阵",
        href: "#game-matrix",
      },
    },
    featuredGame: {
      slug: "super-mario",
      coverImage: "/images/super-mario-cover.svg",
      coverImageAlt: "超级马里奥（Super Mario）致敬复刻版游戏画面",
      title: "Super Mario（超级马里奥）",
      tagline: "致敬马里奥的网页复刻版，支持手机与电脑。",
      description:
        "致敬马里奥复刻版：经典跑跳与关卡节奏；手机虚拟按键，电脑键盘操作。",
      genre: "平台跳跃",
      status: "可玩",
      tags: ["马里奥", "致敬", "多端"],
      metrics: [
        { label: "单局时长", value: "2–5 分钟" },
        { label: "平台", value: "手机 / 电脑" },
        { label: "模式", value: "单人" },
      ],
      primaryCta: {
        label: "立即开玩",
        href: "/games/super-mario",
      },
      secondaryCta: {
        label: "全部游戏",
        href: "/games",
      },
    },
    games: [
      {
        slug: "super-mario",
        title: "Super Mario（超级马里奥）",
        summary: "致敬马里奥复刻版平台跳跃，浏览器内直接游玩。",
        genre: "平台跳跃",
        platform: "Web",
        status: "可玩",
        coverImage: "/images/super-mario-cover.svg",
        coverImageAlt: "超级马里奥 游戏画面",
      },
      {
        slug: "signal-runner",
        title: "Signal Runner",
        summary: "为第二款游戏预留的卡片位。",
        genre: "Runner",
        platform: "Web",
        status: "开发中",
      },
      {
        slug: "grid-breaker",
        title: "Grid Breaker",
        summary: "为第三款游戏预留的卡片位。",
        genre: "Puzzle",
        platform: "Web",
        status: "原型阶段",
      },
      {
        slug: "void-shift",
        title: "Void Shift",
        summary: "预留了封面和标签空间的展示卡。",
        genre: "Action",
        platform: "Web",
        status: "概念阶段",
      },
      {
        slug: "chain-burst",
        title: "Chain Burst",
        summary: "用于后续发布节奏规划的预留卡片。",
        genre: "Casual",
        platform: "Web",
        status: "概念阶段",
      },
      {
        slug: "neon-vault",
        title: "Neon Vault",
        summary: "适合未来活动或 devlog 揭晓的预留位。",
        genre: "Roguelite",
        platform: "Web",
        status: "概念阶段",
      },
    ],
    devlogs: [
      {
        slug: "system-online",
        date: "2026-04-08",
        version: "LOG-001",
        title: "首页骨架已上线",
        summary: "Hero、主推区、游戏矩阵和 devlog 面板都已经具备最终占位结构。",
      },
      {
        slug: "content-pipeline",
        date: "YYYY-MM-DD",
        version: "LOG-002",
        title: "内容位已预留",
        summary:
          "当首个真实项目的素材、文案和链接准备好后，可以直接替换到这里。",
      },
      {
        slug: "next-drop",
        date: "YYYY-MM-DD",
        version: "LOG-003",
        title: "下一阶段待解锁",
        summary: "这个卡片可以留给下一个里程碑更新，或作为下一款作品的预告位。",
      },
    ],
    footer: {
      title: "game.jakelee.site",
      copy: "一个为 H5 游戏、开发日志和后续可玩实验预留扩展空间的模块化 React 站点。",
      links: [
        { label: "游戏", href: "/games" },
        { label: "开发日志", href: "/devlog" },
        { label: "GitHub", href: "#" },
      ],
    },
  },
};

export function getHomePageContent(locale: SiteLocale) {
  return homePageContentByLocale[locale];
}
