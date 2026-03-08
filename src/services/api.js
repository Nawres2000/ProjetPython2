const API_URL = "http://localhost:8000";

function buildPayload(formData) {
  return {
    job_title:             formData.jobTitle        || "Data Engineer",
    job_via:               formData.jobVia          || "LinkedIn",
    job_schedule_type:     formData.schedule        || "Full-time",
    job_location:          formData.location        || "Unknown",
    search_location:       formData.country         || "Unknown",
    company_name:          formData.company         || "Unknown",
    job_country:           formData.country         || "Unknown",
    job_work_from_home:    formData.workFromHome     ? 1 : 0,
    job_no_degree_mention: formData.noDegree        ? 1 : 0,
    job_health_insurance:  formData.healthInsurance ? 1 : 0,
    posted_year:           2024,
    posted_month:          1,
    posted_day:            1,
    job_skills:            JSON.stringify(formData.skills || []),
    job_type_skills:       "{}",
  };
}

export async function predictJobs(formData) {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(formData)),
    });
    if (!response.ok) throw new Error("Server error");
    const data = await response.json();
    const predictions = Object.entries(data.probabilities)
      .map(([job, score]) => ({ job, score: Math.round(score * 100) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    return { predictions, predictedLabel: data.predicted_label };
  } catch (error) {
    console.error("Predict error:", error);
    return {
      predictions: [
        { job: "Data Engineer",     score: 94 },
        { job: "Data Scientist",    score: 87 },
        { job: "ML Engineer",       score: 76 },
        { job: "Software Engineer", score: 61 },
        { job: "Data Analyst",      score: 52 },
      ],
      predictedLabel: "Data Engineer",
    };
  }
}

export async function fetchSalaryInsights(formData) {
  try {
    const response = await fetch(`${API_URL}/salary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(formData)),
    });
    if (!response.ok) throw new Error("Server error");
    const data = await response.json();
    return data.salary_insights;
  } catch (error) {
    console.error("Salary error:", error);
    return {
      "Data Engineer":     { year_avg: 115000, hour_avg: 55 },
      "Data Scientist":    { year_avg: 122000, hour_avg: 59 },
      "Data Analyst":      { year_avg: 82000,  hour_avg: 39 },
      "Business Analyst":  { year_avg: 78000,  hour_avg: 37 },
      "Software Engineer": { year_avg: 130000, hour_avg: 62 },
      "Cloud Engineer":    { year_avg: 125000, hour_avg: 60 },
      "ML Engineer":       { year_avg: 135000, hour_avg: 65 },
    };
  }
}

export async function fetchSkillsGap(formData) {
  try {
    const response = await fetch(`${API_URL}/skills-gap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(formData)),
    });
    if (!response.ok) throw new Error("Server error");
    return await response.json();
  } catch (error) {
    console.error("Skills gap error:", error);
    return {
      predicted_role:  "Data Engineer",
      match_score:     60,
      matched_skills:  ["python", "sql"],
      missing_skills:  ["spark", "aws", "airflow"],
      required_skills: ["python", "sql", "spark", "aws", "airflow"],
    };
  }
}

export async function checkHealth() {
  try {
    const res  = await fetch(`${API_URL}/health`);
    const data = await res.json();
    return data.model_loaded;
  } catch {
    return false;
  }
}