import "server-only";

import type { SiteLocale } from "./config";

type Dictionary = {
  site: {
    title: string;
    description: string;
  };
  nav: {
    home: string;
    games: string;
    devlog: string;
    about: string;
    languageSwitcher: string;
  };
  sections: {
    featuredGame: string;
    featuredTitle: string;
    gameMatrix: string;
    gameMatrixTitle: string;
    devlog: string;
    devlogTitle: string;
  };
  pages: {
    gamesTitle: string;
    gamesBody: string;
    gameDetailBody: string;
    aboutTitle: string;
    aboutBody: string;
    devlogTitle: string;
    devlogBody: string;
  };
};

const dictionaries: Record<SiteLocale, Dictionary> = {
  en: {
    site: {
      title: "game.jakelee.site",
      description: "An arcade-inspired home for experimental H5 games.",
    },
    nav: {
      home: "Home",
      games: "Games",
      devlog: "Devlog",
      about: "About",
      languageSwitcher: "Switch language",
    },
    sections: {
      featuredGame: "Featured Game",
      featuredTitle: "The main release slot is ready for your first core title.",
      gameMatrix: "Game Matrix",
      gameMatrixTitle: "Use placeholder cards first, then swap in real copy and cover art.",
      devlog: "Devlog",
      devlogTitle: "Keep this area as a terminal-style record board for future updates.",
    },
    pages: {
      gamesTitle: "Games",
      gamesBody: "Game index placeholder. Wire this page to shared content when you start adding real releases.",
      gameDetailBody: "Game detail placeholder. Use this route for the marketing shell and embedded game container.",
      aboutTitle: "About",
      aboutBody: "About page placeholder for your creator profile and site statement.",
      devlogTitle: "Devlog",
      devlogBody: "Devlog index placeholder for future posts.",
    },
  },
  zh: {
    site: {
      title: "game.jakelee.site",
      description: "一个面向实验性 H5 游戏的街机风格站点。",
    },
    nav: {
      home: "首页",
      games: "游戏",
      devlog: "开发日志",
      about: "关于",
      languageSwitcher: "切换语言",
    },
    sections: {
      featuredGame: "主推游戏",
      featuredTitle: "主发布位已经准备好，等你放进第一款核心作品。",
      gameMatrix: "游戏矩阵",
      gameMatrixTitle: "先用占位卡片撑起版式，后续直接替换真实文案和封面。",
      devlog: "开发日志",
      devlogTitle: "这里先保留成终端式记录板，后续直接接入真实更新。",
    },
    pages: {
      gamesTitle: "游戏",
      gamesBody: "这里是游戏列表页占位。等有真实发布内容后，可以直接接入共享内容源。",
      gameDetailBody: "这里是游戏详情页占位，用于承接营销外壳和嵌入式游戏容器。",
      aboutTitle: "关于",
      aboutBody: "这里是关于页占位，用来承接创作者介绍和站点说明。",
      devlogTitle: "开发日志",
      devlogBody: "这里是开发日志列表页占位，用于后续接入真实文章。",
    },
  },
};

export async function getDictionary(locale: SiteLocale) {
  return dictionaries[locale];
}
