export default function SkillBadge({ skill, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(skill)}
      style={{
        padding: "6px 14px",
        borderRadius: 20,
        fontSize: 12,
        cursor: "pointer",
        border: "1px solid",
        borderColor: selected ? "#60a5fa" : "rgba(255,255,255,0.1)",
        background: selected ? "rgba(96,165,250,0.15)" : "transparent",
        color: selected ? "#60a5fa" : "#aaa",
        transition: "all 0.2s",
      }}
    >
      {selected ? "✓ " : ""}{skill}
    </button>
  );
}