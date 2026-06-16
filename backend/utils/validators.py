import re
from typing import Optional


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str) -> Optional[str]:
    """Validate password strength. Returns error message or None."""
    if len(password) < 6:
        return "Password must be at least 6 characters long"
    if len(password) > 100:
        return "Password must not exceed 100 characters"
    return None


def sanitize_text(text: str) -> str:
    """Clean and normalize text content."""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,;:!?@#$%&*()\-+=/\[\]{}\'\"<>]', '', text)
    return text.strip()


def validate_object_id(id_str: str) -> bool:
    """Validate MongoDB ObjectId format."""
    return bool(re.match(r'^[0-9a-fA-F]{24}$', id_str))
