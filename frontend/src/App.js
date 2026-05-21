import { useState, useEffect } from "react";
import Header       from "./components/Header";
import StatsRow     from "./components/StatsRow";
import InputPanel   from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import CVAnalyzer   from "./components/CVAnalyzer";
import SignIn       from "./components/SignIn";
import SignUp       from "./components/SignUp";
import HomePage     from "./components/HomePage";
import ProfilePage   from "./components/ProfilePage";
import JobsPage      from "./components/JobsPage";
import LearningPath  from "./components/LearningPath";
import { usePredictor }  from "./hooks/usePredictor";
import { apiGetProfile } from "./services/api";

/* ─── Global styles ─────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <>
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: #fafaf9;
        color: #1a1814;
        font-family: 'DM Sans', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      ::placeholder { color: rgba(26,24,20,0.38) !important; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #e2ddd6; border-radius: 4px; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .sp-fade { animation: fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) both; }
      .sp-fade-d1 { animation-delay: 0.06s; }
      .sp-fade-d2 { animation-delay: 0.12s; }
    `}</style>
  </>
);

/* ─── Auth token helpers ─────────────────────────────────────────────────── */
function getStoredUser() {
  const token    = localStorage.getItem("auth_token");
  const username = localStorage.getItem("auth_username");
  const email    = localStorage.getItem("auth_email");
  return token ? { token, username, email } : null;
}

/* ─── Shared app shell (authenticated pages) ─────────────────────────────── */
const SHELL_CSS = `
  .shell {
    min-height: 100vh;
    background: #fafaf9;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #1a1814;
    padding-bottom: 80px;
  }

  /* ── Page header band ── */
  .shell-hero {
    border-bottom: 1px solid #e2ddd6;
    background: #ffffff;
    padding: 40px 48px 36px;
  }
  .shell-hero-inner { max-width: 1100px; margin: 0 auto; }

  .shell-kicker {
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  }
  .shell-kicker-line { width: 28px; height: 2px; background: #c8490a; border-radius: 1px; }
  .shell-kicker-text {
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.12em; text-transform: uppercase; color: #c8490a; font-weight: 500;
  }

  .shell-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 400; line-height: 1.1; letter-spacing: -0.02em;
    color: #1a1814; margin-bottom: 6px;
  }
  .shell-title em { font-style: italic; color: #c8490a; }
  .shell-title strong {
    font-style: italic; font-weight: 400;
    background: linear-gradient(90deg, #c8490a, #0d6e64);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .shell-subtitle {
    font-size: 14px; color: rgba(26,24,20,0.6);
    line-height: 1.6; font-weight: 300;
  }

  /* ── Tab bar ── */
  .shell-tabs {
    max-width: 1100px; margin: 0 auto;
    padding: 0 48px;
    display: flex; gap: 0;
    border-bottom: 1px solid #e2ddd6;
    background: #ffffff;
  }
  .shell-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 14px 20px;
    background: transparent; border: none;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 500;
    color: rgba(26,24,20,0.4); cursor: pointer;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    transition: all 0.15s;
  }
  .shell-tab:hover { color: #1a1814; }
  .shell-tab.active { color: #c8490a; border-bottom-color: #c8490a; }
  .shell-tab-icon { font-size: 15px; }

  /* ── Content area ── */
  .shell-content {
    max-width: 1100px; margin: 0 auto;
    padding: 36px 48px 0;
  }

  /* ── Panel cards ── */
  .panel-card {
    background: #ffffff;
    border: 1px solid #e2ddd6;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    position: relative;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .panel-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #c8490a, #0d6e64);
  }
  .panel-card:hover {
    border-color: #ccc7bf;
    box-shadow: 0 8px 28px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04);
  }

  .panel-header {
    display: flex; align-items: center; gap: 10px;
    padding: 18px 24px 16px;
    border-bottom: 1px solid #e2ddd6;
    margin-top: 3px;
  }
  .panel-header-icon { font-size: 16px; }
  .panel-header-title {
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(26,24,20,0.58);
  }
  .panel-header-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

  .panel-body { padding: 24px; }

  /* Loading spinner */
  .panel-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid #e2ddd6; border-top-color: #c8490a;
    animation: spin 0.75s linear infinite; flex-shrink: 0;
  }

  /* AI badge */
  .ai-badge {
    padding: 3px 10px; border-radius: 100px;
    font-size: 11px; font-family: 'DM Mono', monospace;
    background: rgba(13,110,100,0.08); border: 1px solid rgba(13,110,100,0.2);
    color: #0d6e64;
  }

  /* Predictor grid */
  .predictor-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }
`;

