import type { FeaturedGame } from "@game/content";
import { ShellButton } from "@game/ui/shell-button";
import { SectionEyebrow } from "@game/ui/section-eyebrow";
import { getLocalizedPath, type SiteLocale } from "../../lib/i18n/config";

type FeaturedGameSectionProps = {
  locale: SiteLocale;
  game: FeaturedGame;
  labels: {
    eyebrow: string;
    title: string;
  };
};

export function FeaturedGameSection({
  locale,
  game,
  labels,
}: FeaturedGameSectionProps) {
  const primaryHref = game.primaryCta.href.startsWith("/")
    ? getLocalizedPath(locale, game.primaryCta.href)
    : game.primaryCta.href;
  const secondaryHref = game.secondaryCta.href.startsWith("/")
    ? getLocalizedPath(locale, game.secondaryCta.href)
    : game.secondaryCta.href;

  return (
    <section className="panel-section" id="featured-game">
      <div className="section-heading">
        <SectionEyebrow label={labels.eyebrow} />
        <h2>{labels.title}</h2>
      </div>

      <article className="feature-panel">
        <div className="feature-copy">
          <span className="feature-status">{game.status}</span>
          <h3>{game.title}</h3>
          <p>{game.description}</p>
          <div className="feature-tags">
            {game.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="feature-actions">
            <ShellButton href={primaryHref} variant="primary">
              {game.primaryCta.label}
            </ShellButton>
            <ShellButton href={secondaryHref} variant="secondary">
              {game.secondaryCta.label}
            </ShellButton>
          </div>
        </div>

        <div className="feature-media">
          <div className="feature-screen">
            <div className="feature-screen-scan" />
            <span className="feature-screen-label">TRAILER / ART SLOT</span>
          </div>
        </div>

        <div className="feature-metrics">
          {game.metrics.map((metric) => (
            <div key={metric.label} className="feature-metric">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
