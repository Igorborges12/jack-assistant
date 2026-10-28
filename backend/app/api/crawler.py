
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.crawler_preference import CrawlerPreference

from app.services.job_crawler import fetch_remote_jobs
from app.services.job_matcher import rank_jobs
from app.services.job_storage import save_crawler_jobs


router = APIRouter(
    prefix="/api/crawler",
    tags=["Crawler"],
)

MINIMUM_MATCH_SCORE = 50


def get_active_preferences(db: Session, user_id: int):
    preferences = (
        db.query(CrawlerPreference)
        .filter(CrawlerPreference.user_id == user_id)
        .first()
    )

    if preferences is None:
        raise HTTPException(
            status_code=404,
            detail="Configure suas preferências do Crawler primeiro.",
        )

    if not preferences.enabled:
        raise HTTPException(
            status_code=400,
            detail="O Crawler está desativado nas preferências.",
        )

    return preferences


def search_and_rank(
    category: Optional[str],
    limit: Optional[int],
    preferences: CrawlerPreference,
):
    search_limit = (
        limit if limit is not None else preferences.max_results
    )

    jobs = fetch_remote_jobs(
        category=category,
        limit=search_limit,
    )

    return rank_jobs(
        jobs=jobs,
        preferences=preferences,
    )


@router.get("/search")
def search_jobs(
    category: Optional[str] = Query(default=None),
    limit: Optional[int] = Query(default=None, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    preferences = get_active_preferences(
        db,
        current_user.id,
    )

    try:
        ranked_jobs = search_and_rank(
            category,
            limit,
            preferences,
        )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível consultar a fonte de vagas.",
        )

    return {
        "status": "success",
        "source": "Remotive",
        "total": len(ranked_jobs),
        "jobs": ranked_jobs,
    }


@router.post("/save")
def search_and_save_jobs(
    category: Optional[str] = Query(default=None),
    limit: Optional[int] = Query(default=None, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    preferences = get_active_preferences(
        db,
        current_user.id,
    )

    try:
        ranked_jobs = search_and_rank(
            category,
            limit,
            preferences,
        )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível consultar a fonte de vagas.",
        )

    # Filtrar vagas com compatibilidade minima de 50/100
    eligible_jobs = [
        job
        for job in ranked_jobs
        if job.get("match_score", 0) >= MINIMUM_MATCH_SCORE
    ]

    filtered_out = len(ranked_jobs) - len(eligible_jobs)

    try:
        result = save_crawler_jobs(
            db=db,
            user_id=current_user.id,
            jobs=eligible_jobs,
            source="Remotive",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Erro ao salvar vagas no banco de dados.",
        )

    return {
        "status": "success",
        "source": "Remotive",
        "minimum_score": MINIMUM_MATCH_SCORE,
        "total_found": len(ranked_jobs),
        "filtered_out": filtered_out,
        **result,
    }
