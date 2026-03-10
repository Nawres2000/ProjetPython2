import { JOB_COLORS } from "../constants/jobs";

export default function JobRankList({ results }) {
  if (!results) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {results.slice(1).map((r, i) => (
        <div key={r.job} style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: JOB_COLORS[r.job] || "#888",
            }} />
            <span style={{ fontSize: 14, color: "#f0f0f0" }}>
              #{i + 2} {r.job}
            </span>
          </div>
          <span style={{ color: "#aaa", fontSize: 13 }}>{r.score}%</span>
        </div>
      ))}
    </div>
  );
}