import type { FeaturedGame } from "@game/content";
import { ShellButton } from "@game/ui/shell-button";
import { SectionEyebrow } from "@game/ui/section-eyebrow";
import Link from "next/link";
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
  const playHref = getLocalizedPath(locale, `/games/${game.slug}`);

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
          <Link
            href={playHref}
            className="feature-screen feature-screen--cover"
            aria-label={`${game.title} — play`}
          >
            <div className="feature-screen-scan" />
            <img
              className="feature-cover-image"
              src={game.coverImage}
              alt={game.coverImageAlt}
              width={1200}
              height={675}
              loading="lazy"
              decoding="async"
            />
            <div className="feature-screen-cta" aria-hidden="true">
              <span className="feature-screen-play">▶</span>
              <span>{game.primaryCta.label}</span>
            </div>
          </Link>
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
