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
 * Builds a neutral title from raw skill names so TF-IDF gets domain
 * signal without being biased toward any single predicted class.
 */
function buildSmartTitle(skills) {
  if (!skills || skills.length === 0) {
    return "developer engineer analyst";
  }
  // Use the skill names themselves — they carry domain signal without
  // embedding a target class label that would cause 100 % confidence.
  return skills.slice(0, 8).join(" ").toLowerCase();
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
    webframeworks: ['django','flask','fastapi','react','angular','vue','node','node.js','spring','express','react.js','angular.js','next.js','vue.js'],
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
    const payload = {
      skills:           formData.skills || [],
      job_type_skills:  buildJobTypeSkills(formData.skills || []),
      job_via:          formData.jobVia       || "LinkedIn",
      job_country:      formData.country      || "Unknown",
      job_location:     formData.country      || "Unknown",
      schedule:         formData.schedule     || "Full-time",
      work_from_home:   formData.workFromHome     ? 1 : 0,
      no_degree:        formData.noDegree        ? 1 : 0,
      health_insurance: formData.healthInsurance ? 1 : 0,
    };

    console.log("[API] POST /predict_profile", payload);
    const response = await fetch(`${API_URL}/predict_profile`, {
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
        score: parseFloat((score * 100).toFixed(1)),
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