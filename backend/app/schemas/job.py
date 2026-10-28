
from datetime import date as DateType
from datetime import datetime
from typing import Literal, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
)


JobModality = Literal["Remoto", "Híbrido", "Presencial"]
JobOrigin = Literal["manual", "crawler"]


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    company: str = Field(min_length=1, max_length=255)
    location: str = Field(default="", max_length=255)
    modality: JobModality = "Remoto"
    source: str = Field(default="Manual", max_length=100)
    date: DateType = Field(default_factory=DateType.today)
    status: str = Field(default="new", max_length=50)
    favorite: bool = False
    description: str = ""

    # Novos campos do Crawler
    application_url: Optional[HttpUrl] = None
    external_id: Optional[str] = Field(
        default=None,
        max_length=255,
    )
    discovered_at: Optional[datetime] = None
    origin: JobOrigin = "manual"


class JobUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    company: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    location: Optional[str] = Field(
        default=None,
        max_length=255,
    )
    modality: Optional[JobModality] = None
    source: Optional[str] = Field(
        default=None,
        max_length=100,
    )
    date: Optional[DateType] = None
    status: Optional[str] = Field(
        default=None,
        max_length=50,
    )
    favorite: Optional[bool] = None
    description: Optional[str] = None

    # Novos campos do Crawler
    application_url: Optional[HttpUrl] = None
    external_id: Optional[str] = Field(
        default=None,
        max_length=255,
    )
    discovered_at: Optional[datetime] = None
    origin: Optional[JobOrigin] = None


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    company: str
    location: str
    modality: str
    source: str
    date: DateType
    status: str
    favorite: bool
    description: Optional[str]

    # Novos campos do Crawler
    application_url: Optional[HttpUrl] = None
    external_id: Optional[str] = None
    discovered_at: Optional[datetime] = None
    origin: JobOrigin

    created_at: datetime
    updated_at: datetime
