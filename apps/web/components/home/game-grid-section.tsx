import type { GameCard } from "@game/content";
import { SectionEyebrow } from "@game/ui/section-eyebrow";

type GameGridSectionProps = {
  games: GameCard[];
  labels: {
    eyebrow: string;
    title: string;
  };
};

export function GameGridSection({ games, labels }: GameGridSectionProps) {
  return (
    <section className="panel-section" id="game-matrix">
      <div className="section-heading">
        <SectionEyebrow label={labels.eyebrow} />
        <h2>{labels.title}</h2>
      </div>

      <div className="game-grid">
        {games.map((game, index) => (
          <article
            key={game.slug}
            className={`game-card ${index === 0 ? "game-card-featured" : ""}`}
          >
            <div className="game-card-topline">
              <span>#{String(index + 1).padStart(2, "0")}</span>
              <span>{game.status}</span>
            </div>
            <div className="game-card-art">
              <span>ART SLOT</span>
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
        ))}
      </div>
    </section>
  );
}
