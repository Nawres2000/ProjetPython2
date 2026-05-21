import { useState, useRef, useEffect } from "react";
import Label          from "./ui/Label";
import Select         from "./ui/Select";
import SkillsSelector from "./ui/SkillsSelector";
import { COUNTRIES, SCHEDULE_TYPES } from "../constants/filters";

/* ─── SkillPath design tokens (inline — mirrors HomePage CSS vars) ──────── */
const T = {
  white:   "#ffffff",
  paper:   "#fafaf9",
  warm:    "#f5f3ef",
  warm2:   "#ede9e1",
  border:  "#e2ddd6",
  border2: "#ccc7bf",
  ink:     "#1a1814",
  ink70:   "rgba(26,24,20,0.78)",
  ink45:   "rgba(26,24,20,0.58)",
  ink25:   "rgba(26,24,20,0.38)",
  ink10:   "rgba(26,24,20,0.08)",
  accent:      "#c8490a",
  accentLight: "#fff3ee",
  accentRule:  "#fbd0b8",
  accentDark:  "#9a3208",
  sans:  "'DM Sans', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono:  "'DM Mono', monospace",
};

/* ─── Shared input style ────────────────────────────────────────────────── */
const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: `1.5px solid ${T.border}`,
  background: T.warm,
  color: T.ink,
  fontSize: 14,
  fontFamily: T.sans,
  fontWeight: 400,
  outline: "none",
  transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s",
  boxSizing: "border-box",
};

/* ─── CountrySelect ─────────────────────────────────────────────────────── */
function CountrySelect({ value, onChange }) {
  const [search,  setSearch]  = useState(value || "");
  const [open,    setOpen]    = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

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

  const filtered = COUNTRIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50);

  const handleSelect = country => {
    onChange(country);
    setSearch(country);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 20 }}>
      <div style={{ position: "relative" }}>
        <input
          placeholder="Search country…"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); if (!e.target.value) onChange(""); }}
          onFocus={() => { setOpen(true); setFocused(true); }}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            borderColor: focused ? T.accent : T.border,
            background:  focused ? T.white : T.warm,
            boxShadow:   focused ? `0 0 0 3px ${T.accentLight}` : "none",
          }}
        />
        {value && (
          <span style={{
            position: "absolute", right: 11, top: "50%",
            transform: "translateY(-50%)",
            fontFamily: T.mono, fontSize: 11,
            color: T.accent, letterSpacing: "0.05em",
          }}>✓</span>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: T.white,
          border: `1.5px solid ${T.border}`,
          borderRadius: 8, zIndex: 100,
          maxHeight: 200, overflowY: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.04)",
        }}>
          {filtered.map(country => (
            <div
              key={country}
              onMouseDown={() => handleSelect(country)}
              style={{
                padding: "10px 14px",
                fontSize: 13.5,
                fontFamily: T.sans,
                cursor: "pointer",
                color: country === value ? T.accent : T.ink70,
                background: country === value ? T.accentLight : "transparent",
                borderLeft: `3px solid ${country === value ? T.accent : "transparent"}`,
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.warm; e.currentTarget.style.color = T.ink; }}
              onMouseLeave={e => { e.currentTarget.style.background = country === value ? T.accentLight : "transparent"; e.currentTarget.style.color = country === value ? T.accent : T.ink70; }}
            >
              {country}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── FieldLabel (matches SkillPath "field-label" class) ───────────────── */
function FieldLabel({ text }) {
  return (
    <div style={{
      fontFamily: T.mono, fontSize: 10.5,
      letterSpacing: "0.1em", textTransform: "uppercase",
      color: T.ink25, marginBottom: 10,
      fontWeight: 500,
    }}>{text}</div>
  );
}

/* ─── FocusableInput ────────────────────────────────────────────────────── */
function FocusableInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        marginBottom: 20,
        borderColor: focused ? T.accent : T.border,
        background:  focused ? T.white  : T.warm,
        boxShadow:   focused ? `0 0 0 3px ${T.accentLight}` : "none",
      }}
    />
  );
}

