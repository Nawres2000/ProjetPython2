const API_URL = "http://localhost:8000";

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

    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();

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
    console.error("API error:", error);
    throw new Error("Backend is offline. Please start the server.");
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