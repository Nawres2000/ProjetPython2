import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { JOB_COLORS }    from "../constants/jobs";
import { cardStyle }      from "../styles/theme";
import JobProfileCard     from "./JobProfileCard";
import SalaryChart        from "./SalaryChart";
import SkillsGap          from "./SkillsGap";

export default function ResultsPanel({ results, predictedLabel, salaryData, skillsGap, loading, error, form }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", maxHeight: "85vh" }}>

      {/* Prediction Chart */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 600, color: "#f0f0f0" }}>
          📊 Predicted Job Demand
        </h2>

        {!results && !loading && !error && (
          <div style={{
            height: 220, display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column",
            color: "#555", gap: 10,
          }}>
            <div style={{ fontSize: 48 }}>🎯</div>
            <div style={{ fontSize: 14 }}>Configure your profile and click Predict</div>
          </div>
        )}

        {loading && (
          <div style={{
            height: 220, display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column",
            gap: 12, color: "#a78bfa",
          }}>
            <div style={{ fontSize: 36 }}>⚙️</div>
            <div style={{ fontSize: 14 }}>Analyzing your profile...</div>
          </div>
        )}

        {error && (
          <div style={{
            height: 220, display: "flex", alignItems: "center",
            justifyContent: "center", color: "#e87885", fontSize: 14,
          }}>
            ⚠️ {error}
          </div>
        )}

        {results && (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={results} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[0, 100]}
                tick={{ fill: "#888", fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis type="category" dataKey="job"
                tick={{ fill: "#ccc", fontSize: 12 }} width={120}
              />
              <Tooltip
                contentStyle={{ background: "#1e1b3a", border: "1px solid #444", borderRadius: 8 }}
                formatter={(v) => [`${v}%`, "Confidence"]}
              />
              <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                {results.map((entry) => (
                  <Cell key={entry.job} fill={JOB_COLORS[entry.job] || "#888"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Job Profile Card */}
      {results && (
        <JobProfileCard
          predictedLabel={predictedLabel}
          salaryData={salaryData}
          skillsGap={skillsGap}
          form={form}
        />
      )}

      {/* Salary Chart */}
      {results && (
        <SalaryChart
          salaryData={salaryData}
          predictedLabel={predictedLabel}
        />
      )}

      {/* Skills Gap */}
      {results && (
        <SkillsGap skillsGap={skillsGap} />
      )}
    </div>
  );
}