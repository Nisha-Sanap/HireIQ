from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from bson import ObjectId
from middleware.auth_middleware import get_current_user
from services.ats_service import calculate_ats_score

router = APIRouter()


@router.get("/ranking/{job_id}")
async def get_ranking_report(
    request: Request,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Generate a ranking report for a job (JSON format for frontend PDF generation)."""
    db = request.app.db

    # Get job
    job = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": current_user["id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get rankings
    cursor = db.rankings.find({"job_id": job_id}).sort("rank", 1)
    rankings = []
    async for doc in cursor:
        rankings.append({
            "rank": doc.get("rank", 0),
            "candidate_name": doc.get("candidate_name", "Unknown"),
            "candidate_email": doc.get("candidate_email"),
            "filename": doc.get("filename", ""),
            "ats_score": doc.get("ats_score", 0),
            "skill_match_score": round(doc.get("skill_match_score", 0) * 100, 2),
            "matched_skills": doc.get("matched_skills", []),
            "missing_skills": doc.get("missing_skills", []),
            "resume_category": doc.get("resume_category"),
        })

    avg_score = sum(r["ats_score"] for r in rankings) / len(rankings) if rankings else 0

    return {
        "report": {
            "job_title": job["title"],
            "company": job.get("company", ""),
            "total_candidates": len(rankings),
            "average_score": round(avg_score, 2),
            "required_skills": job.get("required_skills", []),
            "generated_at": str(job.get("created_at", "")),
            "rankings": rankings,
        }
    }


@router.get("/ats/{job_id}/{resume_id}")
async def get_ats_report(
    request: Request,
    job_id: str,
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Generate detailed ATS report for a specific resume-job pair."""
    db = request.app.db

    # Get job
    job = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": current_user["id"]})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get resume
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": current_user["id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Calculate ATS score
    ats_result = calculate_ats_score(
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

    return {
        "report": {
            "candidate_name": resume.get("candidate_name", "Unknown"),
            "job_title": job["title"],
            "resume_category": resume.get("category"),
            **ats_result,
        }
    }
