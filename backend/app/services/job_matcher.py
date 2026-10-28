
from typing import Any, Dict, List, Optional
from html import unescape
import re
import unicodedata


AREA_ALIASES = {
    "engenharia de dados": [
        "data engineer",
        "data engineering",
        "etl developer",
        "etl engineer",
        "analytics engineer",
    ],
    "ciencia de dados": [
        "data scientist",
        "data science",
    ],
    "analise de dados": [
        "data analyst",
        "data analytics",
        "business intelligence",
        "bi analyst",
    ],
    "desenvolvimento de software": [
        "software engineer",
        "software developer",
        "software development",
        "backend developer",
        "back-end developer",
        "frontend developer",
        "front-end developer",
        "full stack developer",
        "full-stack engineer",
    ],
}

SENIORITY_ALIASES = {
    "estagio": [
        "intern",
        "internship",
        "trainee",
        "estagio",
        "estagiario",
    ],
    "junior": [
        "junior",
        "jr",
        "entry level",
        "entry-level",
        "graduate",
        "new grad",
    ],
    "pleno": [
        "mid level",
        "mid-level",
        "intermediate",
    ],
    "senior": [
        "senior",
        "sr",
        "staff",
        "principal",
        "lead",
        "tech lead",
    ],
}

COUNTRY_ALIASES = {
    "brasil": ["brazil", "brasil"],
    "portugal": ["portugal"],
    "canada": ["canada"],
    "estados unidos": [
        "united states",
        "usa",
        "u.s.",
    ],
}


def normalize(value: Any) -> str:
    if value is None:
        return ""

    text = unescape(str(value))
    text = re.sub(r"<[^>]+>", " ", text)
    text = unicodedata.normalize("NFKD", text)

    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )

    return " ".join(text.lower().split())


def contains_term(text: str, term: str) -> bool:
    normalized = normalize(term)

    if not normalized:
        return False

    pattern = (
        r"(?<!\w)"
        + re.escape(normalized)
        + r"(?!\w)"
    )

    return re.search(pattern, text) is not None


def find_matches(
    text: str,
    terms: Optional[List[str]],
) -> List[str]:
    if not terms:
        return []

    return [
        term
        for term in terms
        if contains_term(text, term)
    ]


def expand_aliases(
    term: str,
    aliases: Dict[str, List[str]],
) -> List[str]:
    normalized = normalize(term)

    for key, values in aliases.items():
        group = [key] + values

        if normalized in [
            normalize(value) for value in group
        ]:
            return group

    return [term]


def detect_seniority(title: str) -> Optional[str]:
    # Prioriza senioridade explícita no título.
    for level in [
        "senior",
        "pleno",
        "junior",
        "estagio",
    ]:
        aliases = SENIORITY_ALIASES[level]

        if any(
            contains_term(title, alias)
            for alias in aliases
        ):
            return level

    return None


def calculate_job_match(
    job: Dict[str, Any],
    areas: Optional[List[str]] = None,
    keywords: Optional[List[str]] = None,
    seniority: Optional[List[str]] = None,
    countries: Optional[List[str]] = None,
    locations: Optional[List[str]] = None,
) -> Dict[str, Any]:

    title = normalize(job.get("title"))
    description = normalize(job.get("description"))
    category = normalize(job.get("category"))
    tags = normalize(" ".join(job.get("tags") or []))
    candidate_location = normalize(
        job.get("candidate_required_location")
    )

    content = " ".join([
        title,
        description,
        category,
        tags,
    ])

    score = 0
    possible_score = 0
    reasons = []

    # 1. Área profissional
    if areas:
        possible_score += 35
        matching_areas = []

        for area in areas:
            aliases = expand_aliases(
                area,
                AREA_ALIASES,
            )

            if any(
                contains_term(title, alias)
                or contains_term(category, alias)
                for alias in aliases
            ):
                matching_areas.append(area)

        if matching_areas:
            score += 35
            reasons.append(
                "Área compatível: "
                + ", ".join(matching_areas)
            )

    # 2. Competências
    if keywords:
        possible_score += 30

        matches = find_matches(
            content,
            keywords,
        )

        if matches:
            score += round(
                30 * len(matches) / len(keywords)
            )
            reasons.append(
                "Competências encontradas: "
                + ", ".join(matches)
            )

    # 3. Senioridade
    detected_level = detect_seniority(title)

    if seniority:
        possible_score += 20

        desired_levels = []

        for level in seniority:
            normalized = normalize(level)

            for key, aliases in SENIORITY_ALIASES.items():
                if normalized in [
                    normalize(value)
                    for value in [key] + aliases
                ]:
                    desired_levels.append(key)
                    break

        if detected_level in desired_levels:
            score += 20
            reasons.append(
                "Senioridade compatível: "
                + detected_level
            )

        elif detected_level is None:
            reasons.append(
                "Senioridade não informada no título"
            )

        else:
            reasons.append(
                "Atenção: senioridade da vaga: "
                + detected_level
            )

    # 4. Localização
    geographic_terms = (
        (countries or []) + (locations or [])
    )

    if geographic_terms:
        possible_score += 15
        location_matches = []

        for location in geographic_terms:
            aliases = expand_aliases(
                location,
                COUNTRY_ALIASES,
            )

            if any(
                contains_term(candidate_location, alias)
                for alias in aliases
            ):
                location_matches.append(location)

        worldwide = any(
            contains_term(candidate_location, term)
            for term in [
                "worldwide",
                "anywhere",
                "global",
            ]
        )

        if location_matches:
            score += 15
            reasons.append(
                "Localização mencionada: "
                + ", ".join(location_matches)
                + "; elegibilidade a confirmar"
            )

        elif worldwide:
            score += 10
            reasons.append(
                "Vaga global; elegibilidade no Brasil a confirmar"
            )

        else:
            reasons.append(
                "Localização não corresponde às preferências"
            )

    # 5. Pontuação
    if possible_score == 0:
        final_score = 0
        reasons.append(
            "Nenhuma preferência ativa"
        )
    else:
        final_score = round(
            score / possible_score * 100
        )

    # Penalização por senioridade incompatível.
    if (
        seniority
        and detected_level in ["senior", "pleno"]
        and detected_level not in desired_levels
    ):
        final_score = min(final_score, 25)
        reasons.append(
            "Pontuação limitada por senioridade incompatível"
        )

    return {
        "score": max(0, min(final_score, 100)),
        "reasons": reasons,
    }


def rank_jobs(
    jobs: List[Dict[str, Any]],
    preferences: Any,
) -> List[Dict[str, Any]]:

    ranked = []

    for job in jobs:
        match = calculate_job_match(
            job=job,
            areas=preferences.areas,
            keywords=preferences.keywords,
            seniority=preferences.seniority,
            countries=preferences.countries,
            locations=preferences.locations,
        )

        ranked.append({
            **job,
            "match_score": match["score"],
            "match_reasons": match["reasons"],
        })

    return sorted(
        ranked,
        key=lambda item: item["match_score"],
        reverse=True,
    )
