import { useState } from "react";
import { apiRegister } from "../services/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --white:        #ffffff;
    --paper:        #fafaf9;
    --warm:         #f5f3ef;
    --warm2:        #ede9e1;
    --border:       #e2ddd6;
    --border2:      #ccc7bf;
    --ink:          #1a1814;
    --ink-70:       rgba(26,24,20,0.7);
    --ink-45:       rgba(26,24,20,0.45);
    --ink-25:       rgba(26,24,20,0.25);
    --ink-10:       rgba(26,24,20,0.08);
    --accent:       #c8490a;
    --accent-light: #fff3ee;
    --accent-rule:  #fbd0b8;
    --red:          #b91c1c;
    --red-light:    rgba(185,28,28,0.08);
    --red-rule:     rgba(185,28,28,0.2);
    --sans:  'DM Sans', system-ui, sans-serif;
    --serif: 'Playfair Display', Georgia, serif;
    --mono:  'DM Mono', monospace;
    --sh:    0 4px 20px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.04);
    --sh-lg: 0 20px 56px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.06);
  }

  .su-root {
    min-height: 100vh;
    background: var(--paper);
    font-family: var(--sans);
    color: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    position: relative;
  }

  /* Dot-grid background */
  .su-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(var(--border) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none; opacity: 0.6;
  }

  .su-wrap {
    width: 100%; max-width: 440px;
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
  }

  /* ── Header ── */
  .su-header { text-align: center; margin-bottom: 36px; }

  .su-logo {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--ink);
    display: inline-flex; align-items: center; justify-content: center;
    margin-bottom: 20px; position: relative; overflow: hidden;
  }
  .su-logo::after {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 14px; height: 14px;
    background: var(--accent);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
  }

  .su-title {
    font-family: var(--serif);
    font-size: clamp(28px, 5vw, 36px);
    font-weight: 700; line-height: 1.1;
    letter-spacing: -0.02em; color: var(--ink);
    margin-bottom: 8px;
  }
  .su-title em { font-style: italic; font-weight: 400; color: var(--accent); }

  .su-subtitle {
    font-size: 14px; color: var(--ink-45);
    line-height: 1.6; font-weight: 300;
  }

  /* ── Card ── */
  .su-card {
    width: 100%;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--sh-lg);
    overflow: hidden;
    position: relative;
  }
  /* Accent top stripe */
  .su-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--accent), #0d6e64);
  }

  .su-card-body { padding: 32px; padding-top: 36px; }

  /* ── Field ── */
  .su-field { margin-bottom: 18px; }
  .su-label {
    display: block;
    font-size: 12px; font-family: var(--mono);
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-45); margin-bottom: 7px;
  }
  .su-input {
    width: 100%; padding: 10px 14px;
    border-radius: 8px; border: 1.5px solid var(--border);
    background: var(--warm); color: var(--ink);
    font-size: 14px; font-family: var(--sans); font-weight: 400;
    outline: none; transition: all 0.18s;
  }
  .su-input:focus {
    border-color: var(--accent); background: var(--white);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
  .su-input::placeholder { color: var(--ink-25); }

  /* ── Field row (two columns) ── */
  .su-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  /* ── Divider ── */
  .su-divider {
    border: none; border-top: 1px solid var(--border);
    margin: 24px 0;
  }

  /* ── Error ── */
  .su-error {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 12px 14px; border-radius: 8px;
    background: var(--red-light); border: 1px solid var(--red-rule);
    color: var(--red); font-size: 13px;
    margin-bottom: 18px; line-height: 1.5;
  }

  /* ── Submit ── */
  .su-submit {
    width: 100%; padding: 13px;
    border-radius: 8px; border: 2px solid var(--ink);
    background: var(--ink); color: #fff;
    font-size: 15px; font-family: var(--sans); font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    letter-spacing: 0.01em;
  }
  .su-submit:hover:not(:disabled) {
    background: var(--accent); border-color: var(--accent);
    box-shadow: 0 6px 20px rgba(200,73,10,0.28);
    transform: translateY(-1px);
  }
  .su-submit:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
  .su-submit svg { transition: transform 0.2s; }
  .su-submit:hover:not(:disabled) svg { transform: translateX(3px); }

  /* ── Footer link ── */
  .su-footer {
    text-align: center; margin-top: 22px;
    font-size: 13.5px; color: var(--ink-45);
  }
  .su-link {
    background: none; border: none;
    color: var(--accent); cursor: pointer;
    font-weight: 500; font-size: 13.5px;
    font-family: var(--sans); padding: 0;
    transition: color 0.15s; text-decoration: underline;
    text-decoration-color: var(--accent-rule);
  }
  .su-link:hover { color: var(--accent-dark, #9a3208); }

  /* ── Password strength indicator ── */
  .su-strength { margin-top: 6px; display: flex; gap: 4px; }
  .su-strength-bar {
    flex: 1; height: 3px; border-radius: 2px;
    background: var(--border); transition: background 0.3s;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .su-anim { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .su-anim-d1 { animation-delay: 0.06s; }
`;

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Password strength ──────────────────────────────────────────── */
function strengthLevel(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_COLORS = ["var(--border)", "#ef4444", "#f97316", "#eab308", "#22c55e"];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

/* ── Field component ────────────────────────────────────────────── */
function Field({ label, type, value, onChange, placeholder, autoComplete, children }) {
  return (
    <div className="su-field">
      <label className="su-label">{label}</label>
      <input
        className="su-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
      {children}
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function SignUp({ onSuccess, onSwitchToSignIn }) {
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const strength = strengthLevel(password);
  const confirmMismatch = confirm.length > 0 && confirm !== password;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm)  { setError("Passwords do not match."); return; }
    if (password.length < 6)   { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const data = await apiRegister(username, email, password);
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
    <>
      <style>{CSS}</style>
      <div className="su-root">
        <div className="su-wrap">

          {/* ── Header ── */}
          <header className="su-header su-anim">
            <div className="su-logo">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="su-title">
              Create your<br /><em>account</em>
            </h1>
            <p className="su-subtitle">Join SkillPath and discover your perfect role.</p>
          </header>

          {/* ── Card ── */}
          <div className="su-card su-anim su-anim-d1">
            <div className="su-card-body">
              <form onSubmit={handleSubmit} noValidate>

                {/* Username */}
                <Field
                  label="Username"
                  type="text"
                  value={username}
                  onChange={setUsername}
                  placeholder="johndoe"
                  autoComplete="username"
                />

                {/* Email */}
                <Field
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <hr className="su-divider" />

                {/* Password */}
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                >
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div>
                      <div className="su-strength">
                        {[1, 2, 3, 4].map(n => (
                          <div
                            key={n}
                            className="su-strength-bar"
                            style={{ background: n <= strength ? STRENGTH_COLORS[strength] : undefined }}
                          />
                        ))}
                      </div>
                      {strength > 0 && (
                        <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: STRENGTH_COLORS[strength], marginTop: 4 }}>
                          {STRENGTH_LABELS[strength]}
                        </div>
                      )}
                    </div>
                  )}
                </Field>

                {/* Confirm password */}
                <div className="su-field">
                  <label className="su-label">Confirm password</label>
                  <input
                    className="su-input"
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    style={confirmMismatch ? {
                      borderColor: "var(--red)",
                      boxShadow: "0 0 0 3px var(--red-light)",
                    } : {}}
                  />
                  {confirmMismatch && (
                    <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--red)", marginTop: 4 }}>
                      Passwords don't match
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="su-error" style={{ display: "block", padding: "12px" }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: "14px" }}>❌ Error</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 8 }}>
                      {error}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--red)", opacity: 0.8 }}>
                      💡 Tip: Check browser console (F12 → Console) for detailed debug logs
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="su-submit"
                  disabled={loading || confirmMismatch}
                >
                  {loading ? "Creating account…" : <><span>Create account</span><ArrowRight /></>}
                </button>
              </form>
            </div>
          </div>

          {/* ── Switch ── */}
          <p className="su-footer">
            Already have an account?{" "}
            <button type="button" className="su-link" onClick={onSwitchToSignIn}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </>
  );
}