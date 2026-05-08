import { useState, useEffect } from "react";
import Header        from "./components/Header";
import StatsRow      from "./components/StatsRow";
import InputPanel    from "./components/InputPanel";
import ResultsPanel  from "./components/ResultsPanel";
import CVAnalyzer    from "./components/CVAnalyzer";
import SignIn        from "./components/SignIn";
import SignUp        from "./components/SignUp";
import HomePage      from "./components/HomePage";
import ProfilePage   from "./components/ProfilePage";
import JobsPage      from "./components/JobsPage";
import { usePredictor } from "./hooks/usePredictor";
import { apiGetProfile } from "./services/api";

/* ─── Design tokens matching SkillPath theme ─────────────────────────────── */
const theme = {
  bg:           "#0a0a0f",
  surface:      "rgba(255,255,255,0.025)",
  surfaceHover: "rgba(255,255,255,0.045)",
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(108,99,255,0.3)",
  text:         "#f0ede8",
  textMuted:    "rgba(240,237,232,0.45)",
  textDim:      "rgba(240,237,232,0.25)",
  purple:       "#6c63ff",
  purpleLight:  "#a098ff",
  teal:         "#3ecfb2",
  gradientPrimary: "linear-gradient(135deg, #6c63ff, #3ecfb2)",
  fontSans:     "'DM Sans', sans-serif",
  fontDisplay:  "'Syne', sans-serif",
};

