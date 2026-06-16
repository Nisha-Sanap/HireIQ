"""
ATS (Applicant Tracking System) scoring service.
Provides detailed ATS analysis for individual resume-job pairs.
"""

from services.matching_service import calculate_match
from ml.skill_extractor import get_keyword_frequency
from utils.logger import get_logger

logger = get_logger(__name__)


def calculate_ats_score(resume_data: dict, job_data: dict) -> dict:
    """
    Calculate detailed ATS score with comprehensive breakdown.

    Returns:
        Detailed ATS report with scores, breakdown, and recommendations.
    """
    match_result = calculate_match(resume_data, job_data)

    # Additional keyword analysis
    all_keywords = job_data.get("required_skills", []) + job_data.get("preferred_skills", [])
    keyword_freq = get_keyword_frequency(
        resume_data.get("raw_text", ""),
        all_keywords,
    )

    # Format score
    ats_score = match_result["ats_score"]

    # Determine grade
    if ats_score >= 80:
        grade = "A"
        grade_label = "Excellent Match"
    elif ats_score >= 60:
        grade = "B"
        grade_label = "Good Match"
    elif ats_score >= 40:
        grade = "C"
        grade_label = "Fair Match"
    elif ats_score >= 20:
        grade = "D"
        grade_label = "Poor Match"
    else:
        grade = "F"
        grade_label = "Very Poor Match"

    # Generate detailed recommendations
    recommendations = _generate_ats_recommendations(match_result)

    return {
        "ats_score": ats_score,
        "grade": grade,
        "grade_label": grade_label,
        "score_breakdown": match_result["score_breakdown"],
        "skill_match_score": round(match_result["skill_match_score"] * 100, 2),
        "similarity_score": round(match_result["similarity_score"] * 100, 2),
        "experience_score": round(match_result["experience_score"] * 100, 2),
        "keyword_score": round(match_result.get("keyword_score", 0) * 100, 2),
        "matched_skills": match_result["matched_skills"],
        "missing_skills": match_result["missing_skills"],
        "additional_skills": match_result["additional_skills"],
        "keyword_frequency": keyword_freq,
        "recommendations": recommendations,
    }


def _generate_ats_recommendations(match_result: dict) -> list:
    """Generate actionable ATS recommendations."""
    recommendations = []
    ats_score = match_result["ats_score"]
    missing = match_result["missing_skills"]
    skill_score = match_result["skill_match_score"]
    similarity = match_result["similarity_score"]

    # Skill recommendations
    if missing:
        if len(missing) <= 3:
            recommendations.append({
                "type": "skill_gap",
                "priority": "medium",
                "message": f"Missing {len(missing)} required skill(s): {', '.join(missing)}",
            })
        else:
            recommendations.append({
                "type": "skill_gap",
                "priority": "high",
                "message": f"Missing {len(missing)} required skills. Top gaps: {', '.join(missing[:5])}",
            })

    # Similarity recommendations
    if similarity < 0.3:
        recommendations.append({
            "type": "content",
            "priority": "high",
            "message": "Resume content has low relevance to the job description. Consider tailoring the resume.",
        })

    # Score-based recommendations
    if ats_score >= 70:
        recommendations.append({
            "type": "overall",
            "priority": "info",
            "message": "Strong candidate! Recommended for interview shortlisting.",
        })
    elif ats_score >= 50:
        recommendations.append({
            "type": "overall",
            "priority": "medium",
            "message": "Moderate fit. Review experience and projects for additional qualification.",
        })
    else:
        recommendations.append({
            "type": "overall",
            "priority": "low",
            "message": "Below threshold. Consider only if candidate pool is limited.",
        })

    if skill_score > 0.8:
        recommendations.append({
            "type": "strength",
            "priority": "info",
            "message": "Excellent technical skill alignment with job requirements.",
        })

    return recommendations
