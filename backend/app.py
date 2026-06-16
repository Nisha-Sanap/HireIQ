from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

from config import settings
from routes.auth import router as auth_router
from routes.resumes import router as resume_router
from routes.jobs import router as job_router
from routes.ranking import router as ranking_router
from routes.analytics import router as analytics_router
from routes.reports import router as reports_router
from middleware.error_handler import add_error_handlers

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Resume Screening & Candidate Ranking System",
    description="AI-powered resume screening, ATS scoring, and candidate ranking API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlers
add_error_handlers(app)


@app.on_event("startup")
async def startup_event():
    """Initialize MongoDB connection and create upload directory."""
    logger.info("Starting Resume Screening System...")

    # MongoDB connection
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URI)
    app.db = app.mongodb_client[settings.DATABASE_NAME]

    # Ensure indexes
    await app.db.users.create_index("email", unique=True)
    await app.db.resumes.create_index("user_id")
    await app.db.jobs.create_index("user_id")
    await app.db.rankings.create_index([("job_id", 1), ("rank", 1)])

    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    logger.info(f"Connected to MongoDB: {settings.DATABASE_NAME}")
    logger.info(f"API docs available at http://localhost:{settings.BACKEND_PORT}/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection."""
    app.mongodb_client.close()
    logger.info("MongoDB connection closed.")


# Register routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resume_router, prefix="/api/resumes", tags=["Resumes"])
app.include_router(job_router, prefix="/api/jobs", tags=["Job Descriptions"])
app.include_router(ranking_router, prefix="/api/ranking", tags=["Ranking & ATS"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])


@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Resume Screening & Candidate Ranking System",
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
async def api_health():
    return {"status": "ok", "database": "connected"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=settings.BACKEND_PORT, reload=True)
