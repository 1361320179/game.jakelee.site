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
        label: "Launch Featured Game",
        href: "#featured-game",
      },
      secondaryCta: {
        label: "Browse Game Matrix",
        href: "#game-matrix",
      },
    },
    featuredGame: {
      title: "Project Placeholder",
      tagline: "Main game preview shell is ready.",
      description:
        "Use this block for the first title you want to push hardest. Copy, tags, metrics, preview art, and CTA slots are already reserved.",
      genre: "Action Puzzle",
      status: "Online Soon",
      tags: ["High Impact", "Short Session", "Mobile Ready"],
      metrics: [
        { label: "Session", value: "03 Min" },
        { label: "Platform", value: "Mobile / PC" },
        { label: "Mode", value: "Solo" },
      ],
      primaryCta: {
        label: "Play Slot",
        href: "#",
      },
      secondaryCta: {
        label: "View Detail",
        href: "/games/project-placeholder",
      },
    },
    games: [
      {
        slug: "project-placeholder",
        title: "Project Placeholder",
        summary: "Primary release slot for the homepage card wall.",
        genre: "Arcade",
        platform: "Web",
        status: "Online Soon",
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
        label: "进入主推游戏",
        href: "#featured-game",
      },
      secondaryCta: {
        label: "查看游戏矩阵",
        href: "#game-matrix",
      },
    },
    featuredGame: {
      title: "Project Placeholder",
      tagline: "主推游戏预览位已经准备好。",
      description:
        "这个区块用于承接你最想重点推广的作品。文案、标签、指标、预览图和 CTA 位置都已经预留。",
      genre: "Action Puzzle",
      status: "即将上线",
      tags: ["高冲击感", "短局体验", "移动端友好"],
      metrics: [
        { label: "单局时长", value: "03 分钟" },
        { label: "平台", value: "Mobile / PC" },
        { label: "模式", value: "单人" },
      ],
      primaryCta: {
        label: "试玩入口",
        href: "#",
      },
      secondaryCta: {
        label: "查看详情",
        href: "/games/project-placeholder",
      },
    },
    games: [
      {
        slug: "project-placeholder",
        title: "Project Placeholder",
        summary: "首页卡片墙的主发布位。",
        genre: "Arcade",
        platform: "Web",
        status: "即将上线",
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
        summary: "当首个真实项目的素材、文案和链接准备好后，可以直接替换到这里。",
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
