
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.crawler_preference import CrawlerPreference
from app.schemas.crawler_preference import (
    CrawlerPreferenceUpdate,
    CrawlerPreferenceResponse,
)


router = APIRouter(
    prefix="/api/crawler/preferences",
    tags=["Crawler Preferences"],
)


# Consultar as preferências do usuário
@router.get(
    "",
    response_model=CrawlerPreferenceResponse,
)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preferences = (
        db.query(CrawlerPreference)
        .filter(
            CrawlerPreference.user_id == current_user.id
        )
        .first()
    )

    if preferences is None:
        raise HTTPException(
            status_code=404,
            detail="Preferências ainda não cadastradas.",
        )

    return preferences


# Criar ou atualizar as preferências do usuário
@router.put(
    "",
    response_model=CrawlerPreferenceResponse,
)
def save_preferences(
    data: CrawlerPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preferences = (
        db.query(CrawlerPreference)
        .filter(
            CrawlerPreference.user_id == current_user.id
        )
        .first()
    )

    updates = data.model_dump(exclude_unset=True)

    # Impede valores nulos em campos obrigatórios
    required_fields = {
        "international_remote",
        "max_results",
        "enabled",
    }

    for field in required_fields:
        if field in updates and updates[field] is None:
            raise HTTPException(
                status_code=422,
                detail="O campo '{}' não pode ser nulo.".format(field),
            )

    if preferences is None:
        preferences = CrawlerPreference(
            user_id=current_user.id,
            international_remote=False,
            max_results=20,
            enabled=True,
        )

        db.add(preferences)

    for field, value in updates.items():
        setattr(preferences, field, value)

    db.commit()
    db.refresh(preferences)

    return preferences
