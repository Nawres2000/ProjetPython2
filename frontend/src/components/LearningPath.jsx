import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────────────────────── */
const TRACKS = [
  {
    id: "python",
    label: "Python",
    icon: "🐍",
    color: "#3b82f6",
    colorLight: "rgba(59,130,246,0.08)",
    colorRule: "rgba(59,130,246,0.22)",
    courses: [
      {
        title: "CS50's Introduction to Programming with Python",
        provider: "Harvard University",
        level: "Beginner",
        tags: ["variables", "loops", "functions", "OOP", "regex", "file handling"],
        note: "One of the most recommended free Python courses online.",
        url: "https://cs50.harvard.edu/python/",
      },
      {
        title: "Python Programming MOOC",
        provider: "University of Helsinki",
        level: "Beginner → Intermediate",
        tags: ["practical", "exercise-heavy", "job-ready"],
        note: "Very practical and exercise-heavy. Frequently recommended by developers on Reddit.",
        url: "https://programming-24.mooc.fi/",
      },
      {
        title: "Automate the Boring Stuff with Python",
        provider: "Al Sweigart",
        level: "Beginner",
        tags: ["automation", "scripting", "real-world projects"],
        note: "Best for automation and scripting — learn real-world Python projects.",
        url: "https://automatetheboringstuff.com/",
      },
    ],
  },
  {
    id: "java",
    label: "Java",
    icon: "☕",
    color: "#f59e0b",
    colorLight: "rgba(245,158,11,0.08)",
    colorRule: "rgba(245,158,11,0.22)",
    courses: [
      {
        title: "Java Programming MOOC",
        provider: "University of Helsinki",
        level: "Beginner → Intermediate",
        tags: ["OOP", "fundamentals", "highly recommended"],
        note: "One of the best free Java courses. Strong fundamentals + OOP.",
        url: "https://java-programming.mooc.fi/",
      },
      {
        title: "Java Full Course for Beginners",
        provider: "freeCodeCamp",
        level: "Beginner",
        tags: ["complete course", "long-form", "easy to follow"],
        note: "Long-form complete beginner course. Easy to follow.",
        url: "https://www.youtube.com/watch?v=GoXwIVyNvX0",
      },
    ],
  },
  {
    id: "ai",
    label: "Artificial Intelligence",
    icon: "🤖",
    color: "#8b5cf6",
    colorLight: "rgba(139,92,246,0.08)",
    colorRule: "rgba(139,92,246,0.22)",
    courses: [
      {
        title: "CS50's Introduction to Artificial Intelligence with Python",
        provider: "Harvard University",
        level: "Intermediate",
        tags: ["search algorithms", "ML", "neural networks", "RL", "NLP", "project-based"],
        note: "Excellent introduction to modern AI — project-based learning.",
        url: "https://cs50.harvard.edu/ai/",
      },
      {
        title: "Machine Learning Crash Course",
        provider: "Google",
        level: "Beginner → Intermediate",
        tags: ["TensorFlow", "practical", "fast-paced"],
        note: "Fast practical ML introduction with TensorFlow exercises.",
        url: "https://developers.google.com/machine-learning/crash-course",
      },
      {
        title: "Elements of AI",
        provider: "University of Helsinki",
        level: "Beginner",
        tags: ["AI theory", "no coding required", "conceptual"],
        note: "Beginner-friendly AI theory course. No coding required initially.",
        url: "https://www.elementsofai.com/",
      },
    ],
  },
  {
    id: "ml",
    label: "Machine Learning",
    icon: "🧠",
    color: "#0d6e64",
    colorLight: "rgba(13,110,100,0.08)",
    colorRule: "rgba(13,110,100,0.22)",
    courses: [
      {
        title: "Machine Learning Specialization",
        provider: "Andrew Ng / DeepLearning.AI",
        level: "Intermediate",
        tags: ["regression", "classification", "neural networks", "clustering", "audit free"],
        note: "Legendary ML course. Audit for free. Heavily recommended by ML learners.",
        url: "https://www.coursera.org/specializations/machine-learning-introduction",
      },
      {
        title: "Kaggle Learn",
        provider: "Kaggle",
        level: "Beginner → Intermediate",
        tags: ["hands-on", "datasets", "notebooks", "short courses"],
        note: "Short practical ML courses with hands-on datasets and notebooks.",
        url: "https://www.kaggle.com/learn",
      },
      {
        title: "Introduction to Data Science with Python",
        provider: "MIT / edX",
        level: "Intermediate",
        tags: ["pandas", "NumPy", "scikit-learn", "ML basics"],
        note: "Covers ML basics with Python libraries — Pandas, NumPy, scikit-learn.",
        url: "https://www.edx.org/learn/data-science/massachusetts-institute-of-technology-introduction-to-computational-thinking-and-data-science",
      },
    ],
  },
  {
    id: "stats",
    label: "Statistics",
    icon: "📊",
    color: "#c8490a",
    colorLight: "rgba(200,73,10,0.08)",
    colorRule: "rgba(200,73,10,0.22)",
    courses: [
      {
        title: "Statistics and Probability",
        provider: "Khan Academy",
        level: "Beginner",
        tags: ["probability", "distributions", "hypothesis testing", "regression"],
        note: "Best free beginner statistics course.",
        url: "https://www.khanacademy.org/math/statistics-probability",
      },
      {
        title: "Statistics 110: Probability",
        provider: "Harvard University",
        level: "Advanced",
        tags: ["probability", "mathematical", "deep dive"],
        note: "Famous probability course — more mathematical and rigorous.",
        url: "https://projects.iq.harvard.edu/stat110",
      },
      {
        title: "Seeing Theory",
        provider: "Brown University",
        level: "Beginner",
        tags: ["interactive", "visual", "intuitive"],
        note: "Interactive visual statistics learning — great for building intuition.",
        url: "https://seeing-theory.brown.edu/",
      },
    ],
  },
  {
    id: "sql",
    label: "SQL & Databases",
    icon: "🗄️",
    color: "#64748b",
    colorLight: "rgba(100,116,139,0.08)",
    colorRule: "rgba(100,116,139,0.22)",
    courses: [
      {
        title: "CS50's Introduction to Databases with SQL",
        provider: "Harvard University",
        level: "Beginner → Intermediate",
        tags: ["PostgreSQL", "MySQL", "joins", "indexing", "normalization"],
        note: "Excellent SQL course covering the full spectrum of database design.",
        url: "https://cs50.harvard.edu/sql/",
      },
      {
        title: "Relational Database Certification",
        provider: "freeCodeCamp",
        level: "Beginner",
        tags: ["interactive exercises", "beginner friendly"],
        note: "Interactive exercises — very beginner friendly.",
        url: "https://www.freecodecamp.org/learn/relational-database/",
      },
      {
        title: "SQLBolt",
        provider: "SQLBolt",
        level: "Beginner",
        tags: ["interactive", "in-browser", "quick"],
        note: "Learn SQL interactively in the browser — fastest way to get started.",
        url: "https://sqlbolt.com/",
      },
    ],
  },
];

