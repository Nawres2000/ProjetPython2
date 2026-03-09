import { STATS } from "../constants/stats";

export default function StatsRow() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      marginBottom: 36,
    }}>
      {STATS.map((s) => (
        <div key={s.label} style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "20px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#a78bfa" }}>
            {s.value}
          </div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}