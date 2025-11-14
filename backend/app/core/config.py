from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # Application Settings
    APP_NAME: str = "NAWRA Library Management System"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # API Settings
    API_V1_PREFIX: str = "/api/v1"

    # CORS Settings
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from comma-separated string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v

    # Security Settings
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Supabase Settings
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Database Settings (Supabase PostgreSQL)
    DATABASE_URL: str = ""

    # Upstash Redis Settings
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""

    # Email Settings (Resend)
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@nawra-library.om"
    FRONTEND_URL: str = "http://localhost:3000"

    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


# Create global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get settings instance"""
    return settings
