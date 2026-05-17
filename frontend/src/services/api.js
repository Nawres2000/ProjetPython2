const API_URL = "/backend";

// ── Helper to parse response safely ────────────────────────────────────────────
async function parseResponse(res) {
  const contentType = res.headers.get("content-type");
  let data;
  
  try {
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.warn(`[API] Non-JSON response (${res.status}):`, text);
      data = { detail: text || `HTTP ${res.status}` };
    }
  } catch (err) {
    console.error(`[API] Failed to parse response:`, err);
    data = { detail: `Failed to parse response: ${err.message}` };
  }
  
  return { res, data };
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
export async function apiRegister(username, email, password) {
  console.log("[API] POST /auth/register", { username, email });
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  
  const { data } = await parseResponse(res);
  
  if (!res.ok) {
    const errorMsg = data.detail || "Registration failed";
    console.error("[API] Registration error:", errorMsg);
    throw new Error(errorMsg);
  }
  
  console.log("[API] Registration success");
  return data; // { token, username, email }
}

export async function apiLogin(email, password) {
  console.log("[API] POST /auth/login", { email });
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const { data } = await parseResponse(res);
  
  if (!res.ok) {
    const errorMsg = data.detail || "Login failed";
    console.error("[API] Login error:", errorMsg);
    throw new Error(errorMsg);
  }
  
  console.log("[API] Login success");
  return data; // { token, username, email }
}

// ── Profile helpers ───────────────────────────────────────────────────────────
export async function apiGetProfile(token) {
  console.log("[API] GET /auth/profile");
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data } = await parseResponse(res);
  if (!res.ok) {
    const errorMsg = data.detail || "Failed to load profile";
    console.error("[API] Get profile error:", errorMsg);
    throw new Error(errorMsg);
  }
  console.log("[API] Profile loaded");
  return data;
}

export async function apiSaveProfile(token, profile) {
  console.log("[API] PUT /auth/profile");
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(profile),
  });
  const { data } = await parseResponse(res);
  if (!res.ok) {
    const errorMsg = data.detail || "Failed to save profile";
    console.error("[API] Save profile error:", errorMsg);
    throw new Error(errorMsg);
  }
  console.log("[API] Profile saved");
  return data;
}

export async function apiUploadCV(token, file) {
  console.log("[API] POST /auth/profile/upload-cv", { fileName: file.name });
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/auth/profile/upload-cv`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const { data } = await parseResponse(res);
  if (!res.ok) {
    const errorMsg = data.detail || "CV upload failed";
    console.error("[API] Upload CV error:", errorMsg);
    throw new Error(errorMsg);
  }
  console.log("[API] CV uploaded successfully");
  return data; // { path, filename }
}

export async function apiUploadCover(token, file) {
  console.log("[API] POST /auth/profile/upload-cover", { fileName: file.name });
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/auth/profile/upload-cover`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const { data } = await parseResponse(res);
  if (!res.ok) {
    const errorMsg = data.detail || "Cover letter upload failed";
    console.error("[API] Upload cover error:", errorMsg);
    throw new Error(errorMsg);
  }
  console.log("[API] Cover letter uploaded successfully");
  return data; // { path, filename }
}

export async function apiDeleteCV(token) {
  console.log("[API] DELETE /auth/profile/upload-cv");
  const res = await fetch(`${API_URL}/auth/profile/upload-cv`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const { data } = await parseResponse(res);
    const errorMsg = data.detail || "Failed to remove CV";
    console.error("[API] Delete CV error:", errorMsg);
    throw new Error(errorMsg);
  }
  console.log("[API] CV deleted successfully");
}

export async function apiDeleteCover(token) {
  console.log("[API] DELETE /auth/profile/upload-cover");
  const res = await fetch(`${API_URL}/auth/profile/upload-cover`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const { data } = await parseResponse(res);
    const errorMsg = data.detail || "Failed to remove cover letter";
    console.error("[API] Delete cover error:", errorMsg);
    throw new Error(errorMsg);
  }
  console.log("[API] Cover letter deleted successfully");
}


/**
 * Builds a job-title-like string based on which skill category
 * the user selected the most from — feeds TF-IDF with real signal
 */
