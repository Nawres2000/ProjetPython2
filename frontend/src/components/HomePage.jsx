import { useState, useEffect, useRef } from "react";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const SKILLS = [
  "JavaScript","Python","React","Node.js","SQL","Machine Learning",
  "Data Analysis","UI/UX Design","Project Management","DevOps",
  "Java","PHP","Marketing","Sales","Accounting","HR Management",
  "Cybersecurity","Cloud Computing","Mobile Development","Agile/Scrum",
  "TypeScript","Docker","Kubernetes","Figma","Adobe XD",
];

const SAMPLE_JOBS = [
  { id:1, title:"Frontend Developer",  company:"Tech Innovations SARL", location:"Tunis",  type:"Full-time", salary:"2,500–3,500 TND", tags:["React","JavaScript","CSS"],               posted:"2 days ago", logo:"TI", color:"#1d4ed8" },
  { id:2, title:"Data Scientist",      company:"Analytics Hub",          location:"Sfax",   type:"Full-time", salary:"3,000–4,500 TND", tags:["Python","Machine Learning","SQL"],       posted:"1 day ago",  logo:"AH", color:"#065f46" },
  { id:3, title:"UX Designer",         company:"Creative Studio",        location:"Sousse", type:"Hybrid",    salary:"2,000–3,000 TND", tags:["Figma","UI/UX Design","Adobe XD"],      posted:"3 days ago", logo:"CS", color:"#9d174d" },
  { id:4, title:"DevOps Engineer",     company:"CloudBase TN",           location:"Tunis",  type:"Remote",    salary:"3,500–5,000 TND", tags:["Docker","Kubernetes","Cloud Computing"], posted:"Today",      logo:"CB", color:"#4c1d95" },
];

