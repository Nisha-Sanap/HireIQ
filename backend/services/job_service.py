from datetime import datetime
from bson import ObjectId
from utils.logger import get_logger
from ml.skill_extractor import extract_skills

logger = get_logger(__name__)


async def create_job(db, user_id: str, job_data: dict) -> dict:
    """Create a new job description and extract skills from it."""
    # Extract skills from the description text
    skills_result = extract_skills(job_data["description"])
    extracted_skills = skills_result["skills"]

    # Merge user-provided required skills with auto-extracted skills
    all_required = list(set(job_data.get("required_skills", []) + extracted_skills))

    job_doc = {
        "user_id": user_id,
        "title": job_data["title"],
        "company": job_data.get("company"),
        "description": job_data["description"],
        "required_skills": all_required,
        "preferred_skills": job_data.get("preferred_skills", []),
        "extracted_skills": extracted_skills,
        "experience_level": job_data.get("experience_level", "mid"),
        "location": job_data.get("location"),
        "job_type": job_data.get("job_type", "full-time"),
        "total_candidates": 0,
        "created_at": datetime.utcnow(),
    }

    result = await db.jobs.insert_one(job_doc)

    logger.info(f"Job created: {job_data['title']} with {len(all_required)} required skills")

    return _format_job({**job_doc, "_id": result.inserted_id})


async def get_jobs(db, user_id: str) -> dict:
    """Get all jobs for a user."""
    cursor = db.jobs.find({"user_id": user_id}).sort("created_at", -1)
    jobs = []
    async for doc in cursor:
        # Count candidates (rankings) for this job
        count = await db.rankings.count_documents({"job_id": str(doc["_id"])})
        doc["total_candidates"] = count
        jobs.append(_format_job(doc))

    return {"jobs": jobs, "total": len(jobs)}


async def get_job_by_id(db, job_id: str, user_id: str) -> dict:
    """Get a single job by ID."""
    job = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": user_id})
    if not job:
        raise ValueError("Job not found")

    count = await db.rankings.count_documents({"job_id": job_id})
    job["total_candidates"] = count

    return _format_job(job)


async def update_job(db, job_id: str, user_id: str, job_data: dict) -> dict:
    """Update a job description."""
    job = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": user_id})
    if not job:
        raise ValueError("Job not found")

    update_fields = {}
    if "title" in job_data:
        update_fields["title"] = job_data["title"]
    if "description" in job_data:
        update_fields["description"] = job_data["description"]
        # Re-extract skills
        skills_result = extract_skills(job_data["description"])
        update_fields["extracted_skills"] = skills_result["skills"]
        update_fields["required_skills"] = list(
            set(job_data.get("required_skills", job.get("required_skills", [])) + skills_result["skills"])
        )
    if "required_skills" in job_data:
        update_fields["required_skills"] = job_data["required_skills"]
    if "preferred_skills" in job_data:
        update_fields["preferred_skills"] = job_data["preferred_skills"]
    if "experience_level" in job_data:
        update_fields["experience_level"] = job_data["experience_level"]
    if "company" in job_data:
        update_fields["company"] = job_data["company"]
    if "location" in job_data:
        update_fields["location"] = job_data["location"]
    if "job_type" in job_data:
        update_fields["job_type"] = job_data["job_type"]

    await db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": update_fields})

    updated = await db.jobs.find_one({"_id": ObjectId(job_id)})
    return _format_job(updated)


async def delete_job(db, job_id: str, user_id: str) -> bool:
    """Delete a job and its rankings."""
    job = await db.jobs.find_one({"_id": ObjectId(job_id), "user_id": user_id})
    if not job:
        raise ValueError("Job not found")

    await db.jobs.delete_one({"_id": ObjectId(job_id)})
    await db.rankings.delete_many({"job_id": job_id})

    logger.info(f"Job deleted: {job_id}")
    return True


def _format_job(doc: dict) -> dict:
    """Format a job document for API response."""
    return {
        "id": str(doc["_id"]),
        "user_id": doc["user_id"],
        "title": doc["title"],
        "company": doc.get("company"),
        "description": doc["description"],
        "required_skills": doc.get("required_skills", []),
        "preferred_skills": doc.get("preferred_skills", []),
        "extracted_skills": doc.get("extracted_skills", []),
        "experience_level": doc.get("experience_level", "mid"),
        "location": doc.get("location"),
        "job_type": doc.get("job_type", "full-time"),
        "total_candidates": doc.get("total_candidates", 0),
        "created_at": doc["created_at"],
    }
