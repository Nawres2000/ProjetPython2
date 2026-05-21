import { useState } from "react";
import { apiLogin } from "../services/api";

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
  sans:        "'DM Sans', system-ui, sans-serif",
  serif:       "'Playfair Display', Georgia, serif",
  mono:        "'DM Mono', monospace",
};

const inputBase = {
  width: "100%", boxSizing: "border-box",
  background: T.warm, border: `1.5px solid ${T.border}`,
  borderRadius: 8, padding: "10px 14px",
  color: T.ink, fontSize: 14, fontFamily: T.sans,
  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
};

function FInput({ id, type, label, value, onChange, placeholder, required }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ink25, marginBottom: 8 }}>
        {label}
      </label>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          ...inputBase,
          borderColor: f ? T.accent : T.border,
          background:  f ? T.white  : T.warm,
          boxShadow:   f ? `0 0 0 3px ${T.accentLight}` : "none",
        }}
      />
    </div>
  );
}

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SignIn({ onSuccess, onSwitchToSignUp }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem("auth_token",    data.token);
      localStorage.setItem("auth_username", data.username);
      localStorage.setItem("auth_email",    data.email);
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.paper, fontFamily: T.sans, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`@keyframes sp-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: T.ink, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ position: "absolute", top: 0, right: 0, width: 11, height: 11, background: T.accent, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
            </div>
            <span style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em" }}>SkillPath</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 10 }}>
            <span style={{ width: 24, height: 2, background: T.accent, borderRadius: 1, display: "inline-block" }} />
            <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.accent }}>Welcome back</span>
            <span style={{ width: 24, height: 2, background: T.accent, borderRadius: 1, display: "inline-block" }} />
          </div>
          <h1 style={{ fontFamily: T.serif, fontSize: 30, fontWeight: 400, color: T.ink, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Sign in to your <em style={{ fontStyle: "italic", color: T.accent }}>account.</em>
          </h1>
        </div>

        {/* Card */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${T.accent}, ${T.blue})` }} />
          <div style={{ padding: 32 }}>
            <form onSubmit={handleSubmit} noValidate>

              <FInput id="si-email"    type="email"    label="Email address" value={email}    onChange={setEmail}    placeholder="you@example.com" required />
              <FInput id="si-password" type="password" label="Password"      value={password} onChange={setPassword} placeholder="••••••••"        required />

              {error && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 8, padding: 12, color: "#b91c1c", fontSize: 13, fontFamily: T.sans, marginBottom: 20, marginTop: 4 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>❌ Error</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {error}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 8, color: "#991b1b", opacity: 0.8 }}>
                    💡 Tip: Check browser console (F12 → Console) for detailed debug logs
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: `2px solid ${loading ? T.border : T.ink}`, background: loading ? T.warm : T.ink, color: loading ? T.ink45 : "#fff", fontSize: 14, fontFamily: T.sans, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = T.accent; e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.boxShadow = "0 6px 20px rgba(200,73,10,0.3)"; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = T.ink; e.currentTarget.style.borderColor = T.ink; e.currentTarget.style.boxShadow = "none"; } }}
              >
                {loading
                  ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${T.border}`, borderTopColor: T.accent, display: "inline-block", animation: "sp-spin 0.75s linear infinite" }} /> Signing in…</>
                  : <>Sign in <ArrowRight /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.ink25, letterSpacing: "0.06em" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            <p style={{ textAlign: "center", color: T.ink45, fontSize: 13.5, margin: 0 }}>
              Don't have an account?{" "}
              <button type="button" onClick={onSwitchToSignUp}
                style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontWeight: 500, fontSize: 13.5, fontFamily: T.sans, padding: 0, textDecoration: "underline", textDecorationColor: T.accentRule }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", fontFamily: T.mono, fontSize: 11, color: T.ink25, marginTop: 24, letterSpacing: "0.04em" }}>
          Tunisia's #1 AI career platform
        </p>
      </div>
    </div>
  );
}