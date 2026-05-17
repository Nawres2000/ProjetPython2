"""
HTTP layer for the job recommender.

Keeps only FastAPI-specific concerns (routing, request/response serialization,
HTTPException mapping). All business logic lives in :mod:`service` and all DTOs
live in :mod:`model`.
"""

from __future__ import annotations

from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model import CVSkillsPayload, ProfilePayload, WebhookPayload
from .service import (
    JOBS_JSON_PATH,
    extract_skills_from_profile,
    get_stored_recommendations,
    load_jobs,
    normalize_skills,
    payload_to_dataframe,
    recommend_from_cv_payload,
    recommend_from_profile_payload,
    recommend_jobs,
    save_dataframe,
    score_job,
    store_recommendations,
)

app = FastAPI(title="Job Recommender API")

# Allow the React dev server / docker frontend to call us directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Generic ingestion endpoints
# ---------------------------------------------------------------------------

@app.post("/webhook/dataframe")
async def webhook_endpoint(payload: WebhookPayload) -> dict:
    """Receive data from a webhook and report its DataFrame shape."""
    try:
        df = payload_to_dataframe(payload.data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error converting to DataFrame: {exc}")

    return {
        "status": "success",
        "rows_received": len(df),
        "columns": df.columns.tolist(),
        "shape": df.shape,
    }


@app.post("/send-data")
async def send_data_endpoint(payload: WebhookPayload, format: str = "json") -> dict:
    """Receive a payload and persist it to disk in the requested format."""
    try:
        df = payload_to_dataframe(payload.data)
        file_path = f"../data/output.{format}"
        save_dataframe(df, file_path, fmt=format)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save data: {exc}")

    return {
        "status": "success",
        "message": f"Data sent to {file_path}",
        "rows": len(df),
        "format": format,
    }


# ---------------------------------------------------------------------------
# Profile / CV recommendation endpoints
# ---------------------------------------------------------------------------

@app.post("/webhook/profile")
async def profile_webhook_endpoint(payload: ProfilePayload) -> dict:
    """Receive user profile data and echo it back as records."""
    try:
        df = payload_to_dataframe(payload.data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error converting profile to DataFrame: {exc}")

    return {
        "status": "success",
        "profile_rows": len(df),
        "columns": df.columns.tolist(),
        "dataframe": df.to_dict(orient="records"),
    }


@app.post("/webhook/recommendations")
async def get_recommendations_endpoint(payload: ProfilePayload, top_n: int = 5) -> dict:
    """Legacy recommendations endpoint (one skill per row)."""
    try:
        return recommend_from_profile_payload(payload.data, top_n=top_n)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error generating recommendations: {exc}")


@app.post("/webhook/cv-recommendations")
async def cv_recommendations_endpoint(payload: CVSkillsPayload) -> dict:
    """
    Endpoint consumed by the N8N workflow: takes the skills extracted from the
    CV and returns the ranked jobs from ``job_scrapper/jobs.json``.
    """
    try:
        return recommend_from_cv_payload(
            skills=payload.skills,
            preferred_locations=payload.preferred_locations,
            top_n=payload.top_n or 5,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error generating recommendations: {exc}")


# ---------------------------------------------------------------------------
# Recommendation cache endpoints
# ---------------------------------------------------------------------------

@app.get("/webhook/get-recommendations")
async def get_recommendations_webhook() -> dict:
    """Retrieve the recommendations currently cached in memory."""
    stored = get_stored_recommendations()
    if not stored["recommendations"]:
        raise HTTPException(status_code=404, detail="No recommendations available")

    return {
        "status": "success",
        "recommendations": stored["recommendations"],
        "metadata": stored["metadata"],
        "count": len(stored["recommendations"]),
    }


@app.post("/webhook/send-recommendations")
async def send_recommendations_response(client_url: Optional[str] = None) -> dict:
    """Confirm the cached recommendations are ready to be forwarded."""
    stored = get_stored_recommendations()
    if not stored["recommendations"]:
        raise HTTPException(status_code=404, detail="No recommendations to send")

    return {
        "status": "success",
        "recommendations_sent": len(stored["recommendations"]),
        "recommendations": stored["recommendations"],
        "target": client_url or "GET /webhook/get-recommendations",
        "metadata": stored["metadata"],
    }


@app.get("/jobs")
def list_jobs() -> list:
    """Return all scraped jobs from jobs.json."""
    import json
    try:
        with open(JOBS_JSON_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---------------------------------------------------------------------------
# Notebook-friendly wrappers
# ---------------------------------------------------------------------------
# The notebook historically imports helpers from ``controller``. Keep a few
# thin wrappers so existing notebooks keep working without edits.

def send_recommendations_to_controller(recommendations_list):
    """Backwards-compatible alias used by the notebook."""
    return store_recommendations(recommendations_list)


def receive_df_from_webhook(payload: WebhookPayload) -> pd.DataFrame:
    """Backwards-compatible alias used by older notebooks/tests."""
    try:
        return payload_to_dataframe(payload.data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error converting to DataFrame: {exc}")


def receive_profile_from_webhook(payload: ProfilePayload) -> pd.DataFrame:
    """Backwards-compatible alias used by older notebooks/tests."""
    try:
        return payload_to_dataframe(payload.data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error converting profile to DataFrame: {exc}")


def get_job_recommendations(profile_df: pd.DataFrame, jobs_df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
    """Backwards-compatible alias around :func:`service.recommend_jobs`."""
    user_skills = extract_skills_from_profile(profile_df)
    return recommend_jobs(user_skills, jobs_df, top_n=top_n)


# Keep public re-exports for ``from controller import ...`` in the notebook.
__all__ = [
    "app",
    # DTOs
    "CVSkillsPayload",
    "ProfilePayload",
    "WebhookPayload",
    # service helpers
    "JOBS_JSON_PATH",
    "normalize_skills",
    "score_job",
    "recommend_jobs",
    "load_jobs",
    "extract_skills_from_profile",
    # wrappers
    "send_recommendations_to_controller",
    "receive_df_from_webhook",
    "receive_profile_from_webhook",
    "get_job_recommendations",
]
