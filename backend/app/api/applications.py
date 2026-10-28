
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
)


router = APIRouter(
    prefix="/api/applications",
    tags=["Applications"],
)


# Lista as candidaturas do usuário autenticado
@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(
            Application.created_at.desc(),
            Application.id.desc(),
        )
        .all()
    )


# Cadastra uma candidatura vinculada a uma vaga
@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == data.job_id,
            Job.user_id == current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Vaga não encontrada",
        )

    existing_application = (
        db.query(Application)
        .filter(
            Application.job_id == data.job_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if existing_application is not None:
        raise HTTPException(
            status_code=409,
            detail="Já existe uma candidatura para esta vaga",
        )

    application = Application(
        user_id=current_user.id,
        job_id=data.job_id,
        stage=data.stage,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


# Consulta uma candidatura específica
@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Candidatura não encontrada",
        )

    return application


# Atualiza a etapa de uma candidatura
@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def update_application(
    application_id: int,
    data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Candidatura não encontrada",
        )

    updates = data.model_dump(exclude_unset=True)

    if "stage" in updates:
        if updates["stage"] is None:
            raise HTTPException(
                status_code=422,
                detail="A etapa não pode ser nula",
            )

        application.stage = updates["stage"]

    db.commit()
    db.refresh(application)

    return application


# Exclui uma candidatura
@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Candidatura não encontrada",
        )

    db.delete(application)
    db.commit()

    return None
