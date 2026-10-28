
from typing import Any, Dict, List, Optional
from html import unescape
import re

import httpx


REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs"


def normalize_text(value: Any) -> str:
    """Normaliza textos para comparação."""
    if value is None:
        return ""

    text = unescape(str(value))
    text = re.sub(r"<[^>]+>", " ", text)
    return " ".join(text.lower().split())


def matches_any(text: str, values: Optional[List[str]]) -> bool:
    """Verifica se o texto contém algum termo informado."""
    if not values:
        return True

    terms = [
        normalize_text(value)
        for value in values
        if normalize_text(value)
    ]

    if not terms:
        return True

    return any(term in text for term in terms)


def filter_jobs(
    jobs: List[Dict[str, Any]],
    keywords: Optional[List[str]] = None,
    seniority: Optional[List[str]] = None,
    countries: Optional[List[str]] = None,
    locations: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Filtra vagas com tratamento de termos equivalentes."""

    seniority_aliases = {
        "estágio": ["intern", "internship", "trainee", "estágio"],
        "estagio": ["intern", "internship", "trainee", "estágio"],
        "júnior": ["junior", "jr", "entry level", "entry-level", "júnior"],
        "junior": ["junior", "jr", "entry level", "entry-level", "júnior"],
        "pleno": ["mid-level", "mid level", "intermediate", "pleno"],
        "sênior": ["senior", "sr", "lead", "sênior"],
        "senior": ["senior", "sr", "lead", "sênior"],
    }

    worldwide_terms = [
        "worldwide",
        "anywhere",
        "global",
        "work from anywhere",
    ]

    filtered = []

    for job in jobs:
        title = normalize_text(job.get("title"))
        description = normalize_text(job.get("description"))
        category = normalize_text(job.get("category"))
        job_type = normalize_text(job.get("job_type"))
        candidate_location = normalize_text(
            job.get("candidate_required_location")
        )

        searchable_text = " ".join(
            [title, description, category, job_type]
        )

        if not matches_any(searchable_text, keywords):
            continue

        if seniority:
            expanded_seniority = []

            for level in seniority:
                normalized_level = normalize_text(level)
                expanded_seniority.extend(
                    seniority_aliases.get(
                        normalized_level,
                        [normalized_level],
                    )
                )

            if not matches_any(
                searchable_text,
                expanded_seniority,
            ):
                continue

        geographic_filters = (countries or []) + (locations or [])

        if geographic_filters:
            matches_location = matches_any(
                candidate_location,
                geographic_filters,
            )

            is_worldwide = any(
                term in candidate_location
                for term in worldwide_terms
            )

            if not matches_location and not is_worldwide:
                continue

        filtered.append(job)

    return filtered


def fetch_remote_jobs(
    category: Optional[str] = None,
    limit: int = 20,
    search: Optional[str] = None,
    keywords: Optional[List[str]] = None,
    seniority: Optional[List[str]] = None,
    countries: Optional[List[str]] = None,
    locations: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Busca vagas remotas na Remotive e aplica filtros.

    Apenas consulta e retorna os dados.
    Não cadastra nada no MySQL.
    """

    params = {}

    if category:
        params["category"] = category

    if search:
        params["search"] = search

    with httpx.Client(timeout=30.0) as client:
        response = client.get(
            REMOTIVE_API_URL,
            params=params,
        )

        response.raise_for_status()
        data = response.json()

    jobs = data.get("jobs", [])

    if not isinstance(jobs, list):
        raise ValueError(
            "A API retornou um formato inesperado."
        )

    filtered_jobs = filter_jobs(
        jobs=jobs,
        keywords=keywords,
        seniority=seniority,
        countries=countries,
        locations=locations,
    )

    return filtered_jobs[:limit]
