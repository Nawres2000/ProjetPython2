import { useState, useRef } from "react";

const WEBHOOK_URL = "http://localhost:5678/webhook-test/c9ef6c41-8ef7-443c-8b23-fc72c30a270d";

const JOB_EMOJIS = {
  "Data Engineer":     "⚙️",
  "Data Scientist":    "🔬",
  "Data Analyst":      "📊",
  "Business Analyst":  "💼",
  "Software Engineer": "💻",
  "Cloud Engineer":    "☁️",
  "ML Engineer":       "🤖",
};

export default function CVAnalyzer() {
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setResult(null);
      setError(null);
    } else {
      setError("Please upload a PDF file only.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your CV first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    // Simulate progress bar
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("sessionId", `user-${Date.now()}`);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const text = await response.text();

      // Try to parse as JSON, fallback to raw text
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
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

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#f0f0f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 24px",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 30,
          margin: "0 auto 16px",
          boxShadow: "0 8px 32px rgba(102,126,234,0.4)",
        }}>
          📄
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>
          CV Job Analyzer
        </h1>
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
            borderRadius: 18,
            padding: "48px 32px",
            textAlign: "center",
            cursor: file ? "default" : "pointer",
            background: dragging
              ? "rgba(167,139,250,0.08)"
              : file
              ? "rgba(110,231,183,0.05)"
              : "rgba(255,255,255,0.03)",
            transition: "all 0.2s",
            marginBottom: 20,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {!file ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                Drop your CV here
              </div>
              <div style={{ fontSize: 13, color: "#888" }}>
                or click to browse — PDF only
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#6ee7b7", marginBottom: 4 }}>
                {file.name}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
                {(file.size / 1024).toFixed(1)} KB · PDF
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                style={{
                  padding: "6px 16px", borderRadius: 20,
                  background: "rgba(232,120,133,0.15)",
                  border: "1px solid rgba(232,120,133,0.3)",
                  color: "#e87885", fontSize: 12, cursor: "pointer",
                }}
              >
                ✕ Remove
              </button>
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
            <div style={{
              width: "100%", height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 10, overflow: "hidden",
            }}>
              <div style={{
                width: `${progress}%`, height: "100%",
                background: "linear-gradient(90deg, #667eea, #764ba2)",
                borderRadius: 10,
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: "14px 18px", borderRadius: 12, marginBottom: 20,
            background: "rgba(232,120,133,0.1)",
            border: "1px solid rgba(232,120,133,0.3)",
            color: "#e87885", fontSize: 13,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          style={{
            width: "100%", padding: "16px", borderRadius: 12,
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            border: "none", color: "#fff", fontWeight: 700,
            fontSize: 16, cursor: (loading || !file) ? "not-allowed" : "pointer",
            letterSpacing: 0.5,
            boxShadow: "0 4px 20px rgba(102,126,234,0.4)",
            opacity: (loading || !file) ? 0.6 : 1,
            transition: "all 0.2s",
            marginBottom: 32,
          }}
        >
          {loading ? "⏳ Analyzing..." : "🚀 Analyze My CV"}
        </button>

        {/* Results */}
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}

function ResultCard({ result }) {
  // Try to extract best job from various response formats
  const bestJob    = result.best_job    || result.predicted_label ||
                     result.job         || result.title           ||
                     result.prediction  || null;
  const confidence = result.confidence  || result.score           ||
                     result.probability || null;
  const skills     = result.skills      || result.matched_skills  ||
                     result.extracted_skills || [];
  const summary    = result.summary     || result.analysis        ||
                     result.message     || result.raw             || null;
  const allJobs    = result.predictions || result.probabilities   || null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: 28,
      animation: "fadeIn 0.4s ease",
    }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "#f0f0f0" }}>
        🎯 Analysis Results
      </h3>

      {/* Best Job */}
      {bestJob && (
        <div style={{
          background: "linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))",
          border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: 14, padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 44 }}>
            {JOB_EMOJIS[bestJob] || "🏆"}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Best Match Role
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0" }}>
              {bestJob}
            </div>
            {confidence && (
              <div style={{ fontSize: 13, color: "#6ee7b7", marginTop: 2 }}>
                Confidence: {typeof confidence === "number"
                  ? `${Math.round(confidence * 100)}%`
                  : confidence}
              </div>
            )}
          </div>
        </div>
      )}

      {/* All job probabilities */}
      {allJobs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 10,
            textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
            All Predictions
          </div>
          {(Array.isArray(allJobs)
            ? allJobs
            : Object.entries(allJobs).map(([job, score]) => ({ job, score }))
          )
            .sort((a, b) => (b.score || b.probability || 0) - (a.score || a.probability || 0))
            .slice(0, 5)
            .map((item, i) => {
              const jobName = item.job || item.title || item.label || `Job ${i + 1}`;
              const score   = Math.round((item.score || item.probability || 0) *
                (item.score > 1 ? 1 : 100));
              return (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: "#ccc" }}>
                      {JOB_EMOJIS[jobName] || "•"} {jobName}
                    </span>
                    <span style={{ color: "#a78bfa", fontWeight: 600 }}>{score}%</span>
                  </div>
                  <div style={{ width: "100%", height: 6,
                    background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{
                      width: `${score}%`, height: "100%",
                      background: "linear-gradient(90deg, #667eea, #764ba2)",
                      borderRadius: 10, transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Extracted Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8,
            textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
            🛠️ Skills Detected
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {skills.map((skill, i) => (
              <span key={i} style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 11,
                background: "rgba(96,165,250,0.15)",
                border: "1px solid rgba(96,165,250,0.3)",
                color: "#60a5fa",
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary / Raw text */}
      {summary && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: "14px 16px",
        }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6,
            textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
            📝 Analysis
          </div>
          <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.7,
            whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {typeof summary === "object" ? JSON.stringify(summary, null, 2) : summary}
          </div>
        </div>
      )}

      {/* Fallback: show raw JSON if nothing matched */}
      {!bestJob && !allJobs && !skills.length && !summary && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: "14px 16px",
        }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Raw Response</div>
          <pre style={{ fontSize: 12, color: "#ccc", margin: 0,
            whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}