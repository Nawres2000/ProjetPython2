import { useState, useEffect, useRef } from "react";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const SKILLS = [
  "JavaScript", "Python", "React", "Node.js", "SQL", "Machine Learning",
  "Data Analysis", "UI/UX Design", "Project Management", "DevOps",
  "Java", "PHP", "Marketing", "Sales", "Accounting", "HR Management",
  "Cybersecurity", "Cloud Computing", "Mobile Development", "Agile/Scrum",
  "TypeScript", "Docker", "Kubernetes", "Figma", "Adobe XD",
];

const SAMPLE_JOBS = [
  { id: 1, title: "Frontend Developer",  company: "Tech Innovations SARL", location: "Tunis, Tunisia",  type: "Full-time", salary: "2,500 – 3,500 TND", tags: ["React", "JavaScript", "CSS"],              posted: "2 days ago", logo: "TI", color: "#1a73e8" },
  { id: 2, title: "Data Scientist",      company: "Analytics Hub",          location: "Sfax, Tunisia",   type: "Full-time", salary: "3,000 – 4,500 TND", tags: ["Python", "Machine Learning", "SQL"],      posted: "1 day ago",  logo: "AH", color: "#0f6e56" },
  { id: 3, title: "UX Designer",         company: "Creative Studio",        location: "Sousse, Tunisia", type: "Hybrid",    salary: "2,000 – 3,000 TND", tags: ["Figma", "UI/UX Design", "Adobe XD"],     posted: "3 days ago", logo: "CS", color: "#993556" },
  { id: 4, title: "DevOps Engineer",     company: "CloudBase TN",           location: "Tunis, Tunisia",  type: "Remote",    salary: "3,500 – 5,000 TND", tags: ["Docker", "Kubernetes", "Cloud Computing"], posted: "Today",      logo: "CB", color: "#7f77dd" },
];

const ROLE_PREDICTIONS = {
  JavaScript: "Frontend Developer", React: "Frontend Developer", TypeScript: "Frontend Developer",
  Python: "Data Scientist", "Machine Learning": "Data Scientist",
  "Data Analysis": "Data Analyst", SQL: "Data Analyst",
  "UI/UX Design": "UX Designer", Figma: "UX Designer", "Adobe XD": "UX Designer",
  Docker: "DevOps Engineer", Kubernetes: "DevOps Engineer", "Cloud Computing": "DevOps Engineer",
  "Project Management": "Product Manager", "Agile/Scrum": "Product Manager",
  Java: "Backend Developer", "Node.js": "Backend Developer", PHP: "Backend Developer",
  Cybersecurity: "Security Engineer", Marketing: "Marketing Specialist",
  Sales: "Sales Manager", Accounting: "Financial Analyst",
  "HR Management": "HR Specialist", "Mobile Development": "Mobile Developer", DevOps: "DevOps Engineer",
};

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const T = {
  bg:          "#0a0a0f",
  surface:     "rgba(255,255,255,0.025)",
  surfaceAlt:  "rgba(255,255,255,0.04)",
  border:      "rgba(255,255,255,0.07)",
  borderAlt:   "rgba(255,255,255,0.06)",
  purple:      "#6c63ff",
  purpleLight: "#a098ff",
  purpleDim:   "rgba(108,99,255,0.1)",
  purpleBorder:"rgba(108,99,255,0.25)",
  teal:        "#3ecfb2",
  tealDim:     "rgba(62,207,178,0.1)",
  tealBorder:  "rgba(62,207,178,0.2)",
  text:        "#f0ede8",
  textMuted:   "rgba(240,237,232,0.45)",
  textDim:     "rgba(240,237,232,0.35)",
  textFaint:   "rgba(240,237,232,0.25)",
  grad:        "linear-gradient(135deg, #6c63ff, #3ecfb2)",
  gradText:    "linear-gradient(90deg, #c8c0ff, #3ecfb2)",
  gradHero:    "linear-gradient(90deg, #6c63ff, #3ecfb2)",
  gradResult:  "linear-gradient(90deg, #a098ff, #3ecfb2)",
  fontSans:    "'DM Sans', sans-serif",
  fontDisplay: "'Syne', sans-serif",
};

