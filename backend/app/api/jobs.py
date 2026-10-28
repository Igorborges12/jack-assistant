
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate, JobUpdate, JobResponse


router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs"],
)


# Converte os dados recebidos para formatos compatíveis
# com o SQLAlchemy e o MySQL.
def prepare_job_data(data: dict) -> dict:
    prepared = data.copy()

    # O Pydantic usa HttpUrl, mas o banco armazena texto.
    if prepared.get("application_url") is not None:
        prepared["application_url"] = str(
            prepared["application_url"]
        )

    return prepared


# Lista todas as vagas do usuário autenticado
@router.get("", response_model=List[JobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc(), Job.id.desc())
        .all()
    )


# Cadastra uma nova vaga
@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job_data = prepare_job_data(
        data.model_dump()
    )

    job = Job(
        **job_data,
        user_id=current_user.id,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


# Consulta uma vaga específica
@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Vaga não encontrada",
        )

    return job


# Atualiza uma vaga
@router.put(
    "/{job_id}",
    response_model=JobResponse,
)
def update_job(
    job_id: int,
    data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Vaga não encontrada",
        )

    updates = prepare_job_data(
        data.model_dump(exclude_unset=True)
    )

    required_fields = {
        "title",
        "company",
        "location",
        "modality",
        "source",
        "date",
        "status",
        "favorite",
        "origin",
    }

    for field, value in updates.items():
        if value is None and field in required_fields:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"O campo '{field}' "
                    "não pode ser nulo"
                ),
            )

        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    return job


# Exclui uma vaga
@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Vaga não encontrada",
        )

    db.delete(job)
    db.commit()

    return None
