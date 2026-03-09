import { useState, useMemo } from "react";
import { SKILLS_BY_CATEGORY, CATEGORY_ICONS, CATEGORY_COLORS } from "../../constants/filters";

export default function SkillsSelector({ selectedSkills, onToggle }) {
  const [activeCategory, setActiveCategory] = useState("PROGRAMMING");
  const [search, setSearch] = useState("");

  const categories = Object.keys(SKILLS_BY_CATEGORY);

  const filteredSkills = useMemo(() => {
    if (search.trim() === "") return SKILLS_BY_CATEGORY[activeCategory];
    const q = search.toLowerCase();
    // Search across ALL categories
    return Object.values(SKILLS_BY_CATEGORY)
      .flat()
      .filter((s) => s.includes(q))
      .filter((s, i, arr) => arr.indexOf(s) === i); // deduplicate
  }, [search, activeCategory]);

  const color = CATEGORY_COLORS[activeCategory] || "#a78bfa";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    }}>

      {/* Search bar */}
      <input
        placeholder="🔍 Search skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#f0f0f0",
          fontSize: 12,
          outline: "none",
          marginBottom: 12,
          boxSizing: "border-box",
        }}
      />

      {/* Category tabs — only show when not searching */}
      {search.trim() === "" && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 12,
        }}>
          {categories.map((cat) => {
            const active = cat === activeCategory;
            const catColor = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: active ? catColor : "rgba(255,255,255,0.08)",
                  background: active ? `${catColor}22` : "transparent",
                  color: active ? catColor : "#666",
                  fontWeight: active ? 700 : 400,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {CATEGORY_ICONS[cat]} {cat}
                <span style={{
                  marginLeft: 4, fontSize: 10,
                  color: active ? catColor : "#444",
                }}>
                  {SKILLS_BY_CATEGORY[cat].length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected count */}
      {selectedSkills.length > 0 && (
        <div style={{
          fontSize: 11, color: "#a78bfa", marginBottom: 8, fontWeight: 600,
        }}>
          ✅ {selectedSkills.length} skill{selectedSkills.length > 1 ? "s" : ""} selected
        </div>
      )}

      {/* Skills grid */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        maxHeight: 180,
        overflowY: "auto",
        paddingRight: 4,
      }}>
        {filteredSkills.length === 0 && (
          <div style={{ fontSize: 12, color: "#555", padding: "8px 0" }}>
            No skills found for "{search}"
          </div>
        )}
        {filteredSkills.map((skill) => {
          const selected = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              onClick={() => onToggle(skill)}
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11,
                cursor: "pointer",
                border: "1px solid",
                borderColor: selected ? color : "rgba(255,255,255,0.08)",
                background: selected ? `${color}22` : "transparent",
                color: selected ? color : "#888",
                transition: "all 0.15s",
                fontWeight: selected ? 600 : 400,
              }}
            >
              {selected ? "✓ " : ""}{skill}
            </button>
          );
        })}
      </div>

      {/* Selected pills preview */}
      {selectedSkills.length > 0 && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>
            Selected:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                onClick={() => onToggle(skill)}
                style={{
                  padding: "3px 8px",
                  borderRadius: 20,
                  fontSize: 10,
                  background: "rgba(167,139,250,0.2)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  color: "#a78bfa",
                  cursor: "pointer",
                }}
              >
                {skill} ✕
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}