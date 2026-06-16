from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token."""
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


async def register_user(db, name: str, email: str, password: str) -> dict:
    """Register a new user."""
    # Check if user exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise ValueError("Email already registered")

    user_doc = {
        "name": name,
        "email": email,
        "hashed_password": hash_password(password),
        "role": "recruiter",
        "created_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token(user_id, email)

    logger.info(f"New user registered: {email}")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": "recruiter",
            "created_at": user_doc["created_at"],
        },
    }


async def login_user(db, email: str, password: str) -> dict:
    """Authenticate a user and return a token."""
    user = await db.users.find_one({"email": email})
    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user["hashed_password"]):
        raise ValueError("Invalid email or password")

    user_id = str(user["_id"])
    token = create_access_token(user_id, email)

    logger.info(f"User logged in: {email}")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "recruiter"),
            "created_at": user["created_at"],
        },
    }