/* ─── Shared style objects ───────────────────────────────────────────────── */
const S = {
  /* Buttons */
  btnPrimary: {
    background: T.grad, border: "none", borderRadius: 10,
    padding: "0.85rem 1.75rem", color: "#fff", cursor: "pointer",
    fontSize: "0.95rem", fontWeight: 500, letterSpacing: "-0.01em",
    fontFamily: T.fontSans,
  },
  btnGhost: {
    background: "transparent", border: "1px solid rgba(240,237,232,0.12)",
    borderRadius: 10, padding: "0.85rem 1.5rem",
    color: "rgba(240,237,232,0.6)", cursor: "pointer",
    fontSize: "0.95rem", fontFamily: T.fontSans,
  },
  btnOutline: {
    background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "0.5rem 1.1rem",
    color: "rgba(240,237,232,0.7)", cursor: "pointer",
    fontSize: "0.85rem", fontFamily: T.fontSans,
  },

  /* Labels */
  sectionLabel: {
    fontSize: "0.75rem", color: "rgba(240,237,232,0.3)",
    letterSpacing: "0.06em", marginBottom: "0.65rem",
    fontFamily: T.fontSans,
  },

  /* Cards */
  card: {
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 16, padding: "1.5rem",
  },
};

/* ─── AnimatedCounter ────────────────────────────────────────────────────── */
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1400;
        const step = (ts) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * value));
          if (progress < 1) requestAnimationFrame(step);
          else setCount(value);
        };
        requestAnimationFrame(step);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── JobCard ────────────────────────────────────────────────────────────── */
