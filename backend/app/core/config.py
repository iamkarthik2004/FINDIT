from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # Always read configuration from this backend's private .env file.
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    mongodb_uri: str = ""
    database_name: str = "findit"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    frontend_url: str = "http://localhost:5173"
    upload_dir: str = str(BACKEND_DIR / "uploads")


@lru_cache
def get_settings() -> Settings:
    return Settings()
