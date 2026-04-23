"""
Pydantic schemas (DTOs) used by the recommender API.

These objects describe the shapes of the payloads that cross the HTTP boundary.
They contain no business logic.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DataRow(BaseModel):
    """Schema for individual rows in the generic webhook payload."""
    # Add specific fields here as the upstream contract solidifies.
    pass


class WebhookPayload(BaseModel):
    """Generic webhook payload (arbitrary tabular records)."""
    data: List[Dict[str, Any]]


class ProfilePayload(BaseModel):
    """
    Legacy profile payload used by the ``/webhook/profile`` and
    ``/webhook/recommendations`` endpoints. Each record typically contains
    at least a ``skill`` field.
    """
    data: List[Dict[str, Any]]


class CVSkillsPayload(BaseModel):
    """
    Payload produced by the N8N workflow after parsing the uploaded CV.

    Example accepted shapes::

        {"skills": ["Python", "SQL", "Docker"]}
        {"skills": ["Python"], "preferred_locations": ["Tunis"], "top_n": 5}
    """

    skills: List[str]
    preferred_locations: Optional[List[str]] = None
    top_n: Optional[int] = 5
