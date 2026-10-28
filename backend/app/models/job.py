
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    company = Column(
        String(255),
        nullable=False,
    )

    location = Column(
        String(255),
        default="",
        nullable=False,
    )

    modality = Column(
        String(50),
        default="Remoto",
        nullable=False,
    )

    source = Column(
        String(100),
        default="Manual",
        nullable=False,
    )

    date = Column(
        Date,
        nullable=False,
    )

    status = Column(
        String(50),
        default="new",
        nullable=False,
    )

    favorite = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    # Link para a página original da candidatura
    application_url = Column(
        Text,
        nullable=True,
    )

    # Identificador da vaga na plataforma de origem
    external_id = Column(
        String(255),
        nullable=True,
    )

    # Data em que o Crawler encontrou a vaga
    discovered_at = Column(
        DateTime,
        nullable=True,
    )

    # Origem do cadastro: manual ou crawler
    origin = Column(
        String(50),
        default="manual",
        nullable=False,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User")
