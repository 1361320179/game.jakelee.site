import type { FeaturedGame, HeroContent } from "@game/content";
import { ShellButton } from "@game/ui/shell-button";
import { SectionEyebrow } from "@game/ui/section-eyebrow";
import Link from "next/link";
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
  const playHref = getLocalizedPath(
    locale,
    `/games/${featuredGame.slug}`,
  );

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

      <Link
        href={playHref}
        className="hero-preview hero-preview--game"
        aria-label={`${featuredGame.title} — open game`}
      >
        <div className="preview-chrome">
          <span>{featuredGame.status}</span>
          <span>{featuredGame.genre}</span>
        </div>
        <div className="preview-screen preview-screen--cover">
          <div className="preview-screen-overlay" />
          <img
            className="preview-cover-image"
            src={featuredGame.coverImage}
            alt={featuredGame.coverImageAlt}
            width={1200}
            height={675}
            loading="eager"
            decoding="async"
          />
          <div className="preview-play-hint" aria-hidden="true">
            <span className="preview-play-icon">▶</span>
            <span className="preview-play-text">{featuredGame.title}</span>
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
      </Link>
    </section>
  );
}
