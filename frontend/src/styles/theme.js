/* ─────────────────────────────────────────────────────────────────────────
   SkillPath Design Tokens
   Matches the dark aesthetic used in HomePage, ProfilePage, and App.jsx
   ───────────────────────────────────────────────────────────────────────── */

export const colors = {
  /* Backgrounds */
  bg:           "#0a0a0f",
  bgSecondary:  "#0f0f17",
  surface:      "rgba(255,255,255,0.025)",
  surfaceHover: "rgba(255,255,255,0.045)",
  overlay:      "rgba(10,10,15,0.88)",

  /* Borders */
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(108,99,255,0.3)",
  borderTeal:   "rgba(62,207,178,0.25)",
  borderDanger: "rgba(220,60,60,0.25)",

  /* Brand */
  purple:       "#6c63ff",
  purpleLight:  "#a098ff",
  purpleDim:    "rgba(108,99,255,0.1)",
  teal:         "#3ecfb2",
  tealDim:      "rgba(62,207,178,0.1)",

  /* Gradients */
  gradientPrimary: "linear-gradient(135deg, #6c63ff, #3ecfb2)",
  gradientHero:    "linear-gradient(90deg, #c8c0ff, #3ecfb2)",

  /* Text */
  text:         "#f0ede8",
  textMuted:    "rgba(240,237,232,0.45)",
  textDim:      "rgba(240,237,232,0.25)",
  textDisabled: "rgba(240,237,232,0.2)",

  /* Semantic */
  success:      "#3ecfb2",
  successDim:   "rgba(62,207,178,0.1)",
  danger:       "#e03c3c",
  dangerDim:    "rgba(220,60,60,0.08)",
  warning:      "#f5c842",
  warningDim:   "rgba(245,200,66,0.1)",

  /* Legacy aliases — kept so existing components don't break */
  glass:        "rgba(255,255,255,0.025)",
  glassBorder:  "rgba(255,255,255,0.07)",
  green:        "#3ecfb2",
  blue:         "#a098ff",
  muted:        "rgba(240,237,232,0.45)",
  dark:         "#0f0f17",
};

/* ─── Typography ─────────────────────────────────────────────────────────── */
export const fonts = {
  sans:    "'DM Sans', sans-serif",
  display: "'Syne', sans-serif",
};

/* ─── Shared input style ─────────────────────────────────────────────────── */
export const inputStyle = {
  width:       "100%",
  background:  "rgba(255,255,255,0.04)",
  border:      "1px solid rgba(255,255,255,0.09)",
  borderRadius: 10,
  padding:     "10px 14px",
  color:       "#f0ede8",
  fontSize:    14,
  outline:     "none",
  boxSizing:   "border-box",
  fontFamily:  "'DM Sans', sans-serif",
  transition:  "border-color 0.2s",
};

/* Focus override — spread inputStyle then this on focus */
export const inputFocusStyle = {
  borderColor: "rgba(108,99,255,0.45)",
};

/* ─── Card / surface styles ──────────────────────────────────────────────── */
export const cardStyle = {
  background:   "rgba(255,255,255,0.025)",
  border:       "1px solid rgba(255,255,255,0.07)",
  borderRadius:  18,
  padding:       28,
};

export const cardHoverStyle = {
  background:   "rgba(255,255,255,0.045)",
  borderColor:  "rgba(108,99,255,0.3)",
  transform:    "translateY(-2px)",
};

/* ─── Button variants ────────────────────────────────────────────────────── */

/** Ghost / glass button — secondary actions */
export const glassButton = {
  background:   "rgba(255,255,255,0.04)",
  border:       "1px solid rgba(255,255,255,0.09)",
  color:        "rgba(240,237,232,0.55)",
  borderRadius:  9,
  padding:      "7px 18px",
  cursor:       "pointer",
  fontSize:      13,
  fontFamily:   "'DM Sans', sans-serif",
  fontWeight:    500,
  transition:   "all 0.2s",
};

/** Primary CTA — gradient fill */
export const primaryButton = {
  background:   "linear-gradient(135deg, #6c63ff, #3ecfb2)",
  border:       "none",
  color:        "#fff",
  borderRadius:  10,
  padding:      "10px 22px",
  cursor:       "pointer",
  fontSize:      14,
  fontFamily:   "'DM Sans', sans-serif",
  fontWeight:    600,
  letterSpacing: "-0.01em",
  transition:   "opacity 0.2s",
};

/** Danger / destructive button */
export const dangerButton = {
  background:   "rgba(220,60,60,0.08)",
  border:       "1px solid rgba(220,60,60,0.2)",
  color:        "rgba(230,90,90,0.8)",
  borderRadius:  8,
  padding:      "6px 14px",
  cursor:       "pointer",
  fontSize:      13,
  fontFamily:   "'DM Sans', sans-serif",
  transition:   "all 0.2s",
};

/* ─── Badge / pill ───────────────────────────────────────────────────────── */
export const pillStyle = {
  display:      "inline-flex",
  alignItems:   "center",
  gap:           6,
  borderRadius:  100,
  padding:      "4px 12px",
  fontSize:      12,
  fontWeight:    500,
  fontFamily:   "'DM Sans', sans-serif",
};

export const pillPurple = {
  ...pillStyle,
  background:   "rgba(108,99,255,0.1)",
  border:       "1px solid rgba(108,99,255,0.25)",
  color:        "#a098ff",
};

export const pillTeal = {
  ...pillStyle,
  background:   "rgba(62,207,178,0.1)",
  border:       "1px solid rgba(62,207,178,0.25)",
  color:        "#3ecfb2",
};

export const pillDanger = {
  ...pillStyle,
  background:   "rgba(220,60,60,0.08)",
  border:       "1px solid rgba(220,60,60,0.2)",
  color:        "#e06060",
};

/* ─── Section label (small all-caps heading) ─────────────────────────────── */
export const sectionLabel = {
  fontSize:      11,
  fontWeight:    500,
  letterSpacing: "0.07em",
  color:        "rgba(240,237,232,0.3)",
  fontFamily:   "'DM Sans', sans-serif",
  marginBottom:  8,
  display:      "block",
};

/* ─── Divider ────────────────────────────────────────────────────────────── */
export const divider = {
  borderTop:  "1px solid rgba(255,255,255,0.06)",
  margin:     "1.25rem 0",
};

/* ─── Animations (reference names — keyframes live in GlobalStyles) ───────── */
export const animations = {
  fadeUp: "skillpath-fade",   // className to trigger fadeUp animation
  spin:   "spin",             // used inline on border spinner
};