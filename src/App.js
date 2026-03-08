import Header       from "./components/Header";
import StatsRow     from "./components/StatsRow";
import InputPanel   from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import { usePredictor } from "./hooks/usePredictor";
import { colors }   from "./styles/theme";

export default function App() {
  const {
    form, results, predictedLabel, salaryData, skillsGap,
    loading, error, backendOk,
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
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <StatsRow />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
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
            salaryData={salaryData}
            skillsGap={skillsGap}
            loading={loading}
            error={error}
            form={form}
          />
        </div>
      </div>
    </div>
  );
}