from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Healthcare RFP Analyzer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://rfp_user:rfp_password@localhost:5432/rfp_analyzer"

    # LLM
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4"
    LLM_PROVIDER: str = "openai"  # "openai" or "anthropic"
    LLM_BASE_URL: str | None = None
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 4096

    # Vector DB
    VECTOR_DB_PATH: str = "./data/chromadb"

    # Uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 52428800  # 50MB
    ALLOWED_FILE_TYPES: list[str] = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".docx", ".txt"]

    # Embeddings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Logging
    LOG_LEVEL: str = "INFO"

    # Compliance weights
    WEIGHT_CRITICAL: float = 4.0
    WEIGHT_HIGH: float = 3.0
    WEIGHT_MEDIUM: float = 2.0
    WEIGHT_LOW: float = 1.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
