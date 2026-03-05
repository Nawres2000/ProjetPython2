import { glassButton } from "../styles/theme";

export default function Header() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "20px 40px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}>
      {/* Logo */}
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22,
      }}>
        🧠
      </div>

      {/* Title */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 0.5, color: "#f0f0f0" }}>
          JobSense AI
        </div>
        <div style={{ fontSize: 12, color: "#aaa" }}>
          ML-Powered Job Demand Predictor
        </div>
      </div>

      {/* Nav */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {["Model", "Docs", "About"].map((tab) => (
          <button key={tab} style={glassButton}>{tab}</button>
        ))}
      </div>
    </div>
  );
}