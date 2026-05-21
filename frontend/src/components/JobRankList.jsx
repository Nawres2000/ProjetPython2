import { JOB_COLORS } from "../constants/jobs";

const T = {
  white:      "#ffffff",
  warm:       "#f5f3ef",
  border:     "#e2ddd6",
  border2:    "#ccc7bf",
  ink:        "#1a1814",
  ink70:      "rgba(26,24,20,0.78)",
  ink45:      "rgba(26,24,20,0.58)",
  ink25:      "rgba(26,24,20,0.38)",
  accent:     "#c8490a",
  accentLight:"#fff3ee",
  accentRule: "#fbd0b8",
  sans:       "'DM Sans', system-ui, sans-serif",
  mono:       "'DM Mono', monospace",
};

export default function JobRankList({ results }) {
  if (!results) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {results.slice(1).map((r, i) => (
        <div
          key={r.job}
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "11px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.18s",
            cursor: "default",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = T.border2;
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
            e.currentTarget.style.transform = "translateX(3px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = T.border;
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Rank number */}
            <span style={{
              fontFamily: T.mono, fontSize: 10.5,
              color: T.ink25, letterSpacing: "0.06em",
              minWidth: 20,
            }}>
              #{i + 2}
            </span>

            {/* Color dot */}
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: JOB_COLORS[r.job] || T.ink25,
              flexShrink: 0,
            }} />

            {/* Job title */}
            <span style={{
              fontSize: 13.5, fontFamily: T.sans,
              fontWeight: 400, color: T.ink70,
            }}>
              {r.job}
            </span>
          </div>

          {/* Score */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Progress bar */}
            <div style={{
              width: 64, height: 3, borderRadius: 2,
              background: T.warm, overflow: "hidden",
            }}>
              <div style={{
                width: `${r.score}%`, height: "100%",
                background: JOB_COLORS[r.job] || T.ink25,
                borderRadius: 2,
                opacity: 0.7,
              }} />
            </div>

            <span style={{
              fontFamily: T.mono, fontSize: 12,
              color: T.ink45, letterSpacing: "0.04em",
              minWidth: 34, textAlign: "right",
            }}>
              {r.score}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}