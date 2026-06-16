"""
Analytics service - provides dashboard statistics and aggregated data.
"""

from collections import Counter
from utils.logger import get_logger

logger = get_logger(__name__)


async def get_dashboard_stats(db, user_id: str) -> dict:
    """Get comprehensive dashboard statistics for a user."""

    # Total resumes
    total_resumes = await db.resumes.count_documents({"user_id": user_id})

    # Total jobs
    total_jobs = await db.jobs.count_documents({"user_id": user_id})

    # Total rankings
    # Get all job IDs for this user
    job_ids = []
    async for job in db.jobs.find({"user_id": user_id}, {"_id": 1}):
        job_ids.append(str(job["_id"]))

    total_rankings = 0
    if job_ids:
        total_rankings = await db.rankings.count_documents({"job_id": {"$in": job_ids}})

    # Average ATS score
    avg_ats = 0.0
    if job_ids:
        pipeline = [
            {"$match": {"job_id": {"$in": job_ids}}},
            {"$group": {"_id": None, "avg_score": {"$avg": "$ats_score"}}},
        ]
        result = await db.rankings.aggregate(pipeline).to_list(1)
        if result:
            avg_ats = round(result[0]["avg_score"], 2)

    # Skill distribution
    skill_counter = Counter()
    async for resume in db.resumes.find({"user_id": user_id}, {"extracted_skills": 1}):
        for skill in resume.get("extracted_skills", []):
            skill_counter[skill] += 1

    top_skills = skill_counter.most_common(15)

    # Category distribution
    category_counter = Counter()
    async for resume in db.resumes.find({"user_id": user_id}, {"category": 1}):
        category = resume.get("category", "Other")
        if category:
            category_counter[category] += 1

    # Recent activity
    recent_resumes = []
    cursor = db.resumes.find({"user_id": user_id}).sort("uploaded_at", -1).limit(5)
    async for doc in cursor:
        recent_resumes.append({
            "id": str(doc["_id"]),
            "filename": doc.get("original_filename", doc["filename"]),
            "candidate_name": doc.get("candidate_name", "Unknown"),
            "category": doc.get("category"),
            "uploaded_at": doc["uploaded_at"],
        })

    recent_jobs = []
    cursor = db.jobs.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    async for doc in cursor:
        recent_jobs.append({
            "id": str(doc["_id"]),
            "title": doc["title"],
            "total_candidates": doc.get("total_candidates", 0),
            "created_at": doc["created_at"],
        })

    # Top candidates (highest ATS scores across all jobs)
    top_candidates = []
    if job_ids:
        cursor = db.rankings.find({"job_id": {"$in": job_ids}}).sort("ats_score", -1).limit(5)
        async for doc in cursor:
            top_candidates.append({
                "candidate_name": doc.get("candidate_name", "Unknown"),
                "ats_score": doc.get("ats_score", 0),
                "job_id": doc["job_id"],
                "resume_id": doc["resume_id"],
                "rank": doc.get("rank", 0),
            })

    # Score distribution (for histogram)
    score_distribution = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    if job_ids:
        async for doc in db.rankings.find({"job_id": {"$in": job_ids}}, {"ats_score": 1}):
            score = doc.get("ats_score", 0)
            if score <= 20:
                score_distribution["0-20"] += 1
            elif score <= 40:
                score_distribution["21-40"] += 1
            elif score <= 60:
                score_distribution["41-60"] += 1
            elif score <= 80:
                score_distribution["61-80"] += 1
            else:
                score_distribution["81-100"] += 1

    return {
        "total_resumes": total_resumes,
        "total_jobs": total_jobs,
        "total_rankings": total_rankings,
        "average_ats_score": avg_ats,
        "top_skills": [{"skill": s, "count": c} for s, c in top_skills],
        "category_distribution": dict(category_counter),
        "score_distribution": score_distribution,
        "recent_resumes": recent_resumes,
        "recent_jobs": recent_jobs,
        "top_candidates": top_candidates,
    }
