import { useState, useEffect } from "react";
import { predictJobs, checkHealth } from "../services/api";

const initialForm = {
  jobVia:          "",
  country:         "",
  schedule:        "",
  workFromHome:    false,
  noDegree:        false,
  healthInsurance: false,
  skills:          [],
};

export function usePredictor() {
  const [form, setForm]            = useState(initialForm);
  const [results, setResults]      = useState(null);
  const [predictedLabel, setLabel] = useState(null);
  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState(null);
  const [backendOk, setBackendOk]  = useState(null);

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
    setLoading(true);
    setError(null);
    setResults(null);
    setLabel(null);
    try {
      const { predictions, predictedLabel } = await predictJobs(form);
      setResults(predictions);
      setLabel(predictedLabel);
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
    setError(null);
  };

  return {
    form, results, predictedLabel, loading, error, backendOk,
    updateField, toggleSkill, handlePredict, reset,
  };
}