import type { FeaturedGame, HeroContent } from "@game/content";
import { ShellButton } from "@game/ui/shell-button";
import { SectionEyebrow } from "@game/ui/section-eyebrow";
import { getLocalizedPath, type SiteLocale } from "../../lib/i18n/config";

type HeroSectionProps = {
  locale: SiteLocale;
  hero: HeroContent;
  featuredGame: FeaturedGame;
};

export function HeroSection({
  locale,
  hero,
  featuredGame,
}: HeroSectionProps) {
  const primaryHref = hero.primaryCta.href.startsWith("/")
    ? getLocalizedPath(locale, hero.primaryCta.href)
    : hero.primaryCta.href;
  const secondaryHref = hero.secondaryCta.href.startsWith("/")
    ? getLocalizedPath(locale, hero.secondaryCta.href)
    : hero.secondaryCta.href;

  return (
    <section className="hero-section">
      <div className="hero-backdrop" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-primary" />
        <div className="hero-glow hero-glow-secondary" />
      </div>

      <div className="hero-copy">
        <SectionEyebrow label={hero.eyebrow} />
        <h1>{hero.title}</h1>
        <p>{hero.subtitle}</p>
        <div className="hero-actions">
          <ShellButton href={primaryHref} variant="primary">
            {hero.primaryCta.label}
          </ShellButton>
          <ShellButton href={secondaryHref} variant="secondary">
            {hero.secondaryCta.label}
          </ShellButton>
        </div>
      </div>

      <div className="hero-preview">
        <div className="preview-chrome">
          <span>{featuredGame.status}</span>
          <span>{featuredGame.genre}</span>
        </div>
        <div className="preview-screen">
          <div className="preview-screen-overlay" />
          <div className="preview-placeholder">
            <span className="preview-label">PRIMARY GAME SLOT</span>
            <strong>{featuredGame.title}</strong>
            <p>{featuredGame.tagline}</p>
          </div>
        </div>
        <div className="preview-stats">
          {featuredGame.metrics.map((metric) => (
            <div key={metric.label} className="preview-stat">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
