import { useState }  from "react";
import Header        from "./components/Header";
import StatsRow      from "./components/StatsRow";
import InputPanel    from "./components/InputPanel";
import ResultsPanel  from "./components/ResultsPanel";
import CVAnalyzer    from "./components/CVAnalyzer";
import { usePredictor } from "./hooks/usePredictor";
import { colors }    from "./styles/theme";

export default function App() {
  const [activeTab, setActiveTab] = useState("predictor");

  const {
    form, results, predictedLabel, loading, error, backendOk,
    updateField, toggleSkill, handlePredict,
  } = usePredictor();

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      fontFamily: "'Segoe UI', sans-serif",
      color: colors.text,
      paddingBottom: 60,
    }}>
      <Header backendOk={backendOk} />

      {/* Tab switcher */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "24px 24px 0",
      }}>
        <div style={{
          display: "inline-flex",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, padding: 4, gap: 4,
          marginBottom: 32,
        }}>
          {[
            { key: "predictor", label: "⚡ Job Predictor" },
            { key: "cv",        label: "📄 CV Analyzer"   },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 24px", borderRadius: 8,
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                background: activeTab === tab.key
                  ? "linear-gradient(135deg, #667eea, #764ba2)"
                  : "transparent",
                color: activeTab === tab.key ? "#fff" : "#888",
                transition: "all 0.2s",
                boxShadow: activeTab === tab.key
                  ? "0 2px 12px rgba(102,126,234,0.4)"
                  : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "predictor" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <StatsRow />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <InputPanel
              form={form}
              updateField={updateField}
              toggleSkill={toggleSkill}
              onPredict={handlePredict}
              loading={loading}
            />
            <ResultsPanel
              results={results}
              predictedLabel={predictedLabel}
              loading={loading}
              error={error}
              form={form}
            />
          </div>
        </div>
      )}

      {activeTab === "cv" && <CVAnalyzer />}
    </div>
  );
}
