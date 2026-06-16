"""
Cosine similarity module for comparing resume and job description vectors.
"""

from sklearn.metrics.pairwise import cosine_similarity
from ml.vectorizer import vectorize_pair, vectorize_texts
from utils.logger import get_logger
import numpy as np

logger = get_logger(__name__)


def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculate cosine similarity between two texts using TF-IDF vectors.

    Returns:
        Similarity score between 0.0 and 1.0.
    """
    if not text1 or not text2:
        return 0.0

    try:
        vec1, vec2 = vectorize_pair(text1, text2)
        similarity = cosine_similarity(vec1, vec2)[0][0]
        return round(float(similarity), 4)
    except Exception as e:
        logger.error(f"Error calculating similarity: {str(e)}")
        return 0.0


def calculate_skill_match_score(
    resume_skills: list, required_skills: list, preferred_skills: list = None
) -> dict:
    """
    Calculate skill matching score between resume and job requirements.

    Returns:
        dict with score, matched_skills, missing_skills, additional_skills
    """
    if not required_skills:
        return {
            "score": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "additional_skills": list(resume_skills),
        }

    resume_set = set(s.lower() for s in resume_skills)
    required_set = set(s.lower() for s in required_skills)
    preferred_set = set(s.lower() for s in (preferred_skills or []))

    # Required skills match
    matched_required = resume_set & required_set
    missing_required = required_set - resume_set

    # Preferred skills match (bonus)
    matched_preferred = resume_set & preferred_set

    # Additional skills (not in requirements)
    additional = resume_set - required_set - preferred_set

    # Score calculation
    required_score = len(matched_required) / len(required_set) if required_set else 0
    preferred_score = len(matched_preferred) / len(preferred_set) if preferred_set else 0

    # Weighted: 80% required + 20% preferred
    overall_score = (required_score * 0.8) + (preferred_score * 0.2)

    return {
        "score": round(overall_score, 4),
        "matched_skills": sorted(list(matched_required | matched_preferred)),
        "missing_skills": sorted(list(missing_required)),
        "additional_skills": sorted(list(additional)),
        "required_match_rate": round(required_score, 4),
        "preferred_match_rate": round(preferred_score, 4),
    }


def batch_similarity(job_text: str, resume_texts: list) -> list:
    """
    Calculate similarity scores for multiple resumes against one job description.

    Args:
        job_text: The job description text.
        resume_texts: List of resume texts.

    Returns:
        List of similarity scores.
    """
    if not resume_texts:
        return []

    try:
        all_texts = [job_text] + resume_texts
        tfidf_matrix = vectorize_texts(all_texts)

        # Compare job (index 0) with each resume
        job_vector = tfidf_matrix[0:1]
        resume_vectors = tfidf_matrix[1:]

        similarities = cosine_similarity(job_vector, resume_vectors)[0]
        return [round(float(s), 4) for s in similarities]
    except Exception as e:
        logger.error(f"Batch similarity error: {str(e)}")
        return [0.0] * len(resume_texts)
