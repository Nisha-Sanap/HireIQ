from fastapi import APIRouter, Request, UploadFile, File, HTTPException, Depends, Query
from typing import List, Optional
from middleware.auth_middleware import get_current_user
from services.resume_service import (
    upload_and_process_resume,
    get_resumes,
    get_resume_by_id,
    delete_resume,
)

router = APIRouter()


@router.post("/upload")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    candidate_name: Optional[str] = None,
    candidate_email: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Upload and process a single resume (PDF or DOCX)."""
    try:
        result = await upload_and_process_resume(
            request.app.db,
            file=file,
            user_id=current_user["id"],
            candidate_name=candidate_name,
            candidate_email=candidate_email,
        )
        return {"message": "Resume uploaded and processed successfully", "resume": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")


@router.post("/upload-multiple")
async def upload_multiple_resumes(
    request: Request,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload and process multiple resumes."""
    results = []
    errors = []

    for file in files:
        try:
            result = await upload_and_process_resume(
                request.app.db,
                file=file,
                user_id=current_user["id"],
            )
            results.append(result)
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})

    return {
        "message": f"Processed {len(results)} resumes, {len(errors)} errors",
        "resumes": results,
        "errors": errors,
    }


@router.get("")
async def list_resumes(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Get all resumes for the current user."""
    result = await get_resumes(
        request.app.db,
        user_id=current_user["id"],
        page=page,
        per_page=per_page,
    )
    return result


@router.get("/{resume_id}")
async def get_resume(
    request: Request,
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a specific resume by ID."""
    try:
        result = await get_resume_by_id(
            request.app.db,
            resume_id=resume_id,
            user_id=current_user["id"],
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{resume_id}")
async def remove_resume(
    request: Request,
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a resume."""
    try:
        await delete_resume(
            request.app.db,
            resume_id=resume_id,
            user_id=current_user["id"],
        )
        return {"message": "Resume deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
