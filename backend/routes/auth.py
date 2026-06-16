from fastapi import APIRouter, Request, HTTPException
from models.user import UserCreate, UserLogin
from services.auth_service import register_user, login_user
from middleware.auth_middleware import get_current_user
from fastapi import Depends

router = APIRouter()


@router.post("/register")
async def register(request: Request, user_data: UserCreate):
    """Register a new recruiter account."""
    try:
        result = await register_user(
            request.app.db,
            name=user_data.name,
            email=user_data.email,
            password=user_data.password,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(request: Request, user_data: UserLogin):
    """Login and get JWT token."""
    try:
        result = await login_user(
            request.app.db,
            email=user_data.email,
            password=user_data.password,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user."""
    return current_user