function AppShell({ children, backendOk, user, onHome, onLogout, onProfile, onJobs, onLearn, activeTab, setActiveTab }) {
  return (
    <div className="shell">
      <style>{SHELL_CSS}</style>

      {/* Sticky nav via shared Header component */}
      <Header
        backendOk={backendOk}
        user={user}
        onHome={onHome}
        onLogout={onLogout}
        onProfile={onProfile}
        onJobs={onJobs}
        onLearn={onLearn}
      />

      {/* Page hero */}
      <div className="shell-hero">
        <div className="shell-hero-inner">
          <div className="shell-kicker">
            <span className="shell-kicker-line" />
            <span className="shell-kicker-text">AI-Powered Tools</span>
          </div>
          <h1 className="shell-title">
            Welcome back, <strong>{user?.username}</strong>
          </h1>
          <p className="shell-subtitle">
            Predict your ideal role or let our AI analyze your CV.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="shell-tabs">
        {[
          { key: "predictor", icon: "⚡", label: "Job Predictor" },
          { key: "cv",        icon: "📄", label: "CV Analyzer"   },
        ].map(tab => (
          <button
            key={tab.key}
            className={`shell-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="shell-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [user,        setUser]        = useState(getStoredUser);
  const [page,        setPage]        = useState("home");
  const [activeTab,   setActiveTab]   = useState("predictor");
  const [authChecked, setAuthChecked] = useState(false);

  /* ── Verify stored token ── */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) { setAuthChecked(true); return; }
    fetch("/backend/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error("invalid"); return res.json(); })
      .then(data => setUser({ token, username: data.username, email: data.email }))
      .catch(() => {
        ["auth_token", "auth_username", "auth_email"].forEach(k => localStorage.removeItem(k));
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const {
    form, results, predictedLabel, loading, error, backendOk,
    updateField, toggleSkill, handlePredict, setSkillsFromProfile,
  } = usePredictor();

  /* ── Sync profile skills when entering app ── */
  useEffect(() => {
    if (!user?.token || page !== "app") return;
    apiGetProfile(user.token)
      .then(profile => {
        if (Array.isArray(profile.skills)) setSkillsFromProfile(profile.skills);
      })
      .catch(() => {});
  }, [user?.token, page, setSkillsFromProfile]);

  if (!authChecked) return null;

  function handleAuthSuccess(data) { setUser(data); setPage("app"); }
  function handleLogout() {
    ["auth_token", "auth_username", "auth_email"].forEach(k => localStorage.removeItem(k));
    setUser(null); setPage("home");
  }

  /* ── Unauthenticated pages ── */
  if (page === "home")    return <><GlobalStyles /><HomePage    onSignIn={() => setPage("signin")} onSignUp={() => setPage("signup")} onGoToApp={user ? () => setPage("app") : null} user={user} /></>;
  if (page === "signin")  return <><GlobalStyles /><SignIn  onSuccess={handleAuthSuccess} onSwitchToSignUp={() => setPage("signup")} /></>;
  if (page === "signup")  return <><GlobalStyles /><SignUp  onSuccess={handleAuthSuccess} onSwitchToSignIn={() => setPage("signin")} /></>;
  if (page === "profile") return <><GlobalStyles /><ProfilePage user={user} onBack={() => setPage("app")} /></>;
  if (page === "jobs")    return <><GlobalStyles /><JobsPage    onBack={() => setPage("app")} /></>;
  if (page === "learn")   return (
    <>
      <GlobalStyles />
      <div className="shell">
        <style>{SHELL_CSS}</style>
        <Header
          backendOk={backendOk}
          user={user}
          onHome={() => setPage("home")}
          onLogout={handleLogout}
          onProfile={() => setPage("profile")}
          onJobs={() => setPage("jobs")}
          onLearn={() => setPage("learn")}
        />
        <div className="shell-hero">
          <div className="shell-hero-inner">
            <div className="shell-kicker">
              <span className="shell-kicker-line" />
              <span className="shell-kicker-text">Free Courses</span>
            </div>
            <h1 className="shell-title">
              Your <strong>Learning Path</strong>
            </h1>
            <p className="shell-subtitle">
              Best free courses in Python, Java, AI, ML, Statistics and SQL — curated from Harvard, Helsinki, Google and more.
            </p>
          </div>
        </div>
        <div className="shell-content">
          <LearningPath />
        </div>
      </div>
    </>
  );

  if (!user) { setPage("home"); return null; }

  /* ── Authenticated app ── */
  return (
    <>
      <GlobalStyles />
      <AppShell
        backendOk={backendOk}
        user={user}
        onHome={() => setPage("home")}
        onLogout={handleLogout}
        onProfile={() => setPage("profile")}
        onJobs={() => setPage("jobs")}
        onLearn={() => setPage("learn")}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <div className="shell-content">

          {/* ── Predictor tab ── */}
          {activeTab === "predictor" && (
            <div className="sp-fade">
              <div className="sp-fade sp-fade-d1" style={{ marginBottom: 28 }}>
                <StatsRow />
              </div>
              <div className="predictor-grid sp-fade sp-fade-d2">

                {/* Input panel */}
                <div className="panel-card">
                  <div className="panel-header">
                    <span className="panel-header-icon">🎯</span>
                    <span className="panel-header-title">Your Profile</span>
                  </div>
                  <div className="panel-body">
                    <InputPanel
                      form={form}
                      updateField={updateField}
                      toggleSkill={toggleSkill}
                      onPredict={handlePredict}
                      loading={loading}
                    />
                  </div>
                </div>

                {/* Results panel */}
                <div className="panel-card">
                  <div className="panel-header">
                    <span className="panel-header-icon">✨</span>
                    <span className="panel-header-title">Prediction Results</span>
                    <div className="panel-header-right">
                      {loading && <div className="panel-spinner" />}
                    </div>
                  </div>
                  <div className="panel-body">
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

          {/* ── CV Analyzer tab ── */}
          {activeTab === "cv" && (
            <div className="panel-card sp-fade" style={{ maxWidth: 720, margin: "0 auto" }}>
              <div className="panel-header">
                <span className="panel-header-icon">📄</span>
                <span className="panel-header-title">CV Analyzer</span>
                <div className="panel-header-right">
                  <span className="ai-badge">AI-powered</span>
                </div>
              </div>
              <div className="panel-body">
                <CVAnalyzer user={user} />
              </div>
            </div>
          )}

        </div>
      </AppShell>
    </>
  );
}