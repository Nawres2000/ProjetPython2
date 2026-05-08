import { useState, useRef, useEffect } from "react";
import {
  apiGetProfile, apiSaveProfile,
  apiUploadCV, apiUploadCover,
  apiDeleteCV, apiDeleteCover,
} from "../services/api";

/* ─────────────────────────── helpers ─────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 8);

const ALL_SKILLS = [
  "JavaScript","Python","React","Node.js","SQL","Machine Learning",
  "Data Analysis","UI/UX Design","Project Management","DevOps",
  "Java","PHP","Marketing","Sales","Accounting","HR Management",
  "Cybersecurity","Cloud Computing","Mobile Development","Agile/Scrum",
  "TypeScript","Docker","Kubernetes","Figma","Adobe XD","C++","Rust",
  "GraphQL","REST APIs","PostgreSQL","MongoDB","Redis","Next.js","Vue.js",
];

const SKILL_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];

const DEGREE_OPTIONS = ["Bachelor's","Master's","PhD","Associate's","Diploma","Bootcamp","Self-taught"];

/* ─────────────────────────── sub-components ─────────────────────────── */

function Section({ title, icon, children, action }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "1.75rem", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1rem" }}>{icon}</span>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1rem", margin: 0, letterSpacing: "-0.01em", color: "#f0ede8" }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddButton({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(108,99,255,0.1)", border: "1px dashed rgba(108,99,255,0.35)", borderRadius: 8, padding: "0.45rem 1rem", color: "#a098ff", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,99,255,0.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(108,99,255,0.1)"; }}>
      <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span> {label}
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <div style={{ marginBottom: "1rem", ...style }}>
      {label && <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,232,0.4)", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "0.7rem 0.9rem", color: "#f0ede8", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }} />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,232,0.4)", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "0.7rem 0.9rem", color: "#f0ede8", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", resize: "vertical", lineHeight: 1.6 }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,232,0.4)", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "0.7rem 0.9rem", color: "#f0ede8", fontSize: "0.875rem", outline: "none", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o} style={{ background: "#16161f" }}>{o}</option>)}
      </select>
    </div>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "rgba(227,63,63,0.08)", border: "1px solid rgba(227,63,63,0.15)", borderRadius: 7, padding: "0.3rem 0.55rem", color: "rgba(240,100,100,0.6)", cursor: "pointer", fontSize: "0.75rem", lineHeight: 1, transition: "all 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(227,63,63,0.15)"; e.currentTarget.style.color = "#f06464"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(227,63,63,0.08)"; e.currentTarget.style.color = "rgba(240,100,100,0.6)"; }}>✕</button>
  );
}

