import { useState, useEffect, useRef } from "react";

const JOBS_API = "/recommender/jobs"; // served by the recommender service

/* ── fallback: fetch directly from the recommender ── */
async function fetchJobs() {
  const res = await fetch(JOBS_API);
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json(); // array of { title, company, location, link, description, skills }
}

/* ── helpers ── */
function skillColor(skill) {
  const palette = ["#6c63ff","#3ecfb2","#f5c842","#e87885","#a78bfa","#38bdf8","#fb923c","#4ade80"];
  let h = 0;
  for (let i = 0; i < skill.length; i++) h = (h * 31 + skill.charCodeAt(i)) % palette.length;
  return palette[h];
}

function timeAgo(str) {
  // jobs don't have date field, just return ""
  return str || "";
}

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(108,99,255,0.35)", color: "#c8c0ff", borderRadius: 3, padding: "0 2px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ── Job Card ── */
function JobCard({ job, query, onClick, selected }) {
  const initials = job.company
    ? job.company.slice(0, 2).toUpperCase()
    : "??";
  const color = skillColor(job.company || job.title);

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "rgba(108,99,255,0.1)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${selected ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16, padding: "1.1rem 1.25rem", cursor: "pointer",
        transition: "all 0.15s", marginBottom: "0.6rem",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "22", border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f0ede8", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {highlight(job.title, query)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(240,237,232,0.45)", marginBottom: "0.5rem" }}>
            {highlight(job.company, query)} · {job.location}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {(job.skills || []).slice(0, 4).map(s => (
              <span key={s} style={{ fontSize: "0.68rem", background: skillColor(s) + "18", border: `1px solid ${skillColor(s)}33`, borderRadius: 100, padding: "0.15rem 0.55rem", color: skillColor(s) }}>
                {s}
              </span>
            ))}
            {(job.skills || []).length > 4 && (
              <span style={{ fontSize: "0.68rem", color: "rgba(240,237,232,0.3)" }}>+{job.skills.length - 4}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Panel ── */
function JobDetail({ job, onClose }) {
  const color = skillColor(job.company || job.title);
  const initials = job.company ? job.company.slice(0, 2).toUpperCase() : "??";

  // Extract a clean description (strip the boilerplate header)
  const desc = job.description
    ? job.description.replace(/^Le portail.*?Retour\n/s, "").slice(0, 800).trim()
    : "No description available.";

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "1.75rem", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: color + "22", border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", color, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#f0ede8", marginBottom: "0.2rem" }}>{job.title}</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(240,237,232,0.5)" }}>{job.company}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.3rem 0.7rem", color: "rgba(240,237,232,0.5)", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {[{ icon: "📍", text: job.location }, { icon: "🏢", text: job.company }].map(({ icon, text }) => text ? (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "0.3rem 0.8rem", fontSize: "0.78rem", color: "rgba(240,237,232,0.55)" }}>
            {icon} {text}
          </div>
        ) : null)}
      </div>

      {/* Skills */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.35)", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>REQUIRED SKILLS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {(job.skills || []).map(s => (
            <span key={s} style={{ fontSize: "0.78rem", background: skillColor(s) + "18", border: `1px solid ${skillColor(s)}44`, borderRadius: 100, padding: "0.25rem 0.7rem", color: skillColor(s), fontWeight: 500 }}>
              {s}
            </span>
          ))}
          {(!job.skills || job.skills.length === 0) && <span style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.3)" }}>Not specified</span>}
        </div>
      </div>

      {/* Description */}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.35)", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>DESCRIPTION</div>
        <p style={{ fontSize: "0.85rem", color: "rgba(240,237,232,0.55)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
          {desc}{job.description && job.description.length > 800 ? "…" : ""}
        </p>
      </div>

      {/* Apply CTA */}
      <a href={job.link} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #6c63ff, #3ecfb2)", border: "none", borderRadius: 12, padding: "0.85rem", color: "#fff", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", transition: "opacity 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
        Apply on Tanit Jobs →
      </a>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function JobsPage({ onBack }) {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filterLoc, setFilterLoc] = useState("All");
  const [filterSkill, setFilterSkill] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchJobs()
      .then(data => {
        // data may be array or { jobs: [...] }
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
    const matchSearch = !q ||
      j.title?.toLowerCase().includes(q) ||
      j.company?.toLowerCase().includes(q) ||
      (j.skills || []).some(s => s.toLowerCase().includes(q));
    const matchLoc = filterLoc === "All" || (j.location || "").includes(filterLoc);
    const matchSkill = filterSkill === "All" || (j.skills || []).includes(filterSkill);
    return matchSearch && matchLoc && matchSkill;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#f0ede8" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 3rem", borderBottom: "1px solid rgba(240,237,232,0.07)", position: "sticky", top: 0, background: "rgba(10,10,15,0.9)", backdropFilter: "blur(14px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6c63ff, #3ecfb2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", background: "linear-gradient(90deg, #c8c0ff, #3ecfb2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SkillPath</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button onClick={onBack} style={{ color: "rgba(240,237,232,0.4)", fontSize: "0.875rem", padding: "0.35rem 0.85rem", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}>← Dashboard</button>
          <span style={{ color: "#a098ff", fontSize: "0.875rem", padding: "0.35rem 0.85rem", borderRadius: 8, background: "rgba(108,99,255,0.1)" }}>Browse Jobs</span>
        </div>
        <div style={{ fontSize: "0.82rem", color: "rgba(240,237,232,0.35)" }}>
          {loading ? "Loading…" : `${filtered.length} / ${jobs.length} jobs`}
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 2rem" }}>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", color: "rgba(240,237,232,0.3)", pointerEvents: "none" }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, company, or skill…"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "0.7rem 0.9rem 0.7rem 2.4rem", color: "#f0ede8", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
          <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "0.7rem 1rem", color: filterLoc !== "All" ? "#a098ff" : "rgba(240,237,232,0.5)", fontSize: "0.875rem", outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            {locations.map(l => <option key={l} value={l} style={{ background: "#16161f" }}>{l === "All" ? "All locations" : l}</option>)}
          </select>
          <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "0.7rem 1rem", color: filterSkill !== "All" ? "#3ecfb2" : "rgba(240,237,232,0.5)", fontSize: "0.875rem", outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            {allSkills.map(s => <option key={s} value={s} style={{ background: "#16161f" }}>{s === "All" ? "All skills" : s}</option>)}
          </select>
          {(search || filterLoc !== "All" || filterSkill !== "All") && (
            <button onClick={() => { setSearch(""); setFilterLoc("All"); setFilterSkill("All"); }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "0.7rem 1rem", color: "rgba(240,237,232,0.4)", fontSize: "0.8rem", cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "4rem", color: "rgba(240,237,232,0.3)" }}>Loading jobs…</div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "4rem", color: "#e87885" }}>
            ⚠️ {error}<br/>
            <span style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.3)" }}>Make sure the recommender service is running on port 8001.</span>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem", alignItems: "start" }}>

            {/* Job list */}
            <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto", paddingRight: "0.25rem" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "rgba(240,237,232,0.25)", fontSize: "0.875rem" }}>No jobs match your filters.</div>
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
            <div style={{ position: "sticky", top: "90px", maxHeight: "calc(100vh - 110px)", overflowY: "auto" }}>
              {selected
                ? <JobDetail job={selected} onClose={() => setSelected(null)} />
                : <div style={{ textAlign: "center", padding: "4rem", color: "rgba(240,237,232,0.2)", fontSize: "0.875rem" }}>Select a job to see details</div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
