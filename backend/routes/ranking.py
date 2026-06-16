from fastapi import APIRouter, Request, HTTPException, Depends
from middleware.auth_middleware import get_current_user
from services.ranking_service import (
    calculate_rankings,
    get_rankings,
    get_ranking_detail,
)

router = APIRouter()


@router.post("/calculate/{job_id}")
async def calculate_job_rankings(
    request: Request,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Calculate candidate rankings for a job description."""
    try:
        result = await calculate_rankings(
            request.app.db,
            job_id=job_id,
            user_id=current_user["id"],
        )
        return {"message": "Rankings calculated successfully", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{job_id}")
async def get_job_rankings(
    request: Request,
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get stored rankings for a job."""
    try:
        result = await get_rankings(
            request.app.db,
            job_id=job_id,
            user_id=current_user["id"],
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{job_id}/{resume_id}")
async def get_candidate_ranking_detail(
    request: Request,
    job_id: str,
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get detailed ranking for a specific candidate-job pair."""
    try:
        result = await get_ranking_detail(
            request.app.db,
            job_id=job_id,
            resume_id=resume_id,
            user_id=current_user["id"],
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
