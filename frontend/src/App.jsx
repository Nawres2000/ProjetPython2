import { useState } from "react";
import Header       from "./components/Header";
import StatsRow     from "./components/StatsRow";
import InputPanel   from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import SignIn       from "./components/SignIn";
import SignUp       from "./components/SignUp";
import HomePage     from "./components/HomePage";
import { usePredictor } from "./hooks/usePredictor";

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
      ::placeholder { color: rgba(26,24,20,0.25) !important; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #e2ddd6; border-radius: 4px; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .sp-fade    { animation: fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) both; }
      .sp-fade-d1 { animation-delay: 0.08s; }
      .sp-fade-d2 { animation-delay: 0.16s; }
    `}</style>
  </>
);

/* ─── App shell CSS ──────────────────────────────────────────────────────── */
const SHELL_CSS = `
  .shell { min-height: 100vh; background: #fafaf9; padding-bottom: 80px; }

  /* Page hero */
  .shell-hero {
    background: #ffffff;
    border-bottom: 1px solid #e2ddd6;
    padding: 40px 48px 36px;
  }
  .shell-hero-inner { max-width: 1100px; margin: 0 auto; }

  .shell-kicker { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .shell-kicker-line { width: 28px; height: 2px; background: #c8490a; border-radius: 1px; }
  .shell-kicker-text {
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #c8490a; font-weight: 500;
  }

  .shell-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 400; line-height: 1.1;
    letter-spacing: -0.02em; color: #1a1814; margin-bottom: 6px;
  }
  .shell-title strong {
    font-style: italic; font-weight: 400;
    background: linear-gradient(90deg, #c8490a, #0d6e64);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .shell-subtitle {
    font-size: 14px; color: rgba(26,24,20,0.6);
    line-height: 1.6; font-weight: 300;
  }

  /* Content */
  .shell-content { max-width: 1100px; margin: 0 auto; padding: 36px 48px 0; }

  /* Panel cards */
  .panel-card {
    background: #ffffff;
    border: 1px solid #e2ddd6;
    border-radius: 20px; overflow: hidden;
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
  .panel-header-icon { font-size: 15px; }
  .panel-header-title {
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(26,24,20,0.45);
  }
  .panel-header-right { margin-left: auto; }

  .panel-body { padding: 24px; }

  .panel-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid #e2ddd6; border-top-color: #c8490a;
    animation: spin 0.75s linear infinite;
  }

  .predictor-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }
`;

/* ─── Auth token helpers ─────────────────────────────────────────────────── */
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
  const [user, setUser] = useState(getStoredUser);
  const [page, setPage] = useState("home");

  const {
    form, results, loading, error,
    updateField, toggleSkill, handlePredict,
  } = usePredictor();

  function handleAuthSuccess(data) { setUser(data); setPage("app"); }

  function handleLogout() {
    ["auth_token", "auth_username", "auth_email"].forEach(k => localStorage.removeItem(k));
    setUser(null);
    setPage("home");
  }

  /* ── Unauthenticated pages ── */
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
          onBack={() => setPage("home")}
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
          onBack={() => setPage("home")}
        />
      </>
    );
  }

  /* ── Guard ── */
  if (!user) { setPage("home"); return null; }

  /* ── Authenticated app ── */
  return (
    <>
      <GlobalStyles />
      <style>{SHELL_CSS}</style>
      <div className="shell">

        {/* Shared nav */}
        <Header
          backendOk={null}
          user={user}
          onHome={() => setPage("home")}
          onLogout={handleLogout}
          onProfile={null}
          onJobs={null}
        />

        {/* Page hero */}
        <div className="shell-hero">
          <div className="shell-hero-inner">
            <div className="shell-kicker">
              <span className="shell-kicker-line" />
              <span className="shell-kicker-text">Job Predictor</span>
            </div>
            <h1 className="shell-title">
              Welcome back, <strong>{user.username}</strong>
            </h1>
            <p className="shell-subtitle">
              Enter your profile details and let the AI predict your ideal role.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="shell-content">

          {/* Stats */}
          <div className="sp-fade" style={{ marginBottom: 28 }}>
            <StatsRow />
          </div>

          {/* Two-column predictor */}
          <div className="predictor-grid">

            {/* Input panel */}
            <div className="panel-card sp-fade sp-fade-d1">
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
            <div className="panel-card sp-fade sp-fade-d2">
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
                  loading={loading}
                  error={error}
                  form={form}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}