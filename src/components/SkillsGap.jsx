export default function SkillsGap({ skillsGap }) {
  if (!skillsGap) return null;

  const { match_score, matched_skills, missing_skills, predicted_role } = skillsGap;

  const scoreColor = match_score >= 70 ? "#6ee7b7"
                   : match_score >= 40 ? "#f4a24d"
                   : "#e87885";

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 24,
      marginTop: 20,
    }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#f0f0f0" }}>
        🛠️ Skills Gap Analyzer
      </h3>

      {/* Match Score */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#aaa" }}>
            Match for <span style={{ color: "#a78bfa", fontWeight: 600 }}>{predicted_role}</span>
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor }}>
            {match_score}%
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          width: "100%", height: 10, background: "rgba(255,255,255,0.08)",
          borderRadius: 10, overflow: "hidden",
        }}>
          <div style={{
            width: `${match_score}%`, height: "100%",
            background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`,
            borderRadius: 10,
            transition: "width 0.8s ease",
          }} />
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Matched */}
        <div>
          <div style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
            ✅ You Have ({matched_skills.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {matched_skills.length > 0 ? matched_skills.map((s) => (
              <span key={s} style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 11,
                background: "rgba(110,231,183,0.15)",
                border: "1px solid rgba(110,231,183,0.3)",
                color: "#6ee7b7",
              }}>
                {s}
              </span>
            )) : (
              <span style={{ fontSize: 12, color: "#555" }}>No matches yet</span>
            )}
          </div>
        </div>

        {/* Missing */}
        <div>
          <div style={{ fontSize: 12, color: "#e87885", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
            ❌ You Need ({missing_skills.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {missing_skills.length > 0 ? missing_skills.map((s) => (
              <span key={s} style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 11,
                background: "rgba(232,120,133,0.15)",
                border: "1px solid rgba(232,120,133,0.3)",
                color: "#e87885",
              }}>
                {s}
              </span>
            )) : (
              <span style={{ fontSize: 12, color: "#6ee7b7" }}>You have all skills! 🎉</span>
            )}
          </div>
        </div>
      </div>

      {/* Tip */}
      {missing_skills.length > 0 && (
        <div style={{
          marginTop: 16, padding: "10px 14px",
          background: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: 10, fontSize: 12, color: "#aaa",
        }}>
          💡 Learn <span style={{ color: "#a78bfa", fontWeight: 600 }}>{missing_skills[0]}</span> first
          — it's the most in-demand missing skill for {predicted_role}s.
        </div>
      )}
    </div>
  );
}