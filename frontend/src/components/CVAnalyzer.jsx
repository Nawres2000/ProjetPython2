import { useState, useRef } from "react";

const WEBHOOK_URL = "http://localhost:5678/webhook-test/c9ef6c41-8ef7-443c-8b23-fc72c30a270d";

const JOB_EMOJIS = {
  "Data Engineer":        "⚙️",
  "Data Scientist":       "🔬",
  "Data Analyst":         "📊",
  "Business Analyst":     "💼",
  "Software Engineer":    "💻",
  "Cloud Engineer":       "☁️",
  "ML Engineer":          "🤖",
  "IoT":                  "📡",
  "DevOps":               "🔧",
  "Full-Stack":           "🖥️",
  "Automation":           "⚡",
};

function getEmoji(title) {
  for (const [key, emoji] of Object.entries(JOB_EMOJIS)) {
    if (title?.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return "🏆";
}

export default function CVAnalyzer() {
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [progress, setProgress]   = useState(0);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f); setResult(null); setError(null);
    } else {
      setError("Please upload a PDF file only.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) { setError("Please upload your CV first."); return; }
    setLoading(true); setError(null); setResult(null); setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("sessionId", `user-${Date.now()}`);

      const response = await fetch(WEBHOOK_URL, { method: "POST", body: formData });
      clearInterval(interval); setProgress(100);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const text = await response.text();

      // Step 1: unwrap n8n's { output: "..." } wrapper if present
      let raw = text;
      try {
        const outer = JSON.parse(text);
        raw = outer.output ?? outer.text ?? outer.result ?? outer.message ?? text;
      } catch { /* not a JSON wrapper, use raw text */ }

      // Step 2: clean markdown code fences Groq sometimes adds
      const cleaned = (typeof raw === "string" ? raw : JSON.stringify(raw))
        .replace(/```json|```/g, "").trim();

      // Step 3: parse the actual result
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); }
          catch { parsed = { raw: cleaned }; }
        } else {
          parsed = { raw: cleaned };
        }
      }

      setResult(parsed);
    } catch (err) {
      clearInterval(interval);
      setError(`Failed to analyze CV: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleReset = () => { setFile(null); setResult(null); setError(null); setProgress(0); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#f0f0f0",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "60px 24px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, margin: "0 auto 16px",
          boxShadow: "0 8px 32px rgba(102,126,234,0.4)",
        }}>📄</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>CV Job Analyzer</h1>
        <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>
          Upload your CV and let AI find your best matching job
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 680 }}>
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? "#a78bfa" : file ? "#6ee7b7" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 18, padding: "48px 32px", textAlign: "center",
            cursor: file ? "default" : "pointer",
            background: dragging ? "rgba(167,139,250,0.08)" : file ? "rgba(110,231,183,0.05)" : "rgba(255,255,255,0.03)",
            transition: "all 0.2s", marginBottom: 20,
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])} />
          {!file ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Drop your CV here</div>
              <div style={{ fontSize: 13, color: "#888" }}>or click to browse — PDF only</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#6ee7b7", marginBottom: 4 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
                {(file.size / 1024).toFixed(1)} KB · PDF
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleReset(); }} style={{
                padding: "6px 16px", borderRadius: 20,
                background: "rgba(232,120,133,0.15)", border: "1px solid rgba(232,120,133,0.3)",
                color: "#e87885", fontSize: 12, cursor: "pointer",
              }}>✕ Remove</button>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {loading && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#a78bfa" }}>Analyzing your CV...</span>
              <span style={{ fontSize: 12, color: "#a78bfa" }}>{progress}%</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #667eea, #764ba2)", borderRadius: 10, transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 20, background: "rgba(232,120,133,0.1)", border: "1px solid rgba(232,120,133,0.3)", color: "#e87885", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Analyze Button */}
        <button onClick={handleAnalyze} disabled={loading || !file} style={{
          width: "100%", padding: "16px", borderRadius: 12,
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none", color: "#fff", fontWeight: 700, fontSize: 16,
          cursor: (loading || !file) ? "not-allowed" : "pointer",
          letterSpacing: 0.5, boxShadow: "0 4px 20px rgba(102,126,234,0.4)",
          opacity: (loading || !file) ? 0.6 : 1, transition: "all 0.2s", marginBottom: 32,
        }}>
          {loading ? "⏳ Analyzing..." : "🚀 Analyze My CV"}
        </button>

        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}

function ResultCard({ result }) {
  const jobTitles     = result.job_titles    || result.recommendedJobs || [];
  const topSkills     = result.top_skills    || result.topSkills       || [];
  const careerAdvice  = result.career_advice || result.careerAdvice    || null;
  const candidateName = result.candidate_name || result.candidateName  || null;
  const expLevel      = result.experience_level || result.experienceLevel || null;

  const bestJobObj  = jobTitles[0] || null;
  const bestJob     = bestJobObj?.title || result.best_job || null;
  const bestSalary  = bestJobObj?.salary_range_usd_per_year || null;
  const bestExp     = bestJobObj?.explanation || null;

  const skills  = topSkills.length > 0 ? topSkills : (result.skills || result.matched_skills || []);
  const allJobs = jobTitles.length > 1 ? jobTitles : null;
  const isRaw   = !bestJob && !allJobs && !skills.length && !careerAdvice;

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f0f0f0" }}>🎯 Analysis Results</h3>
        {(candidateName || expLevel) && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {candidateName && <span style={{ fontSize: 13, color: "#ccc" }}>{candidateName}</span>}
            {expLevel && (
              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "rgba(102,126,234,0.2)", border: "1px solid rgba(102,126,234,0.3)", color: "#a78bfa" }}>
                {expLevel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Best Job Hero Card */}
      {bestJob && (
        <div style={{
          background: "linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))",
          border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: 14, padding: "20px 24px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ fontSize: 44, flexShrink: 0 }}>{getEmoji(bestJob)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Best Match Role
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>{bestJob}</div>
              {bestSalary && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.2)", marginBottom: bestExp ? 10 : 0 }}>
                  <span style={{ fontSize: 13, color: "#6ee7b7" }}>💰 {bestSalary}</span>
                </div>
              )}
              {bestExp && (
                <p style={{ margin: bestSalary ? "8px 0 0" : "4px 0 0", fontSize: 13, color: "#b0a8c8", lineHeight: 1.6 }}>{bestExp}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Jobs */}
      {allJobs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
            All Matched Roles
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {allJobs.map((item, i) => {
              const jobName   = item.title || `Job ${i + 1}`;
              const salary    = item.salary_range_usd_per_year || null;
              const skillsDev = item.skills_to_develop || [];
              const exp       = item.explanation || null;
              const barWidth  = Math.max(95 - i * 12, 35);

              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{getEmoji(jobName)}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#e0d8f0" }}>{jobName}</span>
                    </div>
                    {salary && (
                      <span style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, whiteSpace: "nowrap" }}>
                        💰 {salary}
                      </span>
                    )}
                  </div>
                  <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", marginBottom: exp || skillsDev.length ? 10 : 0 }}>
                    <div style={{ width: `${barWidth}%`, height: "100%", background: "linear-gradient(90deg, #667eea, #764ba2)", borderRadius: 10, transition: "width 0.6s ease" }} />
                  </div>
                  {exp && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#8880a0", lineHeight: 1.6 }}>{exp}</p>}
                  {skillsDev.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {skillsDev.map((s, j) => (
                        <span key={j} style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa" }}>+ {s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
            🛠️ Skills Detected
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {skills.map((skill, i) => (
              <span key={i} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa" }}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Career Advice */}
      {careerAdvice && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
            📝 Career Advice
          </div>
          <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.8 }}>{careerAdvice}</div>
        </div>
      )}

      {/* Fallback raw */}
      {isRaw && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "#e87885", marginBottom: 8, fontWeight: 600 }}>
            ⚠️ Unexpected response format — update your n8n AI Agent prompt to return JSON only.
          </div>
          <pre style={{ fontSize: 11, color: "#888", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 300, overflow: "auto" }}>
            {typeof result.raw === "string" ? result.raw : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
