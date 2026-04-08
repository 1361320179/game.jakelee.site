import type { FeaturedGame, HeroContent } from "@game/content";
import { ShellButton } from "@game/ui/shell-button";
import { SectionEyebrow } from "@game/ui/section-eyebrow";

type HeroSectionProps = {
  hero: HeroContent;
  featuredGame: FeaturedGame;
};

export function HeroSection({ hero, featuredGame }: HeroSectionProps) {
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
          <ShellButton href={hero.primaryCta.href} variant="primary">
            {hero.primaryCta.label}
          </ShellButton>
          <ShellButton href={hero.secondaryCta.href} variant="secondary">
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
