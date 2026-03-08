import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { JOB_COLORS } from "../constants/jobs";
import { useState } from "react";

export default function SalaryChart({ salaryData, predictedLabel }) {
  const [mode, setMode] = useState("year"); // "year" or "hour"

  if (!salaryData) return null;

  const chartData = Object.entries(salaryData).map(([job, vals]) => ({
    job: job.replace(" Engineer", " Eng.").replace("Business ", "Biz "),
    fullJob: job,
    value: mode === "year"
      ? Math.round(vals.year_avg / 1000)
      : vals.hour_avg,
  })).sort((a, b) => b.value - a.value);

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 24,
      marginTop: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f0f0f0" }}>
          💰 Salary Comparison
        </h3>
        {/* Toggle */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.05)",
          borderRadius: 8, padding: 3, gap: 3,
        }}>
          {["year", "hour"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "4px 12px", borderRadius: 6, border: "none",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: mode === m ? "rgba(167,139,250,0.3)" : "transparent",
              color: mode === m ? "#a78bfa" : "#888",
              transition: "all 0.2s",
            }}>
              {m === "year" ? "$/Year" : "$/Hour"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="job" tick={{ fill: "#888", fontSize: 10 }} />
          <YAxis
            tick={{ fill: "#888", fontSize: 11 }}
            tickFormatter={(v) => mode === "year" ? `$${v}K` : `$${v}`}
          />
          <Tooltip
            contentStyle={{ background: "#1e1b3a", border: "1px solid #444", borderRadius: 8 }}
            formatter={(v, name, props) => [
              mode === "year" ? `$${v}K/year` : `$${v}/hour`,
              props.payload.fullJob,
            ]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.fullJob}
                fill={JOB_COLORS[entry.fullJob] || "#888"}
                opacity={entry.fullJob === predictedLabel ? 1 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend note */}
      <div style={{ fontSize: 11, color: "#666", marginTop: 8, textAlign: "center" }}>
        Bright bar = your predicted role
      </div>
    </div>
  );
}