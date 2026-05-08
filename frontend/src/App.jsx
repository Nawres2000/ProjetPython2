import { useState } from "react";
import Header       from "./components/Header";
import StatsRow     from "./components/StatsRow";
import InputPanel   from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import SignIn       from "./components/SignIn";
import SignUp       from "./components/SignUp";
import HomePage     from "./components/HomePage";
import { usePredictor } from "./hooks/usePredictor";
import { colors }   from "./styles/theme";

function getStoredUser() {
  const token    = localStorage.getItem("auth_token");
  const username = localStorage.getItem("auth_username");
  const email    = localStorage.getItem("auth_email");
  return token ? { token, username, email } : null;
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [page, setPage] = useState("home"); // "home" | "signin" | "signup" | "app"

  const {
    form, results, loading, error,
    updateField, toggleSkill, handlePredict,
  } = usePredictor();

  function handleAuthSuccess(data) {
    setUser(data);
    setPage("app");
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_email");
    setUser(null);
    setPage("home");
  }

  // ── Always show landing page first ──────────────────────────────────────────
  if (page === "home") {
    return (
      <HomePage
        onSignIn={() => setPage("signin")}
        onSignUp={() => setPage("signup")}
        onGoToApp={user ? () => setPage("app") : null}
        user={user}
      />
    );
  }

  if (page === "signin") {
    return <SignIn onSuccess={handleAuthSuccess} onSwitchToSignUp={() => setPage("signup")} onBack={() => setPage("home")} />;
  }
  if (page === "signup") {
    return <SignUp onSuccess={handleAuthSuccess} onSwitchToSignIn={() => setPage("signin")} onBack={() => setPage("home")} />;
  }

  // ── Main app (authenticated) ─────────────────────────────────────────────────
  if (!user) {
    setPage("home");
    return null;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      fontFamily: "'Segoe UI', sans-serif",
      color: colors.text,
      paddingBottom: 60,
    }}>
      <div style={{ position: "relative" }}>
        <Header />
        {/* Logout / user pill */}
        <div style={{
          position: "absolute", top: 16, right: 24,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ color: colors.muted, fontSize: 13 }}>
            👤 {user.username}
          </span>
          <button
            onClick={() => setPage("home")}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "6px 14px",
              color: colors.text,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Home
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "6px 14px",
              color: colors.text,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <StatsRow />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <InputPanel
            form={form}
            updateField={updateField}
            toggleSkill={toggleSkill}
            onPredict={handlePredict}
            loading={loading}
          />
          <ResultsPanel
            results={results}
            loading={loading}
            error={error}
            form={form}
          />
        </div>
      </div>
    </div>
  );
}