from fastapi import APIRouter, Request, HTTPException, Depends
from models.job import JobCreate
from middleware.auth_middleware import get_current_user
from services.job_service import (
    create_job,
    get_jobs,
    get_job_by_id,
    update_job,
    delete_job,
)

router = APIRouter()


@router.post("")
async def create_new_job(
    request: Request,
    job_data: JobCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new job description."""
    try:
        result = await create_job(
            request.app.db,
            user_id=current_user["id"],
            job_data=job_data.dict(),
        )
        return {"message": "Job created successfully", "job": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
async def list_jobs(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Get all jobs for the current user."""
    result = await get_jobs(request.app.db, user_id=current_user["id"])
    return result


@router.get("/{job_id}")
async def get_job(
    request: Request,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a specific job by ID."""
    try:
        result = await get_job_by_id(
            request.app.db,
            job_id=job_id,
            user_id=current_user["id"],
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{job_id}")
async def modify_job(
    request: Request,
    job_id: str,
    job_data: JobCreate,
    current_user: dict = Depends(get_current_user),
):
    """Update a job description."""
    try:
        result = await update_job(
            request.app.db,
            job_id=job_id,
            user_id=current_user["id"],
            job_data=job_data.dict(),
        )
        return {"message": "Job updated successfully", "job": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{job_id}")
async def remove_job(
    request: Request,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a job and its rankings."""
    try:
        await delete_job(
            request.app.db,
            job_id=job_id,
            user_id=current_user["id"],
        )
        return {"message": "Job deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
