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

export const homePageContent: {
  hero: HeroContent;
  featuredGame: FeaturedGame;
  games: GameCard[];
  devlogs: DevlogEntry[];
  footer: FooterContent;
} = {
  hero: {
    eyebrow: "Arcade Control Deck",
    title: "Build The Next Playable Signal",
    subtitle:
      "A React-based home for experimental H5 games. The visuals are in place first. Your real content can drop into these slots later.",
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
      href: "#",
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
      summary: "Hero, featured panel, game matrix, and devlog board now have final placeholder structure.",
    },
    {
      slug: "content-pipeline",
      date: "YYYY-MM-DD",
      version: "LOG-002",
      title: "Content slots reserved",
      summary: "Use this card for the first real project update once art, copy, and links are ready.",
    },
    {
      slug: "next-drop",
      date: "YYYY-MM-DD",
      version: "LOG-003",
      title: "Next milestone pending",
      summary: "Keep this card as a placeholder for the next development milestone or release teaser.",
    },
  ],
  footer: {
    title: "game.jakelee.site",
    copy: "A modular React home for H5 games, devlogs, and future playable experiments.",
    links: [
      { label: "Games", href: "#game-matrix" },
      { label: "Devlog", href: "#devlog" },
      { label: "GitHub", href: "#" },
    ],
  },
};
