import { useState } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --white:        #ffffff;
    --warm:         #f5f3ef;
    --border:       #e2ddd6;
    --border2:      #ccc7bf;
    --ink:          #1a1814;
    --ink-70:       rgba(26,24,20,0.78);
    --ink-45:       rgba(26,24,20,0.58);
    --ink-25:       rgba(26,24,20,0.38);
    --accent:       #c8490a;
    --accent-light: #fff3ee;
    --accent-rule:  #fbd0b8;
    --teal:         #0d6e64;
    --teal-light:   rgba(13,110,100,0.08);
    --teal-rule:    rgba(13,110,100,0.22);
    --red:          #b91c1c;
    --red-light:    rgba(185,28,28,0.08);
    --red-rule:     rgba(185,28,28,0.2);
    --sans:  'DM Sans', system-ui, sans-serif;
    --serif: 'Playfair Display', Georgia, serif;
    --mono:  'DM Mono', monospace;
  }

  .sp-nav {
    height: 62px;
    display: flex;
    align-items: center;
    padding: 0 40px;
    gap: 10px;
    border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    position: sticky;
    top: 0;
    z-index: 100;
    font-family: var(--sans);
  }

  /* ── Logo ── */
  .sp-nav-logo {
    display: flex; align-items: center; gap: 9px;
    cursor: pointer; text-decoration: none; flex-shrink: 0;
  }
  .sp-nav-logo-mark {
    width: 30px; height: 30px; border-radius: 7px;
    background: var(--ink);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  /* Accent corner triangle */
  .sp-nav-logo-mark::after {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 10px; height: 10px;
    background: var(--accent);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
  }
  .sp-nav-logo-text {
    font-family: var(--serif);
    font-size: 17px; font-weight: 700;
    color: var(--ink); letter-spacing: -0.01em;
  }

  /* ── Status pill ── */
  .sp-status {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 11px; border-radius: 100px;
    font-size: 11px; font-family: var(--mono);
    margin-left: 6px; transition: all 0.2s;
  }
  .sp-status-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  }
  .sp-status--checking {
    background: var(--warm); border: 1px solid var(--border); color: var(--ink-25);
  }
  .sp-status--ok {
    background: var(--teal-light); border: 1px solid var(--teal-rule); color: var(--teal);
  }
  .sp-status--err {
    background: var(--red-light); border: 1px solid var(--red-rule); color: var(--red);
  }

  /* ── Right rail ── */
  .sp-nav-right {
    margin-left: auto;
    display: flex; align-items: center; gap: 6px;
  }

  /* Username chip */
  .sp-username {
    padding: 5px 12px; border-radius: 100px;
    background: var(--warm); border: 1px solid var(--border);
    font-size: 12.5px; font-family: var(--mono); color: var(--ink-45);
    margin-right: 4px;
  }

  /* Nav buttons */
  .sp-nav-btn {
    padding: 6px 14px; border-radius: 7px;
    background: transparent; border: 1px solid transparent;
    color: var(--ink-45); font-size: 13.5px;
    font-family: var(--sans); font-weight: 500;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .sp-nav-btn:hover {
    background: var(--warm); border-color: var(--border); color: var(--ink);
  }

  /* Destructive (sign out) */
  .sp-nav-btn--danger:hover {
    background: var(--red-light); border-color: var(--red-rule); color: var(--red);
  }

  /* Divider between groups */
  .sp-nav-divider {
    width: 1px; height: 20px; background: var(--border); flex-shrink: 0;
    margin: 0 4px;
  }
`;

export default function Header({ backendOk, user, onHome, onLogout, onProfile, onJobs, onLearn }) {
  const statusClass =
    backendOk === null ? "sp-status sp-status--checking" :
    backendOk          ? "sp-status sp-status--ok"       :
                         "sp-status sp-status--err";

  const dotColor =
    backendOk === null ? "var(--ink-25)" :
    backendOk          ? "var(--teal)"   : "var(--red)";

  const statusLabel =
    backendOk === null ? "Checking…" :
    backendOk          ? "API connected" : "API offline";

  return (
    <>
      <style>{CSS}</style>
      <nav className="sp-nav">

        {/* ── Logo ── */}
        <div className="sp-nav-logo" onClick={onHome}>
          <div className="sp-nav-logo-mark">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="sp-nav-logo-text">SkillPath</span>
        </div>

        {/* ── Backend status ── */}
        <div className={statusClass}>
          <span className="sp-status-dot" style={{ background: dotColor }} />
          {statusLabel}
        </div>

        {/* ── Right rail ── */}
        <div className="sp-nav-right">
          {user ? (
            <>
              <span className="sp-username">{user.username}</span>

              <button className="sp-nav-btn" onClick={onJobs}>Browse Jobs</button>
              <button className="sp-nav-btn" onClick={onLearn}>Learning Path</button>
              <button className="sp-nav-btn" onClick={onProfile}>Profile</button>
              <button className="sp-nav-btn" onClick={onHome}>Home</button>

              <span className="sp-nav-divider" />

              <button className="sp-nav-btn sp-nav-btn--danger" onClick={onLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button className="sp-nav-btn">Model</button>
              <button className="sp-nav-btn">Docs</button>
              <button className="sp-nav-btn">About</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}