import { useState, useRef, useEffect } from "react";
import Label          from "./ui/Label";
import Select         from "./ui/Select";
import SkillsSelector from "./ui/SkillsSelector";
import { COUNTRIES, SCHEDULE_TYPES } from "../constants/filters";
import { inputStyle } from "../styles/theme";

// Searchable country dropdown component
function CountrySelect({ value, onChange }) {
  const [search, setSearch]   = useState(value || "");
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        if (!value) setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [value]);

  const filtered = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50); // max 50 results at a time

  const handleSelect = (country) => {
    onChange(country);
    setSearch(country);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 20 }}>
      <input
        placeholder="Search country..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          if (e.target.value === "") onChange("");
        }}
        onFocus={() => { setOpen(true); setFocused(true); }}
        style={{
          ...inputStyle,
          borderColor: focused ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.1)",
        }}
      />
      {/* Selected indicator */}
      {value && (
        <span style={{
          position: "absolute", right: 10, top: "50%",
          transform: "translateY(-50%)",
          fontSize: 11, color: "#a78bfa",
        }}>✓</span>
      )}
      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#1e1b3a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10, zIndex: 100,
          maxHeight: 200, overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {filtered.map((country) => (
            <div
              key={country}
              onMouseDown={() => handleSelect(country)}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                cursor: "pointer",
                color: country === value ? "#a78bfa" : "#ccc",
                background: country === value ? "rgba(167,139,250,0.1)" : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={(e) => e.target.style.background = country === value ? "rgba(167,139,250,0.1)" : "transparent"}
            >
              {country}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

      {/* Posted Via — free text input */}
      <Label text="Posted Via" />
      <input
        placeholder="e.g. LinkedIn, Indeed, Glassdoor..."
        value={form.jobVia}
        onChange={(e) => updateField("jobVia", e.target.value)}
        style={{ ...inputStyle, marginBottom: 20 }}
      />

      {/* Country — searchable dropdown */}
      <Label text="Country" />
      <CountrySelect
        value={form.country}
        onChange={(v) => updateField("country", v)}
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
          { field: "noDegree",        label: "🎓 No Degree Required" },
          { field: "healthInsurance", label: "🏥 Health Insurance"   },
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

      {/* Skills Selector */}
      <Label text="Your Skills" />
      <SkillsSelector
        selectedSkills={form.skills}
        onToggle={toggleSkill}
      />

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