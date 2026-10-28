
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class CrawlerPreferenceUpdate(BaseModel):
    areas: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    seniority: Optional[List[str]] = None
    modalities: Optional[List[str]] = None
    countries: Optional[List[str]] = None
    locations: Optional[List[str]] = None

    international_remote: Optional[bool] = None
    max_results: Optional[int] = Field(
        default=None,
        ge=1,
        le=100,
    )
    enabled: Optional[bool] = None
    notes: Optional[str] = None


class CrawlerPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int

    areas: Optional[List[str]]
    keywords: Optional[List[str]]
    seniority: Optional[List[str]]
    modalities: Optional[List[str]]
    countries: Optional[List[str]]
    locations: Optional[List[str]]

    international_remote: bool
    max_results: int
    enabled: bool
    notes: Optional[str]

    created_at: datetime
    updated_at: datetime
