from fastapi import APIRouter, Request, Depends
from middleware.auth_middleware import get_current_user
from services.analytics_service import get_dashboard_stats

router = APIRouter()


@router.get("/dashboard")
async def dashboard_stats(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Get comprehensive dashboard statistics."""
    result = await get_dashboard_stats(
        request.app.db,
        user_id=current_user["id"],
    )
    return result
