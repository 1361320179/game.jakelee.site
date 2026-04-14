import "../../components/home/home.css";
import { getHomePageContent } from "@game/content";
import { SiteFooter } from "../../components/layout/site-footer";
import { SiteHeader } from "../../components/layout/site-header";
import { DevlogSection } from "../../components/home/devlog-section";
import { FeaturedGameSection } from "../../components/home/featured-game-section";
import { GameGridSection } from "../../components/home/game-grid-section";
import { HeroSection } from "../../components/home/hero-section";
import { getLocaleDictionary } from "../../lib/i18n/server";

type HomePageProps = {
  params: Promise<{ lang: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  const { locale, dictionary } = await getLocaleDictionary(lang);
  const homePageContent = getHomePageContent(locale);

  return (
    <main className="home-shell">
      <SiteHeader locale={locale} labels={dictionary.nav} />
      <HeroSection
        locale={locale}
        hero={homePageContent.hero}
        featuredGame={homePageContent.featuredGame}
      />
      <FeaturedGameSection
        locale={locale}
        game={homePageContent.featuredGame}
        labels={{
          eyebrow: dictionary.sections.featuredGame,
          title: dictionary.sections.featuredTitle,
        }}
      />
      <GameGridSection
        locale={locale}
        games={homePageContent.games}
        labels={{
          eyebrow: dictionary.sections.gameMatrix,
          title: dictionary.sections.gameMatrixTitle,
        }}
      />
      <DevlogSection
        entries={homePageContent.devlogs}
        labels={{
          eyebrow: dictionary.sections.devlog,
          title: dictionary.sections.devlogTitle,
        }}
      />
      <SiteFooter locale={locale} footer={homePageContent.footer} />
    </main>
  );
}
