
from datetime import datetime, date
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models.job import Job


def parse_publication_date(value: Any) -> date:
    if not value:
        return date.today()

    try:
        return datetime.fromisoformat(
            str(value).replace("Z", "+00:00")
        ).date()
    except (ValueError, TypeError):
        return date.today()


def save_crawler_jobs(
    db: Session,
    user_id: int,
    jobs: List[Dict[str, Any]],
    source: str = "Remotive",
) -> Dict[str, Any]:

    saved = 0
    duplicates = 0
    skipped = 0

    # Identificadores já existentes para este usuário
    existing_jobs = (
        db.query(Job.external_id)
        .filter(
            Job.user_id == user_id,
            Job.source == source,
            Job.external_id.isnot(None),
        )
        .all()
    )

    existing_ids = {
        str(row[0])
        for row in existing_jobs
    }

    try:
        for item in jobs:
            external_id = item.get("id")
            title = str(item.get("title") or "").strip()
            company = str(
                item.get("company_name") or ""
            ).strip()

            if (
                external_id is None
                or not title
                or not company
            ):
                skipped += 1
                continue

            external_id = str(external_id)

            if external_id in existing_ids:
                duplicates += 1
                continue

            location = str(
                item.get("candidate_required_location")
                or ""
            )[:255]

            job = Job(
                user_id=user_id,
                title=title[:255],
                company=company[:255],
                location=location,
                modality="Remoto",
                source=source,
                date=parse_publication_date(
                    item.get("publication_date")
                ),
                status="new",
                favorite=False,
                description=item.get("description"),
                application_url=item.get("url"),
                external_id=external_id,
                discovered_at=datetime.utcnow(),
                origin="crawler",
            )

            db.add(job)
            existing_ids.add(external_id)
            saved += 1

        db.commit()

    except Exception:
        db.rollback()
        raise

    return {
        "total_received": len(jobs),
        "saved": saved,
        "duplicates": duplicates,
        "skipped": skipped,
    }