function buildSmartTitle(skills) {
  if (!skills || skills.length === 0) {
    return "data analyst engineer scientist";
  }

  const categoryMap = {
    "ML Engineer":       ['tensorflow','pytorch','keras','scikit-learn','huggingface','hugging face','mxnet','theano','mlpack','ggplot2','numpy','pandas','nltk','opencv'],
    "Data Engineer":     ['spark','hadoop','kafka','airflow','pyspark','aws','gcp','azure','databricks','snowflake','redshift','bigquery','docker','kubernetes'],
    "Cloud Engineer":    ['aws','azure','gcp','terraform','ansible','kubernetes','docker','jenkins','linux','ubuntu','vmware','openstack','heroku'],
    "Data Scientist":    ['python','r','matlab','julia','scipy','plotly','seaborn','matplotlib','jupyter','tableau','sas','spss'],
    "Data Analyst":      ['excel','tableau','power bi','powerbi','sql','looker','cognos','qlik','dax','ssrs','ssis','microstrategy'],
    "Software Engineer": ['java','javascript','typescript','c++','c#','go','rust','swift','kotlin','react','angular','django','flask','node'],
    "Business Analyst":  ['excel','powerpoint','word','jira','confluence','trello','sharepoint','outlook','visio','sap','ms access'],
  };

  const lowerSkills = skills.map((s) => s.toLowerCase());

  // Count how many skills match each job category
  const scores = Object.entries(categoryMap).map(([jobTitle, relatedSkills]) => ({
    jobTitle,
    score: relatedSkills.filter((s) => lowerSkills.includes(s)).length,
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  const first  = scores[0];
  const second = scores[1];

  // No match at all — fallback to raw skills
  if (first.score === 0) {
    return skills.slice(0, 5).join(" ");
  }

  // Tie between top 2 — combine both titles
  if (second.score > 0 && second.score === first.score) {
    return `${first.jobTitle} ${second.jobTitle}`.toLowerCase();
  }

  // Clear winner — title + matched skills for extra TF-IDF signal
  const topSkillsText = skills
    .filter((s) => categoryMap[first.jobTitle].includes(s.toLowerCase()))
    .slice(0, 3)
    .join(" ");

  return `${first.jobTitle} ${topSkillsText}`.toLowerCase();
}

/**
 * Build job_type_skills dict from selected skills
 * Maps each skill to its category so the model gets category features
 */
function buildJobTypeSkills(skills) {
  const categoryMap = {
    programming:   ['python','r','sql','java','javascript','typescript','scala','go','rust','c++','c#','bash','shell','php','ruby','swift','kotlin','matlab','julia'],
    cloud:         ['aws','azure','gcp','bigquery','snowflake','databricks','redshift','spark','hadoop','kafka','airflow','docker','kubernetes'],
    analyst_tools: ['excel','tableau','power bi','powerbi','looker','sas','spss','qlik','cognos','microstrategy','dax'],
    libraries:     ['tensorflow','pytorch','keras','scikit-learn','numpy','pandas','matplotlib','seaborn','plotly','nltk','opencv','huggingface','hugging face','pyspark'],
    databases:     ['mysql','postgresql','mongodb','redis','cassandra','elasticsearch','dynamodb','neo4j','sqlite','mariadb'],
    other:         ['git','github','gitlab','docker','jenkins','terraform','ansible','kubernetes','linux'],
    frameworks:    ['django','flask','fastapi','react','angular','vue','node','node.js','spring'],
    os:            ['linux','ubuntu','windows','macos','unix'],
  };

  const result = {};
  const lowerSkills = skills.map((s) => s.toLowerCase());

  for (const [category, catSkills] of Object.entries(categoryMap)) {
    const matched = catSkills.filter((s) => lowerSkills.includes(s));
    if (matched.length > 0) {
      result[category] = matched;
    }
  }

  return JSON.stringify(result);
}

export async function predictJobs(formData) {
  try {
    // Smart title built from dominant skill category
    const skillsTitle = buildSmartTitle(formData.skills || []);

    const payload = {
      job_title:             skillsTitle,
      job_via:               formData.jobVia          || "LinkedIn",
      job_schedule_type:     formData.schedule        || "Full-time",
      job_location:          formData.country         || "Unknown",
      search_location:       formData.country         || "Unknown",
      company_name:          "Unknown",
      job_country:           formData.country         || "Unknown",
      job_work_from_home:    formData.workFromHome     ? 1 : 0,
      job_no_degree_mention: formData.noDegree        ? 1 : 0,
      job_health_insurance:  formData.healthInsurance ? 1 : 0,
      posted_year:           2024,
      posted_month:          6,
      posted_day:            15,
      job_skills:            JSON.stringify(formData.skills || []),
      job_type_skills:       buildJobTypeSkills(formData.skills || []),
    };

    console.log("[API] POST /predict", payload);
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const { data } = await parseResponse(response);

    if (!response.ok) {
      const errorMsg = data.detail || "Prediction failed";
      console.error("[API] Predict error:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("[API] Prediction successful");

    const predictions = Object.entries(data.probabilities)
      .map(([job, score]) => ({
        job,
        score: Math.round(score * 100),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);

    return {
      predictions,
      predictedLabel: data.predicted_label,
    };

  } catch (error) {
    console.error("[API] Predict error:", error);
    throw new Error(error.message || "Backend is offline. Please start the server.");
  }
}

export async function checkHealth() {
  try {
    console.log("[API] GET /health");
    const res = await fetch(`${API_URL}/health`);
    const { data } = await parseResponse(res);
    console.log("[API] Health check:", data);
    return data.model_loaded || false;
  } catch (error) {
    console.error("[API] Health check failed:", error);
    return false;
  }
}