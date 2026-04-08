import type { DevlogEntry } from "@game/content";
import { SectionEyebrow } from "@game/ui/section-eyebrow";

type DevlogSectionProps = {
  entries: DevlogEntry[];
};

export function DevlogSection({ entries }: DevlogSectionProps) {
  return (
    <section className="panel-section" id="devlog">
      <div className="section-heading">
        <SectionEyebrow label="Devlog" />
        <h2>开发日志区域先保留成终端记录板，后续直接接你的内容。</h2>
      </div>

      <div className="devlog-board">
        <div className="devlog-rail" aria-hidden="true" />
        <div className="devlog-list">
          {entries.map((entry) => (
            <article key={entry.slug} className="devlog-card">
              <div className="devlog-meta">
                <span>{entry.date}</span>
                <span>{entry.version}</span>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
