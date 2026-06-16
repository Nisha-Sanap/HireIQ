from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ResumeCreate(BaseModel):
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    raw_text: str = ""
    extracted_skills: List[str] = []
    skill_categories: dict = {}
    category: Optional[str] = None
    category_confidence: Optional[float] = None
    file_size: int = 0
    uploaded_at: datetime
    processed: bool = False


class ResumeInDB(BaseModel):
    user_id: str
    filename: str
    original_filename: str
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    raw_text: str = ""
    extracted_skills: List[str] = []
    skill_categories: dict = {}
    category: Optional[str] = None
    category_confidence: Optional[float] = None
    file_size: int = 0
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    processed: bool = False


class ResumeListResponse(BaseModel):
    resumes: List[ResumeResponse]
    total: int
    page: int = 1
    per_page: int = 20