/* ─── InputPanel ────────────────────────────────────────────────────────── */
export default function InputPanel({ form, updateField, toggleSkill, onPredict, loading }) {
  return (
    <div style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.04)",
      position: "relative",
    }}>
      {/* Accent top bar */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${T.accent}, #1d4ed8)`,
      }} />

      <div style={{
        padding: 32,
        overflowY: "auto",
        maxHeight: "calc(85vh - 3px)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 24, height: 2, background: T.accent, borderRadius: 1, display: "inline-block" }} />
            <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.accent, fontWeight: 500 }}>
              Profile Setup
            </span>
          </div>
          <h2 style={{
            margin: 0, fontFamily: T.serif,
            fontSize: 22, fontWeight: 400,
            color: T.ink, letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}>
            Configure your <em style={{ fontStyle: "italic", color: T.accent }}>profile.</em>
          </h2>
        </div>

        {/* Posted Via */}
        <FieldLabel text="Posted Via" />
        <FocusableInput
          placeholder="e.g. LinkedIn, Indeed, Glassdoor…"
          value={form.jobVia}
          onChange={e => updateField("jobVia", e.target.value)}
        />

        {/* Country */}
        <FieldLabel text="Country" />
        <CountrySelect value={form.country} onChange={v => updateField("country", v)} />

        {/* Schedule */}
        <FieldLabel text="Schedule Type" />
        <div style={{ marginBottom: 20 }}>
          <Select
            value={form.schedule}
            onChange={v => updateField("schedule", v)}
            options={SCHEDULE_TYPES}
            placeholder="Select schedule…"
          />
        </div>

        {/* Work Preference */}
        <FieldLabel text="Work Preference" />
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["Remote", "On-site"].map(opt => {
            const active = (opt === "Remote") === form.workFromHome;
            return (
              <button
                key={opt}
                onClick={() => updateField("workFromHome", opt === "Remote")}
                style={{
                  flex: 1, padding: "10px 14px",
                  borderRadius: 8, cursor: "pointer",
                  fontSize: 13.5, fontFamily: T.sans, fontWeight: active ? 500 : 400,
                  border: `1.5px solid ${active ? T.accentRule : T.border}`,
                  background: active ? T.accentLight : T.warm,
                  color: active ? T.accent : T.ink70,
                  transition: "all 0.18s",
                }}
              >
                {opt === "Remote" ? "🏠 Remote" : "🏢 On-site"}
              </button>
            );
          })}
        </div>

        {/* Job Benefits */}
        <FieldLabel text="Job Benefits" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {[
            { field: "noDegree",        label: "No Degree Required" },
            { field: "healthInsurance", label: "Health Insurance"   },
          ].map(({ field, label }) => {
            const checked = form[field];
            return (
              <label
                key={field}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: "pointer", padding: "9px 13px",
                  borderRadius: 8, border: `1.5px solid ${checked ? T.accentRule : T.border}`,
                  background: checked ? T.accentLight : T.warm,
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => updateField(field, e.target.checked)}
                  style={{ accentColor: T.accent, width: 15, height: 15, cursor: "pointer" }}
                />
                <span style={{
                  fontSize: 13.5, fontFamily: T.sans,
                  color: checked ? T.accent : T.ink70,
                  fontWeight: checked ? 500 : 400,
                  transition: "color 0.15s",
                }}>{label}</span>
              </label>
            );
          })}
        </div>

        {/* Skills */}
        <FieldLabel text="Your Skills" />
        <div style={{ marginBottom: 24 }}>
          <SkillsSelector
            selectedSkills={form.skills}
            onToggle={toggleSkill}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.border, marginBottom: 24 }} />

        {/* Predict Button */}
        <button
          onClick={onPredict}
          disabled={loading}
          style={{
            width: "100%", padding: "13px",
            borderRadius: 8,
            background: loading ? T.warm : T.ink,
            border: `2px solid ${loading ? T.border : T.ink}`,
            color: loading ? T.ink45 : "#fff",
            fontFamily: T.sans, fontWeight: 500,
            fontSize: 14, letterSpacing: "0.01em",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = T.accent; e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.boxShadow = "0 6px 20px rgba(200,73,10,0.3)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = loading ? T.warm : T.ink; e.currentTarget.style.borderColor = loading ? T.border : T.ink; e.currentTarget.style.boxShadow = "none"; }}
        >
          {loading ? (
            <>
              <span style={{
                width: 14, height: 14, borderRadius: "50%",
                border: `1.5px solid ${T.border}`,
                borderTopColor: T.accent,
                display: "inline-block",
                animation: "sp-spin 0.75s linear infinite",
              }} />
              Predicting…
            </>
          ) : (
            <>
              Predict top jobs
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: "transform 0.2s" }}>
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
          <style>{`@keyframes sp-spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>
    </div>
  );
}