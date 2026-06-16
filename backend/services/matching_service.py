"""
Matching service - orchestrates similarity calculation between resumes and job descriptions.
"""

from ml.similarity import calculate_text_similarity, calculate_skill_match_score
from ml.skill_extractor import extract_experience_years, get_keyword_frequency
from utils.logger import get_logger

logger = get_logger(__name__)


def calculate_match(resume_data: dict, job_data: dict) -> dict:
    """
    Calculate comprehensive match score between a resume and job description.

    Scoring weights:
    - Skill match: 40%
    - Text similarity: 30%
    - Experience match: 15%
    - Keyword coverage: 15%

    Returns:
        dict with all scoring components and overall score
    """
    resume_text = resume_data.get("raw_text", "")
    job_text = job_data.get("description", "")
    resume_skills = resume_data.get("extracted_skills", [])
    required_skills = job_data.get("required_skills", [])
    preferred_skills = job_data.get("preferred_skills", [])

    # 1. Skill match score (40%)
    skill_result = calculate_skill_match_score(resume_skills, required_skills, preferred_skills)
    skill_score = skill_result["score"]

    # 2. Text similarity score (30%)
    text_similarity = calculate_text_similarity(resume_text, job_text)

    # 3. Experience score (15%)
    resume_years = extract_experience_years(resume_text)
    job_years = _parse_experience_level(job_data.get("experience_level", "mid"))
    experience_score = _calculate_experience_score(resume_years, job_years)

    # 4. Keyword coverage (15%)
    keyword_freq = get_keyword_frequency(resume_text, required_skills)
    keyword_score = _calculate_keyword_score(keyword_freq, required_skills)

    # Overall weighted score
    overall_score = (
        skill_score * 0.40
        + text_similarity * 0.30
        + experience_score * 0.15
        + keyword_score * 0.15
    )

    # Convert to percentage (0-100)
    ats_score = round(overall_score * 100, 2)

    return {
        "overall_score": round(overall_score, 4),
        "ats_score": ats_score,
        "skill_match_score": round(skill_score, 4),
        "similarity_score": round(text_similarity, 4),
        "experience_score": round(experience_score, 4),
        "keyword_score": round(keyword_score, 4),
        "matched_skills": skill_result["matched_skills"],
        "missing_skills": skill_result["missing_skills"],
        "additional_skills": skill_result["additional_skills"],
        "keyword_frequency": keyword_freq,
        "resume_experience_years": resume_years,
        "score_breakdown": {
            "skill_match": round(skill_score * 40, 2),
            "text_similarity": round(text_similarity * 30, 2),
            "experience": round(experience_score * 15, 2),
            "keyword_coverage": round(keyword_score * 15, 2),
        },
    }


def _parse_experience_level(level: str) -> int:
    """Convert experience level to approximate years."""
    level_map = {
        "junior": 1,
        "entry": 1,
        "mid": 3,
        "mid-level": 3,
        "senior": 5,
        "lead": 7,
        "principal": 10,
        "director": 10,
        "executive": 15,
    }
    return level_map.get(level.lower(), 3)


def _calculate_experience_score(resume_years: int, required_years: int) -> float:
    """Calculate experience match score."""
    if required_years == 0:
        return 0.5  # Neutral if no requirement

    if resume_years >= required_years:
        # Full score if meets or exceeds requirement
        return min(1.0, 0.8 + (resume_years - required_years) * 0.04)
    else:
        # Partial score based on how close
        ratio = resume_years / required_years
        return max(0.0, ratio * 0.8)


def _calculate_keyword_score(keyword_freq: dict, required_skills: list) -> float:
    """Calculate keyword coverage score."""
    if not required_skills:
        return 0.0

    found_count = sum(1 for freq in keyword_freq.values() if freq > 0)
    return found_count / len(required_skills) if required_skills else 0.0
