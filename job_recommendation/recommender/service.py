"""
Business logic for the job recommender.

Everything in this module is framework-agnostic: it can be imported from the
FastAPI controller, from a notebook, or from a CLI without pulling in HTTP
dependencies.
"""

from __future__ import annotations

import re
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import pandas as pd

# ---------------------------------------------------------------------------
# Paths & shared state
# ---------------------------------------------------------------------------

JOBS_JSON_PATH: Path = (
    Path(__file__).resolve().parent.parent / "job_scrapper" / "jobs.json"
)

# In-memory store used to hand off recommendations between the notebook /
# batch pipeline and the HTTP endpoints. Kept as a module-level singleton on
# purpose so that both the controller and notebook see the same state when
# running inside the same process.
stored_recommendations: Dict[str, Any] = {
    "recommendations": [],
    "metadata": {},
}


# ---------------------------------------------------------------------------
# Skill normalization + scoring (single source of truth)
# ---------------------------------------------------------------------------

def normalize_skills(skills: Union[List[str], str, None]) -> List[str]:
    """
    Normalize a list (or comma-separated string) of skills: lowercase, trim,
    drop noise and duplicates. Preserves characters that are meaningful inside
    tech names (``+``, ``#``, ``.``, ``/``, ``-``).
    """
    if skills is None:
        return []
    if isinstance(skills, str):
        skills = re.split(r"[,;|]", skills)
    if not isinstance(skills, (list, tuple, set)):
        return []

    cleaned: List[str] = []
    seen: set = set()
    for raw in skills:
        if raw is None:
            continue
        token = str(raw).lower().strip()
        token = re.sub(r"\s+", " ", token)
        token = re.sub(r"[^a-z0-9\+\#\.\-/ ]", "", token)
        token = token.strip()
        if token and token not in seen:
            seen.add(token)
            cleaned.append(token)
    return cleaned


def _fuzzy_match(user_skill: str, job_skill: str, threshold: float = 0.82) -> bool:
    """Return True when two skill tokens are close enough (handles typos)."""
    if user_skill == job_skill:
        return True
    if user_skill in job_skill or job_skill in user_skill:
        return True
    return SequenceMatcher(None, user_skill, job_skill).ratio() >= threshold


def score_job(user_skills: List[str], job_skills: List[str]) -> Dict[str, Any]:
    """
    Score a single job against the user's skills.

    Returns a dict with:
      - ``matched``: skills the user already has that the job requires
      - ``missing``: required skills the user lacks
      - ``coverage``: share of required skills the user covers (0..1)
      - ``jaccard``: Jaccard similarity between user and job skill sets (0..1)
      - ``score``: final weighted score (0..1)
    """
    user_set = set(user_skills)
    job_set = set(job_skills)

    if not job_set:
        return {
            "matched": [],
            "missing": [],
            "coverage": 0.0,
            "jaccard": 0.0,
            "score": 0.0,
        }

    matched: List[str] = []
    for req in job_set:
        if any(_fuzzy_match(u, req) for u in user_set):
            matched.append(req)

    missing = sorted(job_set - set(matched))
    coverage = len(matched) / len(job_set)
    union = len(user_set | job_set) or 1
    jaccard = len(set(matched)) / union

    score = round(0.75 * coverage + 0.25 * jaccard, 4)

    return {
        "matched": sorted(matched),
        "missing": missing,
        "coverage": round(coverage, 4),
        "jaccard": round(jaccard, 4),
        "score": score,
    }


def recommend_jobs(
    user_skills: List[str],
    jobs_df: pd.DataFrame,
    top_n: int = 5,
    preferred_locations: Optional[List[str]] = None,
) -> pd.DataFrame:
    """
    Rank jobs in ``jobs_df`` for a user described by ``user_skills``.

    ``jobs_df`` must contain: title, company, location, link, skills.
    """
    user_skills = normalize_skills(user_skills)
    preferred = {loc.lower().strip() for loc in (preferred_locations or [])}

    rows: List[Dict[str, Any]] = []
    for _, job in jobs_df.iterrows():
        job_skills = normalize_skills(job.get("skills"))
        result = score_job(user_skills, job_skills)

        location_raw = str(job.get("location", "") or "")
        location_boost = 0.0
        if preferred:
            location_lower = location_raw.lower()
            if any(loc and loc in location_lower for loc in preferred):
                location_boost = 0.1  # small nudge, never overrides skill fit

        final_score = min(round(result["score"] + location_boost, 4), 1.0)

        rows.append({
            "job_title": job.get("title"),
            "company": job.get("company"),
            "location": location_raw,
            "link": job.get("link"),
            "skills_required": job_skills,
            "skills_matched": result["matched"],
            "skills_missing": result["missing"],
            "coverage": result["coverage"],
            "jaccard": result["jaccard"],
            "match_score": final_score,
        })

    ranked = pd.DataFrame(rows).sort_values(
        "match_score", ascending=False, kind="mergesort"
    )
    return ranked.head(top_n).reset_index(drop=True)


