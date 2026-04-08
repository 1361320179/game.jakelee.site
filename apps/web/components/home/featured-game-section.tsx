import type { FeaturedGame } from "@game/content";
import { ShellButton } from "@game/ui/shell-button";
import { SectionEyebrow } from "@game/ui/section-eyebrow";

type FeaturedGameSectionProps = {
  game: FeaturedGame;
};

export function FeaturedGameSection({ game }: FeaturedGameSectionProps) {
  return (
    <section className="panel-section" id="featured-game">
      <div className="section-heading">
        <SectionEyebrow label="Featured Game" />
        <h2>主推游戏位已预留，等你填入第一款核心作品。</h2>
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
            <ShellButton href={game.primaryCta.href} variant="primary">
              {game.primaryCta.label}
            </ShellButton>
            <ShellButton href={game.secondaryCta.href} variant="secondary">
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
