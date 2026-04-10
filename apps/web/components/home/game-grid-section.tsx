import type { GameCard } from "@game/content";
import { SectionEyebrow } from "@game/ui/section-eyebrow";
import Link from "next/link";
import { getLocalizedPath, type SiteLocale } from "../../lib/i18n/config";

type GameGridSectionProps = {
  locale: SiteLocale;
  games: GameCard[];
  labels: {
    eyebrow: string;
    title: string;
  };
};

export function GameGridSection({
  locale,
  games,
  labels,
}: GameGridSectionProps) {
  return (
    <section className="panel-section" id="game-matrix">
      <div className="section-heading">
        <SectionEyebrow label={labels.eyebrow} />
        <h2>{labels.title}</h2>
      </div>

      <div className="game-grid">
        {games.map((game, index) => {
          const href = getLocalizedPath(locale, `/games/${game.slug}`);
          return (
            <Link
              key={game.slug}
              href={href}
              className={`game-card-link ${index === 0 ? "game-card-link--featured" : ""}`}
              aria-label={`${game.title} — open`}
            >
              <article
                className={`game-card ${index === 0 ? "game-card-featured" : ""}`}
              >
                <div className="game-card-topline">
                  <span>#{String(index + 1).padStart(2, "0")}</span>
                  <span>{game.status}</span>
                </div>
                <div
                  className={`game-card-art ${game.coverImage ? "game-card-art--cover" : ""}`}
                >
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={game.coverImageAlt ?? game.title}
                      className="game-card-cover-image"
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span>ART SLOT</span>
                  )}
                </div>
                <div className="game-card-copy">
                  <h3>{game.title}</h3>
                  <p>{game.summary}</p>
                  <div className="game-card-meta">
                    <span>{game.genre}</span>
                    <span>{game.platform}</span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
