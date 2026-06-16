from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class RankingResult(BaseModel):
    id: str
    job_id: str
    resume_id: str
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    filename: str
    ats_score: float = 0.0
    similarity_score: float = 0.0
    skill_match_score: float = 0.0
    experience_score: float = 0.0
    overall_score: float = 0.0
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    additional_skills: List[str] = []
    resume_category: Optional[str] = None
    rank: int = 0
    calculated_at: datetime


class RankingInDB(BaseModel):
    job_id: str
    resume_id: str
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    filename: str
    ats_score: float = 0.0
    similarity_score: float = 0.0
    skill_match_score: float = 0.0
    experience_score: float = 0.0
    overall_score: float = 0.0
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    additional_skills: List[str] = []
    resume_category: Optional[str] = None
    rank: int = 0
    calculated_at: datetime = Field(default_factory=datetime.utcnow)


class RankingListResponse(BaseModel):
    job_id: str
    job_title: str
    rankings: List[RankingResult]
    total_candidates: int
    average_score: float = 0.0


class ATSReport(BaseModel):
    resume_id: str
    job_id: str
    candidate_name: Optional[str] = None
    ats_score: float
    score_breakdown: Dict[str, float] = {}
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    recommendations: List[str] = []
    keyword_frequency: Dict[str, int] = {}
