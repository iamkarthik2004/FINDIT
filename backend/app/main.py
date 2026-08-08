from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.database import close_mongo_connection, connect_to_mongo
from app.routes import admin, auth, claims, chats, items, uploads

settings = get_settings()
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="FINDIT API", version="1.0.0", description="Smart Campus Lost & Found API", lifespan=lifespan)
origins = list({settings.frontend_url.rstrip("/"), "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000", "http://127.0.0.1:5000"})
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["Authorization", "Content-Type"])
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

@app.exception_handler(Exception)
async def unexpected_error(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred"})

@app.get("/api/health", tags=["Health"])
async def health() -> dict:
    # Ping Atlas rather than relying on the client being created at startup.
    from app.core.database import get_database
    await get_database().command("ping")
    return {"status": "ok", "database": "connected"}

app.include_router(auth.router)
app.include_router(items.router)
app.include_router(claims.router)
app.include_router(chats.router)
app.include_router(admin.router)
app.include_router(uploads.router)
