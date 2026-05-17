import { useState, useRef, useEffect } from "react";
import { apiGetProfile } from "../services/api";

const WEBHOOK_URL = "http://localhost:5678/webhook-test/c9ef6c41-8ef7-443c-8b23-fc72c30a270d";
const RECOMMENDER_URL =
  process.env.NODE_ENV === "production"
    ? "/recommender/webhook/cv-recommendations"
    : "http://localhost:8001/webhook/cv-recommendations";

const JOB_EMOJIS = {
  "Data Engineer":     "⚙️",
  "Data Scientist":    "🔬",
  "Data Analyst":      "📊",
  "Business Analyst":  "💼",
  "Software Engineer": "💻",
  "Cloud Engineer":    "☁️",
  "ML Engineer":       "🤖",
  "IoT":               "📡",
  "DevOps":            "🔧",
  "Full-Stack":        "🖥️",
  "Automation":        "⚡",
};

function getEmoji(title) {
  for (const [key, emoji] of Object.entries(JOB_EMOJIS)) {
    if (title?.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return "🏆";
}

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --white:   #ffffff;
    --paper:   #fafaf9;
    --warm:    #f5f3ef;
    --warm2:   #ede9e1;
    --border:  #e2ddd6;
    --border2: #ccc7bf;
    --ink:     #1a1814;
    --ink-70:  rgba(26,24,20,0.7);
    --ink-45:  rgba(26,24,20,0.45);
    --ink-25:  rgba(26,24,20,0.25);
    --ink-10:  rgba(26,24,20,0.08);
    --ink-5:   rgba(26,24,20,0.04);

    --accent:       #c8490a;
    --accent-light: #fff3ee;
    --accent-rule:  #fbd0b8;
    --accent-dark:  #9a3208;

    --teal:       #0d6e64;
    --teal-light: rgba(13,110,100,0.08);
    --teal-rule:  rgba(13,110,100,0.2);

    --green:       #166534;
    --green-light: rgba(22,101,52,0.08);
    --green-rule:  rgba(22,101,52,0.2);

    --amber:       #b45309;
    --amber-light: rgba(180,83,9,0.08);
    --amber-rule:  rgba(180,83,9,0.2);

    --red:       #b91c1c;
    --red-light: rgba(185,28,28,0.08);
    --red-rule:  rgba(185,28,28,0.2);

    --r-xs: 4px;
    --r-sm: 8px;
    --r:    14px;
    --r-lg: 20px;
    --r-xl: 28px;

    --serif: 'Playfair Display', Georgia, serif;
    --sans:  'DM Sans', system-ui, sans-serif;
    --mono:  'DM Mono', monospace;

    --sh-sm: 0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --sh:    0 4px 20px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.04);
    --sh-lg: 0 20px 56px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.06);
  }

  /* ── Root layout ── */
  .cv-root {
    min-height: 100vh;
    background: var(--paper);
    font-family: var(--sans);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 24px 120px;
    position: relative;
  }

  /* Subtle dot-grid texture */
  .cv-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(var(--border) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    opacity: 0.6;
  }

  .cv-inner {
    width: 100%; max-width: 680px; position: relative;
  }

  /* ── Header ── */
  .cv-header { margin-bottom: 56px; }

  .cv-kicker {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
  }
  .cv-kicker-line { width: 28px; height: 2px; background: var(--accent); border-radius: 1px; }
  .cv-kicker-text {
    font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--accent); font-weight: 500;
  }

  .cv-title {
    font-family: var(--serif);
    font-size: clamp(36px, 5vw, 54px);
    font-weight: 400; line-height: 1.08;
    letter-spacing: -0.02em; color: var(--ink);
    margin-bottom: 14px;
  }
  .cv-title em { font-style: italic; color: var(--accent); }

  .cv-subtitle {
    font-size: 15px; color: var(--ink-70);
    line-height: 1.7; max-width: 460px; font-weight: 300;
  }

  /* ── Card shell ── */
  .card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    box-shadow: var(--sh);
    overflow: hidden;
    position: relative;
  }
  /* Accent top stripe on every card */
  .card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--teal));
    border-radius: var(--r-lg) var(--r-lg) 0 0;
  }

  .card-header {
    padding: 20px 26px 18px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    margin-top: 3px; /* offset the accent stripe */
  }
  .card-header-title {
    font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--ink-45);
  }

  .card-body { padding: 26px; }

  /* ── Badge pill ── */
  .badge-pill {
    padding: 3px 10px; border-radius: 100px;
    font-size: 11px; font-family: var(--mono);
    background: var(--warm); border: 1px solid var(--border);
    color: var(--ink-45);
  }

  /* ── Profile banner ── */
  .profile-banner {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 14px 16px; border-radius: var(--r);
    border: 1px solid var(--border); background: var(--warm);
    margin-bottom: 18px; transition: all 0.2s;
  }
  .profile-banner.active {
    background: var(--teal-light); border-color: var(--teal-rule);
  }
  .profile-banner-info { display: flex; align-items: center; gap: 12px; }
  .profile-banner-icon {
    width: 36px; height: 36px; border-radius: var(--r-sm);
    background: var(--white); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .profile-banner-label {
    font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 2px;
  }
  .profile-banner-label.active { color: var(--teal); }
  .profile-banner-filename {
    font-size: 11px; color: var(--ink-45); font-family: var(--mono);
  }

  .btn-ghost {
    padding: 6px 14px; border-radius: var(--r-sm);
    background: var(--white); border: 1px solid var(--border);
    color: var(--ink-70); font-size: 12px; font-family: var(--sans);
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .btn-ghost:hover { border-color: var(--border2); color: var(--ink); background: var(--warm); }

  /* ── Drop zone ── */
  .dropzone {
    border: 2px dashed var(--border);
    border-radius: var(--r-lg);
    padding: 52px 32px; text-align: center;
    cursor: pointer; background: var(--warm);
    transition: all 0.22s; margin-bottom: 22px;
  }
  .dropzone:hover, .dropzone.drag {
    border-color: var(--accent); background: var(--accent-light);
  }
  .dropzone.has-file {
    border-style: solid; border-color: var(--teal-rule);
    background: var(--teal-light); cursor: default; padding: 28px 32px;
  }

  .dropzone-icon {
    width: 56px; height: 56px; border-radius: var(--r);
    background: var(--white); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; margin: 0 auto 16px; box-shadow: var(--sh-sm);
  }
  .dropzone-title { font-size: 15px; font-weight: 500; margin-bottom: 5px; color: var(--ink); font-family: var(--sans); }
  .dropzone-sub { font-size: 13px; color: var(--ink-45); font-weight: 300; }

  .file-pill {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 5px 12px; background: var(--white);
    border: 1px solid var(--teal-rule); border-radius: 100px;
    font-size: 12px; font-family: var(--mono); color: var(--teal); margin-top: 12px;
  }

  .btn-remove {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: var(--r-sm);
    background: transparent; border: 1px solid var(--red-rule);
    color: var(--red); font-size: 12px; cursor: pointer;
    margin-top: 12px; transition: all 0.15s;
  }
  .btn-remove:hover { background: var(--red-light); }

  /* ── Progress ── */
  .progress-wrap { margin-bottom: 22px; }
  .progress-meta {
    display: flex; justify-content: space-between;
    font-size: 12px; color: var(--ink-45);
    margin-bottom: 8px; font-family: var(--mono);
  }
  .progress-track {
    width: 100%; height: 4px;
    background: var(--warm2); border-radius: 2px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: linear-gradient(90deg, var(--accent), var(--teal));
    border-radius: 2px; transition: width 0.3s ease;
  }

  /* ── Error ── */
  .error-box {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 14px 16px; border-radius: var(--r);
    background: var(--red-light); border: 1px solid var(--red-rule);
    color: var(--red); font-size: 13px; margin-bottom: 20px; line-height: 1.5;
  }

  /* ── Primary button ── */
  .btn-primary {
    width: 100%; padding: 14px; border-radius: var(--r-sm);
    background: var(--ink); border: 2px solid var(--ink);
    color: #fff; font-family: var(--sans); font-weight: 500;
    font-size: 15px; letter-spacing: 0.01em;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--accent); border-color: var(--accent);
    box-shadow: 0 6px 20px rgba(200,73,10,0.3);
    transform: translateY(-1px);
  }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
  .btn-primary svg { transition: transform 0.2s; }
  .btn-primary:hover:not(:disabled) svg { transform: translateX(3px); }

  /* ── Section label ── */
  .section-label {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--mono); font-size: 10.5px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--ink-25); margin-bottom: 14px;
  }
  .section-label::before {
    content: ''; display: inline-block;
    width: 14px; height: 2px;
    background: var(--accent); border-radius: 1px; flex-shrink: 0;
  }
  .section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  /* ── Result hero ── */
  .result-hero {
    background: var(--ink);
    border-radius: var(--r); padding: 28px;
    margin-bottom: 20px; position: relative; overflow: hidden;
  }
  /* Decorative circle */
  .result-hero::after {
    content: '';
    position: absolute; bottom: -50px; right: -50px;
    width: 160px; height: 160px; border-radius: 50%;
    border: 28px solid rgba(255,255,255,0.04); pointer-events: none;
  }
  .result-hero-eye {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(255,255,255,0.35); margin-bottom: 8px;
  }
  .result-hero-role {
    font-family: var(--serif); font-size: 32px;
    font-weight: 400; font-style: italic;
    color: #fff; margin-bottom: 12px; line-height: 1.2;
  }
  .result-hero-salary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 13px; border-radius: 100px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    font-size: 12px; color: rgba(255,255,255,0.7);
    font-family: var(--mono); margin-bottom: 12px;
  }
  .result-hero-exp {
    font-size: 13.5px; color: rgba(255,255,255,0.5);
    line-height: 1.72; max-width: 520px; font-weight: 300;
  }

  /* ── Jobs table ── */
  .jobs-table {
    border: 1px solid var(--border); border-radius: var(--r);
    overflow: hidden; margin-bottom: 20px;
  }
  .jobs-table-row {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 18px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }
  .jobs-table-row:last-child { border-bottom: none; }
  .jobs-table-row:hover { background: var(--warm); }

  .jobs-table-rank {
    font-family: var(--mono); font-size: 11px;
    color: var(--ink-25); width: 18px; flex-shrink: 0; text-align: right;
  }
  .jobs-table-emoji { font-size: 18px; flex-shrink: 0; }
  .jobs-table-name  { font-size: 14px; font-weight: 500; flex: 1; }
  .jobs-table-salary {
    font-size: 12px; font-family: var(--mono);
    color: var(--teal); white-space: nowrap;
  }
  .jobs-table-bar-wrap { width: 60px; flex-shrink: 0; }
  .jobs-table-bar-track { width: 100%; height: 3px; background: var(--border); border-radius: 2px; }
  .jobs-table-bar-fill  { height: 100%; background: var(--accent); border-radius: 2px; }

  /* ── Skills ── */
  .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag {
    padding: 4px 10px; border-radius: 4px;
    background: var(--warm); border: 1px solid var(--border);
    font-size: 12px; font-family: var(--mono);
    color: var(--ink-70); transition: all 0.15s;
  }
  .skill-tag:hover { background: var(--warm2); color: var(--ink); border-color: var(--border2); }

  /* ── Career advice ── */
  .advice-box {
    background: var(--warm); border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: var(--r-sm); padding: 16px 18px;
    font-size: 14px; color: var(--ink-70); line-height: 1.8; font-weight: 300;
  }

  /* ── Match cards ── */
  .match-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--r); padding: 20px;
    transition: all 0.2s; position: relative; overflow: hidden;
  }
  .match-card::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px; background: transparent; transition: background 0.2s;
  }
  .match-card:hover { box-shadow: var(--sh); border-color: var(--border2); }
  .match-card:hover::after { background: var(--accent); }

  .match-card-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 12px; margin-bottom: 12px;
  }
  .match-card-main { display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 0; }
  .match-card-emoji { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
  .match-card-title { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 3px; }
  .match-card-meta  { font-size: 12px; color: var(--ink-45); }

  .match-badge {
    padding: 4px 10px; border-radius: var(--r-xs);
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    background: var(--accent-light); color: var(--accent);
    border: 1px solid var(--accent-rule); white-space: nowrap; flex-shrink: 0;
  }

  .match-bar-track {
    width: 100%; height: 3px; background: var(--border);
    border-radius: 2px; margin-bottom: 14px; overflow: hidden;
  }
  .match-bar-fill {
    height: 100%; background: linear-gradient(90deg, var(--accent), var(--teal));
    border-radius: 2px; transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
  }

  .tags-label {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--ink-25); margin-bottom: 6px; margin-top: 12px;
  }
  .tag-matched {
    display: inline-flex; align-items: center;
    padding: 3px 8px; border-radius: var(--r-xs);
    font-size: 11px; font-family: var(--mono);
    background: var(--green-light); border: 1px solid var(--green-rule);
    color: var(--green); margin: 3px 3px 0 0;
  }
  .tag-missing {
    display: inline-flex; align-items: center;
    padding: 3px 8px; border-radius: var(--r-xs);
    font-size: 11px; font-family: var(--mono);
    background: var(--amber-light); border: 1px solid var(--amber-rule);
    color: var(--amber); margin: 3px 3px 0 0;
  }

  .apply-btn {
    display: inline-flex; align-items: center; gap: 7px;
    margin-top: 16px; padding: 9px 18px; border-radius: var(--r-sm);
    background: var(--ink); color: #fff; font-size: 13px; font-weight: 500;
    text-decoration: none; transition: all 0.18s; font-family: var(--sans);
  }
  .apply-btn:hover {
    background: var(--accent);
    box-shadow: 0 4px 14px rgba(200,73,10,0.28);
    transform: translateY(-1px);
  }
  .apply-btn svg { transition: transform 0.18s; }
  .apply-btn:hover svg { transform: translateX(3px); }

  /* ── Warning ── */
  .warning-box {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 14px 16px; border-radius: var(--r);
    background: var(--amber-light); border: 1px solid var(--amber-rule);
    color: var(--amber); font-size: 13px; margin-top: 16px; line-height: 1.5;
  }

  /* ── Raw fallback ── */
  .raw-box {
    background: var(--warm); border: 1px solid var(--border); border-radius: var(--r);
    padding: 16px; font-size: 12px; font-family: var(--mono); color: var(--ink-70);
    white-space: pre-wrap; word-break: break-word; max-height: 300px; overflow: auto;
  }

  /* ── Animations ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim    { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-d1 { animation-delay: 0.06s; }
  .anim-d2 { animation-delay: 0.12s; }
  .anim-d3 { animation-delay: 0.18s; }
`;

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════ */

