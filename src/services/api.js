const API_URL = "http://localhost:5000"; // 👈 Change to your Flask/FastAPI URL

/**
 * Send user profile to your ML backend and get job predictions.
 * @param {Object} formData
 * @returns {Promise<Array>} - e.g. [{ job: "Data Engineer", score: 94 }, ...]
 */
export async function predictJobs(formData) {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();
    return data.predictions; // adjust key to match your API response
  } catch (error) {
    console.error("Prediction API error:", error);

    // 🔁 Fallback mock data while backend isn't ready
    return [
      { job: "Data Engineer",    score: 94 },
      { job: "Data Scientist",   score: 87 },
      { job: "ML Engineer",      score: 76 },
      { job: "Software Engineer",score: 61 },
      { job: "Data Analyst",     score: 52 },
    ];
  }
}