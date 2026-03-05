export default function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        marginBottom: 20,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "10px 14px",
        color: value ? "#f0f0f0" : "#666",
        fontSize: 13,
        outline: "none",
        cursor: "pointer",
      }}
    >
      <option value="" disabled style={{ background: "#1a1a2e" }}>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#1a1a2e" }}>
          {o}
        </option>
      ))}
    </select>
  );
}