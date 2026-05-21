import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { JOB_COLORS } from "../constants/jobs";
import TopResultCard  from "./TopResultCard";
import JobRankList    from "./JobRankList";

const T = {
  white:       "#ffffff",
  paper:       "#fafaf9",
  warm:        "#f5f3ef",
  warm2:       "#ede9e1",
  border:      "#e2ddd6",
  border2:     "#ccc7bf",
  ink:         "#1a1814",
  ink70:       "rgba(26,24,20,0.78)",
  ink45:       "rgba(26,24,20,0.58)",
  ink25:       "rgba(26,24,20,0.38)",
  ink10:       "rgba(26,24,20,0.08)",
  accent:      "#c8490a",
  accentLight: "#fff3ee",
  accentRule:  "#fbd0b8",
  blue:        "#1d4ed8",
  sans:        "'DM Sans', system-ui, sans-serif",
  serif:       "'Playfair Display', Georgia, serif",
  mono:        "'DM Mono', monospace",
};

function FieldLabel({ text }) {
  return (
    <div style={{
      fontFamily: T.mono, fontSize: 10.5,
      letterSpacing: "0.1em", textTransform: "uppercase",
      color: T.ink25, marginBottom: 14, fontWeight: 500,
    }}>{text}</div>
  );
}

/* Custom tooltip */
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { job, score } = payload[0].payload;
  const color = JOB_COLORS[job] || T.ink45;
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`,
      borderRadius: 8, padding: "9px 13px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      fontFamily: T.sans,
    }}>
      <div style={{ fontSize: 12.5, color: T.ink70, marginBottom: 3 }}>{job}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 500, color: T.ink }}>{score}%</span>
        <span style={{ fontSize: 11.5, color: T.ink45 }}>confidence</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({ results, predictedLabel, loading, error, form }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Chart card */}
      <div style={{
        background: T.white, border: `1px solid ${T.border}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${T.accent}, ${T.blue})` }} />
        <div style={{ padding: "24px 28px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 24, height: 2, background: T.accent, borderRadius: 1, display: "inline-block" }} />
              <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.accent, fontWeight: 500 }}>
                Analysis
              </span>
            </div>
          </div>
          <h2 style={{
            fontFamily: T.serif, fontWeight: 400, fontSize: 20,
            margin: "0 0 22px", color: T.ink, letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}>
            Predicted <em style={{ fontStyle: "italic", color: T.accent }}>job demand</em>
          </h2>

          {/* Empty state */}
          {!results && !loading && !error && (
            <div style={{
              height: 260, display: "flex", alignItems: "center",
              justifyContent: "center", flexDirection: "column", gap: 14,
              background: T.warm, borderRadius: 12, border: `1px solid ${T.border}`,
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: T.white, border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.serif, fontSize: 26, fontStyle: "italic", color: T.ink25,
              }}>?</div>
              <div style={{ fontSize: 13.5, color: T.ink25, fontWeight: 300, textAlign: "center" }}>
                Configure your profile and click Predict
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div style={{
              height: 260, display: "flex", alignItems: "center",
              justifyContent: "center", flexDirection: "column", gap: 14,
              background: T.warm, borderRadius: 12, border: `1px solid ${T.border}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `2px solid ${T.border}`, borderTopColor: T.accent,
                animation: "sp-spin 0.75s linear infinite",
              }} />
              <div style={{ fontFamily: T.mono, fontSize: 12, color: T.ink45, letterSpacing: "0.06em" }}>
                Running model inference…
              </div>
              <style>{`@keyframes sp-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{
              height: 260, display: "flex", alignItems: "center",
              justifyContent: "center", flexDirection: "column", gap: 12,
              background: "#fef2f2", borderRadius: 12, border: "1.5px solid #fca5a5",
              padding: "20px",
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#b91c1c" }}>❌ Prediction Error</div>
              <div style={{ 
                fontSize: 13, color: "#b91c1c", 
                lineHeight: 1.5, 
                whiteSpace: "pre-wrap", 
                wordBreak: "break-word",
                textAlign: "center",
                maxHeight: 120,
                overflowY: "auto"
              }}>
                {error}
              </div>
              <div style={{ fontSize: 11, color: "#991b1b", opacity: 0.8, marginTop: 8 }}>
                💡 Check console (F12 → Console) for debug info
              </div>
            </div>
          )}

          {/* Chart */}
          {results && (
            <>
              <FieldLabel text="Confidence by role" />
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={results} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={T.border}
                    horizontal={false}
                  />
                  <XAxis
                    type="number" domain={[0, 100]}
                    tick={{ fill: T.ink45, fontSize: 11, fontFamily: T.mono }}
                    tickFormatter={v => `${v}%`}
                    axisLine={{ stroke: T.border }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category" dataKey="job"
                    tick={{ fill: T.ink70, fontSize: 12, fontFamily: T.sans }}
                    width={130}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: T.warm }} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {results.map(entry => (
                      <Cell
                        key={entry.job}
                        fill={JOB_COLORS[entry.job] || T.ink25}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Top result */}
      {results && <TopResultCard result={results[0]} form={form} />}

      {/* Ranked list */}
      {results && <JobRankList results={results} />}
    </div>
  );
}