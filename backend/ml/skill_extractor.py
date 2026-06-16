"""
Skill extraction module using pattern matching against skills taxonomy.
Extracts technical and soft skills from resume/job description text.
"""

import re
from typing import Dict, List
from ml.skills_db import SKILLS_DATABASE, SKILL_ALIASES, normalize_skill, get_skill_category
from utils.logger import get_logger

logger = get_logger(__name__)


def extract_skills(text: str) -> Dict:
    """
    Extract skills from text using pattern matching against the skills database.

    Returns:
        dict with 'skills' (list of matched skills) and 'categories' (dict of category -> skills)
    """
    if not text:
        return {"skills": [], "categories": {}}

    text_lower = text.lower()

    found_skills = set()
    categories = {}

    # Check each skill in the database
    for category, skills_list in SKILLS_DATABASE.items():
        category_matches = []
        for skill in skills_list:
            # Use word boundary matching for accurate detection
            if _skill_in_text(skill, text_lower):
                normalized = normalize_skill(skill)
                if normalized not in found_skills:
                    found_skills.add(normalized)
                    category_matches.append(normalized)

        if category_matches:
            categories[category] = category_matches

    # Check aliases
    for alias, canonical in SKILL_ALIASES.items():
        if _skill_in_text(alias, text_lower):
            normalized = normalize_skill(canonical)
            if normalized not in found_skills:
                found_skills.add(normalized)
                cat = get_skill_category(canonical)
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append(normalized)

    skills_list = sorted(list(found_skills))

    logger.info(f"Extracted {len(skills_list)} skills across {len(categories)} categories")

    return {
        "skills": skills_list,
        "categories": categories,
        "total": len(skills_list),
    }


def _skill_in_text(skill: str, text: str) -> bool:
    """Check if a skill is present in text using word boundary matching."""
    # Escape special regex characters in skill name
    escaped = re.escape(skill)

    # For short skills (1-2 chars like "c", "r"), require stricter matching
    if len(skill) <= 2:
        # Match as standalone word with surrounding context
        pattern = r'(?<![a-zA-Z])' + escaped + r'(?![a-zA-Z])'
    else:
        # Standard word boundary matching
        pattern = r'\b' + escaped + r'\b'

    try:
        return bool(re.search(pattern, text, re.IGNORECASE))
    except re.error:
        return skill in text


def get_keyword_frequency(text: str, skills: List[str]) -> Dict[str, int]:
    """Count how many times each skill appears in the text."""
    text_lower = text.lower()
    frequency = {}

    for skill in skills:
        escaped = re.escape(skill.lower())
        pattern = r'\b' + escaped + r'\b'
        try:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            frequency[skill] = len(matches)
        except re.error:
            frequency[skill] = text_lower.count(skill.lower())

    return frequency


def extract_experience_years(text: str) -> int:
    """Extract years of experience from resume text."""
    patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'experience\s*:?\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional|work|industry)',
    ]

    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            years = int(match)
            if years <= 50:  # Sanity check
                max_years = max(max_years, years)

    return max_years
