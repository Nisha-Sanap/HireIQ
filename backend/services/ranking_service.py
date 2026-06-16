"""
Ranking service - calculates and stores candidate rankings for job descriptions.
"""

from datetime import datetime
from bson import ObjectId
from services.matching_service import calculate_match
from utils.logger import get_logger

logger = get_logger(__name__)


async def calculate_rankings(db, job_id: str, user_id: str) -> dict:
    """
    Calculate rankings for all resumes against a specific job description.
    Stores results in the rankings collection.
    """
    # Get job
    job = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": user_id})
    if not job:
        raise ValueError("Job not found")

    # Get all resumes for this user
    resumes = []
    cursor = db.resumes.find({"user_id": user_id, "processed": True})
    async for doc in cursor:
        resumes.append(doc)

    if not resumes:
        raise ValueError("No processed resumes found. Upload resumes first.")

    # Delete existing rankings for this job
    await db.rankings.delete_many({"job_id": job_id})

    # Calculate match score for each resume
    ranking_results = []
    for resume in resumes:
        match_result = calculate_match(
            resume_data={
                "raw_text": resume.get("raw_text", ""),
                "extracted_skills": resume.get("extracted_skills", []),
            },
            job_data={
                "description": job.get("description", ""),
                "required_skills": job.get("required_skills", []),
                "preferred_skills": job.get("preferred_skills", []),
                "experience_level": job.get("experience_level", "mid"),
            },
        )

        ranking_doc = {
            "job_id": job_id,
            "resume_id": str(resume["_id"]),
            "candidate_name": resume.get("candidate_name", "Unknown"),
            "candidate_email": resume.get("candidate_email"),
            "filename": resume.get("original_filename", resume.get("filename", "")),
            "ats_score": match_result["ats_score"],
            "similarity_score": match_result["similarity_score"],
            "skill_match_score": match_result["skill_match_score"],
            "experience_score": match_result["experience_score"],
            "overall_score": match_result["overall_score"],
            "matched_skills": match_result["matched_skills"],
            "missing_skills": match_result["missing_skills"],
            "additional_skills": match_result["additional_skills"],
            "resume_category": resume.get("category"),
            "score_breakdown": match_result["score_breakdown"],
            "keyword_frequency": match_result["keyword_frequency"],
            "rank": 0,  # Will be set after sorting
            "calculated_at": datetime.utcnow(),
        }

        ranking_results.append(ranking_doc)

    # Sort by overall score descending and assign ranks
    ranking_results.sort(key=lambda x: x["overall_score"], reverse=True)
    for i, result in enumerate(ranking_results):
        result["rank"] = i + 1

    # Store rankings in database
    if ranking_results:
        await db.rankings.insert_many(ranking_results)

    # Update job with candidate count
    await db.jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"total_candidates": len(ranking_results)}},
    )

    logger.info(f"Rankings calculated for job {job_id}: {len(ranking_results)} candidates")

    # Calculate average score
    avg_score = sum(r["ats_score"] for r in ranking_results) / len(ranking_results) if ranking_results else 0

    return {
        "job_id": job_id,
        "job_title": job["title"],
        "total_candidates": len(ranking_results),
        "average_score": round(avg_score, 2),
        "rankings": [_format_ranking(r) for r in ranking_results],
    }


async def get_rankings(db, job_id: str, user_id: str) -> dict:
    """Get stored rankings for a job."""
    job = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": user_id})
    if not job:
        raise ValueError("Job not found")

    cursor = db.rankings.find({"job_id": job_id}).sort("rank", 1)
    rankings = []
    async for doc in cursor:
        rankings.append(_format_ranking(doc))

    avg_score = sum(r["ats_score"] for r in rankings) / len(rankings) if rankings else 0

    return {
        "job_id": job_id,
        "job_title": job["title"],
        "total_candidates": len(rankings),
        "average_score": round(avg_score, 2),
        "rankings": rankings,
    }


async def get_ranking_detail(db, job_id: str, resume_id: str, user_id: str) -> dict:
    """Get detailed ranking for a specific resume-job pair."""
    job = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": user_id})
    if not job:
        raise ValueError("Job not found")

    ranking = await db.rankings.find_one({"job_id": job_id, "resume_id": resume_id})
    if not ranking:
        raise ValueError("Ranking not found. Calculate rankings first.")

    result = _format_ranking(ranking)
    result["score_breakdown"] = ranking.get("score_breakdown", {})
    result["keyword_frequency"] = ranking.get("keyword_frequency", {})
    result["job_title"] = job["title"]
    result["required_skills"] = job.get("required_skills", [])

    # Generate recommendations
    result["recommendations"] = _generate_recommendations(ranking)

    return result


def _format_ranking(doc: dict) -> dict:
    """Format a ranking document for API response."""
    return {
        "id": str(doc.get("_id", "")),
        "job_id": doc["job_id"],
        "resume_id": doc["resume_id"],
        "candidate_name": doc.get("candidate_name", "Unknown"),
        "candidate_email": doc.get("candidate_email"),
        "filename": doc.get("filename", ""),
        "ats_score": doc.get("ats_score", 0),
        "similarity_score": doc.get("similarity_score", 0),
        "skill_match_score": doc.get("skill_match_score", 0),
        "experience_score": doc.get("experience_score", 0),
        "overall_score": doc.get("overall_score", 0),
        "matched_skills": doc.get("matched_skills", []),
        "missing_skills": doc.get("missing_skills", []),
        "additional_skills": doc.get("additional_skills", []),
        "resume_category": doc.get("resume_category"),
        "rank": doc.get("rank", 0),
        "calculated_at": doc.get("calculated_at"),
    }


def _generate_recommendations(ranking: dict) -> list:
    """Generate improvement recommendations based on the ranking."""
    recommendations = []
    missing = ranking.get("missing_skills", [])
    ats_score = ranking.get("ats_score", 0)

    if missing:
        top_missing = missing[:5]
        recommendations.append(
            f"Add these missing skills to improve match: {', '.join(top_missing)}"
        )

    if ats_score < 30:
        recommendations.append(
            "This resume has a low match score. Consider candidates with stronger alignment."
        )
    elif ats_score < 60:
        recommendations.append(
            "Moderate match. The candidate has some relevant skills but gaps exist."
        )
    else:
        recommendations.append(
            "Strong match! This candidate has good alignment with the job requirements."
        )

    if ranking.get("experience_score", 0) < 0.5:
        recommendations.append(
            "Experience level may not fully meet requirements."
        )

    if ranking.get("skill_match_score", 0) > 0.8:
        recommendations.append(
            "Excellent skill alignment - prioritize this candidate for interview."
        )

    return recommendations
