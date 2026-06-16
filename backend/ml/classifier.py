"""
Resume category classifier using rule-based classification.
Classifies resumes into categories like IT, Finance, Healthcare, etc.
"""

import re
from typing import Dict
from utils.logger import get_logger

logger = get_logger(__name__)

# Category keyword patterns
CATEGORY_PATTERNS = {
    "Information Technology": {
        "keywords": [
            "software", "developer", "programmer", "engineer", "coding",
            "python", "java", "javascript", "react", "angular", "node",
            "database", "sql", "api", "backend", "frontend", "fullstack",
            "full stack", "devops", "cloud", "aws", "azure", "docker",
            "kubernetes", "machine learning", "data science", "artificial intelligence",
            "web development", "mobile development", "cybersecurity", "networking",
            "linux", "git", "agile", "scrum", "microservices",
        ],
        "weight": 1.0,
    },
    "Data Science": {
        "keywords": [
            "data scientist", "data analyst", "machine learning", "deep learning",
            "tensorflow", "pytorch", "pandas", "numpy", "statistics",
            "data mining", "big data", "hadoop", "spark", "data visualization",
            "tableau", "power bi", "r programming", "statistical modeling",
            "predictive analytics", "natural language processing", "nlp",
            "computer vision", "neural network",
        ],
        "weight": 1.2,
    },
    "Finance": {
        "keywords": [
            "finance", "banking", "investment", "accounting", "financial analysis",
            "portfolio", "risk management", "audit", "tax", "compliance",
            "cpa", "cfa", "financial planning", "budgeting", "forecasting",
            "equity", "derivatives", "bloomberg", "trading", "actuarial",
            "insurance", "credit", "loan", "revenue", "profit",
        ],
        "weight": 1.0,
    },
    "Healthcare": {
        "keywords": [
            "healthcare", "medical", "clinical", "hospital", "patient",
            "nursing", "physician", "pharmacy", "diagnostic", "treatment",
            "surgery", "cardiology", "oncology", "radiology", "pathology",
            "ehr", "hipaa", "fda", "pharmaceutical", "biotech",
            "public health", "epidemiology", "health informatics",
        ],
        "weight": 1.0,
    },
    "Marketing": {
        "keywords": [
            "marketing", "digital marketing", "seo", "sem", "social media",
            "content marketing", "brand", "advertising", "campaign", "analytics",
            "google ads", "facebook ads", "email marketing", "crm", "hubspot",
            "salesforce", "market research", "copywriting", "pr", "communications",
            "product marketing", "growth hacking",
        ],
        "weight": 1.0,
    },
    "Human Resources": {
        "keywords": [
            "human resources", "hr", "recruitment", "talent acquisition",
            "onboarding", "employee relations", "compensation", "benefits",
            "training", "development", "performance management", "hris",
            "workforce planning", "organizational development", "diversity",
            "payroll", "labor law", "employee engagement",
        ],
        "weight": 1.0,
    },
    "Sales": {
        "keywords": [
            "sales", "business development", "account management", "revenue",
            "pipeline", "quota", "crm", "salesforce", "cold calling",
            "lead generation", "negotiation", "closing", "territory",
            "b2b", "b2c", "enterprise sales", "solution selling",
        ],
        "weight": 1.0,
    },
    "Engineering": {
        "keywords": [
            "mechanical engineering", "electrical engineering", "civil engineering",
            "chemical engineering", "structural", "cad", "autocad", "solidworks",
            "matlab", "manufacturing", "quality control", "six sigma",
            "lean manufacturing", "project engineering", "industrial engineering",
        ],
        "weight": 1.0,
    },
    "Design": {
        "keywords": [
            "graphic design", "ui design", "ux design", "user experience",
            "user interface", "figma", "sketch", "adobe", "photoshop",
            "illustrator", "indesign", "wireframe", "prototype", "visual design",
            "interaction design", "design system", "typography", "branding",
        ],
        "weight": 1.0,
    },
    "Education": {
        "keywords": [
            "education", "teaching", "professor", "instructor", "curriculum",
            "lesson plan", "student", "academic", "university", "school",
            "tutoring", "e-learning", "training", "pedagogy", "assessment",
        ],
        "weight": 1.0,
    },
    "Legal": {
        "keywords": [
            "legal", "attorney", "lawyer", "litigation", "contract",
            "compliance", "regulatory", "intellectual property", "patent",
            "corporate law", "law firm", "paralegal", "legal research",
            "due diligence", "mergers and acquisitions",
        ],
        "weight": 1.0,
    },
}


def predict_category(text: str) -> Dict:
    """
    Predict the resume category using keyword-based scoring.

    Returns:
        dict with 'category', 'confidence', and 'scores'
    """
    if not text:
        return {"category": "Unknown", "confidence": 0.0, "scores": {}}

    text_lower = text.lower()
    scores = {}

    for category, config in CATEGORY_PATTERNS.items():
        keywords = config["keywords"]
        weight = config["weight"]

        match_count = 0
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            matches = re.findall(pattern, text_lower)
            match_count += len(matches)

        # Normalize by number of keywords in category
        normalized_score = (match_count / len(keywords)) * weight
        scores[category] = round(normalized_score, 4)

    if not scores or max(scores.values()) == 0:
        return {"category": "Other", "confidence": 0.0, "scores": scores}

    # Get best match
    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]

    # Calculate confidence (relative strength of top match)
    total_score = sum(scores.values())
    confidence = round(best_score / total_score, 4) if total_score > 0 else 0.0

    logger.info(f"Resume classified as: {best_category} (confidence: {confidence})")

    return {
        "category": best_category,
        "confidence": confidence,
        "scores": scores,
    }
