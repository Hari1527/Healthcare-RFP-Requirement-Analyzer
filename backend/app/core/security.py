import uuid
import os
import re
from app.core.config import settings

def validate_file_type(filename: str, content_type: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in settings.ALLOWED_EXTENSIONS and content_type in settings.ALLOWED_FILE_TYPES

def validate_file_size(size: int) -> bool:
    return size <= settings.MAX_FILE_SIZE

def sanitize_filename(filename: str) -> str:
    filename = os.path.basename(filename)
    filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    return filename

def generate_unique_filename(original_filename: str) -> str:
    unique_id = str(uuid.uuid4())
    sanitized = sanitize_filename(original_filename)
    return f"{unique_id}_{sanitized}"