/* ─────────────────────────── upload zone ─────────────────────────── */
function UploadZone({ label, accept, file, onFile, icon }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{ border: `1.5px dashed ${dragging ? "rgba(108,99,255,0.6)" : file ? "rgba(62,207,178,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: "1.75rem 1.5rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: dragging ? "rgba(108,99,255,0.06)" : file ? "rgba(62,207,178,0.04)" : "rgba(255,255,255,0.015)" }}>
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => onFile(e.target.files[0])} />
      <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{file ? "✅" : icon}</div>
      {file ? (
        <>
          <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#3ecfb2", marginBottom: "0.25rem" }}>{file.name}</div>
          <div style={{ fontSize: "0.75rem", color: "rgba(240,237,232,0.3)" }}>{(file.size / 1024).toFixed(0)} KB · Click to replace</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "rgba(240,237,232,0.55)", marginBottom: "0.25rem" }}>{label}</div>
          <div style={{ fontSize: "0.75rem", color: "rgba(240,237,232,0.25)" }}>PDF, DOC, DOCX · Max 5 MB</div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────── profile completion ring ─────────────────────────── */
function CompletionRing({ pct }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="url(#ring-grad)" strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6c63ff" />
          <stop offset="100%" stopColor="#3ecfb2" />
        </linearGradient>
      </defs>
      <text x="36" y="40" textAnchor="middle" fill="#f0ede8" fontSize="13" fontWeight="700" fontFamily="'Syne', sans-serif">{pct}%</text>
    </svg>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */
export default function ProfilePage({ user, onBack }) {
  /* — basic info — */
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [name, setName] = useState(user?.username || "");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [bio, setBio] = useState("");

  /* — documents (stored info from server) — */
  const [cvInfo, setCvInfo] = useState(null);     // { path, filename } or null
  const [coverInfo, setCoverInfo] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  /* — save state — */
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  /* — load profile on mount — */
  useEffect(() => {
    if (!user?.token) return;
    apiGetProfile(user.token).then((p) => {
      if (p.title)    setTitle(p.title);
      if (p.phone)    setPhone(p.phone);
      if (p.location) setLocation(p.location);
      if (p.linkedin) setLinkedin(p.linkedin);
      if (p.bio)      setBio(p.bio);
      if (p.skills)   setSkills(p.skills);
      if (p.educations)  setEducations(p.educations);
      if (p.experiences) setExperiences(p.experiences);
      if (p.cv_path)    setCvInfo({ path: p.cv_path, filename: p.cv_filename });
      if (p.cover_path) setCoverInfo({ path: p.cover_path, filename: p.cover_filename });
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* — skills — */
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  /* — education — */
  const [educations, setEducations] = useState([]);

  /* — experience — */
  const [experiences, setExperiences] = useState([]);

  /* — active tab — */
  const [tab, setTab] = useState("profile");

  /* — avatar (local preview only) — */
  const avatarRef = useRef();
  const handleAvatar = (f) => {
    setAvatarUrl(URL.createObjectURL(f));
  };

  /* — CV upload — */
  const handleCvFile = async (f) => {
    setCvUploading(true);
    try {
      const result = await apiUploadCV(user.token, f);
      setCvInfo(result);
    } catch (e) {
      alert(e.message);
    } finally {
      setCvUploading(false);
    }
  };

  /* — Cover letter upload — */
  const handleCoverFile = async (f) => {
    setCoverUploading(true);
    try {
      const result = await apiUploadCover(user.token, f);
      setCoverInfo(result);
    } catch (e) {
      alert(e.message);
    } finally {
      setCoverUploading(false);
    }
  };

  /* — Remove CV — */
  const handleRemoveCv = async () => {
    try {
      await apiDeleteCV(user.token);
      setCvInfo(null);
    } catch (e) {
      alert(e.message);
    }
  };

  /* — Remove Cover — */
  const handleRemoveCover = async () => {
    try {
      await apiDeleteCover(user.token);
      setCoverInfo(null);
    } catch (e) {
      alert(e.message);
    }
  };

  /* — Save profile — */
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await apiSaveProfile(user.token, { title, phone, location, linkedin, bio, skills, educations, experiences });
      setSaveMsg("Profile saved!");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e) {
      setSaveMsg("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  /* — skills — */
  const handleSkillInput = (val) => {
    setSkillInput(val);
    if (val.length > 0) {
      setSkillSuggestions(ALL_SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !skills.find(sk => sk.name === s)).slice(0, 5));
    } else setSkillSuggestions([]);
  };

  const addSkill = (name) => {
    if (!name.trim() || skills.find(s => s.name === name)) return;
    setSkills([...skills, { id: uid(), name, level: skillLevel }]);
    setSkillInput(""); setSkillSuggestions([]);
  };

  const removeSkill = (id) => setSkills(skills.filter(s => s.id !== id));
  const updateSkillLevel = (id, level) => setSkills(skills.map(s => s.id === id ? { ...s, level } : s));

  /* — education — */
  const addEdu = () => setEducations([...educations, { id: uid(), degree: "Bachelor's", field: "", school: "", year: "", description: "" }]);
  const removeEdu = (id) => setEducations(educations.filter(e => e.id !== id));
  const updateEdu = (id, key, val) => setEducations(educations.map(e => e.id === id ? { ...e, [key]: val } : e));

  /* — experience — */
  const addExp = () => setExperiences([...experiences, { id: uid(), role: "", company: "", start: "", end: "", current: false, description: "" }]);
  const removeExp = (id) => setExperiences(experiences.filter(e => e.id !== id));
  const updateExp = (id, key, val) => setExperiences(experiences.map(e => e.id === id ? { ...e, [key]: val } : e));

  /* — completion score — */
  const completion = Math.round(
    ([name, email, bio, phone, location].filter(Boolean).length / 5 * 20) +
    (cvInfo ? 15 : 0) + (coverInfo ? 10 : 0) +
    (skills.length > 0 ? 20 : 0) +
    (educations.length > 0 ? 17 : 0) +
    (experiences.length > 0 ? 18 : 0)
  );

  const levelColor = (level) => ({
    Beginner: "#888", Intermediate: "#6c63ff", Advanced: "#3ecfb2", Expert: "#f5c842"
  }[level] || "#888");

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#f0ede8" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(240,237,232,0.2) !important; }
        select option { background: #16161f; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 3rem", borderBottom: "1px solid rgba(240,237,232,0.07)", position: "sticky", top: 0, background: "rgba(10,10,15,0.9)", backdropFilter: "blur(14px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6c63ff, #3ecfb2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", background: "linear-gradient(90deg, #c8c0ff, #3ecfb2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SkillPath</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button onClick={onBack} style={{ textDecoration: "none", color: "rgba(240,237,232,0.4)", fontSize: "0.875rem", padding: "0.35rem 0.85rem", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}>← Dashboard</button>
          <span style={{ color: "#a098ff", fontSize: "0.875rem", padding: "0.35rem 0.85rem", borderRadius: 8, background: "rgba(108,99,255,0.1)" }}>Profile</span>
        </div>
        <button style={{ background: "linear-gradient(135deg, #6c63ff, #3ecfb2)", border: "none", borderRadius: 8, padding: "0.5rem 1.25rem", color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>Save profile</button>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 2rem", display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.75rem", alignItems: "start" }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ position: "sticky", top: "90px" }}>
          {/* Avatar + name card */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "1.75rem", marginBottom: "1rem", textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
              <div onClick={() => avatarRef.current.click()} style={{ width: 90, height: 90, borderRadius: "50%", background: avatarUrl ? "transparent" : "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(62,207,178,0.3))", border: "2px solid rgba(108,99,255,0.3)", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "rgba(240,237,232,0.4)" }}>
                {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
              </div>
              <div onClick={() => avatarRef.current.click()} style={{ position: "absolute", bottom: 2, right: 2, width: 24, height: 24, borderRadius: "50%", background: "#6c63ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #0a0a0f" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 7.5L3.5 5l4-4M6.5 1.5l2 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleAvatar(e.target.files[0])} />
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.25rem" }}>{name || "Your Name"}</div>
            <div style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.4)", marginBottom: "1rem" }}>{title || "Your Title"}</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CompletionRing pct={completion} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.3)", marginTop: "0.5rem" }}>Profile completeness</div>
          </div>

          {/* Side nav */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
            {[
              { key: "profile", icon: "👤", label: "Basic Info" },
              { key: "documents", icon: "📄", label: "Documents" },
              { key: "skills", icon: "⚡", label: "Skills" },
              { key: "education", icon: "🎓", label: "Education" },
              { key: "experience", icon: "💼", label: "Experience" },
            ].map(({ key, icon, label }) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", padding: "0.9rem 1.25rem", background: tab === key ? "rgba(108,99,255,0.12)" : "transparent", border: "none", borderLeft: `2.5px solid ${tab === key ? "#6c63ff" : "transparent"}`, cursor: "pointer", fontSize: "0.875rem", color: tab === key ? "#a098ff" : "rgba(240,237,232,0.45)", textAlign: "left", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}>
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                <span>{label}</span>
                {tab === key && <span style={{ marginLeft: "auto", fontSize: "0.7rem", opacity: 0.5 }}>▶</span>}
              </button>
            ))}
          </div>

          {/* Quick stats */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1.25rem", marginTop: "1rem" }}>
            <div style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.3)", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>PROFILE STATS</div>
            {[
              { label: "Skills", value: skills.length, color: "#6c63ff" },
              { label: "Experiences", value: experiences.length, color: "#3ecfb2" },
              { label: "Education", value: educations.length, color: "#a098ff" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.4)" }}>{s.label}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div className="fade-up" key={tab}>

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (
            <div>
              <Section title="Basic Information" icon="👤">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.25rem" }}>
                  <Input label="FULL NAME" value={name} onChange={setName} placeholder="e.g. Amine Belhaj" />
                  <Input label="JOB TITLE" value={title} onChange={setTitle} placeholder="e.g. Frontend Developer" />
                  <Input label="EMAIL" value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
                  <Input label="PHONE" value={phone} onChange={setPhone} placeholder="+216 XX XXX XXX" />
                  <Input label="LOCATION" value={location} onChange={setLocation} placeholder="City, Country" />
                  <Input label="LINKEDIN" value={linkedin} onChange={setLinkedin} placeholder="linkedin.com/in/..." />
                </div>
                <Textarea label="BIO" value={bio} onChange={setBio} placeholder="Write a short professional summary about yourself…" rows={4} />
              </Section>
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {tab === "documents" && (
            <Section title="Documents" icon="📄">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(240,237,232,0.4)", letterSpacing: "0.05em", marginBottom: "0.65rem" }}>CURRICULUM VITAE</div>
                  {cvUploading ? (
                    <div style={{ borderRadius: 14, padding: "2rem", textAlign: "center", color: "rgba(240,237,232,0.4)", border: "1.5px dashed rgba(255,255,255,0.1)" }}>Uploading…</div>
                  ) : (
                    <UploadZone label="Drop your CV here or click to browse" accept=".pdf,.doc,.docx" file={cvInfo ? { name: cvInfo.filename, size: 0 } : null} onFile={handleCvFile} icon="📋" />
                  )}
                  {cvInfo && !cvUploading && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                      <a href={`/backend${cvInfo.path}`} target="_blank" rel="noreferrer" style={{ background: "rgba(62,207,178,0.1)", border: "1px solid rgba(62,207,178,0.2)", borderRadius: 8, padding: "0.4rem 1rem", color: "#3ecfb2", cursor: "pointer", fontSize: "0.8rem", textDecoration: "none" }}>Download</a>
                      <button onClick={handleRemoveCv} style={{ background: "transparent", border: "none", color: "rgba(240,100,100,0.5)", cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(240,237,232,0.4)", letterSpacing: "0.05em", marginBottom: "0.65rem" }}>COVER LETTER</div>
                  {coverUploading ? (
                    <div style={{ borderRadius: 14, padding: "2rem", textAlign: "center", color: "rgba(240,237,232,0.4)", border: "1.5px dashed rgba(255,255,255,0.1)" }}>Uploading…</div>
                  ) : (
                    <UploadZone label="Drop your cover letter here or click to browse" accept=".pdf,.doc,.docx" file={coverInfo ? { name: coverInfo.filename, size: 0 } : null} onFile={handleCoverFile} icon="✉️" />
                  )}
                  {coverInfo && !coverUploading && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                      <a href={`/backend${coverInfo.path}`} target="_blank" rel="noreferrer" style={{ background: "rgba(62,207,178,0.1)", border: "1px solid rgba(62,207,178,0.2)", borderRadius: 8, padding: "0.4rem 1rem", color: "#3ecfb2", cursor: "pointer", fontSize: "0.8rem", textDecoration: "none" }}>Download</a>
                      <button onClick={handleRemoveCover} style={{ background: "transparent", border: "none", color: "rgba(240,100,100,0.5)", cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: "1.5rem", background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.12)", borderRadius: 12, padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.45)", lineHeight: 1.7 }}>
                  💡 <strong style={{ color: "rgba(240,237,232,0.7)", fontWeight: 500 }}>Tip:</strong> A complete CV increases your match rate by up to 3×. Make sure your file is up-to-date and under 5 MB.
                </div>
              </div>
            </Section>
          )}

          {/* ── SKILLS TAB ── */}
          {tab === "skills" && (
            <Section title="Skills" icon="⚡">
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", alignItems: "flex-end", marginBottom: "1.5rem", position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <Input label="ADD SKILL" value={skillInput} onChange={handleSkillInput} placeholder="Type a skill name…" style={{ marginBottom: 0 }} />
                  {skillSuggestions.length > 0 && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#16161f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, zIndex: 20, overflow: "hidden" }}>
                      {skillSuggestions.map(s => (
                        <div key={s} onClick={() => addSkill(s)} style={{ padding: "0.65rem 1rem", cursor: "pointer", fontSize: "0.875rem", color: "rgba(240,237,232,0.8)", transition: "background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(108,99,255,0.12)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{s}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(240,237,232,0.4)", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>LEVEL</label>
                  <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "0.7rem 0.9rem", color: "#f0ede8", fontSize: "0.875rem", outline: "none", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                    {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <button onClick={() => addSkill(skillInput)} disabled={!skillInput.trim()}
                  style={{ background: skillInput.trim() ? "linear-gradient(135deg, #6c63ff, #3ecfb2)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 9, padding: "0.7rem 1.25rem", color: skillInput.trim() ? "#fff" : "rgba(240,237,232,0.2)", cursor: skillInput.trim() ? "pointer" : "not-allowed", fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap", marginTop: "1.4rem" }}>Add skill</button>
              </div>

              {skills.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "rgba(240,237,232,0.2)", fontSize: "0.875rem" }}>No skills added yet. Type above to add your first skill.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {skills.map(sk => (
                    <div key={sk.id} style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 11, padding: "0.75rem 1rem" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: levelColor(sk.level), flexShrink: 0 }}></div>
                      <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 500, color: "#f0ede8" }}>{sk.name}</span>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        {SKILL_LEVELS.map(l => (
                          <button key={l} onClick={() => updateSkillLevel(sk.id, l)}
                            style={{ background: sk.level === l ? levelColor(l) + "22" : "transparent", border: `1px solid ${sk.level === l ? levelColor(l) + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: 100, padding: "0.2rem 0.65rem", fontSize: "0.72rem", color: sk.level === l ? levelColor(l) : "rgba(240,237,232,0.3)", cursor: "pointer", transition: "all 0.15s" }}>
                            {l}
                          </button>
                        ))}
                      </div>
                      <DeleteBtn onClick={() => removeSkill(sk.id)} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "1.25rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {SKILL_LEVELS.map(l => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: levelColor(l) }}></div>
                    <span style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.3)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── EDUCATION TAB ── */}
          {tab === "education" && (
            <Section title="Education" icon="🎓" action={<AddButton onClick={addEdu} label="Add education" />}>
              {educations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "rgba(240,237,232,0.2)", fontSize: "0.875rem" }}>No education entries yet.</div>
              ) : (
                educations.map((edu, idx) => (
                  <div key={edu.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "1.25rem", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>🎓</div>
                        <span style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.35)" }}>Entry {idx + 1}</span>
                      </div>
                      <DeleteBtn onClick={() => removeEdu(edu.id)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.25rem" }}>
                      <Select label="DEGREE" value={edu.degree} onChange={v => updateEdu(edu.id, "degree", v)} options={DEGREE_OPTIONS} />
                      <Input label="FIELD OF STUDY" value={edu.field} onChange={v => updateEdu(edu.id, "field", v)} placeholder="e.g. Computer Science" />
                      <Input label="INSTITUTION" value={edu.school} onChange={v => updateEdu(edu.id, "school", v)} placeholder="University name" />
                      <Input label="GRADUATION YEAR" value={edu.year} onChange={v => updateEdu(edu.id, "year", v)} placeholder="e.g. 2022" />
                    </div>
                    <Textarea label="DESCRIPTION (OPTIONAL)" value={edu.description} onChange={v => updateEdu(edu.id, "description", v)} placeholder="Courses, projects, achievements…" rows={2} />
                  </div>
                ))
              )}
            </Section>
          )}

          {/* ── EXPERIENCE TAB ── */}
          {tab === "experience" && (
            <Section title="Professional Experience" icon="💼" action={<AddButton onClick={addExp} label="Add experience" />}>
              {experiences.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "rgba(240,237,232,0.2)", fontSize: "0.875rem" }}>No experience entries yet.</div>
              ) : (
                experiences.map((exp, idx) => (
                  <div key={exp.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "1.25rem", marginBottom: "1rem", position: "relative" }}>
                    {idx < experiences.length - 1 && (
                      <div style={{ position: "absolute", left: -1, top: "100%", width: 1, height: "1rem", background: "rgba(108,99,255,0.2)" }}></div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(62,207,178,0.1)", border: "1px solid rgba(62,207,178,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>💼</div>
                        <span style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.35)" }}>Experience {idx + 1}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "rgba(240,237,232,0.4)", cursor: "pointer" }}>
                          <input type="checkbox" checked={exp.current} onChange={e => updateExp(exp.id, "current", e.target.checked)}
                            style={{ accentColor: "#3ecfb2" }} />
                          Current job
                        </label>
                        <DeleteBtn onClick={() => removeExp(exp.id)} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.25rem" }}>
                      <Input label="JOB TITLE" value={exp.role} onChange={v => updateExp(exp.id, "role", v)} placeholder="e.g. Frontend Developer" />
                      <Input label="COMPANY" value={exp.company} onChange={v => updateExp(exp.id, "company", v)} placeholder="Company name" />
                      <Input label="START DATE" value={exp.start} onChange={v => updateExp(exp.id, "start", v)} placeholder="e.g. Jan 2022" />
                      <Input label="END DATE" value={exp.end} onChange={v => updateExp(exp.id, "end", v)} placeholder={exp.current ? "Present" : "e.g. Dec 2023"} style={{ opacity: exp.current ? 0.4 : 1, pointerEvents: exp.current ? "none" : "auto" }} />
                    </div>
                    <Textarea label="DESCRIPTION" value={exp.description} onChange={v => updateExp(exp.id, "description", v)} placeholder="Describe your responsibilities, achievements, and technologies used…" rows={3} />
                  </div>
                ))
              )}
            </Section>
          )}

          {/* ── SAVE BUTTON ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
            {saveMsg && <span style={{ fontSize: "0.85rem", color: saveMsg.startsWith("Failed") ? "#e87885" : "#3ecfb2" }}>{saveMsg}</span>}
            <button onClick={() => window.location.reload()} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "0.75rem 1.5rem", color: "rgba(240,237,232,0.4)", cursor: "pointer", fontSize: "0.875rem" }}>Discard changes</button>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #6c63ff, #3ecfb2)", border: "none", borderRadius: 10, padding: "0.75rem 2rem", color: saving ? "rgba(240,237,232,0.3)" : "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
              {saving ? "Saving…" : "Save & update profile"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