export default function CVAnalyzer({ user }) {
  const [file,         setFile]         = useState(null);
  const [profileCv,    setProfileCv]    = useState(null);
  const [useProfileCv, setUseProfileCv] = useState(false);
  const [dragging,     setDragging]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [jobMatches,   setJobMatches]   = useState(null);
  const [matchWarning, setMatchWarning] = useState(null);
  const [error,        setError]        = useState(null);
  const [progress,     setProgress]     = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user?.token) return;
    apiGetProfile(user.token)
      .then((p) => {
        if (p.cv_path && p.cv_filename) {
          setProfileCv({ path: p.cv_path, filename: p.cv_filename });
          setUseProfileCv(true);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f); setResult(null); setError(null); setJobMatches(null); setMatchWarning(null);
    } else {
      setError("Please upload a PDF file only.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const extractSkillStrings = (parsed) => {
    const raw = parsed?.top_skills || parsed?.topSkills || parsed?.skills || parsed?.matched_skills || [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map((s) => {
        if (typeof s === "string") return s;
        if (s && typeof s === "object") return s.name || s.skill || s.title || "";
        return String(s || "");
      })
      .map((s) => s.trim()).filter(Boolean);
  };

  const fetchJobMatches = async (skills) => {
    if (!skills || skills.length === 0) {
      setMatchWarning("No skills were extracted from the CV, so no jobs could be matched.");
      return;
    }
    try {
      const res = await fetch(RECOMMENDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, top_n: 5 }),
      });
      if (!res.ok) throw new Error(`Recommender error: ${res.status}`);
      const data = await res.json();
      setJobMatches(data.recommendations || []);
    } catch (err) {
      setMatchWarning(`Could not reach the job recommender (${err.message}). Make sure controller.py is running on port 8000.`);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !useProfileCv) { setError("Please upload your CV first."); return; }
    setLoading(true); setError(null); setResult(null); setJobMatches(null); setMatchWarning(null); setProgress(0);
    const interval = setInterval(() => setProgress((p) => (p < 85 ? p + 5 : p)), 300);
    try {
      let cvFile = file;
      if (useProfileCv && !file) {
        const res = await fetch(`/backend${profileCv.path}`);
        if (!res.ok) throw new Error("Could not load CV from profile");
        const blob = await res.blob();
        cvFile = new File([blob], profileCv.filename, { type: "application/pdf" });
      }
      const formData = new FormData();
      formData.append("file", cvFile, cvFile.name);
      formData.append("sessionId", `user-${Date.now()}`);
      const response = await fetch(WEBHOOK_URL, { method: "POST", body: formData });
      clearInterval(interval); setProgress(100);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const text = await response.text();
      let raw = text;
      try {
        const outer = JSON.parse(text);
        raw = outer.output ?? outer.text ?? outer.result ?? outer.message ?? text;
      } catch { /* not JSON wrapper */ }
      const cleaned = (typeof raw === "string" ? raw : JSON.stringify(raw)).replace(/```json|```/g, "").trim();
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) { try { parsed = JSON.parse(match[0]); } catch { parsed = { raw: cleaned }; } }
        else { parsed = { raw: cleaned }; }
      }
      setResult(parsed);
      await fetchJobMatches(extractSkillStrings(parsed));
    } catch (err) {
      clearInterval(interval);
      setError(`Failed to analyze CV: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleReset = () => {
    setFile(null); setResult(null); setError(null);
    setJobMatches(null); setMatchWarning(null); setProgress(0);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cv-root">
        <div className="cv-inner">

          {/* ── Header ── */}
          <header className="cv-header">
            <div className="cv-kicker">
              <span className="cv-kicker-line" />
              <span className="cv-kicker-text">AI-Powered Career Tool</span>
            </div>
            <h1 className="cv-title">
              Analyze Your CV,<br /><em>Find Your Role</em>
            </h1>
            <p className="cv-subtitle">
              Upload your résumé and let our AI surface the most fitting job titles,
              salary benchmarks, and skill gaps in seconds.
            </p>
          </header>

          {/* ── Upload card ── */}
          <div className="card anim" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-header-title">01 — Upload Résumé</span>
              <span className="badge-pill">PDF only</span>
            </div>
            <div className="card-body">

              {/* Profile CV banner */}
              {profileCv && (
                <div className={`profile-banner${useProfileCv ? " active" : ""}`}>
                  <div className="profile-banner-info">
                    <div className="profile-banner-icon">📎</div>
                    <div>
                      <div className={`profile-banner-label${useProfileCv ? " active" : ""}`}>
                        {useProfileCv ? "Using CV from your profile" : "Profile CV available"}
                      </div>
                      <div className="profile-banner-filename">{profileCv.filename}</div>
                    </div>
                  </div>
                  <button
                    className="btn-ghost"
                    onClick={() => { setUseProfileCv(!useProfileCv); if (!useProfileCv) setFile(null); }}
                  >
                    {useProfileCv ? "Use different file" : "Use this CV"}
                  </button>
                </div>
              )}

              {/* Drop zone */}
              {!useProfileCv && (
                <div
                  className={`dropzone${dragging ? " drag" : ""}${file ? " has-file" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !file && inputRef.current.click()}
                >
                  <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])} />
                  {!file ? (
                    <>
                      <div className="dropzone-icon">📂</div>
                      <div className="dropzone-title">Drop your résumé here</div>
                      <div className="dropzone-sub">or click to browse — PDF only</div>
                    </>
                  ) : (
                    <>
                      <div className="dropzone-icon" style={{ background: "var(--teal-light)", borderColor: "var(--teal-rule)" }}>✅</div>
                      <div className="dropzone-title" style={{ color: "var(--teal)" }}>{file.name}</div>
                      <div className="file-pill">
                        <span>PDF</span>
                        <span style={{ color: "var(--teal-rule)" }}>·</span>
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <br />
                      <button className="btn-remove" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                        ✕ Remove file
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Progress */}
              {loading && (
                <div className="progress-wrap">
                  <div className="progress-meta">
                    <span>Analyzing document…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="error-box">
                  <span>⚠</span><span>{error}</span>
                </div>
              )}

              {/* CTA */}
              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={loading || (!file && !useProfileCv)}
                style={{ marginTop: error || loading ? 0 : 4 }}
              >
                {loading ? "Analyzing…" : <><span>Analyze My CV</span><ArrowRight /></>}
              </button>
            </div>
          </div>

          {/* ── Results ── */}
          {result && (
            <div className="anim anim-d1" style={{ marginTop: 20 }}>
              <ResultCard result={result} />
            </div>
          )}

          {/* ── Warning ── */}
          {matchWarning && (
            <div className="warning-box">
              <span>⚠</span><span>{matchWarning}</span>
            </div>
          )}

          {/* ── Job matches ── */}
          {jobMatches && jobMatches.length > 0 && (
            <div className="anim anim-d2" style={{ marginTop: 16 }}>
              <JobMatches matches={jobMatches} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Result card ────────────────────────────────────────────────────────── */
function ResultCard({ result }) {
  const jobTitles    = result.job_titles    || result.recommendedJobs || [];
  const topSkills    = result.top_skills    || result.topSkills       || [];
  const careerAdvice = result.career_advice || result.careerAdvice    || null;
  const candidateName= result.candidate_name|| result.candidateName   || null;
  const expLevel     = result.experience_level || result.experienceLevel || null;

  const bestJobObj = jobTitles[0] || null;
  const bestJob    = bestJobObj?.title || result.best_job || null;
  const bestSalary = bestJobObj?.salary_range_usd_per_year || null;
  const bestExp    = bestJobObj?.explanation || null;

  const skills  = topSkills.length > 0 ? topSkills : (result.skills || result.matched_skills || []);
  const allJobs = jobTitles.length > 1 ? jobTitles : null;
  const isRaw   = !bestJob && !allJobs && !skills.length && !careerAdvice;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-header-title">02 — Analysis Results</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {candidateName && (
            <span style={{ fontSize: 12, color: "var(--ink-45)", fontFamily: "var(--mono)" }}>{candidateName}</span>
          )}
          {expLevel && <span className="badge-pill">{expLevel}</span>}
        </div>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 26 }}>

        {/* Best job hero */}
        {bestJob && (
          <div>
            <div className="section-label">Top Match</div>
            <div className="result-hero">
              <div className="result-hero-eye">Best Matching Role</div>
              <div className="result-hero-role">{getEmoji(bestJob)}&ensp;{bestJob}</div>
              {bestSalary && <div className="result-hero-salary">💰 {bestSalary}</div>}
              {bestExp && <p className="result-hero-exp">{bestExp}</p>}
            </div>
          </div>
        )}

        {/* All jobs table */}
        {allJobs && (
          <div>
            <div className="section-label">All Matched Roles</div>
            <div className="jobs-table">
              {allJobs.map((item, i) => {
                const jobName = item.title || `Role ${i + 1}`;
                const salary  = item.salary_range_usd_per_year || null;
                const barW    = Math.max(96 - i * 13, 30);
                return (
                  <div className="jobs-table-row" key={i}>
                    <span className="jobs-table-rank">{i + 1}</span>
                    <span className="jobs-table-emoji">{getEmoji(jobName)}</span>
                    <span className="jobs-table-name">{jobName}</span>
                    {salary && <span className="jobs-table-salary">{salary}</span>}
                    <div className="jobs-table-bar-wrap">
                      <div className="jobs-table-bar-track">
                        <div className="jobs-table-bar-fill" style={{ width: `${barW}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <div className="section-label">Detected Skills</div>
            <div className="skills-wrap">
              {skills.map((s, i) => (
                <span className="skill-tag" key={i}>
                  {typeof s === "string" ? s : s.name || s.skill || String(s)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Career advice */}
        {careerAdvice && (
          <div>
            <div className="section-label">Career Advice</div>
            <div className="advice-box">{careerAdvice}</div>
          </div>
        )}

        {/* Raw fallback */}
        {isRaw && (
          <div>
            <div className="section-label" style={{ color: "var(--red)" }}>Unexpected Format</div>
            <p style={{ fontSize: 13, color: "var(--ink-70)", marginBottom: 10, lineHeight: 1.6, fontWeight: 300 }}>
              The AI returned an unrecognized format. Update your n8n agent to return JSON only.
            </p>
            <div className="raw-box">
              {typeof result.raw === "string" ? result.raw : JSON.stringify(result, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Job matches ────────────────────────────────────────────────────────── */
function JobMatches({ matches }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-header-title">03 — Live Job Matches</span>
        <span className="badge-pill">TanitJobs · {matches.length} results</span>
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {matches.map((job, i) => {
          const scorePct = Math.round((job.match_score ?? 0) * 100);
          const matched  = job.skills_matched || [];
          const missing  = job.skills_missing || [];
          return (
            <div className="match-card" key={i}>
              <div className="match-card-header">
                <div className="match-card-main">
                  <span className="match-card-emoji">{getEmoji(job.job_title || "")}</span>
                  <div>
                    <div className="match-card-title">{job.job_title}</div>
                    <div className="match-card-meta">
                      {job.company}{job.location ? ` · ${job.location}` : ""}
                    </div>
                  </div>
                </div>
                <span className="match-badge">{scorePct}% match</span>
              </div>

              <div className="match-bar-track">
                <div className="match-bar-fill" style={{ width: `${scorePct}%` }} />
              </div>

              {matched.length > 0 && (
                <>
                  <div className="tags-label">✓ Your matching skills</div>
                  <div>{matched.map((s, j) => <span className="tag-matched" key={j}>{s}</span>)}</div>
                </>
              )}

              {missing.length > 0 && (
                <>
                  <div className="tags-label">+ Skills to develop</div>
                  <div>
                    {missing.slice(0, 8).map((s, j) => <span className="tag-missing" key={j}>{s}</span>)}
                    {missing.length > 8 && (
                      <span style={{ fontSize: 11, color: "var(--ink-25)", marginLeft: 6, fontFamily: "var(--mono)" }}>
                        +{missing.length - 8} more
                      </span>
                    )}
                  </div>
                </>
              )}

              {job.link && (
                <a href={job.link} target="_blank" rel="noopener noreferrer" className="apply-btn">
                  Apply on TanitJobs <ArrowRight />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}