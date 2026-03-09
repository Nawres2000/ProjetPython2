import { JOB_COLORS } from "../constants/jobs";

export default function TopResultCard({ result, form }) {
  if (!result) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))",
      border: "1px solid rgba(167,139,250,0.3)",
      borderRadius: 18,
      padding: "24px 28px",
      display: "flex",
      alignItems: "center",
      gap: 20,
    }}>
      <div style={{ fontSize: 48 }}>🏆</div>
      <div>
        <div style={{
          fontSize: 12, color: "#a78bfa", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: 1,
        }}>
          Top Predicted Role
        </div>
        <div style={{
          fontSize: 24, fontWeight: 700, margin: "4px 0", color: "#f0f0f0",
          borderLeft: `4px solid ${JOB_COLORS[result.job] || "#a78bfa"}`,
          paddingLeft: 10,
        }}>
          {result.job}
        </div>
        <div style={{ fontSize: 13, color: "#aaa" }}>
          Confidence:{" "}
          <span style={{ color: "#6ee7b7", fontWeight: 600 }}>{result.score}%</span>
          {form.country && ` · ${form.country}`}
          {" · "}{form.workFromHome ? "🏠 Remote" : "🏢 On-site"}
        </div>
      </div>
    </div>
  );
}