import { useState } from "react";
import { apiLogin } from "../services/api";
import { colors, cardStyle, inputStyle } from "../styles/theme";

export default function SignIn({ onSuccess, onSwitchToSignUp }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
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
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      fontFamily: "'Segoe UI', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.purple}, ${colors.blue})`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, marginBottom: 14,
          }}>
            🔮
          </div>
          <h1 style={{ color: colors.text, fontSize: 26, fontWeight: 700, margin: 0 }}>
            Welcome back
          </h1>
          <p style={{ color: colors.muted, fontSize: 14, marginTop: 6 }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div style={{ ...cardStyle, padding: 32 }}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="si-email" style={{ display: "block", color: colors.muted, fontSize: 13, marginBottom: 6 }}>
                Email address
              </label>
              <input
                id="si-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={(e)  => (e.target.style.borderColor = colors.purple)}
                onBlur={(e)   => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="si-password" style={{ display: "block", color: colors.muted, fontSize: 13, marginBottom: 6 }}>
                Password
              </label>
              <input
                id="si-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={(e)  => (e.target.style.borderColor = colors.purple)}
                onBlur={(e)   => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#f87171",
                fontSize: 13,
                marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background: loading
                  ? "rgba(167,139,250,0.4)"
                  : `linear-gradient(135deg, ${colors.purple}, ${colors.blue})`,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Switch */}
          <p style={{ textAlign: "center", color: colors.muted, fontSize: 13, marginTop: 22, marginBottom: 0 }}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              style={{ background: "none", border: "none", color: colors.purple, cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
