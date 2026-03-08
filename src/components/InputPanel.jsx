import Label      from "./ui/Label";
import Select     from "./ui/Select";
import SkillBadge from "./ui/SkillBadge";
import { COUNTRIES, SCHEDULE_TYPES, SKILLS, JOB_VIA_OPTIONS } from "../constants/filters";
import { inputStyle } from "../styles/theme";

export default function InputPanel({ form, updateField, toggleSkill, onPredict, loading }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 30,
      overflowY: "auto",
      maxHeight: "85vh",
    }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 17, fontWeight: 600, color: "#f0f0f0" }}>
        🔍 Configure Your Profile
      </h2>

      {/* Job Title — REQUIRED */}
      <Label text="Job Title *" />
      <input
        placeholder="e.g. Senior Data Engineer"
        value={form.jobTitle}
        onChange={(e) => updateField("jobTitle", e.target.value)}
        style={{ ...inputStyle, marginBottom: 20, border: "1px solid rgba(167,139,250,0.4)" }}
      />

      {/* Job Via */}
      <Label text="Posted Via" />
      <Select
        value={form.jobVia}
        onChange={(v) => updateField("jobVia", v)}
        options={JOB_VIA_OPTIONS}
        placeholder="Select platform..."
      />

      {/* Company */}
      <Label text="Company Name" />
      <input
        placeholder="e.g. Amazon, Google..."
        value={form.company}
        onChange={(e) => updateField("company", e.target.value)}
        style={{ ...inputStyle, marginBottom: 20 }}
      />

      {/* Country */}
      <Label text="Country" />
      <Select
        value={form.country}
        onChange={(v) => updateField("country", v)}
        options={COUNTRIES}
        placeholder="Select country..."
      />

      {/* Location */}
      <Label text="Job Location" />
      <input
        placeholder="e.g. New York, NY"
        value={form.location}
        onChange={(e) => updateField("location", e.target.value)}
        style={{ ...inputStyle, marginBottom: 20 }}
      />

      {/* Schedule */}
      <Label text="Schedule Type" />
      <Select
        value={form.schedule}
        onChange={(v) => updateField("schedule", v)}
        options={SCHEDULE_TYPES}
        placeholder="Select schedule..."
      />

      {/* Work Preference */}
      <Label text="Work Preference" />
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["Remote", "On-site"].map((opt) => {
          const active = (opt === "Remote") === form.workFromHome;
          return (
            <button key={opt}
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

      {/* Checkboxes */}
      <Label text="Job Benefits" />
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[
          { field: "noDegree",         label: "🎓 No Degree Required" },
          { field: "healthInsurance",  label: "🏥 Health Insurance"   },
        ].map(({ field, label }) => (
          <label key={field} style={{
            display: "flex", alignItems: "center", gap: 8,
            cursor: "pointer", fontSize: 13, color: "#ccc",
          }}>
            <input
              type="checkbox"
              checked={form[field]}
              onChange={(e) => updateField(field, e.target.checked)}
              style={{ accentColor: "#a78bfa", width: 16, height: 16 }}
            />
            {label}
          </label>
        ))}
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
          fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: 0.5,
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