# ---------------------------------------------------------------------------
# I/O & DataFrame helpers
# ---------------------------------------------------------------------------

def load_jobs(path: Union[str, Path] = JOBS_JSON_PATH) -> pd.DataFrame:
    """Load the scraped jobs JSON file into a DataFrame."""
    return pd.read_json(path)


def payload_to_dataframe(data: List[Dict[str, Any]]) -> pd.DataFrame:
    """Turn a list of dict records into a DataFrame."""
    return pd.DataFrame(data)


def extract_skills_from_profile(profile_df: pd.DataFrame) -> List[str]:
    """
    Pull a flat list of skills from a profile DataFrame. Accepts either a
    ``skill`` column (one skill per row) or a ``skills`` column containing a
    list per row.
    """
    if profile_df is None or profile_df.empty:
        return []
    if "skill" in profile_df.columns:
        return normalize_skills(profile_df["skill"].astype(str).tolist())
    if "skills" in profile_df.columns:
        flat: List[str] = []
        for value in profile_df["skills"]:
            if isinstance(value, (list, tuple, set)):
                flat.extend(value)
            elif value is not None:
                flat.append(value)
        return normalize_skills(flat)
    return []


def save_dataframe(df: pd.DataFrame, file_path: str, fmt: str = "json") -> None:
    """
    Export a DataFrame to disk in the requested format.

    Raises ``ValueError`` on unsupported formats; any I/O exception is allowed
    to bubble up so the caller can decide how to surface it.
    """
    fmt = fmt.lower()
    if fmt == "json":
        df.to_json(file_path, orient="records", indent=2)
    elif fmt == "csv":
        df.to_csv(file_path, index=False)
    elif fmt == "excel":
        df.to_excel(file_path, index=False)
    elif fmt == "parquet":
        df.to_parquet(file_path, index=False)
    elif fmt == "pickle":
        df.to_pickle(file_path)
    else:
        raise ValueError(f"Unsupported format: {fmt}")


# ---------------------------------------------------------------------------
# Recommendation cache (used by the HTTP endpoints)
# ---------------------------------------------------------------------------

def store_recommendations(recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Cache the given recommendations in the module-level store and return the
    new metadata block. Used by the notebook / pipeline to make results
    available to the GET webhook endpoint.
    """
    stored_recommendations["recommendations"] = recommendations
    stored_recommendations["metadata"] = {
        "count": len(recommendations),
        "timestamp": pd.Timestamp.now().isoformat(),
        "status": "ready",
    }
    return {
        "status": "success",
        "count": len(recommendations),
        "message": "Recommendations stored successfully",
    }


def get_stored_recommendations() -> Dict[str, Any]:
    """Return the currently cached recommendations + metadata."""
    return stored_recommendations


# ---------------------------------------------------------------------------
# High-level pipeline used by the HTTP endpoints
# ---------------------------------------------------------------------------

def recommend_from_cv_payload(
    skills: List[str],
    preferred_locations: Optional[List[str]] = None,
    top_n: int = 5,
    jobs_df: Optional[pd.DataFrame] = None,
) -> Dict[str, Any]:
    """
    Full pipeline used by the CV endpoint: normalize skills, load jobs if not
    provided, rank them, cache the result, and return a response-ready dict.

    Raises ``ValueError`` when no skills are provided.
    """
    user_skills = normalize_skills(skills)
    if not user_skills:
        raise ValueError("No skills provided in payload")

    if jobs_df is None:
        jobs_df = load_jobs()

    ranked = recommend_jobs(
        user_skills,
        jobs_df,
        top_n=top_n or 5,
        preferred_locations=preferred_locations,
    )
    records = ranked.to_dict(orient="records")
    store_recommendations(records)

    return {
        "status": "success",
        "user_skills": user_skills,
        "recommendations_count": len(records),
        "recommendations": records,
        "top_match": records[0] if records else None,
    }


def recommend_from_profile_payload(
    profile_records: List[Dict[str, Any]],
    top_n: int = 5,
    jobs_df: Optional[pd.DataFrame] = None,
) -> Dict[str, Any]:
    """Legacy profile pipeline (rows like ``{"skill": "Python"}``)."""
    profile_df = payload_to_dataframe(profile_records)
    user_skills = extract_skills_from_profile(profile_df)

    if jobs_df is None:
        jobs_df = load_jobs()

    ranked = recommend_jobs(user_skills, jobs_df, top_n=top_n)
    records = ranked.to_dict(orient="records")

    return {
        "status": "success",
        "user_skills": user_skills,
        "recommendations_count": len(records),
        "recommendations": records,
        "top_match": records[0] if records else None,
    }
