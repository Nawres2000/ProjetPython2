import { useState, useEffect, useMemo, useCallback } from "react";
import { predictJobs, checkHealth } from "../services/api";
import { SKILLS_BY_CATEGORY } from "../constants/filters";

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

  const canonicalSkillMap = useMemo(() => {
    const map = new Map();
    Object.values(SKILLS_BY_CATEGORY)
      .flat()
      .forEach((skill) => map.set(skill.toLowerCase(), skill));
    return map;
  }, []);

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

  const setSkillsFromProfile = useCallback((profileSkills) => {
    if (!Array.isArray(profileSkills)) {
      setForm((f) => ({ ...f, skills: [] }));
      return;
    }

    const normalized = profileSkills
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return item.name || item.skill || "";
        return "";
      })
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => canonicalSkillMap.get(name.toLowerCase()) || name.toLowerCase())
      .filter((name, idx, arr) => arr.indexOf(name) === idx);

    setForm((f) => ({ ...f, skills: normalized }));
  }, [canonicalSkillMap]);

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
    updateField, toggleSkill, handlePredict, reset, setSkillsFromProfile,
  };
}