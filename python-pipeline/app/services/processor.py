import tempfile
import os
import pymupdf4llm
import logging

logger = logging.getLogger(__name__)

async def process_upload(file_name: str, content_bytes: bytes) -> str:
    if file_name.lower().endswith(".pdf"):
        tmp_path = None
        try:

            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                tmp.write(content_bytes)
                tmp_path = tmp.name

                return pymupdf4llm.to_markdown(tmp_path)
        except Exception as e:
            logger.error(f"Failed to process pdf file {file_name}: {str(e)}")
            raise ValueError(f"PDF Conversion Error: {str(e)}")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    try:
        return content_bytes.decode("utf-8", errors="ignore")
    except UnicodeDecodeError:
        logger.warning(f"UTF-8 decoding failed for {file_name}, trying latin-1")
        return content_bytes.decode('latin-1', errors='ignore')
