import { useState } from "react";

export default function Header({ backendOk, user, onHome, onLogout, onProfile, onJobs }) {
  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      padding: "1.1rem 2.5rem",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(10,10,15,0.88)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      gap: "0.75rem",
    }}>

      {/* ── Logo ── */}
      <div
        onClick={onHome}
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", textDecoration: "none" }}
      >
        <div style={{
          width: 32, height: 32,
          background: "linear-gradient(135deg, #6c63ff, #3ecfb2)",
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M8 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "1.05rem",
          letterSpacing: "-0.01em",
          background: "linear-gradient(90deg, #c8c0ff, #3ecfb2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          SkillPath
        </span>
      </div>

      {/* ── Backend status pill ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.4rem",
        background: backendOk === null
          ? "rgba(255,255,255,0.04)"
          : backendOk
            ? "rgba(62,207,178,0.08)"
            : "rgba(220,60,60,0.08)",
        border: `1px solid ${
          backendOk === null
            ? "rgba(255,255,255,0.08)"
            : backendOk
              ? "rgba(62,207,178,0.2)"
              : "rgba(220,60,60,0.2)"
        }`,
        borderRadius: 100,
        padding: "0.25rem 0.75rem",
        marginLeft: "0.5rem",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: backendOk === null ? "rgba(240,237,232,0.3)" : backendOk ? "#3ecfb2" : "#e03c3c",
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: "0.7rem",
          fontFamily: "'DM Sans', sans-serif",
          color: backendOk === null
            ? "rgba(240,237,232,0.3)"
            : backendOk
              ? "#3ecfb2"
              : "#e06060",
        }}>
          {backendOk === null ? "Checking…" : backendOk ? "API connected" : "API offline"}
        </span>
      </div>

      {/* ── Right-side nav ── */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {user ? (
          <>
            {/* Username chip */}
            <div style={{
              fontSize: "0.8rem",
              color: "rgba(240,237,232,0.45)",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              padding: "0.35rem 0.8rem",
              marginRight: "0.35rem",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {user.username}
            </div>

            {/* Nav buttons */}
            {[
              { label: "Browse Jobs", action: onJobs    },
              { label: "Profile",     action: onProfile },
              { label: "Home",        action: onHome    },
            ].map(({ label, action }) => (
              <NavBtn key={label} onClick={action}>{label}</NavBtn>
            ))}

            {/* Sign out */}
            <NavBtn
              onClick={onLogout}
              hoverColor="#e06060"
              hoverBorder="rgba(220,60,60,0.3)"
            >
              Sign out
            </NavBtn>
          </>
        ) : (
          ["Model", "Docs", "About"].map((label) => (
            <NavBtn key={label}>{label}</NavBtn>
          ))
        )}
      </div>
    </nav>
  );
}

/* ── Shared nav button ────────────────────────────────────────────────────── */
function NavBtn({ children, onClick, hoverColor, hoverBorder }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "transparent",
        border: `1px solid ${hovered && hoverBorder ? hoverBorder : "rgba(255,255,255,0.07)"}`,
        borderRadius: 8,
        padding: "0.4rem 0.9rem",
        color: hovered
          ? hoverColor || "rgba(240,237,232,0.85)"
          : "rgba(240,237,232,0.45)",
        fontSize: "0.83rem",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        cursor: "pointer",
        transition: "color 0.2s, border-color 0.2s",
      }}
    >
      {children}
    </button>
  );
}