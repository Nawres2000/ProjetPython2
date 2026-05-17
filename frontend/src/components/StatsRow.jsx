import { STATS } from "../constants/stats";

const CSS = `
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid #e2ddd6;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 36px;
    background: #e2ddd6; /* acts as gap color between cells */
  }

  .stats-cell {
    background: #ffffff;
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background 0.15s;
    position: relative;
  }
  .stats-cell:hover { background: #f5f3ef; }

  /* Top accent line on first cell only — matches the card stripe pattern */
  .stats-cell:first-child::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #c8490a, #0d6e64);
  }

  .stats-value {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 30px;
    font-weight: 700;
    color: #1a1814;
    line-height: 1;
  }

  .stats-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(26,24,20,0.4);
  }

  @media (max-width: 600px) {
    .stats-row { grid-template-columns: repeat(2, 1fr); }
  }
`;

export default function StatsRow() {
  return (
    <>
      <style>{CSS}</style>
      <div className="stats-row">
        {STATS.map((s) => (
          <div key={s.label} className="stats-cell">
            <div className="stats-value">{s.value}</div>
            <div className="stats-label">{s.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}