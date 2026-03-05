import { useState } from "react";
import { predictJobs } from "../services/api";

const initialForm = {
  country: "",
  schedule: "",
  workFromHome: false,
  skills: [],
  salaryMin: "",
  salaryMax: "",
};

export function usePredictor() {
  const [form, setForm]       = useState(initialForm);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

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
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const predictions = await predictJobs(form);
      setResults(predictions);
    } catch (err) {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(initialForm);
    setResults(null);
    setError(null);
  };

  return { form, results, loading, error, updateField, toggleSkill, handlePredict, reset };
}