const ROLE_PREDICTIONS = {
  JavaScript:"Frontend Developer",React:"Frontend Developer",TypeScript:"Frontend Developer",
  Python:"Data Scientist","Machine Learning":"Data Scientist",
  "Data Analysis":"Data Analyst",SQL:"Data Analyst",
  "UI/UX Design":"UX Designer",Figma:"UX Designer","Adobe XD":"UX Designer",
  Docker:"DevOps Engineer",Kubernetes:"DevOps Engineer","Cloud Computing":"DevOps Engineer",
  "Project Management":"Product Manager","Agile/Scrum":"Product Manager",
  Java:"Backend Developer","Node.js":"Backend Developer",PHP:"Backend Developer",
  Cybersecurity:"Security Engineer",Marketing:"Marketing Specialist",
  Sales:"Sales Manager",Accounting:"Financial Analyst",
  "HR Management":"HR Specialist","Mobile Development":"Mobile Developer",DevOps:"DevOps Engineer",
};

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --white:   #ffffff;
    --paper:   #fafaf9;
    --warm:    #f5f3ef;
    --warm2:   #ede9e1;
    --border:  #e2ddd6;
    --border2: #ccc7bf;
    --ink:     #1a1814;
    --ink-70:  rgba(26,24,20,0.7);
    --ink-45:  rgba(26,24,20,0.45);
    --ink-25:  rgba(26,24,20,0.25);
    --ink-10:  rgba(26,24,20,0.08);

    --accent:       #c8490a;
    --accent-light: #fff3ee;
    --accent-rule:  #fbd0b8;
    --accent-dark:  #9a3208;

    --blue:       #1d4ed8;
    --blue-light: #eff3ff;
    --blue-rule:  #bfcbfb;

    --green:       #065f46;
    --green-light: #ecfdf5;
    --green-rule:  #a7f3d0;

    --r-xs: 4px;
    --r-sm: 8px;
    --r:    14px;
    --r-lg: 20px;
    --r-xl: 28px;

    --serif: 'Playfair Display', Georgia, serif;
    --sans:  'DM Sans', system-ui, sans-serif;
    --mono:  'DM Mono', monospace;

    --sh-sm: 0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --sh:    0 4px 20px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.04);
    --sh-lg: 0 20px 56px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.06);
  }

  .sp {
    font-family: var(--sans);
    background: var(--white);
    color: var(--ink);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ════ NAV ════════════════════════════════════════════════════════ */
  .nav {
    height: 62px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px;
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0;
    background: rgba(255,255,255,0.94);
    backdrop-filter: blur(14px);
    z-index: 100;
  }

  .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .nav-logo-mark {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--ink);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .nav-logo-mark::after {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 10px; height: 10px;
    background: var(--accent);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
  }
  .nav-logo-text {
    font-family: var(--serif);
    font-size: 18px; font-weight: 700;
    color: var(--ink); letter-spacing: -0.01em;
  }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a {
    text-decoration: none; font-size: 14px;
    color: var(--ink-45); transition: color 0.15s;
    font-weight: 400; letter-spacing: 0.01em;
  }
  .nav-links a:hover { color: var(--ink); }
  .nav-actions { display: flex; gap: 8px; align-items: center; }

  .btn-nav-ghost {
    padding: 7px 16px; border-radius: var(--r-sm);
    background: transparent; border: 1px solid var(--border);
    color: var(--ink-70); font-size: 13.5px; font-family: var(--sans); font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-nav-ghost:hover { border-color: var(--border2); color: var(--ink); background: var(--warm); }

  .btn-nav-solid {
    padding: 7px 16px; border-radius: var(--r-sm);
    background: var(--ink); border: 1px solid var(--ink);
    color: #fff; font-size: 13.5px; font-family: var(--sans); font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-nav-solid:hover { background: var(--accent); border-color: var(--accent); }

  .user-badge {
    padding: 5px 12px; border-radius: 100px;
    background: var(--warm); border: 1px solid var(--border);
    font-size: 12px; font-family: var(--mono); color: var(--ink-45);
  }

  /* ════ HERO ════════════════════════════════════════════════════════ */
  .hero {
    max-width: 1120px; margin: 0 auto;
    padding: 80px 48px 72px;
    display: grid; grid-template-columns: 1fr 420px;
    gap: 72px; align-items: center;
    position: relative;
  }

  /* Decorative large number behind headline */
  .hero-bg-num {
    position: absolute;
    right: 440px; top: 40px;
    font-family: var(--serif); font-size: 220px; font-weight: 700;
    color: var(--ink-10); line-height: 1;
    pointer-events: none; user-select: none;
    letter-spacing: -0.05em;
  }

  .hero-kicker {
    display: inline-flex; align-items: center; gap: 8px;
    margin-bottom: 22px;
  }
  .hero-kicker-line {
    width: 28px; height: 2px; background: var(--accent); border-radius: 1px;
  }
  .hero-kicker-text {
    font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--accent); font-weight: 500;
  }

  .hero-h1 {
    font-family: var(--serif);
    font-size: clamp(44px, 5.5vw, 68px);
    font-weight: 400; line-height: 1.06;
    letter-spacing: -0.025em; color: var(--ink);
    margin-bottom: 20px;
  }
  .hero-h1 em { font-style: italic; font-weight: 400; color: var(--accent); }

  .hero-sub {
    font-size: 16px; color: var(--ink-70); line-height: 1.75;
    max-width: 420px; margin-bottom: 36px;
    font-weight: 300;
  }

  .hero-cta { display: flex; gap: 12px; align-items: center; }

  .btn-primary {
    padding: 13px 26px; border-radius: var(--r-sm);
    background: var(--ink); border: 2px solid var(--ink);
    color: #fff; font-size: 14.5px; font-family: var(--sans); font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
    letter-spacing: 0.01em;
  }
  .btn-primary:hover {
    background: var(--accent); border-color: var(--accent);
    transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,73,10,0.3);
  }
  .btn-primary svg { transition: transform 0.2s; }
  .btn-primary:hover svg { transform: translateX(3px); }

  .btn-ghost {
    padding: 13px 22px; border-radius: var(--r-sm);
    background: transparent; border: 2px solid var(--border);
    color: var(--ink-70); font-size: 14.5px; font-family: var(--sans); font-weight: 400;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-ghost:hover { border-color: var(--border2); color: var(--ink); background: var(--warm); }

  /* Scrolling tag ticker */
  .hero-ticker {
    margin-top: 40px; overflow: hidden;
    display: flex; gap: 0;
  }
  .hero-ticker-inner {
    display: flex; gap: 8px;
    animation: ticker 22s linear infinite;
    white-space: nowrap;
  }
  .hero-ticker-inner:hover { animation-play-state: paused; }
  .ticker-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 100px;
    border: 1px solid var(--border); background: var(--warm);
    font-size: 12px; color: var(--ink-45); font-family: var(--mono);
    white-space: nowrap; flex-shrink: 0;
    transition: all 0.15s; cursor: default;
  }
  .ticker-tag:hover { border-color: var(--accent-rule); color: var(--accent); background: var(--accent-light); }
  .ticker-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.5; }

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* ════ STATS PANEL ═════════════════════════════════════════════════ */
  .stats-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--r-xl); overflow: hidden;
    box-shadow: var(--sh-lg);
    position: relative;
  }
  /* Accent top bar */
  .stats-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--blue));
  }
  .stats-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid var(--border);
  }
  .stat-cell {
    padding: 22px 24px;
    border-right: 1px solid var(--border);
    transition: background 0.15s;
  }
  .stat-cell:hover { background: var(--warm); }
  .stat-cell:nth-child(2n) { border-right: none; }
  .stat-cell:nth-child(n+3) { border-top: 1px solid var(--border); }
  .stat-value {
    font-family: var(--serif); font-size: 30px;
    font-weight: 700; color: var(--ink); line-height: 1; margin-bottom: 4px;
  }
  .stat-label {
    font-size: 11px; font-family: var(--mono);
    color: var(--ink-45); letter-spacing: 0.06em; text-transform: uppercase;
  }
  .stats-jobs { padding: 14px; display: flex; flex-direction: column; gap: 8px; }

  .mini-job {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: var(--r-sm);
    border: 1px solid var(--border); background: var(--white);
    cursor: pointer; transition: all 0.18s;
  }
  .mini-job:hover {
    border-color: var(--border2);
    box-shadow: var(--sh-sm);
    transform: translateX(3px);
  }
  .mini-logo {
    width: 34px; height: 34px; border-radius: 8px;
    font-size: 11px; font-weight: 600; font-family: var(--mono);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .mini-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 1px; }
  .mini-sub   { font-size: 11.5px; color: var(--ink-45); }

  /* ════ DIVIDER & SECTION ═══════════════════════════════════════════ */
  .divider { border: none; border-top: 1px solid var(--border); }
  .section { max-width: 1120px; margin: 0 auto; padding: 80px 48px; }

  /* Tinted section band */
  .band { background: var(--warm); }
  .band .section { padding-top: 72px; padding-bottom: 72px; }

  .section-kicker {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  }
  .section-kicker-num {
    font-family: var(--mono); font-size: 11px;
    color: var(--accent); letter-spacing: 0.1em;
    font-weight: 500;
  }
  .section-kicker-rule { flex: 0 0 24px; height: 1px; background: var(--accent); }
  .section-h2 {
    font-family: var(--serif);
    font-size: clamp(30px, 4vw, 44px);
    font-weight: 400; line-height: 1.15; letter-spacing: -0.02em;
    color: var(--ink); margin-bottom: 10px;
  }
  .section-h2 em { font-style: italic; color: var(--accent); }
  .section-sub {
    font-size: 15px; color: var(--ink-70); line-height: 1.7;
    font-weight: 300; max-width: 520px;
  }

  /* ════ PREDICTOR ═══════════════════════════════════════════════════ */
  .predictor {
    margin-top: 44px;
    border: 1px solid var(--border);
    border-radius: var(--r-xl); overflow: hidden;
    box-shadow: var(--sh);
    background: var(--white);
  }
  .predictor-grid { display: grid; grid-template-columns: 1fr 1fr; }
  .predictor-left {
    padding: 40px; border-right: 1px solid var(--border);
    background: var(--white);
  }
  .predictor-right {
    padding: 40px; background: var(--paper);
    display: flex; flex-direction: column; justify-content: center;
    min-height: 420px;
    position: relative; overflow: hidden;
  }
  /* Decorative corner accent on right panel */
  .predictor-right::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 120px; height: 120px; border-radius: 50%;
    border: 24px solid var(--warm2);
    pointer-events: none;
  }

  .field-label {
    font-family: var(--mono); font-size: 10.5px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--ink-25); margin-bottom: 10px;
  }

  .skill-input-wrap { position: relative; margin-bottom: 24px; }
  .skill-input {
    width: 100%; padding: 11px 15px; border-radius: var(--r-sm);
    border: 1.5px solid var(--border); background: var(--warm);
    color: var(--ink); font-size: 14px; font-family: var(--sans); font-weight: 400;
    outline: none; transition: all 0.18s;
  }
  .skill-input:focus {
    border-color: var(--accent); background: var(--white);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
  .skill-input::placeholder { color: var(--ink-25); }

  .suggestions-drop {
    position: absolute; top: calc(100% + 5px); left: 0; right: 0;
    background: var(--white); border: 1.5px solid var(--border);
    border-radius: var(--r-sm); overflow: hidden; z-index: 30;
    box-shadow: var(--sh);
  }
  .suggestion-item {
    padding: 11px 15px; font-size: 13.5px; color: var(--ink-70);
    cursor: pointer; transition: all 0.12s; border-left: 3px solid transparent;
  }
  .suggestion-item:hover {
    background: var(--warm); color: var(--ink);
    border-left-color: var(--accent);
  }

  .chips { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 24px; }

  .chip-idle {
    padding: 6px 13px; border-radius: 100px;
    background: var(--white); border: 1.5px solid var(--border);
    color: var(--ink-45); font-size: 13px; font-family: var(--sans); font-weight: 400;
    cursor: pointer; transition: all 0.15s;
  }
  .chip-idle:hover { border-color: var(--accent-rule); color: var(--accent); background: var(--accent-light); }
  .chip-idle.on { background: var(--accent-light); border-color: var(--accent-rule); color: var(--accent); cursor: default; font-weight: 500; }

  .chip-active {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 8px 6px 13px; border-radius: 100px;
    background: var(--ink); color: #fff; font-size: 13px; font-family: var(--sans);
    transition: all 0.15s;
  }
  .chip-active:hover { background: var(--accent); }
  .chip-remove {
    background: rgba(255,255,255,0.25); border: none; cursor: pointer;
    color: #fff; font-size: 14px; line-height: 1; padding: 0;
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.12s;
  }
  .chip-remove:hover { background: rgba(255,255,255,0.4); }

  .btn-predict {
    width: 100%; padding: 13px; border-radius: var(--r-sm);
    background: var(--ink); border: 2px solid var(--ink); color: #fff;
    font-size: 14px; font-family: var(--sans); font-weight: 500;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em;
  }
  .btn-predict:hover:not(:disabled) {
    background: var(--accent); border-color: var(--accent);
    box-shadow: 0 6px 20px rgba(200,73,10,0.3);
  }
  .btn-predict:disabled { opacity: 0.25; cursor: not-allowed; }

  /* ── Result ── */
  .result-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 26px; margin-bottom: 18px;
    box-shadow: var(--sh-sm); position: relative; overflow: hidden;
  }
  .result-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 4px; background: var(--accent);
    border-radius: 4px 0 0 4px;
  }
  .result-eyebrow {
    font-family: var(--mono); font-size: 10.5px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 8px; font-weight: 500;
  }
  .result-role {
    font-family: var(--serif); font-size: 30px;
    font-weight: 500; font-style: italic;
    color: var(--ink); margin-bottom: 8px; line-height: 1.2;
  }
  .result-desc { font-size: 13.5px; color: var(--ink-70); line-height: 1.65; font-weight: 300; }

  .empty-state {
    text-align: center; padding: 36px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .empty-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: var(--warm); border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--serif); font-size: 26px; font-style: italic;
    color: var(--ink-25);
  }
  .empty-text { font-size: 14px; color: var(--ink-25); line-height: 1.7; max-width: 250px; font-weight: 300; }

  .spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid var(--border); border-top-color: var(--accent);
    animation: spin 0.75s linear infinite; margin: 0 auto 14px;
  }
  .analyzing-text { font-size: 13px; color: var(--ink-45); text-align: center; font-family: var(--mono); }

  /* ════ JOB CARDS ════════════════════════════════════════════════════ */
  .job-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 16px; margin-top: 40px;
  }

  .job-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 22px 24px;
    cursor: pointer; transition: all 0.22s;
    position: relative; overflow: hidden;
  }
  .job-card::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; background: transparent; transition: background 0.2s;
  }
  .job-card:hover {
    border-color: var(--border2);
    box-shadow: var(--sh);
    transform: translateY(-3px);
  }
  .job-card:hover::after { background: var(--accent); }

  .job-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 12px; }
  .job-identity { display: flex; gap: 12px; align-items: center; }
  .job-logo {
    width: 44px; height: 44px; border-radius: 10px;
    font-size: 11.5px; font-weight: 700; font-family: var(--mono);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .job-title   { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 3px; font-family: var(--sans); }
  .job-company { font-size: 12.5px; color: var(--ink-45); font-weight: 400; }

  .job-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .job-tag {
    padding: 3px 9px; border-radius: 4px;
    background: var(--warm); border: 1px solid var(--border);
    font-size: 11.5px; font-family: var(--mono); color: var(--ink-70);
  }
  .job-footer { display: flex; justify-content: space-between; align-items: center; }
  .job-location { font-size: 12.5px; color: var(--ink-45); }
  .job-posted   { font-size: 11px; color: var(--ink-25); font-family: var(--mono); }

  /* ── Badges ── */
  .badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-family: var(--mono); white-space: nowrap; }
  .badge-blue   { background: var(--blue-light);  color: var(--blue);  border: 1px solid var(--blue-rule); }
  .badge-green  { background: var(--green-light); color: var(--green); border: 1px solid var(--green-rule); }
  .badge-amber  { background: #fefce8; color: #854d0e; border: 1px solid #fde68a; }
  .badge-neutral{ background: var(--warm); color: var(--ink-70); border: 1px solid var(--border); }

  /* ── Filters ── */
  .filter-bar { display: flex; gap: 6px; }
  .filter-btn {
    padding: 7px 15px; border-radius: 100px; background: transparent;
    border: 1.5px solid var(--border); color: var(--ink-45); font-size: 13px;
    font-family: var(--sans); cursor: pointer; transition: all 0.15s;
  }
  .filter-btn:hover { border-color: var(--border2); color: var(--ink); background: var(--warm); }
  .filter-btn.active { background: var(--ink); border-color: var(--ink); color: #fff; }

  /* ════ HOW IT WORKS ════════════════════════════════════════════════ */
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }

  .step {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 32px 28px;
    transition: all 0.22s; position: relative; overflow: hidden;
  }
  .step:hover {
    box-shadow: var(--sh);
    transform: translateY(-4px);
    border-color: var(--border2);
  }
  /* Step number watermark */
  .step::before {
    content: attr(data-num);
    position: absolute; right: 16px; top: 12px;
    font-family: var(--serif); font-size: 80px; font-weight: 700;
    color: var(--ink-10); line-height: 1; pointer-events: none;
    letter-spacing: -0.05em;
  }

  .step-kicker {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 18px;
  }
  .step-kicker-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent);
  }
  .step-kicker-num {
    font-family: var(--mono); font-size: 11px; color: var(--accent);
    letter-spacing: 0.08em; font-weight: 500;
  }
  .step-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 10px; font-family: var(--sans); }
  .step-desc  { font-size: 13.5px; color: var(--ink-70); line-height: 1.72; font-weight: 300; }

  /* ════ MISC ════════════════════════════════════════════════════════ */
  .btn-view-all {
    display: flex; align-items: center; gap: 8px;
    margin: 28px auto 0; width: fit-content;
    padding: 11px 26px; border-radius: var(--r-sm);
    background: transparent; border: 1.5px solid var(--border);
    color: var(--ink-70); font-size: 14px; font-family: var(--sans);
    cursor: pointer; transition: all 0.15s; font-weight: 400;
  }
  .btn-view-all:hover { border-color: var(--border2); color: var(--ink); background: var(--warm); }
  .btn-view-all svg { transition: transform 0.2s; }
  .btn-view-all:hover svg { transform: translateX(3px); }

  .footer {
    border-top: 1px solid var(--border); padding: 28px 48px;
    max-width: 1120px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
  }
  .footer-copy { font-size: 12px; color: var(--ink-25); font-family: var(--mono); }
  .footer-links { display: flex; gap: 22px; }
  .footer-links a { text-decoration: none; font-size: 13px; color: var(--ink-45); transition: color 0.12s; }
  .footer-links a:hover { color: var(--ink); }

  /* ════ ANIMATIONS ══════════════════════════════════════════════════ */
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes ticker  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

  .anim { animation: fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-d1 { animation-delay: 0.06s; }
  .anim-d2 { animation-delay: 0.12s; }

  .page-fade {
    opacity:0; transform:translateY(20px);
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  .page-fade.in { opacity:1; transform:translateY(0); }
  .d1 { transition-delay: 0.1s; }
  .d2 { transition-delay: 0.2s; }
`;

/* ─── AnimatedCounter ────────────────────────────────────────────────────── */
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let t0 = 0;
        const step = ts => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / 1400, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * value));
          if (p < 1) requestAnimationFrame(step); else setCount(value);
        };
        requestAnimationFrame(step);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function TypeBadge({ type }) {
  const cls = type === "Remote" ? "badge badge-green" : type === "Hybrid" ? "badge badge-amber" : type === "Full-time" ? "badge badge-neutral" : "badge badge-blue";
  return <span className={cls}>{type}</span>;
}

/* ─── SkillTicker ────────────────────────────────────────────────────────── */
function SkillTicker() {
  const items = [...SKILLS, ...SKILLS];
  return (
    <div className="hero-ticker">
      <div className="hero-ticker-inner">
        {items.map((s, i) => (
          <span key={i} className="ticker-tag">
            <span className="ticker-dot" />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── JobCard ────────────────────────────────────────────────────────────── */
function JobCard({ job, onClick }) {
  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-card-top">
        <div className="job-identity">
          <div className="job-logo" style={{ background: job.color + "12", color: job.color, border: `1px solid ${job.color}20` }}>{job.logo}</div>
          <div>
            <div className="job-title">{job.title}</div>
            <div className="job-company">{job.company}</div>
          </div>
        </div>
        <TypeBadge type={job.type} />
      </div>
      <div className="job-tags">{job.tags.map(t => <span key={t} className="job-tag">{t}</span>)}</div>
      <div className="job-footer">
        <span className="job-location">📍 {job.location} · <strong>{job.salary}</strong>/mo</span>
        <span className="job-posted">{job.posted}</span>
      </div>
    </div>
  );
}

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function HomePage({ onSignIn, onSignUp, onGoToApp, user }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput,     setSkillInput]     = useState("");
  const [suggestions,    setSuggestions]    = useState([]);
  const [predictedRole,  setPredictedRole]  = useState(null);
  const [isAnalyzing,    setIsAnalyzing]    = useState(false);
  const [activeFilter,   setActiveFilter]   = useState("All");
  const [visible,        setVisible]        = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const handleSkillInput = val => {
    setSkillInput(val);
    setSuggestions(val.length > 0
      ? SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !selectedSkills.includes(s)).slice(0, 5)
      : []);
  };

  const addSkill = skill => {
    if (!selectedSkills.includes(skill)) setSelectedSkills(p => [...p, skill]);
    setSkillInput(""); setSuggestions([]); setPredictedRole(null);
  };

  const removeSkill = skill => { setSelectedSkills(p => p.filter(s => s !== skill)); setPredictedRole(null); };

  const predictRole = () => {
    if (!selectedSkills.length) return;
    setIsAnalyzing(true); setPredictedRole(null);
    setTimeout(() => {
      const votes = {};
      selectedSkills.forEach(s => { const r = ROLE_PREDICTIONS[s]; if (r) votes[r] = (votes[r] || 0) + 1; });
      const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
      setPredictedRole(best ? best[0] : "Full-Stack Developer");
      setIsAnalyzing(false);
    }, 1600);
  };

  const filters      = ["All", "Full-time", "Remote", "Hybrid"];
  const filteredJobs = activeFilter === "All" ? SAMPLE_JOBS : SAMPLE_JOBS.filter(j => j.type === activeFilter);

  const STATS = [
    { label: "Active Jobs",     value: 12400, suffix: "+" },
    { label: "Companies",       value: 840,   suffix: ""  },
    { label: "Skills Tracked",  value: 320,   suffix: ""  },
    { label: "Monthly Matches", value: 9800,  suffix: "+" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="sp">

        {/* ── Nav ── */}
        <nav className="nav">
          <a className="nav-logo" href="#" onClick={e => e.preventDefault()}>
            <div className="nav-logo-mark">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="nav-logo-text">SkillPath</span>
          </a>
          <ul className="nav-links">
            {["Jobs", "Skills", "Companies", "Insights"].map(item => (
              <li key={item}><a href="#" onClick={e => { e.preventDefault(); onSignIn(); }}>{item}</a></li>
            ))}
          </ul>
          <div className="nav-actions">
            {user ? (
              <>
                <div className="user-badge">{user.username}</div>
                <button className="btn-nav-solid" onClick={onGoToApp}>Dashboard →</button>
              </>
            ) : (
              <>
                <button className="btn-nav-ghost" onClick={onSignIn}>Log in</button>
                <button className="btn-nav-solid" onClick={onSignUp}>Get started</button>
              </>
            )}
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-bg-num">01</div>

          <div className={`page-fade${visible ? " in" : ""}`}>
            <div className="hero-kicker">
              <span className="hero-kicker-line" />
              <span className="hero-kicker-text">AI-Powered Career Matching</span>
            </div>
            <h1 className="hero-h1">
              Your skills,<br />your <em>perfect</em> role.
            </h1>
            <p className="hero-sub">
              Tell us what you know. Our AI surfaces the career paths and real job openings from Tanit Jobs that fit you best.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={onSignUp}>
                Discover your path <ArrowRight />
              </button>
              <button className="btn-ghost" onClick={onSignIn}>Browse jobs</button>
            </div>
            <SkillTicker />
          </div>

          <div className={`page-fade d1${visible ? " in" : ""}`}>
            <div className="stats-card">
              <div className="stats-grid">
                {STATS.map(s => (
                  <div className="stat-cell" key={s.label}>
                    <div className="stat-value"><AnimatedCounter value={s.value} suffix={s.suffix} /></div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="stats-jobs">
                {SAMPLE_JOBS.slice(0, 2).map(job => (
                  <div className="mini-job" key={job.id} onClick={onSignIn}>
                    <div className="mini-logo" style={{ background: job.color + "12", color: job.color }}>{job.logo}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mini-title">{job.title}</div>
                      <div className="mini-sub">{job.company}</div>
                    </div>
                    <TypeBadge type={job.type} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── Skill Predictor (tinted band) ── */}
        <div className="band">
          <section className="section">
            <div className="section-kicker">
              <span className="section-kicker-num">02</span>
              <span className="section-kicker-rule" />
            </div>
            <h2 className="section-h2">What's your <em>skill set?</em></h2>
            <p className="section-sub">Add your skills and our model instantly predicts the role you're best suited for.</p>

            <div className="predictor">
              <div className="predictor-grid">
                <div className="predictor-left">
                  <div className="skill-input-wrap">
                    <input
                      className="skill-input"
                      value={skillInput}
                      onChange={e => handleSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && suggestions.length) addSkill(suggestions[0]); }}
                      placeholder="Type a skill — React, Python, Figma…"
                    />
                    {suggestions.length > 0 && (
                      <div className="suggestions-drop">
                        {suggestions.map(s => <div key={s} className="suggestion-item" onClick={() => addSkill(s)}>{s}</div>)}
                      </div>
                    )}
                  </div>

                  <div className="field-label">Popular Skills</div>
                  <div className="chips">
                    {["React", "Python", "SQL", "Figma", "DevOps", "Java", "Node.js"].map(s => (
                      <button key={s} className={`chip-idle${selectedSkills.includes(s) ? " on" : ""}`} onClick={() => addSkill(s)} disabled={selectedSkills.includes(s)}>{s}</button>
                    ))}
                  </div>

                  {selectedSkills.length > 0 && (
                    <>
                      <div className="field-label">Your Skills ({selectedSkills.length})</div>
                      <div className="chips">
                        {selectedSkills.map(s => (
                          <div key={s} className="chip-active">
                            {s}
                            <button className="chip-remove" onClick={() => removeSkill(s)}>×</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <button className="btn-predict" onClick={predictRole} disabled={!selectedSkills.length || isAnalyzing}>
                    {isAnalyzing ? "Analyzing…" : "Predict my best role →"}
                  </button>
                </div>

                <div className="predictor-right">
                  {!predictedRole && !isAnalyzing && (
                    <div className="empty-state">
                      <div className="empty-icon">?</div>
                      <p className="empty-text">Add skills on the left and click predict to reveal your best-matched role.</p>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div style={{ textAlign: "center" }}>
                      <div className="spinner" />
                      <p className="analyzing-text">Analyzing {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""}…</p>
                    </div>
                  )}
                  {predictedRole && !isAnalyzing && (
                    <div className="anim">
                      <div className="result-card">
                        <div className="result-eyebrow">Your Best Match</div>
                        <div className="result-role">{predictedRole}</div>
                        <div className="result-desc">
                          Based on {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""},
                          this role aligns most closely with your profile.
                        </div>
                      </div>
                      <div className="field-label" style={{ marginBottom: 10 }}>Recommended Openings</div>
                      {SAMPLE_JOBS.slice(0, 2).map((job, i) => (
                        <div key={job.id} className="mini-job" style={{ background: "#fff", marginBottom: i === 0 ? 9 : 0 }} onClick={onSignIn}>
                          <div className="mini-logo" style={{ background: job.color + "12", color: job.color }}>{job.logo}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="mini-title">{job.title}</div>
                            <div className="mini-sub">{job.company} · {job.location}</div>
                          </div>
                          <ArrowRight />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <hr className="divider" />

        {/* ── Job Listings ── */}
        <section className="section" style={{ paddingBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div className="section-kicker">
                <span className="section-kicker-num">03</span>
                <span className="section-kicker-rule" />
              </div>
              <h2 className="section-h2" style={{ fontSize: 34 }}>Latest from <em>Tanit Jobs</em></h2>
            </div>
            <div className="filter-bar">
              {filters.map(f => (
                <button key={f} className={`filter-btn${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="job-grid">
            {filteredJobs.map(job => <JobCard key={job.id} job={job} onClick={onSignIn} />)}
          </div>
          <button className="btn-view-all" onClick={onSignIn}>
            View all jobs on Tanit Jobs <ArrowRight />
          </button>
        </section>

        <hr className="divider" />

        {/* ── How it works ── */}
        <div className="band">
          <section className="section">
            <div style={{ textAlign: "center" }}>
              <div className="section-kicker" style={{ justifyContent: "center" }}>
                <span className="section-kicker-num">04</span>
                <span className="section-kicker-rule" style={{ flex: "0 0 24px" }} />
              </div>
              <h2 className="section-h2">Three steps to your <em>next role</em></h2>
            </div>
            <div className="steps">
              {[
                { num:"01", title:"Add your skills",          desc:"Tell us what tools, languages, and domains you know. The more detail, the better the match." },
                { num:"02", title:"Get your role prediction", desc:"Our AI analyzes your profile and identifies the career path where you'll excel most." },
                { num:"03", title:"Apply to matched jobs",    desc:"Browse live Tanit Jobs listings tailored to your role. One click to apply directly." },
              ].map(step => (
                <div className="step" key={step.num} data-num={step.num}>
                  <div className="step-kicker">
                    <span className="step-kicker-dot" />
                    <span className="step-kicker-num">Step {step.num}</span>
                  </div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <hr className="divider" />
        <footer className="footer">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div className="nav-logo-mark" style={{ width: 24, height: 24, borderRadius: 6 }}>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--ink-70)", fontWeight: 500 }}>SkillPath</span>
          </div>
          <p className="footer-copy">Job data sourced from tanit-jobs.com · Tunisia's #1 job platform</p>
          <div className="footer-links">
            {["Privacy", "Terms", "Contact"].map(l => <a key={l} href="#">{l}</a>)}
          </div>
        </footer>
      </div>
    </>
  );
}