import { useState, useRef, useEffect } from "react";
import {
  apiGetProfile, apiSaveProfile,
  apiUploadCV, apiUploadCover,
  apiDeleteCV, apiDeleteCover,
} from "../services/api";

/* ─── Tokens ────────────────────────────────────────────────────────────── */
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
  accentDark:  "#9a3208",
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

/* ─── Constants ─────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 8);

const ALL_SKILLS = [
  "JavaScript","Python","React","Node.js","SQL","Machine Learning",
  "Data Analysis","UI/UX Design","Project Management","DevOps",
  "Java","PHP","Marketing","Sales","Accounting","HR Management",
  "Cybersecurity","Cloud Computing","Mobile Development","Agile/Scrum",
  "TypeScript","Docker","Kubernetes","Figma","Adobe XD","C++","Rust",
  "GraphQL","REST APIs","PostgreSQL","MongoDB","Redis","Next.js","Vue.js",
];

const SKILL_LEVELS   = ["Beginner","Intermediate","Advanced","Expert"];
const DEGREE_OPTIONS = ["Bachelor's","Master's","PhD","Associate's","Diploma","Bootcamp","Self-taught"];

const LEVEL_COLORS = {
  Beginner:     T.ink25,
  Intermediate: T.blue,
  Advanced:     T.accent,
  Expert:       "#b45309",
};

/* ─── Base styles ───────────────────────────────────────────────────────── */
const inputBase = {
  width: "100%", boxSizing: "border-box",
  background: T.warm, border: `1.5px solid ${T.border}`,
  borderRadius: 8, padding: "9px 13px",
  color: T.ink, fontSize: 13.5, fontFamily: T.sans,
  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
};

/* ─── Micro-components ──────────────────────────────────────────────────── */
function FieldLabel({ text }) {
  return (
    <div style={{
      fontFamily: T.mono, fontSize: 10.5,
      letterSpacing: "0.1em", textTransform: "uppercase",
      color: T.ink25, marginBottom: 7, fontWeight: 500,
    }}>{text}</div>
  );
}

function FInput({ label, value, onChange, placeholder, type = "text", disabled }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <FieldLabel text={label} />}
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          ...inputBase,
          borderColor: f ? T.accent : T.border,
          background:  f ? T.white  : T.warm,
          boxShadow:   f ? `0 0 0 3px ${T.accentLight}` : "none",
          opacity: disabled ? 0.4 : 1,
        }}
      />
    </div>
  );
}

function FTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <FieldLabel text={label} />}
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          ...inputBase,
          resize: "vertical", lineHeight: 1.65,
          borderColor: f ? T.accent : T.border,
          background:  f ? T.white  : T.warm,
          boxShadow:   f ? `0 0 0 3px ${T.accentLight}` : "none",
        }}
      />
    </div>
  );
}

function FSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <FieldLabel text={label} />}
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputBase, cursor: "pointer", color: T.ink }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DeleteBtn({ onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? "#fee2e2" : T.warm,
        border: `1px solid ${h ? "#fca5a5" : T.border}`,
        borderRadius: 7, padding: "4px 9px",
        color: h ? "#b91c1c" : T.ink45,
        cursor: "pointer", fontSize: 13, lineHeight: 1,
        transition: "all 0.15s",
      }}>✕</button>
  );
}

function AddButton({ onClick, label }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: h ? T.accentLight : T.warm,
        border: `1.5px dashed ${h ? T.accentRule : T.border}`,
        borderRadius: 8, padding: "6px 14px",
        color: h ? T.accent : T.ink45,
        fontSize: 13, fontFamily: T.sans, cursor: "pointer",
        transition: "all 0.18s",
      }}>
      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> {label}
    </button>
  );
}

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── Section wrapper ───────────────────────────────────────────────────── */
function Section({ title, icon, children, action }) {
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`,
      borderRadius: 18, overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      marginBottom: 16,
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${T.accent}, ${T.blue})` }} />
      <div style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <h2 style={{
              fontFamily: T.serif, fontWeight: 400, fontSize: 18,
              margin: 0, color: T.ink, letterSpacing: "-0.01em",
            }}>{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Upload zone ───────────────────────────────────────────────────────── */
function UploadZone({ label, accept, file, onFile, icon }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `1.5px dashed ${dragging ? T.accent : file ? T.greenRule : T.border2}`,
        borderRadius: 12, padding: "28px 20px",
        textAlign: "center", cursor: "pointer",
        background: dragging ? T.accentLight : file ? T.greenLight : T.warm,
        transition: "all 0.2s",
      }}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => onFile(e.target.files[0])} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>{file ? "✅" : icon}</div>
      {file ? (
        <>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: T.green, marginBottom: 3 }}>{file.name}</div>
          <div style={{ fontSize: 12, color: T.ink45, fontFamily: T.mono }}>
            {file.size ? `${(file.size / 1024).toFixed(0)} KB · ` : ""}Click to replace
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13.5, color: T.ink70, marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 12, color: T.ink25, fontFamily: T.mono }}>PDF, DOC, DOCX · Max 5 MB</div>
        </>
      )}
    </div>
  );
}

