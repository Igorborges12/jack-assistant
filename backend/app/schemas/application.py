
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ApplicationCreate(BaseModel):
    job_id: int = Field(gt=0)
    stage: str = Field(
        default="applied",
        min_length=1,
        max_length=50,
    )


class ApplicationUpdate(BaseModel):
    stage: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
    )


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    stage: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
