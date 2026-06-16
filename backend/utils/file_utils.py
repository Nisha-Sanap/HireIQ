import os
import uuid
from fastapi import UploadFile, HTTPException
from config import settings


def validate_file_extension(filename: str) -> str:
    """Validate file extension and return it."""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )
    return ext


def validate_file_size(file_size: int) -> None:
    """Validate file size is within limits."""
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB",
        )


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename preserving the extension."""
    ext = os.path.splitext(original_filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return unique_name


async def save_upload_file(upload_file: UploadFile) -> tuple:
    """Save an uploaded file and return (saved_filename, file_size)."""
    validate_file_extension(upload_file.filename)

    content = await upload_file.read()
    file_size = len(content)
    validate_file_size(file_size)

    filename = generate_unique_filename(upload_file.filename)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    return filename, file_size


def delete_upload_file(filename: str) -> None:
    """Delete an uploaded file."""
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
