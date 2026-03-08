import { useState, useEffect } from "react";
import { predictJobs, fetchSalaryInsights, fetchSkillsGap, checkHealth } from "../services/api";

const initialForm = {
  jobTitle:        "",
  jobVia:          "",
  company:         "",
  location:        "",
  country:         "",
  schedule:        "",
  workFromHome:    false,
  noDegree:        false,
  healthInsurance: false,
  skills:          [],
  salaryMin:       "",
  salaryMax:       "",
};

export function usePredictor() {
  const [form, setForm]           = useState(initialForm);
  const [results, setResults]     = useState(null);
  const [predictedLabel, setLabel]= useState(null);
  const [salaryData, setSalary]   = useState(null);
  const [skillsGap, setSkillsGap] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [backendOk, setBackendOk] = useState(null);

  useEffect(() => {
    checkHealth().then(setBackendOk);
  }, []);

  const updateField = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleSkill = (skill) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));

  const handlePredict = async () => {
    if (!form.jobTitle) {
      setError("Please enter a Job Title first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    setLabel(null);
    setSalary(null);
    setSkillsGap(null);

    try {
      // Run all 3 API calls in parallel
      const [predResult, salaryResult, gapResult] = await Promise.all([
        predictJobs(form),
        fetchSalaryInsights(form),
        fetchSkillsGap(form),
      ]);

      setResults(predResult.predictions);
      setLabel(predResult.predictedLabel);
      setSalary(salaryResult);
      setSkillsGap(gapResult);
    } catch (err) {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(initialForm);
    setResults(null);
    setLabel(null);
    setSalary(null);
    setSkillsGap(null);
    setError(null);
  };

  return {
    form, results, predictedLabel, salaryData, skillsGap,
    loading, error, backendOk,
    updateField, toggleSkill, handlePredict, reset,
  };
}