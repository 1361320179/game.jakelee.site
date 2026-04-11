import React from "react";

interface DashMeterProps {
  progress: number;
}

export const DashMeter: React.FC<DashMeterProps> = ({ progress }) => {
  const clamped = Math.min(1, Math.max(0, progress));
  const isReady = clamped >= 1;
  const widthPct = isReady ? 100 : clamped * 100;

  return (
    <div className={`dash-meter ${isReady ? "is-ready" : ""}`}>
      <div className="dash-meter-head">
        <span className="dash-icon" aria-hidden>
          ⚡
        </span>
        <span className="dash-label">冲刺能量</span>
      </div>
      <div className="dash-track" role="progressbar" aria-valuenow={Math.round(widthPct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="dash-fill" style={{ width: `${widthPct}%` }} />
        <div className="dash-sparkles" aria-hidden>
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>
      </div>
    </div>
  );
};
