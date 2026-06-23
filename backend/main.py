"""
PlacementGPT — FastAPI Backend Application
Main entry point for the AI Placement Eligibility and Career Guidance API.
"""

import sys
from pathlib import Path

# Ensure backend package imports resolve correctly when starting from the repo root
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import logging
from contextlib import asynccontextmanager

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
from services.llm_service import llm_service
from services.rag_service import rag_service
from services.prediction_service import prediction_service
from services.eligibility_service import eligibility_service
from routes import chat, predict, eligibility, students

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("=" * 60)
    logger.info("PlacementGPT Backend Starting...")
    logger.info("=" * 60)

    # 1. Load company data
    logger.info("Loading company data...")
    eligibility_service.load_companies(str(config.COMPANIES_CSV))

    # 2. Train prediction model
    logger.info("Training placement prediction model...")
    prediction_service.train(str(config.STUDENTS_CSV))

    # 3. Initialize RAG pipeline (embeddings + ChromaDB)
    logger.info("Initializing RAG pipeline...")
    rag_service.initialize(
        knowledge_dir=str(config.KNOWLEDGE_DIR),
        persist_dir=str(config.VECTORSTORE_DIR),
        embedding_model=config.EMBEDDING_MODEL,
    )

    # 4. Load LLM (this is the heaviest operation)
    logger.info("Loading language model...")
    if config.HF_TOKEN and config.HF_TOKEN != "your_huggingface_token_here":
        llm_service.load_model(
            model_name=config.MODEL_NAME,
            hf_token=config.HF_TOKEN,
            max_new_tokens=config.MAX_NEW_TOKENS,
        )
    else:
        logger.warning(
            "HF_TOKEN not set! LLM will use fallback rule-based responses. "
            "Set HF_TOKEN in .env for full AI capability."
        )

    logger.info("=" * 60)
    logger.info("PlacementGPT Backend Ready!")
    logger.info(f"  Model loaded: {llm_service.is_loaded}")
    logger.info(f"  RAG ready: {rag_service.is_ready}")
    logger.info(f"  Prediction model trained: {prediction_service.is_trained}")
    logger.info(f"  Companies loaded: {len(eligibility_service.companies)}")
    logger.info("=" * 60)

    yield

    # Shutdown
    logger.info("PlacementGPT Backend shutting down...")


# Create FastAPI app
app = FastAPI(
    title="PlacementGPT API",
    description="AI-powered Placement Eligibility and Career Guidance Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(chat.router)
app.include_router(predict.router)
app.include_router(eligibility.router)
app.include_router(students.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        student_count = 0
        if Path(config.STUDENTS_CSV).exists():
            student_count = int(pd.read_csv(config.STUDENTS_CSV).shape[0])
    except Exception:
        student_count = 0

    return {
        "status": "healthy",
        "model_loaded": llm_service.is_loaded,
        "llm_error": llm_service.load_error,
        "vectorstore_ready": rag_service.is_ready,
        "prediction_ready": prediction_service.is_trained,
        "companies_count": len(eligibility_service.companies),
        "students_count": student_count,
    }


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "PlacementGPT API",
        "version": "1.0.0",
        "description": "AI Placement Eligibility and Career Guidance Assistant",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=True,
    )
