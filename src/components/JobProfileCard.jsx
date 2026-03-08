import { JOB_COLORS } from "../constants/jobs";

export default function JobProfileCard({ predictedLabel, salaryData, skillsGap, form }) {
  if (!predictedLabel || !salaryData) return null;

  const salary = salaryData[predictedLabel];
  const color  = JOB_COLORS[predictedLabel] || "#a78bfa";

  const jobEmojis = {
    "Data Engineer":     "⚙️",
    "Data Scientist":    "🔬",
    "Data Analyst":      "📊",
    "Business Analyst":  "💼",
    "Software Engineer": "💻",
    "Cloud Engineer":    "☁️",
    "ML Engineer":       "🤖",
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}22, ${color}11)`,
      border: `1px solid ${color}44`,
      borderRadius: 18,
      padding: 24,
      marginTop: 20,
    }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
        }}>
          {jobEmojis[predictedLabel] || "🎯"}
        </div>
        <div>
          <div style={{ fontSize: 11, color, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>
            🏆 Best Match Role
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0" }}>
            {predictedLabel}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>

        {/* Salary */}
        {salary && (
          <div style={statCardStyle}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>💰 Avg Salary</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#6ee7b7" }}>
              ${(salary.year_avg / 1000).toFixed(0)}K
            </div>
            <div style={{ fontSize: 10, color: "#666" }}>per year</div>
          </div>
        )}

        {/* Hourly */}
        {salary && (
          <div style={statCardStyle}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>⏱️ Hourly Rate</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa" }}>
              ${salary.hour_avg}
            </div>
            <div style={{ fontSize: 10, color: "#666" }}>per hour</div>
          </div>
        )}

        {/* Skills match */}
        {skillsGap && (
          <div style={statCardStyle}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>🛠️ Skills Match</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>
              {skillsGap.match_score}%
            </div>
            <div style={{ fontSize: 10, color: "#666" }}>of required</div>
          </div>
        )}

        {/* Remote */}
        <div style={statCardStyle}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>🏠 Remote</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f4a24d" }}>
            {form.workFromHome ? "Yes" : "No"}
          </div>
          <div style={{ fontSize: 10, color: "#666" }}>preference</div>
        </div>

        {/* Degree */}
        <div style={statCardStyle}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>🎓 Degree</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: form.noDegree ? "#6ee7b7" : "#e87885" }}>
            {form.noDegree ? "Not req." : "Required"}
          </div>
          <div style={{ fontSize: 10, color: "#666" }}>for this role</div>
        </div>

        {/* Health */}
        <div style={statCardStyle}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>🏥 Insurance</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: form.healthInsurance ? "#6ee7b7" : "#e87885" }}>
            {form.healthInsurance ? "Included" : "Not incl."}
          </div>
          <div style={{ fontSize: 10, color: "#666" }}>health coverage</div>
        </div>
      </div>
    </div>
  );
}

const statCardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  padding: "12px 14px",
  textAlign: "center",
};