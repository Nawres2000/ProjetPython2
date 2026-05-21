import { useState, useEffect } from "react";

const JOBS_API = "/recommender/jobs";

async function fetchJobs() {
  const res = await fetch(JOBS_API);
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json();
}

/* ─── Design tokens ─────────────────────────────────────────────────────── */
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
  blueLight:   "#eff3ff",
  blueRule:    "#bfcbfb",
  green:       "#065f46",
  greenLight:  "#ecfdf5",
  greenRule:   "#a7f3d0",
  sans:        "'DM Sans', system-ui, sans-serif",
  serif:       "'Playfair Display', Georgia, serif",
  mono:        "'DM Mono', monospace",
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const JOB_PALETTE = ["#c8490a","#1d4ed8","#065f46","#9d174d","#4c1d95","#b45309","#0e7490","#7c3aed"];

function jobColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % JOB_PALETTE.length;
  return JOB_PALETTE[h];
}

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: T.accentLight, color: T.accent, borderRadius: 2, padding: "0 2px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const inputBase = {
  background: T.warm,
  border: `1.5px solid ${T.border}`,
  borderRadius: 8,
  padding: "9px 14px",
  color: T.ink,
  fontSize: 13.5,
  fontFamily: T.sans,
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function FieldLabel({ text }) {
  return (
    <div style={{
      fontFamily: T.mono, fontSize: 10.5,
      letterSpacing: "0.1em", textTransform: "uppercase",
      color: T.ink25, marginBottom: 8, fontWeight: 500,
    }}>{text}</div>
  );
}

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── JobCard ───────────────────────────────────────────────────────────── */
function JobCard({ job, query, onClick, selected }) {
  const initials = (job.company || "??").slice(0, 2).toUpperCase();
  const color    = jobColor(job.company || job.title);

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? T.accentLight : T.white,
        border: `1px solid ${selected ? T.accentRule : T.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.18s",
        marginBottom: 8,
        borderLeft: `3px solid ${selected ? T.accent : "transparent"}`,
        position: "relative",
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateX(2px)"; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateX(0)"; } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: color + "12", border: `1px solid ${color}20`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.mono, fontWeight: 700, fontSize: 11.5, color,
        }}>{initials}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: T.sans, fontWeight: 600, fontSize: 14,
            color: T.ink, marginBottom: 3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{highlight(job.title, query)}</div>

          <div style={{ fontSize: 12.5, color: T.ink45, marginBottom: 8 }}>
            {highlight(job.company, query)}{job.location ? ` · ${job.location}` : ""}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {(job.skills || []).slice(0, 4).map(s => (
              <span key={s} style={{
                fontSize: 11, fontFamily: T.mono,
                background: T.warm, border: `1px solid ${T.border}`,
                borderRadius: 100, padding: "2px 8px", color: T.ink70,
              }}>{s}</span>
            ))}
            {(job.skills || []).length > 4 && (
              <span style={{ fontSize: 11, fontFamily: T.mono, color: T.ink25 }}>
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── JobDetail ─────────────────────────────────────────────────────────── */
function JobDetail({ job, onClose }) {
  const color    = jobColor(job.company || job.title);
  const initials = (job.company || "??").slice(0, 2).toUpperCase();
  const desc     = job.description
    ? job.description.replace(/^Le portail.*?Retour\n/s, "").slice(0, 800).trim()
    : "No description available.";

  return (
    <div style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      {/* Accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${T.accent}, ${T.blue})` }} />

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 13, flexShrink: 0,
              background: color + "12", border: `1px solid ${color}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.mono, fontWeight: 700, fontSize: 13, color,
            }}>{initials}</div>
            <div>
              <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 400, color: T.ink, lineHeight: 1.2, marginBottom: 4 }}>
                {job.title}
              </div>
              <div style={{ fontSize: 13, color: T.ink45, fontFamily: T.sans }}>{job.company}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.warm, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: "5px 11px", color: T.ink45, cursor: "pointer",
              fontSize: 14, fontFamily: T.sans, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.ink; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.ink45; }}
          >✕</button>
        </div>

        {/* Meta pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {[job.location && { icon: "📍", text: job.location }, job.company && { icon: "🏢", text: job.company }]
            .filter(Boolean)
            .map(({ icon, text }) => (
              <div key={text} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: T.warm, border: `1px solid ${T.border}`,
                borderRadius: 100, padding: "5px 12px",
                fontSize: 12.5, fontFamily: T.sans, color: T.ink70,
              }}>{icon} {text}</div>
            ))}
        </div>

        {/* Skills */}
        <div>
          <FieldLabel text="Required Skills" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(job.skills || []).map(s => (
              <span key={s} style={{
                fontSize: 12.5, fontFamily: T.mono,
                background: T.warm, border: `1px solid ${T.border}`,
                borderRadius: 100, padding: "4px 10px", color: T.ink70,
              }}>{s}</span>
            ))}
            {(!job.skills || !job.skills.length) && (
              <span style={{ fontSize: 13, color: T.ink25 }}>Not specified</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <FieldLabel text="Description" />
          <p style={{
            fontSize: 13.5, color: T.ink70, lineHeight: 1.75,
            margin: 0, whiteSpace: "pre-wrap", fontFamily: T.sans, fontWeight: 300,
          }}>
            {desc}{job.description && job.description.length > 800 ? "…" : ""}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.border }} />

        {/* Apply CTA */}
        <a
          href={job.link} target="_blank" rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            textAlign: "center",
            background: T.ink, border: `2px solid ${T.ink}`,
            borderRadius: 8, padding: "12px 20px",
            color: "#fff", fontWeight: 500, fontSize: 14,
            fontFamily: T.sans, textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.boxShadow = "0 6px 20px rgba(200,73,10,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.ink; e.currentTarget.style.borderColor = T.ink; e.currentTarget.style.boxShadow = "none"; }}
        >
          Apply on Tanit Jobs <ArrowRight />
        </a>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function JobsPage({ onBack }) {
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [filterLoc,  setFilterLoc]  = useState("All");
  const [filterSkill,setFilterSkill]= useState("All");
  const [selected,   setSelected]   = useState(null);
  const [sfocus,     setSfocus]     = useState(false);

  useEffect(() => {
    fetchJobs()
      .then(data => {
        const arr = Array.isArray(data) ? data : data.jobs || [];
        setJobs(arr);
        if (arr.length > 0) setSelected(arr[0]);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const locations = ["All", ...Array.from(new Set(jobs.map(j => (j.location || "").split(",")[0].trim()))).sort()];
  const allSkills = ["All", ...Array.from(new Set(jobs.flatMap(j => j.skills || []))).sort()];

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) || (j.skills || []).some(s => s.toLowerCase().includes(q));
    const matchLoc   = filterLoc   === "All" || (j.location || "").includes(filterLoc);
    const matchSkill = filterSkill === "All" || (j.skills || []).includes(filterSkill);
    return matchSearch && matchLoc && matchSkill;
  });

  const hasFilters = search || filterLoc !== "All" || filterSkill !== "All";

  return (
    <div style={{ fontFamily: T.sans, background: T.paper, minHeight: "100vh", color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── Nav ── */}
      <nav style={{
        height: 62, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px",
        borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(14px)",
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: T.ink,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden", flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: T.accent, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
          </div>
          <span style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em" }}>SkillPath</span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={onBack}
            style={{
              padding: "7px 16px", borderRadius: 8,
              background: "transparent", border: `1px solid ${T.border}`,
              color: T.ink70, fontSize: 13.5, fontFamily: T.sans, fontWeight: 400,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.warm; e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.ink; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.ink70; }}
          >← Dashboard</button>
          <span style={{
            padding: "7px 16px", borderRadius: 8,
            background: T.accentLight, border: `1px solid ${T.accentRule}`,
            color: T.accent, fontSize: 13.5, fontFamily: T.mono, fontWeight: 500,
          }}>Browse Jobs</span>
        </div>

        {/* Count */}
        <div style={{ fontFamily: T.mono, fontSize: 11.5, color: T.ink25, letterSpacing: "0.04em" }}>
          {loading ? "Loading…" : `${filtered.length} / ${jobs.length} jobs`}
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px" }}>

        {/* Section header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.accent, letterSpacing: "0.1em" }}>03</span>
            <span style={{ width: 24, height: 1, background: T.accent, display: "inline-block" }} />
          </div>
          <h2 style={{ fontFamily: T.serif, fontSize: 36, fontWeight: 400, color: T.ink, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Latest from <em style={{ fontStyle: "italic", color: T.accent }}>Tanit Jobs</em>
          </h2>
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.ink25, pointerEvents: "none" }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSfocus(true)}
              onBlur={() => setSfocus(false)}
              placeholder="Search by title, company, or skill…"
              style={{
                ...inputBase,
                width: "100%", boxSizing: "border-box",
                paddingLeft: 36,
                borderColor: sfocus ? T.accent : T.border,
                background: sfocus ? T.white : T.warm,
                boxShadow: sfocus ? `0 0 0 3px ${T.accentLight}` : "none",
              }}
            />
          </div>

          <select
            value={filterLoc}
            onChange={e => setFilterLoc(e.target.value)}
            style={{
              ...inputBase,
              color: filterLoc !== "All" ? T.accent : T.ink45,
              borderColor: filterLoc !== "All" ? T.accentRule : T.border,
              background: filterLoc !== "All" ? T.accentLight : T.warm,
              cursor: "pointer",
            }}
          >
            {locations.map(l => <option key={l} value={l}>{l === "All" ? "All locations" : l}</option>)}
          </select>

          <select
            value={filterSkill}
            onChange={e => setFilterSkill(e.target.value)}
            style={{
              ...inputBase,
              color: filterSkill !== "All" ? T.accent : T.ink45,
              borderColor: filterSkill !== "All" ? T.accentRule : T.border,
              background: filterSkill !== "All" ? T.accentLight : T.warm,
              cursor: "pointer",
            }}
          >
            {allSkills.map(s => <option key={s} value={s}>{s === "All" ? "All skills" : s}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setFilterLoc("All"); setFilterSkill("All"); }}
              style={{
                ...inputBase,
                cursor: "pointer", color: T.ink45,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.ink45; }}
            >Clear</button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "5rem", color: T.ink25 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.accent, animation: "sp-spin 0.75s linear infinite", margin: "0 auto 14px" }} />
            <span style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: "0.06em" }}>Loading jobs…</span>
            <style>{`@keyframes sp-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            textAlign: "center", padding: "4rem",
            background: T.white, border: `1px solid ${T.border}`,
            borderRadius: 16,
          }}>
            <div style={{ fontFamily: T.serif, fontSize: 18, color: T.ink, marginBottom: 8 }}>Could not load jobs</div>
            <div style={{ fontSize: 13.5, color: T.ink45, marginBottom: 6 }}>{error}</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.ink25 }}>Make sure the recommender service is running on port 8001.</div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>

            {/* Job list */}
            <div style={{ maxHeight: "calc(100vh - 240px)", overflowY: "auto", paddingRight: 4 }}>
              {filtered.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "3rem 1rem",
                  background: T.white, border: `1px solid ${T.border}`,
                  borderRadius: 12,
                }}>
                  <div style={{ fontFamily: T.serif, fontSize: 16, color: T.ink45, marginBottom: 6, fontStyle: "italic" }}>No jobs found</div>
                  <div style={{ fontSize: 13, color: T.ink25 }}>Try adjusting your filters.</div>
                </div>
              ) : (
                filtered.map(job => (
                  <JobCard
                    key={job.link || job.title + job.company}
                    job={job}
                    query={search}
                    selected={selected === job}
                    onClick={() => setSelected(job)}
                  />
                ))
              )}
            </div>

            {/* Detail panel */}
            <div style={{ position: "sticky", top: 78, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
              {selected
                ? <JobDetail job={selected} onClose={() => setSelected(null)} />
                : (
                  <div style={{
                    textAlign: "center", padding: "5rem 2rem",
                    background: T.white, border: `1px solid ${T.border}`,
                    borderRadius: 20,
                  }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.warm, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontFamily: T.serif, fontSize: 24, fontStyle: "italic", color: T.ink25 }}>?</div>
                    <div style={{ fontSize: 14, color: T.ink25, fontWeight: 300 }}>Select a job to see details</div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}