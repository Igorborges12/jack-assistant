
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class CrawlerPreference(Base):
    __tablename__ = "crawler_preferences"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Cada usuário terá suas próprias preferências
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Áreas de interesse
    # Exemplo: ["Engenharia de Dados", "Marketing"]
    areas = Column(
        JSON,
        nullable=True,
    )

    # Palavras-chave da busca
    # Exemplo: ["Python", "SQL", "Java"]
    keywords = Column(
        JSON,
        nullable=True,
    )

    # Senioridade
    # Exemplo: ["Estágio", "Júnior"]
    seniority = Column(
        JSON,
        nullable=True,
    )

    # Modalidade
    # Exemplo: ["Remoto", "Híbrido"]
    modalities = Column(
        JSON,
        nullable=True,
    )

    # Países de interesse
    # Exemplo: ["Brasil", "Canadá", "Portugal"]
    countries = Column(
        JSON,
        nullable=True,
    )

    # Localizações específicas
    # Exemplo: ["Porto Alegre", "São Paulo"]
    locations = Column(
        JSON,
        nullable=True,
    )

    # Aceitar apenas vagas remotas internacionais
    international_remote = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Quantidade máxima de vagas por busca
    max_results = Column(
        Integer,
        default=20,
        nullable=False,
    )

    # Ativar ou desativar buscas automáticas
    enabled = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Observações adicionais do usuário
    notes = Column(
        Text,
        nullable=True,
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
