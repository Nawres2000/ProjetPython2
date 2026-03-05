import Label      from "./ui/Label";
import Select     from "./ui/Select";
import SkillBadge from "./ui/SkillBadge";
import { COUNTRIES, SCHEDULE_TYPES, SKILLS } from "../constants/filters";
import { inputStyle } from "../styles/theme";

export default function InputPanel({ form, updateField, toggleSkill, onPredict, loading }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 30,
    }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 17, fontWeight: 600, color: "#f0f0f0" }}>
        🔍 Configure Your Profile
      </h2>

      {/* Country */}
      <Label text="Country" />
      <Select
        value={form.country}
        onChange={(v) => updateField("country", v)}
        options={COUNTRIES}
        placeholder="Select country..."
      />

      {/* Schedule */}
      <Label text="Schedule Type" />
      <Select
        value={form.schedule}
        onChange={(v) => updateField("schedule", v)}
        options={SCHEDULE_TYPES}
        placeholder="Select schedule..."
      />

      {/* Salary */}
      <Label text="Expected Salary Range ($/year)" />
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Min (e.g. 60000)"
          value={form.salaryMin}
          onChange={(e) => updateField("salaryMin", e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Max (e.g. 120000)"
          value={form.salaryMax}
          onChange={(e) => updateField("salaryMax", e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Work Preference */}
      <Label text="Work Preference" />
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["Remote", "On-site"].map((opt) => {
          const active = (opt === "Remote") === form.workFromHome;
          return (
            <button
              key={opt}
              onClick={() => updateField("workFromHome", opt === "Remote")}
              style={{
                flex: 1, padding: "10px", borderRadius: 10,
                cursor: "pointer", fontSize: 13, border: "1px solid",
                borderColor: active ? "#a78bfa" : "rgba(255,255,255,0.1)",
                background: active ? "rgba(167,139,250,0.15)" : "transparent",
                color: active ? "#a78bfa" : "#ccc",
                transition: "all 0.2s",
              }}
            >
              {opt === "Remote" ? "🏠 Remote" : "🏢 On-site"}
            </button>
          );
        })}
      </div>

      {/* Skills */}
      <Label text="Your Skills" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
        {SKILLS.map((skill) => (
          <SkillBadge
            key={skill}
            skill={skill}
            selected={form.skills.includes(skill)}
            onToggle={toggleSkill}
          />
        ))}
      </div>

      {/* Predict Button */}
      <button
        onClick={onPredict}
        disabled={loading}
        style={{
          width: "100%", padding: "14px", borderRadius: 12,
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none", color: "#fff", fontWeight: 700,
          fontSize: 15, cursor: "pointer", letterSpacing: 0.5,
          boxShadow: "0 4px 20px rgba(102,126,234,0.4)",
          opacity: loading ? 0.7 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {loading ? "⏳ Predicting..." : "⚡ Predict Top Jobs"}
      </button>
    </div>
  );
}