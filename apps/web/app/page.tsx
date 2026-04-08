import { homePageContent } from "@game/content";
import { SiteFooter } from "../components/layout/site-footer";
import { DevlogSection } from "../components/home/devlog-section";
import { FeaturedGameSection } from "../components/home/featured-game-section";
import { GameGridSection } from "../components/home/game-grid-section";
import { HeroSection } from "../components/home/hero-section";

export default function HomePage() {
  return (
    <main className="home-shell">
      <HeroSection hero={homePageContent.hero} featuredGame={homePageContent.featuredGame} />
      <FeaturedGameSection game={homePageContent.featuredGame} />
      <GameGridSection games={homePageContent.games} />
      <DevlogSection entries={homePageContent.devlogs} />
      <SiteFooter footer={homePageContent.footer} />
    </main>
  );
}