/* ─── Global styles injected once ───────────────────────────────────────── */
const GlobalStyles = () => (
  <>
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap"
      rel="stylesheet"
    />
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: ${theme.bg};
        color: ${theme.text};
        font-family: ${theme.fontSans};
        -webkit-font-smoothing: antialiased;
      }
      ::placeholder { color: rgba(240,237,232,0.22) !important; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .skillpath-fade { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
    `}</style>
  </>
);

/* ─── Shared layout wrapper for authenticated pages ─────────────────────── */
function AppShell({ children, backendOk, user, onHome, onLogout, onProfile, onJobs }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bg,
      fontFamily: theme.fontSans,
      color: theme.text,
      paddingBottom: 80,
    }}>
      <GlobalStyles />

      {/* ── Sticky nav ── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.1rem 2.5rem",
        borderBottom: `1px solid ${theme.border}`,
        position: "sticky",
        top: 0,
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        zIndex: 100,
      }}>
        {/* Logo */}
        <div
          onClick={onHome}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
        >
          <div style={{
            width: 32, height: 32,
            background: theme.gradientPrimary,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: "1.05rem",
            background: "linear-gradient(90deg, #c8c0ff, #3ecfb2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            SkillPath
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {[
            { label: "Jobs",    action: onJobs    },
            { label: "Profile", action: onProfile },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                background: "transparent",
                border: "none",
                borderRadius: 8,
                padding: "0.35rem 0.85rem",
                color: theme.textMuted,
                fontSize: "0.875rem",
                cursor: "pointer",
                fontFamily: theme.fontSans,
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = theme.text}
              onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
            >
              {label}
            </button>
          ))}
        </div>

        {/* User + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Backend status pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            background: backendOk ? "rgba(62,207,178,0.08)" : "rgba(220,60,60,0.08)",
            border: `1px solid ${backendOk ? "rgba(62,207,178,0.2)" : "rgba(220,60,60,0.2)"}`,
            borderRadius: 100,
            padding: "0.25rem 0.75rem",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: backendOk ? theme.teal : "#e03c3c",
            }} />
            <span style={{ fontSize: "0.72rem", color: backendOk ? theme.teal : "#e06060" }}>
              {backendOk ? "API connected" : "API offline"}
            </span>
          </div>

          {/* Username chip */}
          {user && (
            <div style={{
              fontSize: "0.8rem",
              color: theme.textMuted,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "0.35rem 0.8rem",
            }}>
              {user.username}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "0.45rem 1rem",
              color: theme.textMuted,
              fontSize: "0.83rem",
              cursor: "pointer",
              fontFamily: theme.fontSans,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(220,60,60,0.35)";
              e.currentTarget.style.color = "#e06060";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.color = theme.textMuted;
            }}
          >
            Log out
          </button>
        </div>
      </nav>

      {children}
    </div>
  );
}

/* ─── Section label ─────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: "0.7rem",
      color: theme.textDim,
      letterSpacing: "0.07em",
      fontWeight: 500,
      marginBottom: "0.6rem",
    }}>
      {children}
    </div>
  );
}

/* ─── Auth token persistence ─────────────────────────────────────────────── */
function getStoredUser() {
  const token    = localStorage.getItem("auth_token");
  const username = localStorage.getItem("auth_username");
  const email    = localStorage.getItem("auth_email");
  return token ? { token, username, email } : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser]           = useState(getStoredUser);
  const [page, setPage]           = useState("home");
  const [activeTab, setActiveTab] = useState("predictor");
  const [authChecked, setAuthChecked] = useState(false);

  /* ── Verify stored token on load ───────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) { setAuthChecked(true); return; }

    fetch("/backend/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error("invalid"); return res.json(); })
      .then(data => setUser({ token, username: data.username, email: data.email }))
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_username");
        localStorage.removeItem("auth_email");
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const {
    form, results, predictedLabel, loading, error, backendOk,
    updateField, toggleSkill, handlePredict, setSkillsFromProfile,
  } = usePredictor();

  /* — Sync profile skills to predictor when entering the app view — */
  useEffect(() => {
    if (!user?.token || page !== "app") return;
    apiGetProfile(user.token)
      .then((profile) => {
        if (profile.skills && Array.isArray(profile.skills)) {
          setSkillsFromProfile(profile.skills);
        }
      })
      .catch(() => {});
  }, [user?.token, page, setSkillsFromProfile]);

  if (!authChecked) return null;

  function handleAuthSuccess(data) { setUser(data); setPage("app"); }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_email");
    setUser(null);
    setPage("home");
  }

  /* ── Page routing ───────────────────────────────────────────────────────── */
  if (page === "home") {
    return (
      <>
        <GlobalStyles />
        <HomePage
          onSignIn={() => setPage("signin")}
          onSignUp={() => setPage("signup")}
          onGoToApp={user ? () => setPage("app") : null}
          user={user}
        />
      </>
    );
  }

  if (page === "signin") {
    return (
      <>
        <GlobalStyles />
        <SignIn
          onSuccess={handleAuthSuccess}
          onSwitchToSignUp={() => setPage("signup")}
        />
      </>
    );
  }

  if (page === "signup") {
    return (
      <>
        <GlobalStyles />
        <SignUp
          onSuccess={handleAuthSuccess}
          onSwitchToSignIn={() => setPage("signin")}
        />
      </>
    );
  }

  if (page === "profile") {
    return (
      <>
        <GlobalStyles />
        <ProfilePage user={user} onBack={() => setPage("app")} />
      </>
    );
  }

  if (page === "jobs") {
    return (
      <>
        <GlobalStyles />
        <JobsPage onBack={() => setPage("app")} />
      </>
    );
  }

  if (!user) { setPage("home"); return null; }

  /* ── Authenticated main app ─────────────────────────────────────────────── */
  return (
    <AppShell
      backendOk={backendOk}
      user={user}
      onHome={() => setPage("home")}
      onLogout={handleLogout}
      onProfile={() => setPage("profile")}
      onJobs={() => setPage("jobs")}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2rem 0" }}>

        {/* ── Page title ── */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(108,99,255,0.08)",
            border: "1px solid rgba(108,99,255,0.2)",
            borderRadius: 100,
            padding: "0.3rem 0.9rem",
            marginBottom: "0.75rem",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: theme.teal, display: "inline-block" }} />
            <span style={{ fontSize: "0.72rem", color: theme.teal, letterSpacing: "0.05em", fontWeight: 500 }}>
              AI-POWERED TOOLS
            </span>
          </div>
          <h1 style={{
            fontFamily: theme.fontDisplay,
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: theme.text,
            lineHeight: 1.15,
          }}>
            Welcome back,{" "}
            <span style={{
              background: theme.gradientPrimary,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {user.username}
            </span>
          </h1>
          <p style={{ color: theme.textMuted, fontSize: "0.9rem", marginTop: "0.4rem" }}>
            Predict your ideal role or let our AI analyze your CV.
          </p>
        </div>

        {/* ── Tab switcher ── */}
        <div style={{
          display: "inline-flex",
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: 4,
          gap: 4,
          marginBottom: "2rem",
        }}>
          {[
            { key: "predictor", icon: "⚡", label: "Job Predictor" },
            { key: "cv",        icon: "📄", label: "CV Analyzer"   },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.6rem 1.4rem",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                fontFamily: theme.fontSans,
                background: activeTab === tab.key
                  ? theme.gradientPrimary
                  : "transparent",
                color: activeTab === tab.key ? "#fff" : theme.textMuted,
                transition: "all 0.2s",
                boxShadow: activeTab === tab.key
                  ? "0 2px 16px rgba(108,99,255,0.35)"
                  : "none",
                letterSpacing: "-0.01em",
              }}
            >
              <span style={{ fontSize: "0.95rem" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Stats row (predictor only) ── */}
        {activeTab === "predictor" && (
          <div className="skillpath-fade">
            <StatsRow />
          </div>
        )}
      </div>

      {/* ── Predictor panels ── */}
      {activeTab === "predictor" && (
        <div
          className="skillpath-fade"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Input panel wrapper */}
            <div style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 20,
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = theme.borderHover}
              onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
            >
              {/* Panel header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                padding: "1.25rem 1.5rem",
                borderBottom: `1px solid ${theme.border}`,
              }}>
                <span style={{ fontSize: "1rem" }}>🎯</span>
                <span style={{
                  fontFamily: theme.fontDisplay,
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  letterSpacing: "-0.01em",
                }}>
                  Your Profile
                </span>
              </div>
              <div style={{ padding: "1.5rem" }}>
                <InputPanel
                  form={form}
                  updateField={updateField}
                  toggleSkill={toggleSkill}
                  onPredict={handlePredict}
                  loading={loading}
                />
              </div>
            </div>

            {/* Results panel wrapper */}
            <div style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 20,
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(62,207,178,0.25)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                padding: "1.25rem 1.5rem",
                borderBottom: `1px solid ${theme.border}`,
              }}>
                <span style={{ fontSize: "1rem" }}>✨</span>
                <span style={{
                  fontFamily: theme.fontDisplay,
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  letterSpacing: "-0.01em",
                }}>
                  Prediction Results
                </span>
                {loading && (
                  <div style={{
                    marginLeft: "auto",
                    width: 16, height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(108,99,255,0.2)",
                    borderTop: `2px solid ${theme.purple}`,
                    animation: "spin 0.75s linear infinite",
                  }} />
                )}
              </div>
              <div style={{ padding: "1.5rem" }}>
                <ResultsPanel
                  results={results}
                  predictedLabel={predictedLabel}
                  loading={loading}
                  error={error}
                  form={form}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CV Analyzer ── */}
      {activeTab === "cv" && (
        <div
          className="skillpath-fade"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}
        >
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            overflow: "hidden",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "1.25rem 1.5rem",
              borderBottom: `1px solid ${theme.border}`,
            }}>
              <span style={{ fontSize: "1rem" }}>📄</span>
              <span style={{
                fontFamily: theme.fontDisplay,
                fontWeight: 800,
                fontSize: "0.95rem",
                letterSpacing: "-0.01em",
              }}>
                CV Analyzer
              </span>
              <div style={{
                marginLeft: "auto",
                fontSize: "0.72rem",
                color: theme.teal,
                background: "rgba(62,207,178,0.08)",
                border: "1px solid rgba(62,207,178,0.2)",
                borderRadius: 100,
                padding: "0.2rem 0.7rem",
              }}>
                AI-powered
              </div>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <CVAnalyzer user={user} />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}