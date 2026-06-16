from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    company: Optional[str] = None
    description: str = Field(..., min_length=10)
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience_level: str = "mid"  # junior, mid, senior, lead
    location: Optional[str] = None
    job_type: str = "full-time"  # full-time, part-time, contract, remote


class JobResponse(BaseModel):
    id: str
    user_id: str
    title: str
    company: Optional[str] = None
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    extracted_skills: List[str] = []
    experience_level: str = "mid"
    location: Optional[str] = None
    job_type: str = "full-time"
    total_candidates: int = 0
    created_at: datetime


class JobInDB(BaseModel):
    user_id: str
    title: str
    company: Optional[str] = None
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    extracted_skills: List[str] = []
    experience_level: str = "mid"
    location: Optional[str] = None
    job_type: str = "full-time"
    total_candidates: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
