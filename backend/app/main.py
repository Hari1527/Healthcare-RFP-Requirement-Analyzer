import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.utils.exceptions import AppException
from app.utils.logging import logger
from app.api.routes import documents, requirements, search, responses, compliance, dashboard

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Healthcare RFP Requirement Analyzer"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_origin_regex=r"^https?://.*" if "*" in settings.CORS_ORIGINS or not settings.CORS_ORIGINS else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    logger.error(f"AppException: {exc.message} (Code: {exc.code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred."}}
    )

app.include_router(documents.router)
app.include_router(requirements.router)
app.include_router(search.router)
app.include_router(responses.router)
app.include_router(compliance.router)
app.include_router(dashboard.router)

@app.on_event("startup")
async def startup_event():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)
    from app.db.base import Base
    from app.db.session import engine, SessionLocal
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.warning(f"Could not auto-create database tables: {e}")

    # Auto-seed datasets on fresh cloud deployment if database has 0 documents
    try:
        from app.models.document import Document
        db = SessionLocal()
        doc_count = db.query(Document).count()
        db.close()
        if doc_count == 0:
            logger.info("Fresh database detected. Auto-seeding healthcare RFP datasets...")
            from app.seed_datasets import seed_all_datasets
            seed_all_datasets()
            logger.info("Auto-seeding completed successfully.")
    except Exception as e:
        logger.warning(f"Auto-seeding skipped or encountered error: {e}")

    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
