import os
from datetime import datetime
from bson import ObjectId
from fastapi import UploadFile
from config import settings
from utils.file_utils import save_upload_file, delete_upload_file
from utils.logger import get_logger
from ml.text_extractor import extract_text_from_file
from ml.skill_extractor import extract_skills
from ml.classifier import predict_category

logger = get_logger(__name__)


async def upload_and_process_resume(
    db, file: UploadFile, user_id: str,
    candidate_name: str = None, candidate_email: str = None
) -> dict:
    """Upload a resume file, extract text, skills, and classify it."""
    # Save file
    filename, file_size = await save_upload_file(file)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    try:
        # Extract text
        raw_text = extract_text_from_file(filepath)

        # Extract skills
        skills_result = extract_skills(raw_text)
        extracted_skills = skills_result["skills"]
        skill_categories = skills_result["categories"]

        # Classify resume
        category_result = predict_category(raw_text)
        category = category_result["category"]
        category_confidence = category_result["confidence"]

        # Extract candidate name from resume if not provided
        if not candidate_name:
            candidate_name = _extract_name_from_text(raw_text)

        # Extract email from resume if not provided
        if not candidate_email:
            candidate_email = _extract_email_from_text(raw_text)

        # Store in database
        resume_doc = {
            "user_id": user_id,
            "filename": filename,
            "original_filename": file.filename,
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "raw_text": raw_text,
            "extracted_skills": extracted_skills,
            "skill_categories": skill_categories,
            "category": category,
            "category_confidence": category_confidence,
            "file_size": file_size,
            "uploaded_at": datetime.utcnow(),
            "processed": True,
        }

        result = await db.resumes.insert_one(resume_doc)

        logger.info(f"Resume processed: {file.filename} -> {len(extracted_skills)} skills extracted")

        return {
            "id": str(result.inserted_id),
            "user_id": user_id,
            "filename": filename,
            "original_filename": file.filename,
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "extracted_skills": extracted_skills,
            "skill_categories": skill_categories,
            "category": category,
            "category_confidence": category_confidence,
            "file_size": file_size,
            "uploaded_at": resume_doc["uploaded_at"],
            "processed": True,
        }

    except Exception as e:
        # Clean up file on error
        delete_upload_file(filename)
        logger.error(f"Error processing resume {file.filename}: {str(e)}")
        raise


async def get_resumes(db, user_id: str, page: int = 1, per_page: int = 20) -> dict:
    """Get paginated resumes for a user."""
    skip = (page - 1) * per_page
    cursor = db.resumes.find({"user_id": user_id}).sort("uploaded_at", -1).skip(skip).limit(per_page)
    resumes = []
    async for doc in cursor:
        resumes.append(_format_resume(doc))

    total = await db.resumes.count_documents({"user_id": user_id})

    return {"resumes": resumes, "total": total, "page": page, "per_page": per_page}


async def get_resume_by_id(db, resume_id: str, user_id: str) -> dict:
    """Get a single resume by ID."""
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": user_id})
    if not resume:
        raise ValueError("Resume not found")
    return _format_resume(resume)


async def delete_resume(db, resume_id: str, user_id: str) -> bool:
    """Delete a resume and its file."""
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": user_id})
    if not resume:
        raise ValueError("Resume not found")

    # Delete file
    delete_upload_file(resume["filename"])

    # Delete from database
    await db.resumes.delete_one({"_id": ObjectId(resume_id)})

    # Delete associated rankings
    await db.rankings.delete_many({"resume_id": resume_id})

    logger.info(f"Resume deleted: {resume_id}")
    return True


def _format_resume(doc: dict) -> dict:
    """Format a resume document for API response."""
    return {
        "id": str(doc["_id"]),
        "user_id": doc["user_id"],
        "filename": doc.get("original_filename", doc["filename"]),
        "candidate_name": doc.get("candidate_name"),
        "candidate_email": doc.get("candidate_email"),
        "raw_text": doc.get("raw_text", "")[:500],  # Truncate for list view
        "extracted_skills": doc.get("extracted_skills", []),
        "skill_categories": doc.get("skill_categories", {}),
        "category": doc.get("category"),
        "category_confidence": doc.get("category_confidence"),
        "file_size": doc.get("file_size", 0),
        "uploaded_at": doc["uploaded_at"],
        "processed": doc.get("processed", False),
    }


def _extract_name_from_text(text: str) -> str:
    """Try to extract a name from the first few lines of resume text."""
    import re
    lines = text.strip().split('\n')
    for line in lines[:5]:
        line = line.strip()
        # Skip empty lines and lines that look like contact info
        if not line or '@' in line or line.startswith('+') or line.startswith('http'):
            continue
        # A name is usually 2-4 words, all starting with capitals
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
            return line
    return "Unknown Candidate"


def _extract_email_from_text(text: str) -> str:
    """Extract email address from resume text."""
    import re
    match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    return match.group(0) if match else None
