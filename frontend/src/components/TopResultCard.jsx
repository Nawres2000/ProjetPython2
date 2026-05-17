import { JOB_COLORS } from "../constants/jobs";

const CSS = `
  .trc {
    background: #1a1814;
    border-radius: 16px;
    padding: 28px;
    display: flex;
    align-items: flex-start;
    gap: 20px;
    position: relative;
    overflow: hidden;
  }

  /* Decorative circle watermark */
  .trc::after {
    content: '';
    position: absolute;
    bottom: -48px; right: -48px;
    width: 160px; height: 160px;
    border-radius: 50%;
    border: 28px solid rgba(255,255,255,0.04);
    pointer-events: none;
  }

  .trc-emoji {
    font-size: 36px;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .trc-body { flex: 1; min-width: 0; }

  .trc-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 8px;
  }

  .trc-role {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 28px;
    font-weight: 400;
    font-style: italic;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 14px;
  }

  .trc-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .trc-score {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px;
    border-radius: 100px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: rgba(255,255,255,0.7);
  }
  .trc-score-value {
    color: #fff;
    font-weight: 500;
  }

  .trc-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px;
    border-radius: 100px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 12px;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: rgba(255,255,255,0.5);
  }
`;

export default function TopResultCard({ result, form }) {
  if (!result) return null;

  const accentColor = JOB_COLORS?.[result.job] || "#c8490a";

  return (
    <>
      <style>{CSS}</style>
      <div className="trc">
        {/* Left accent bar using job color */}
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: 4,
          background: accentColor,
          borderRadius: "16px 0 0 16px",
        }} />

        <div className="trc-emoji">🏆</div>

        <div className="trc-body">
          <div className="trc-eyebrow">Top Predicted Role</div>

          <div className="trc-role">{result.job}</div>

          <div className="trc-meta">
            <span className="trc-score">
              Confidence&nbsp;
              <span className="trc-score-value">{result.score}%</span>
            </span>

            {form.country && (
              <span className="trc-pill">📍 {form.country}</span>
            )}

            <span className="trc-pill">
              {form.workFromHome ? "🏠 Remote" : "🏢 On-site"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}