const ROADMAP = [
  { step: 1, label: "Python",           course: "CS50 Python",         icon: "🐍", color: "#3b82f6" },
  { step: 2, label: "SQL",              course: "SQLBolt / CS50 SQL",  icon: "🗄️", color: "#64748b" },
  { step: 3, label: "Statistics",       course: "Khan Academy Stats",  icon: "📊", color: "#c8490a" },
  { step: 4, label: "Machine Learning", course: "Andrew Ng ML",        icon: "🧠", color: "#0d6e64" },
  { step: 5, label: "AI",               course: "CS50 AI",             icon: "🤖", color: "#8b5cf6" },
  { step: 6, label: "Projects",         course: "Kaggle Projects",     icon: "🏆", color: "#f59e0b" },
];

/* ─────────────────────────────────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────────────────────────────────── */
const CSS = `
  .lp-wrap { font-family: 'DM Sans', system-ui, sans-serif; }

  /* ── Track tabs ── */
  .lp-tabs {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 28px;
  }
  .lp-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 7px 16px; border-radius: 100px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    border: 1px solid #e2ddd6;
    background: #ffffff; color: rgba(26,24,20,0.6);
    transition: all 0.15s;
  }
  .lp-tab:hover { border-color: #ccc7bf; color: #1a1814; background: #f5f3ef; }
  .lp-tab.active {
    background: #1a1814; border-color: #1a1814;
    color: #ffffff;
  }
  .lp-tab-icon { font-size: 14px; }

  /* ── Track header ── */
  .lp-track-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
  }
  .lp-track-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .lp-track-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 24px; font-weight: 400;
    letter-spacing: -0.02em; color: #1a1814;
  }
  .lp-track-count {
    margin-left: auto;
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(26,24,20,0.35);
  }

  /* ── Course cards ── */
  .lp-courses { display: flex; flex-direction: column; gap: 16px; }

  .lp-card {
    background: #ffffff;
    border: 1px solid #e2ddd6;
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
    position: relative;
  }
  .lp-card:hover {
    border-color: #ccc7bf;
    box-shadow: 0 6px 24px rgba(0,0,0,0.07);
  }
  .lp-card-accent {
    height: 3px; width: 100%;
  }
  .lp-card-body { padding: 20px 24px 22px; }

  .lp-card-meta {
    display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
  }
  .lp-card-provider {
    font-family: 'DM Mono', monospace; font-size: 10.5px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(26,24,20,0.4);
  }
  .lp-card-level {
    padding: 2px 9px; border-radius: 100px;
    font-size: 10.5px; font-family: 'DM Mono', monospace;
    background: #f5f3ef; color: rgba(26,24,20,0.5);
    border: 1px solid #e2ddd6;
  }

  .lp-card-title {
    font-size: 15.5px; font-weight: 600; color: #1a1814;
    line-height: 1.35; margin-bottom: 8px;
  }
  .lp-card-note {
    font-size: 13px; color: rgba(26,24,20,0.55);
    line-height: 1.55; margin-bottom: 14px;
  }

  .lp-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .lp-tag {
    padding: 3px 10px; border-radius: 6px;
    font-size: 11.5px; font-family: 'DM Mono', monospace;
    background: #f5f3ef; color: rgba(26,24,20,0.5);
    border: 1px solid #e2ddd6;
  }

  .lp-card-link {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: 8px;
    font-size: 12.5px; font-weight: 500;
    text-decoration: none; transition: all 0.15s;
    border: 1px solid transparent;
  }
  .lp-card-link:hover { opacity: 0.85; transform: translateY(-1px); }

  /* ── Roadmap section ── */
  .lp-roadmap-wrap {
    background: #ffffff;
    border: 1px solid #e2ddd6; border-radius: 20px;
    overflow: hidden; margin-bottom: 32px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    position: relative;
  }
  .lp-roadmap-wrap::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #c8490a, #8b5cf6, #0d6e64);
  }
  .lp-roadmap-header {
    padding: 22px 28px 18px;
    border-bottom: 1px solid #e2ddd6;
    margin-top: 3px;
  }
  .lp-roadmap-kicker {
    font-family: 'DM Mono', monospace; font-size: 10.5px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #c8490a; font-weight: 500; margin-bottom: 6px;
  }
  .lp-roadmap-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 20px; font-weight: 400;
    letter-spacing: -0.01em; color: #1a1814;
  }
  .lp-roadmap-body { padding: 24px 28px; }

  .lp-steps {
    display: flex; align-items: flex-start; gap: 0;
    flex-wrap: wrap;
  }
  .lp-step {
    display: flex; flex-direction: column; align-items: center;
    flex: 1; min-width: 120px; position: relative;
  }
  .lp-step:not(:last-child)::after {
    content: '';
    position: absolute; top: 20px; left: calc(50% + 20px);
    width: calc(100% - 40px); height: 2px;
    background: #e2ddd6;
    z-index: 0;
  }
  .lp-step-circle {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; z-index: 1; position: relative;
    border: 2px solid #e2ddd6; background: #ffffff;
    margin-bottom: 10px;
  }
  .lp-step-label {
    font-size: 12px; font-weight: 600; color: #1a1814;
    text-align: center; margin-bottom: 3px;
  }
  .lp-step-course {
    font-size: 10.5px; color: rgba(26,24,20,0.58);
    font-family: 'DM Mono', monospace;
    text-align: center; line-height: 1.4;
  }

  /* ── Source note ── */
  .lp-source {
    display: flex; align-items: center; gap: 8px;
    padding: 14px 20px; border-radius: 10px;
    background: #f5f3ef; border: 1px solid #e2ddd6;
    font-size: 12.5px; color: rgba(26,24,20,0.5);
    margin-top: 32px;
  }

  @media (max-width: 680px) {
    .lp-steps { gap: 16px; }
    .lp-step:not(:last-child)::after { display: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────────── */
export default function LearningPath() {
  const [activeTrack, setActiveTrack] = useState("python");
  const track = TRACKS.find(t => t.id === activeTrack);

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-wrap">

        {/* ── Recommended Roadmap ── */}
        <div className="lp-roadmap-wrap">
          <div className="lp-roadmap-header">
            <div className="lp-roadmap-kicker">Community Consensus · Reddit / Dev Forums</div>
            <div className="lp-roadmap-title">Best Learning Path — Starting from Zero</div>
          </div>
          <div className="lp-roadmap-body">
            <div className="lp-steps">
              {ROADMAP.map(s => (
                <div className="lp-step" key={s.step}>
                  <div className="lp-step-circle" style={{ borderColor: s.color, background: `rgba(${hexToRgb(s.color)},0.07)` }}>
                    {s.icon}
                  </div>
                  <div className="lp-step-label">{s.label}</div>
                  <div className="lp-step-course">{s.course}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Track tabs ── */}
        <div className="lp-tabs">
          {TRACKS.map(t => (
            <button
              key={t.id}
              className={`lp-tab${activeTrack === t.id ? " active" : ""}`}
              onClick={() => setActiveTrack(t.id)}
            >
              <span className="lp-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Active track ── */}
        <div className="lp-track-header">
          <div
            className="lp-track-icon"
            style={{ background: track.colorLight, border: `1px solid ${track.colorRule}` }}
          >
            {track.icon}
          </div>
          <div className="lp-track-title">{track.label}</div>
          <div className="lp-track-count">{track.courses.length} courses</div>
        </div>

        <div className="lp-courses">
          {track.courses.map((c, i) => (
            <div className="lp-card" key={i}>
              <div className="lp-card-accent" style={{ background: `linear-gradient(90deg, ${track.color}, ${track.colorRule})` }} />
              <div className="lp-card-body">
                <div className="lp-card-meta">
                  <span className="lp-card-provider">{c.provider}</span>
                  <span className="lp-card-level">{c.level}</span>
                </div>
                <div className="lp-card-title">{c.title}</div>
                <div className="lp-card-note">{c.note}</div>
                <div className="lp-tags">
                  {c.tags.map(tag => (
                    <span className="lp-tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <a
                  className="lp-card-link"
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: track.colorLight,
                    border: `1px solid ${track.colorRule}`,
                    color: track.color,
                  }}
                >
                  View Course →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* ── Source note ── */}
        <div className="lp-source">
          <span>📌</span>
          Community consensus from Reddit, Hacker News, and dev forums — Harvard CS50, Helsinki MOOCs, Kaggle Learn, and Andrew Ng ML are consistently top-recommended.
        </div>

      </div>
    </>
  );
}

/* tiny util — converts "#rrggbb" → "r,g,b" for rgba() usage */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