function JobCard({ job, onClick }) {
  const isRemote = job.type === "Remote";
  return (
    <div
      onClick={onClick}
      style={{ ...S.card, cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => {
        e.currentTarget.style.background   = "rgba(255,255,255,0.045)";
        e.currentTarget.style.borderColor  = "rgba(108,99,255,0.2)";
        e.currentTarget.style.transform    = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background   = T.surface;
        e.currentTarget.style.borderColor  = T.border;
        e.currentTarget.style.transform    = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: job.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: job.color, border: `1px solid ${job.color}30`, flexShrink: 0 }}>
            {job.logo}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: "1rem", color: T.text, marginBottom: "0.2rem" }}>{job.title}</div>
            <div style={{ fontSize: "0.8rem", color: T.textDim }}>{job.company}</div>
          </div>
        </div>
        <div style={{ fontSize: "0.72rem", color: isRemote ? T.teal : T.textMuted, background: isRemote ? T.tealDim : "rgba(255,255,255,0.04)", border: `1px solid ${isRemote ? T.tealBorder : "rgba(255,255,255,0.07)"}`, borderRadius: 100, padding: "0.25rem 0.7rem", whiteSpace: "nowrap" }}>
          {job.type}
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {job.tags.map(tag => (
          <span key={tag} style={{ fontSize: "0.75rem", background: T.purpleDim, color: "rgba(160,152,255,0.8)", border: `1px solid rgba(108,99,255,0.15)`, borderRadius: 100, padding: "0.2rem 0.65rem" }}>{tag}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.82rem", color: T.textDim }}>
          <span style={{ marginRight: "0.75rem" }}>📍 {job.location}</span>
          <span>{job.salary} / mo</span>
        </div>
        <div style={{ fontSize: "0.72rem", color: T.textFaint }}>{job.posted}</div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function HomePage({ onSignIn, onSignUp, onGoToApp, user }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput,     setSkillInput]     = useState("");
  const [suggestions,    setSuggestions]    = useState([]);
  const [predictedRole,  setPredictedRole]  = useState(null);
  const [isAnalyzing,    setIsAnalyzing]    = useState(false);
  const [activeFilter,   setActiveFilter]   = useState("All");
  const [visible,        setVisible]        = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* ── Skill helpers ── */
  const handleSkillInput = (val) => {
    setSkillInput(val);
    setSuggestions(
      val.length > 0
        ? SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !selectedSkills.includes(s)).slice(0, 5)
        : []
    );
  };

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) setSelectedSkills(p => [...p, skill]);
    setSkillInput(""); setSuggestions([]); setPredictedRole(null);
  };

  const removeSkill = (skill) => {
    setSelectedSkills(p => p.filter(s => s !== skill));
    setPredictedRole(null);
  };

  const predictRole = () => {
    if (selectedSkills.length === 0) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const votes = {};
      selectedSkills.forEach(skill => {
        const role = ROLE_PREDICTIONS[skill];
        if (role) votes[role] = (votes[role] || 0) + 1;
      });
      const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
      setPredictedRole(best ? best[0] : "Full-Stack Developer");
      setIsAnalyzing(false);
    }, 1600);
  };

  const filters     = ["All", "Full-time", "Remote", "Hybrid"];
  const filteredJobs = activeFilter === "All" ? SAMPLE_JOBS : SAMPLE_JOBS.filter(j => j.type === activeFilter);

  /* ── Shared fade style ── */
  const fadeStyle = (delay = 0) => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? "translateY(0)" : "translateY(28px)",
    transition: `all 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
  });

  return (
    <div style={{ fontFamily: T.fontSans, background: T.bg, minHeight: "100vh", color: T.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        ::placeholder      { color: rgba(240,237,232,0.22) !important; }
      `}</style>

      {/* ══════════════════ NAV ══════════════════ */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 3rem", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: "rgba(10,10,15,0.88)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", zIndex: 100 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, background: T.grad, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.01em", background: T.gradText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SkillPath</span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "2rem", fontSize: "0.875rem" }}>
          {["Jobs", "Skills", "Companies", "Insights"].map(item => (
            <a key={item} href="#"
              onClick={e => { e.preventDefault(); onSignIn(); }}
              style={{ textDecoration: "none", color: T.textMuted, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.text}
              onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
            >{item}</a>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: "0.8rem", color: T.textMuted, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "0.35rem 0.8rem" }}>
                {user.username}
              </span>
              <button onClick={onGoToApp} style={{ ...S.btnPrimary, padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}>
                Dashboard →
              </button>
            </>
          ) : (
            <>
              <button onClick={onSignIn}  style={S.btnOutline}>Log in</button>
              <button onClick={onSignUp}  style={{ ...S.btnPrimary, padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}>Get started</button>
            </>
          )}
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section ref={heroRef} style={{ padding: "6rem 3rem 4rem", maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        {/* Left copy */}
        <div style={fadeStyle(0)}>
          {/* Badge pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: T.purpleDim, border: `1px solid ${T.purpleBorder}`, borderRadius: 100, padding: "0.35rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, display: "inline-block" }} />
            <span style={{ fontSize: "0.78rem", color: T.teal, letterSpacing: "0.04em", fontWeight: 500 }}>AI-POWERED JOB MATCHING</span>
          </div>

          <h1 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(2.4rem, 4.5vw, 3.4rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 1.25rem", color: T.text }}>
            Your skills,<br />
            <span style={{ background: T.gradHero, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>your perfect role.</span>
          </h1>

          <p style={{ fontSize: "1.05rem", color: T.textMuted, lineHeight: 1.7, marginBottom: "2rem", maxWidth: 440 }}>
            Tell us what you know. We predict your ideal career path and surface real job opportunities from Tanit Jobs — tailored to you.
          </p>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={onSignUp} style={S.btnPrimary}>Discover your path →</button>
            <button onClick={onSignIn} style={S.btnGhost}>Browse jobs</button>
          </div>
        </div>

        {/* Right — floating stats card */}
        <div style={{ ...fadeStyle(0.15), position: "relative" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, borderRadius: 20, padding: "2rem", backdropFilter: "blur(10px)" }}>
            {/* Stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Active jobs",    value: 12400, suffix: "+" },
                { label: "Companies",      value: 840,   suffix: ""  },
                { label: "Skills tracked", value: 320,   suffix: ""  },
                { label: "Matches/month",  value: 9800,  suffix: "+" },
              ].map(stat => (
                <div key={stat.label} style={{ background: T.surfaceAlt, borderRadius: 12, padding: "1.1rem 1.25rem" }}>
                  <div style={{ fontSize: "1.6rem", fontFamily: T.fontDisplay, fontWeight: 800, color: T.text, lineHeight: 1 }}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(240,237,232,0.4)", marginTop: "0.35rem", letterSpacing: "0.03em" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Mini job previews */}
            {SAMPLE_JOBS.slice(0, 2).map((job, i) => (
              <div key={job.id} style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.75rem", background: T.surfaceAlt, borderRadius: 10, marginBottom: i === 0 ? "0.6rem" : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: job.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: job.color, flexShrink: 0 }}>{job.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(240,237,232,0.4)" }}>{job.company}</div>
                </div>
                <div style={{ fontSize: "0.7rem", background: T.tealDim, color: T.teal, border: `1px solid ${T.tealBorder}`, borderRadius: 100, padding: "0.2rem 0.65rem", whiteSpace: "nowrap" }}>{job.type}</div>
              </div>
            ))}
          </div>
          {/* Glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)", pointerEvents: "none", zIndex: -1 }} />
        </div>
      </section>

      {/* ══════════════════ SKILL PREDICTOR ══════════════════ */}
      <section style={{ padding: "4rem 3rem", maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 24, padding: "3rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>

            {/* Left — skill input */}
            <div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: "1.8rem", fontWeight: 800, margin: "0 0 0.5rem", letterSpacing: "-0.03em" }}>What's your skill set?</h2>
              <p style={{ color: T.textMuted, fontSize: "0.9rem", marginBottom: "1.75rem", lineHeight: 1.6 }}>
                Add your skills and our AI model will predict the best role for your profile.
              </p>

              {/* Input + autocomplete */}
              <div style={{ position: "relative", marginBottom: "1rem" }}>
                <input
                  value={skillInput}
                  onChange={e => handleSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && suggestions.length > 0) addSkill(suggestions[0]); }}
                  placeholder="Type a skill (e.g. React, Python…)"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, padding: "0.8rem 1rem", color: T.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: T.fontSans }}
                />
                {suggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#16161f", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, overflow: "hidden", zIndex: 20 }}>
                    {suggestions.map(s => (
                      <div key={s} onClick={() => addSkill(s)}
                        style={{ padding: "0.65rem 1rem", cursor: "pointer", fontSize: "0.875rem", color: "rgba(240,237,232,0.8)", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(108,99,255,0.12)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >{s}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular skills */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={S.sectionLabel}>POPULAR SKILLS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["React", "Python", "SQL", "Figma", "DevOps", "Java", "Node.js"].map(s => (
                    <button key={s} onClick={() => addSkill(s)} disabled={selectedSkills.includes(s)}
                      style={{ background: selectedSkills.includes(s) ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${selectedSkills.includes(s) ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 100, padding: "0.3rem 0.85rem", fontSize: "0.8rem", color: selectedSkills.includes(s) ? T.purpleLight : T.textMuted, cursor: selectedSkills.includes(s) ? "default" : "pointer", transition: "all 0.15s", fontFamily: T.fontSans }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Selected skills */}
              {selectedSkills.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={S.sectionLabel}>YOUR SKILLS ({selectedSkills.length})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {selectedSkills.map(s => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: T.tealDim, border: `1px solid ${T.tealBorder}`, borderRadius: 100, padding: "0.3rem 0.75rem 0.3rem 0.85rem", fontSize: "0.8rem", color: T.teal }}>
                        {s}
                        <button onClick={() => removeSkill(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(62,207,178,0.5)", padding: 0, lineHeight: 1, fontSize: "1rem" }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predict button */}
              <button
                onClick={predictRole}
                disabled={selectedSkills.length === 0 || isAnalyzing}
                style={{ ...S.btnPrimary, width: "100%", background: selectedSkills.length === 0 ? "rgba(108,99,255,0.3)" : T.grad, cursor: selectedSkills.length === 0 ? "not-allowed" : "pointer", opacity: isAnalyzing ? 0.7 : 1 }}
              >
                {isAnalyzing ? "Analyzing your profile…" : "Predict my best role →"}
              </button>
            </div>

            {/* Right — prediction result */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 300 }}>
              {!predictedRole && !isAnalyzing && (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="10" stroke="rgba(108,99,255,0.5)" strokeWidth="1.5" />
                      <path d="M16 11v5l3 3" stroke="rgba(108,99,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p style={{ color: "rgba(240,237,232,0.3)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    Add your skills and click predict to see your ideal role and matched job offers.
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(108,99,255,0.15)", borderTop: `2px solid ${T.purple}`, margin: "0 auto 1.25rem", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ color: "rgba(240,237,232,0.4)", fontSize: "0.9rem" }}>Analyzing {selectedSkills.length} skills…</p>
                </div>
              )}

              {predictedRole && !isAnalyzing && (
                <div style={{ animation: "fadeIn 0.5s ease" }}>
                  {/* Result hero */}
                  <div style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(62,207,178,0.1))", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 16, padding: "1.75rem", marginBottom: "1.25rem" }}>
                    <div style={{ ...S.sectionLabel, marginBottom: "0.65rem" }}>YOUR BEST MATCH</div>
                    <div style={{ fontFamily: T.fontDisplay, fontSize: "1.6rem", fontWeight: 800, background: T.gradResult, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>{predictedRole}</div>
                    <div style={{ fontSize: "0.85rem", color: T.textDim, lineHeight: 1.6 }}>Based on your {selectedSkills.length} skills, this role aligns most with your profile.</div>
                  </div>

                  <div style={{ ...S.sectionLabel, marginBottom: "0.75rem", letterSpacing: "0.05em" }}>RECOMMENDED JOBS FROM TANIT JOBS</div>
                  {SAMPLE_JOBS.slice(0, 2).map(job => (
                    <div key={job.id} onClick={onSignIn}
                      style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.9rem 1rem", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderAlt}`, borderRadius: 12, marginBottom: "0.6rem", cursor: "pointer", transition: "border-color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = T.purpleBorder}
                      onMouseLeave={e => e.currentTarget.style.borderColor = T.borderAlt}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: job.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: job.color, flexShrink: 0 }}>{job.logo}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500, color: T.text }}>{job.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(240,237,232,0.4)" }}>{job.company} · {job.location}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M9 5l3 3-3 3" stroke="rgba(240,237,232,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ JOB LISTINGS ══════════════════ */}
      <section style={{ padding: "2rem 3rem 5rem", maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "1.7rem", fontWeight: 800, margin: "0 0 0.3rem", letterSpacing: "-0.03em" }}>Latest from Tanit Jobs</h2>
            <p style={{ color: T.textDim, fontSize: "0.875rem", margin: 0 }}>Real-time job offers sourced from tanit-jobs.com</p>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ background: activeFilter === f ? "rgba(108,99,255,0.15)" : "transparent", border: `1px solid ${activeFilter === f ? "rgba(108,99,255,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: 100, padding: "0.35rem 0.9rem", fontSize: "0.8rem", color: activeFilter === f ? T.purpleLight : T.textMuted, cursor: "pointer", transition: "all 0.15s", fontFamily: T.fontSans }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {filteredJobs.map(job => <JobCard key={job.id} job={job} onClick={onSignIn} />)}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button onClick={onSignIn}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "0.85rem 2.5rem", color: T.textMuted, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", fontFamily: T.fontSans }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,99,255,0.35)"; e.currentTarget.style.color = T.purpleLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";  e.currentTarget.style.color = T.textMuted; }}
          >
            View all jobs on Tanit Jobs →
          </button>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section style={{ padding: "4rem 3rem", borderTop: `1px solid rgba(255,255,255,0.05)`, maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 0.5rem" }}>How SkillPath works</h2>
          <p style={{ color: T.textDim, fontSize: "0.9rem" }}>Three steps to your next opportunity</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {[
            { step: "01", title: "Add your skills",        desc: "Tell us what tools, languages, and domains you know. The more you add, the smarter the match.",                 icon: "✦", color: T.purple      },
            { step: "02", title: "Get your role prediction",desc: "Our AI analyzes your skill profile and identifies the career path where you'll excel most.",                    icon: "◈", color: T.teal        },
            { step: "03", title: "Apply to matched jobs",  desc: "Browse real Tanit Jobs listings filtered to your predicted role. One click to apply.",                           icon: "◎", color: T.purpleLight },
          ].map(item => (
            <div key={item.step} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "1.4rem", color: item.color }}>{item.icon}</span>
                <span style={{ fontFamily: T.fontDisplay, fontSize: "2rem", fontWeight: 800, color: "rgba(255,255,255,0.04)", lineHeight: 1 }}>{item.step}</span>
              </div>
              <h3 style={{ fontWeight: 600, fontSize: "1rem", margin: "0 0 0.5rem", color: T.text }}>{item.title}</h3>
              <p style={{ color: T.textDim, fontSize: "0.875rem", lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 24, height: 24, background: T.grad, borderRadius: 6 }} />
          <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: "0.9rem", color: T.textMuted }}>SkillPath</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.2)", margin: 0 }}>Job data sourced from tanit-jobs.com · Tunisia's #1 job platform</p>
        <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.8rem", color: T.textFaint }}>
          {["Privacy", "Terms", "Contact"].map(label => (
            <a key={label} href="#" style={{ textDecoration: "none", color: "inherit" }}>{label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}