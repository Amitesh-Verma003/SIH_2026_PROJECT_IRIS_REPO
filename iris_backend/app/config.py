from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve .env from either iris_backend/ or the repo root (../)
_backend_dir = Path(__file__).resolve().parent.parent
_repo_root = _backend_dir.parent
_env_file = _backend_dir / ".env" if (_backend_dir / ".env").exists() else _repo_root / ".env"


class Settings(BaseSettings):
    database_url: str
    app_name: str = "IRIS DR Screening API"
    debug: bool = False
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = str(_env_file)


settings = Settings()
