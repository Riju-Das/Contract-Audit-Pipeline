from fastapi import APIRouter, HTTPException, File, UploadFile
from app.services.chain.processor import process_upload
from app.services.auditor import LegalAuditor
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
auditor = LegalAuditor()

@router.post("/audit")
async def audit_contract(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        if not content_bytes:
            raise HTTPException(status_code=400, detail="Content cannot be empty")

        await file.seek(0)

        markdown_text = await process_upload(file.filename,content_bytes)

        result = await auditor.analyze_contract(file.filename, markdown_text)

        return result

    except ValueError as ve:
        logger.error(f"Validation error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Unexpected audit error: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during audit.")

