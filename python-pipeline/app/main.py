import  uvicorn
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as audit_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Contract audit API worker",
    description="Python Service for PDF processing and Gemini RAG analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "A critical error occurred on the Python worker server."}
    )

app.include_router(audit_router, prefix="/api/v1")

if __name__ == "__main__":
    logger.info("Starting server on http://0.0.0.0:8001")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001,reload=True)