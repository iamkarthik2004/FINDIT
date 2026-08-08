from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.core.security import CurrentUser

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])
ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/image", summary="Upload an item image")
async def upload_image(current_user: CurrentUser, file: UploadFile = File(...)) -> dict:
    if file.content_type not in ALLOWED_TYPES: raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed")
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE: raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller")
    destination = Path(get_settings().upload_dir)
    destination.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{ALLOWED_TYPES[file.content_type]}"
    (destination / filename).write_bytes(content)
    return {"imageUrl": f"/uploads/{filename}"}