/* ─── Completion ring ───────────────────────────────────────────────────── */
function CompletionRing({ pct }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke={T.warm2} strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={T.accent} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
      <text x="36" y="40" textAnchor="middle" fill={T.ink} fontSize="13"
        fontWeight="500" fontFamily={T.mono}>{pct}%</text>
    </svg>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function ProfilePage({ user, onBack }) {
  const [avatarUrl,      setAvatarUrl]      = useState(null);
  const [name,           setName]           = useState(user?.username || "");
  const [title,          setTitle]          = useState("");
  const [email,          setEmail]          = useState(user?.email || "");
  const [phone,          setPhone]          = useState("");
  const [location,       setLocation]       = useState("");
  const [linkedin,       setLinkedin]       = useState("");
  const [bio,            setBio]            = useState("");
  const [cvInfo,         setCvInfo]         = useState(null);
  const [coverInfo,      setCoverInfo]      = useState(null);
  const [cvUploading,    setCvUploading]    = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [saveMsg,        setSaveMsg]        = useState(null);
  const [skills,         setSkills]         = useState([]);
  const [skillInput,     setSkillInput]     = useState("");
  const [skillLevel,     setSkillLevel]     = useState("Intermediate");
  const [skillSugg,      setSkillSugg]      = useState([]);
  const [educations,     setEducations]     = useState([]);
  const [experiences,    setExperiences]    = useState([]);
  const [tab,            setTab]            = useState("profile");
  const avatarRef = useRef();

  useEffect(() => {
    if (!user?.token) return;
    apiGetProfile(user.token).then(p => {
      if (p.title)       setTitle(p.title);
      if (p.phone)       setPhone(p.phone);
      if (p.location)    setLocation(p.location);
      if (p.linkedin)    setLinkedin(p.linkedin);
      if (p.bio)         setBio(p.bio);
      if (p.skills)      setSkills(p.skills);
      if (p.educations)  setEducations(p.educations);
      if (p.experiences) setExperiences(p.experiences);
      if (p.cv_path)     setCvInfo({ path: p.cv_path, filename: p.cv_filename });
      if (p.cover_path)  setCoverInfo({ path: p.cover_path, filename: p.cover_filename });
    }).catch(() => {});
  }, []);

  /* — handlers — */
  const handleAvatar   = f => setAvatarUrl(URL.createObjectURL(f));

  const handleCvFile   = async f => { setCvUploading(true); try { setCvInfo(await apiUploadCV(user.token, f)); } catch(e) { alert(e.message); } finally { setCvUploading(false); } };
  const handleCoverFile= async f => { setCoverUploading(true); try { setCoverInfo(await apiUploadCover(user.token, f)); } catch(e) { alert(e.message); } finally { setCoverUploading(false); } };
  const handleRemoveCv   = async () => { try { await apiDeleteCV(user.token);    setCvInfo(null);    } catch(e) { alert(e.message); } };
  const handleRemoveCover= async () => { try { await apiDeleteCover(user.token); setCoverInfo(null); } catch(e) { alert(e.message); } };

  const handleSave = async () => {
    setSaving(true); setSaveMsg(null);
    try {
      await apiSaveProfile(user.token, { title, phone, location, linkedin, bio, skills, educations, experiences });
      setSaveMsg("Profile saved!"); setTimeout(() => setSaveMsg(null), 3000);
    } catch(e) { setSaveMsg("Failed to save: " + e.message); } finally { setSaving(false); }
  };

  /* — skills — */
  const handleSkillInput = val => {
    setSkillInput(val);
    setSkillSugg(val.length > 0
      ? ALL_SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !skills.find(sk => sk.name === s)).slice(0, 5)
      : []);
  };
  const addSkill = name => {
    if (!name.trim() || skills.find(s => s.name === name)) return;
    setSkills([...skills, { id: uid(), name, level: skillLevel }]);
    setSkillInput(""); setSkillSugg([]);
  };
  const removeSkill      = id    => setSkills(skills.filter(s => s.id !== id));
  const updateSkillLevel = (id, level) => setSkills(skills.map(s => s.id === id ? { ...s, level } : s));

  /* — education — */
  const addEdu    = () => setEducations([...educations, { id: uid(), degree: "Bachelor's", field: "", school: "", year: "", description: "" }]);
  const removeEdu = id => setEducations(educations.filter(e => e.id !== id));
  const updateEdu = (id, key, val) => setEducations(educations.map(e => e.id === id ? { ...e, [key]: val } : e));

  /* — experience — */
  const addExp    = () => setExperiences([...experiences, { id: uid(), role: "", company: "", start: "", end: "", current: false, description: "" }]);
  const removeExp = id => setExperiences(experiences.filter(e => e.id !== id));
  const updateExp = (id, key, val) => setExperiences(experiences.map(e => e.id === id ? { ...e, [key]: val } : e));

  /* — completion — */
  const completion = Math.round(
    ([name, email, bio, phone, location].filter(Boolean).length / 5 * 20) +
    (cvInfo ? 15 : 0) + (coverInfo ? 10 : 0) +
    (skills.length > 0 ? 20 : 0) +
    (educations.length > 0 ? 17 : 0) +
    (experiences.length > 0 ? 18 : 0)
  );

  const TABS = [
    { key: "profile",    icon: "👤", label: "Basic Info"   },
    { key: "documents",  icon: "📄", label: "Documents"    },
    { key: "skills",     icon: "⚡", label: "Skills"       },
    { key: "education",  icon: "🎓", label: "Education"    },
    { key: "experience", icon: "💼", label: "Experience"   },
  ];

  return (
    <div style={{ fontFamily: T.sans, background: T.paper, minHeight: "100vh", color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        ::placeholder { color: ${T.ink25} !important; }
        @keyframes sp-fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .sp-fade { animation: sp-fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes sp-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        height: 62, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0,
        background: "rgba(255,255,255,0.94)", backdropFilter: "blur(14px)", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: T.accent, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
          </div>
          <span style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em" }}>SkillPath</span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onBack}
            style={{ padding: "7px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${T.border}`, color: T.ink70, fontSize: 13.5, fontFamily: T.sans, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.warm; e.currentTarget.style.borderColor = T.border2; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; }}>
            ← Dashboard
          </button>
          <span style={{ padding: "7px 16px", borderRadius: 8, background: T.accentLight, border: `1px solid ${T.accentRule}`, color: T.accent, fontSize: 13.5, fontFamily: T.mono, fontWeight: 500 }}>Profile</span>
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ padding: "8px 20px", borderRadius: 8, background: saving ? T.warm : T.ink, border: `2px solid ${saving ? T.border : T.ink}`, color: saving ? T.ink45 : "#fff", fontSize: 13.5, fontFamily: T.sans, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = T.accent; e.currentTarget.style.borderColor = T.accent; } }}
          onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = T.ink; e.currentTarget.style.borderColor = T.ink; } }}>
          {saving ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid ${T.border}`, borderTopColor: T.accent, display: "inline-block", animation: "sp-spin 0.75s linear infinite" }} /> Saving…</> : <>Save profile <ArrowRight /></>}
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 48px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── Left sidebar ── */}
        <div style={{ position: "sticky", top: 78 }}>

          {/* Avatar card */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden", marginBottom: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${T.accent}, ${T.blue})` }} />
            <div style={{ padding: "24px 20px", textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 14 }}>
                <div onClick={() => avatarRef.current.click()} style={{ width: 88, height: 88, borderRadius: "50%", background: avatarUrl ? "transparent" : T.warm2, border: `2px solid ${T.border}`, overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: T.ink25, transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                  {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                </div>
                <div onClick={() => avatarRef.current.click()} style={{ position: "absolute", bottom: 2, right: 2, width: 24, height: 24, borderRadius: "50%", background: T.ink, border: `2px solid ${T.white}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 7.5L3.5 5l4-4M6.5 1.5l2 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleAvatar(e.target.files[0])} />
              </div>
              <div style={{ fontFamily: T.serif, fontWeight: 400, fontSize: 17, color: T.ink, marginBottom: 3, lineHeight: 1.2 }}>{name || "Your Name"}</div>
              <div style={{ fontSize: 12.5, color: T.ink45, marginBottom: 16, fontStyle: "italic" }}>{title || "Your Title"}</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                <CompletionRing pct={completion} />
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.ink25, letterSpacing: "0.06em", textTransform: "uppercase" }}>Profile completeness</div>
            </div>
          </div>

          {/* Tab nav */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            {TABS.map(({ key, icon, label }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "11px 16px",
                background: tab === key ? T.accentLight : "transparent",
                border: "none",
                borderLeft: `3px solid ${tab === key ? T.accent : "transparent"}`,
                cursor: "pointer", fontSize: 13.5,
                color: tab === key ? T.accent : T.ink70,
                fontFamily: T.sans, fontWeight: tab === key ? 500 : 400,
                textAlign: "left", transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (tab !== key) e.currentTarget.style.background = T.warm; }}
                onMouseLeave={e => { if (tab !== key) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span>{label}</span>
                {tab === key && <span style={{ marginLeft: "auto" }}><ArrowRight /></span>}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 18px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <FieldLabel text="Profile Stats" />
            {[
              { label: "Skills",      value: skills.length,      color: T.blue   },
              { label: "Experiences", value: experiences.length, color: T.accent },
              { label: "Education",   value: educations.length,  color: T.green  },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: T.ink70 }}>{s.label}</span>
                <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 500, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right content ── */}
        <div className="sp-fade" key={tab}>

          {/* PROFILE TAB */}
          {tab === "profile" && (
            <Section title="Basic Information" icon="👤">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <FInput label="Full Name"    value={name}     onChange={setName}     placeholder="e.g. Amine Belhaj" />
                <FInput label="Job Title"    value={title}    onChange={setTitle}    placeholder="e.g. Frontend Developer" />
                <FInput label="Email"        value={email}    onChange={setEmail}    placeholder="you@email.com" type="email" />
                <FInput label="Phone"        value={phone}    onChange={setPhone}    placeholder="+216 XX XXX XXX" />
                <FInput label="Location"     value={location} onChange={setLocation} placeholder="City, Country" />
                <FInput label="LinkedIn"     value={linkedin} onChange={setLinkedin} placeholder="linkedin.com/in/…" />
              </div>
              <FTextarea label="Bio" value={bio} onChange={setBio} placeholder="Write a short professional summary about yourself…" rows={4} />
            </Section>
          )}

          {/* DOCUMENTS TAB */}
          {tab === "documents" && (
            <Section title="Documents" icon="📄">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <FieldLabel text="Curriculum Vitae" />
                  {cvUploading
                    ? <div style={{ borderRadius: 12, padding: "2rem", textAlign: "center", color: T.ink45, border: `1.5px dashed ${T.border}`, background: T.warm }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.accent, animation: "sp-spin 0.75s linear infinite", margin: "0 auto 10px" }} />
                        <span style={{ fontFamily: T.mono, fontSize: 12 }}>Uploading…</span>
                      </div>
                    : <UploadZone label="Drop your CV here or click to browse" accept=".pdf,.doc,.docx" file={cvInfo ? { name: cvInfo.filename, size: 0 } : null} onFile={handleCvFile} icon="📋" />
                  }
                  {cvInfo && !cvUploading && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <a href={`/backend${cvInfo.path}`} target="_blank" rel="noreferrer"
                        style={{ background: T.greenLight, border: `1px solid ${T.greenRule}`, borderRadius: 8, padding: "5px 14px", color: T.green, fontSize: 12.5, fontFamily: T.sans, textDecoration: "none" }}>
                        Download
                      </a>
                      <button onClick={handleRemoveCv} style={{ background: "transparent", border: "none", color: T.ink45, cursor: "pointer", fontSize: 12.5, fontFamily: T.sans }}>Remove</button>
                    </div>
                  )}
                </div>
                <div>
                  <FieldLabel text="Cover Letter" />
                  {coverUploading
                    ? <div style={{ borderRadius: 12, padding: "2rem", textAlign: "center", color: T.ink45, border: `1.5px dashed ${T.border}`, background: T.warm }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.accent, animation: "sp-spin 0.75s linear infinite", margin: "0 auto 10px" }} />
                        <span style={{ fontFamily: T.mono, fontSize: 12 }}>Uploading…</span>
                      </div>
                    : <UploadZone label="Drop your cover letter here or click to browse" accept=".pdf,.doc,.docx" file={coverInfo ? { name: coverInfo.filename, size: 0 } : null} onFile={handleCoverFile} icon="✉️" />
                  }
                  {coverInfo && !coverUploading && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <a href={`/backend${coverInfo.path}`} target="_blank" rel="noreferrer"
                        style={{ background: T.greenLight, border: `1px solid ${T.greenRule}`, borderRadius: 8, padding: "5px 14px", color: T.green, fontSize: 12.5, fontFamily: T.sans, textDecoration: "none" }}>
                        Download
                      </a>
                      <button onClick={handleRemoveCover} style={{ background: "transparent", border: "none", color: T.ink45, cursor: "pointer", fontSize: 12.5, fontFamily: T.sans }}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 20, background: T.accentLight, border: `1px solid ${T.accentRule}`, borderRadius: 10, padding: "13px 16px" }}>
                <div style={{ fontSize: 13, color: T.ink70, lineHeight: 1.7 }}>
                  💡 <span style={{ color: T.accent, fontWeight: 500 }}>Tip:</span> A complete CV increases your match rate by up to 3×. Make sure your file is up-to-date and under 5 MB.
                </div>
              </div>
            </Section>
          )}

          {/* SKILLS TAB */}
          {tab === "skills" && (
            <Section title="Skills" icon="⚡">
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "flex-end", marginBottom: 24, position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <FInput label="Add Skill" value={skillInput} onChange={handleSkillInput} placeholder="Type a skill name…" />
                  {skillSugg.length > 0 && (
                    <div style={{ position: "absolute", top: "calc(100% - 16px)", left: 0, right: 0, background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, zIndex: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                      {skillSugg.map(s => (
                        <div key={s} onClick={() => addSkill(s)}
                          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13.5, color: T.ink70, transition: "all 0.12s", borderLeft: "3px solid transparent" }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.warm; e.currentTarget.style.borderLeftColor = T.accent; e.currentTarget.style.color = T.ink; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.color = T.ink70; }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <FieldLabel text="Level" />
                  <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)}
                    style={{ ...inputBase, cursor: "pointer", color: T.ink }}>
                    {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <button onClick={() => addSkill(skillInput)} disabled={!skillInput.trim()}
                  style={{ padding: "9px 18px", borderRadius: 8, background: skillInput.trim() ? T.ink : T.warm, border: `2px solid ${skillInput.trim() ? T.ink : T.border}`, color: skillInput.trim() ? "#fff" : T.ink25, fontSize: 13.5, fontFamily: T.sans, fontWeight: 500, cursor: skillInput.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap", marginBottom: 1, transition: "all 0.15s" }}
                  onMouseEnter={e => { if (skillInput.trim()) { e.currentTarget.style.background = T.accent; e.currentTarget.style.borderColor = T.accent; } }}
                  onMouseLeave={e => { if (skillInput.trim()) { e.currentTarget.style.background = T.ink; e.currentTarget.style.borderColor = T.ink; } }}>
                  Add skill
                </button>
              </div>

              {skills.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", background: T.warm, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink45, fontStyle: "italic", marginBottom: 4 }}>No skills added yet</div>
                  <div style={{ fontSize: 13, color: T.ink25 }}>Type above to add your first skill.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {skills.map(sk => (
                    <div key={sk.id} style={{ display: "flex", alignItems: "center", gap: 12, background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: LEVEL_COLORS[sk.level] || T.ink25, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: T.ink }}>{sk.name}</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {SKILL_LEVELS.map(l => (
                          <button key={l} onClick={() => updateSkillLevel(sk.id, l)}
                            style={{
                              background: sk.level === l ? LEVEL_COLORS[l] + "18" : "transparent",
                              border: `1.5px solid ${sk.level === l ? LEVEL_COLORS[l] + "50" : T.border}`,
                              borderRadius: 100, padding: "2px 9px",
                              fontSize: 11, fontFamily: T.mono,
                              color: sk.level === l ? LEVEL_COLORS[l] : T.ink45,
                              cursor: "pointer", transition: "all 0.12s",
                            }}>
                            {l}
                          </button>
                        ))}
                      </div>
                      <DeleteBtn onClick={() => removeSkill(sk.id)} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 18, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                {SKILL_LEVELS.map(l => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: LEVEL_COLORS[l] }} />
                    <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.ink45 }}>{l}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* EDUCATION TAB */}
          {tab === "education" && (
            <Section title="Education" icon="🎓" action={<AddButton onClick={addEdu} label="Add education" />}>
              {educations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", background: T.warm, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink45, fontStyle: "italic", marginBottom: 4 }}>No education entries yet</div>
                  <div style={{ fontSize: 13, color: T.ink25 }}>Click "Add education" to get started.</div>
                </div>
              ) : educations.map((edu, idx) => (
                <div key={edu.id} style={{ background: T.warm, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 20px", marginBottom: 12, position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: T.blueLight, border: `1px solid ${T.blueRule}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎓</div>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink45, letterSpacing: "0.05em" }}>Entry {idx + 1}</span>
                    </div>
                    <DeleteBtn onClick={() => removeEdu(edu.id)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                    <FSelect label="Degree"           value={edu.degree}  onChange={v => updateEdu(edu.id, "degree", v)}  options={DEGREE_OPTIONS} />
                    <FInput  label="Field of Study"   value={edu.field}   onChange={v => updateEdu(edu.id, "field", v)}   placeholder="e.g. Computer Science" />
                    <FInput  label="Institution"      value={edu.school}  onChange={v => updateEdu(edu.id, "school", v)}  placeholder="University name" />
                    <FInput  label="Graduation Year"  value={edu.year}    onChange={v => updateEdu(edu.id, "year", v)}    placeholder="e.g. 2022" />
                  </div>
                  <FTextarea label="Description (optional)" value={edu.description} onChange={v => updateEdu(edu.id, "description", v)} placeholder="Courses, projects, achievements…" rows={2} />
                </div>
              ))}
            </Section>
          )}

          {/* EXPERIENCE TAB */}
          {tab === "experience" && (
            <Section title="Professional Experience" icon="💼" action={<AddButton onClick={addExp} label="Add experience" />}>
              {experiences.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", background: T.warm, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink45, fontStyle: "italic", marginBottom: 4 }}>No experience entries yet</div>
                  <div style={{ fontSize: 13, color: T.ink25 }}>Click "Add experience" to get started.</div>
                </div>
              ) : experiences.map((exp, idx) => (
                <div key={exp.id} style={{ background: T.warm, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 20px", marginBottom: 12, position: "relative" }}>
                  {idx < experiences.length - 1 && (
                    <div style={{ position: "absolute", left: 29, top: "100%", width: 1, height: 12, background: T.border2 }} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentLight, border: `1px solid ${T.accentRule}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💼</div>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink45, letterSpacing: "0.05em" }}>Experience {idx + 1}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: T.ink70, cursor: "pointer" }}>
                        <input type="checkbox" checked={exp.current} onChange={e => updateExp(exp.id, "current", e.target.checked)}
                          style={{ accentColor: T.accent, width: 14, height: 14, cursor: "pointer" }} />
                        Current job
                      </label>
                      <DeleteBtn onClick={() => removeExp(exp.id)} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                    <FInput label="Job Title"   value={exp.role}    onChange={v => updateExp(exp.id, "role", v)}    placeholder="e.g. Frontend Developer" />
                    <FInput label="Company"     value={exp.company} onChange={v => updateExp(exp.id, "company", v)} placeholder="Company name" />
                    <FInput label="Start Date"  value={exp.start}   onChange={v => updateExp(exp.id, "start", v)}   placeholder="e.g. Jan 2022" />
                    <FInput label="End Date"    value={exp.end}     onChange={v => updateExp(exp.id, "end", v)}     placeholder={exp.current ? "Present" : "e.g. Dec 2023"} disabled={exp.current} />
                  </div>
                  <FTextarea label="Description" value={exp.description} onChange={v => updateExp(exp.id, "description", v)} placeholder="Describe your responsibilities, achievements, and technologies used…" rows={3} />
                </div>
              ))}
            </Section>
          )}

          {/* Save bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 4 }}>
            {saveMsg && (
              <span style={{ fontFamily: T.mono, fontSize: 12, color: saveMsg.startsWith("Failed") ? "#b91c1c" : T.green, letterSpacing: "0.04em" }}>
                {saveMsg}
              </span>
            )}
            <button onClick={() => window.location.reload()}
              style={{ padding: "10px 18px", borderRadius: 8, background: "transparent", border: `1.5px solid ${T.border}`, color: T.ink70, fontSize: 13.5, fontFamily: T.sans, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = T.warm; e.currentTarget.style.borderColor = T.border2; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; }}>
              Discard changes
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "10px 22px", borderRadius: 8, background: saving ? T.warm : T.ink, border: `2px solid ${saving ? T.border : T.ink}`, color: saving ? T.ink45 : "#fff", fontSize: 13.5, fontFamily: T.sans, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = T.accent; e.currentTarget.style.borderColor = T.accent; } }}
              onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = T.ink; e.currentTarget.style.borderColor = T.ink; } }}>
              {saving ? "Saving…" : <> Save & update profile <ArrowRight /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}