import os
import sys
import logging
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

from app.services.chunker import get_legal_chunks
from app.services.embedder import create_vector_store

logging.basicConfig(
    level=logging.INFO,
    format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def ingest_policies():
    md_dir = BASE_DIR / "app" / "output_md"

    if not os.path.exists(md_dir):
        logger.error("Markdown directory does not exist")
        logger.info("Run pdf to markdown converter script first")
        return

    all_document_chunks = []

    logger.info("Starting ingestion process....")
    for filename in os.listdir(md_dir):
        if filename.endswith(".md"):

            file_path = os.path.join(md_dir, filename)
            logger.info("Processing " + filename)

            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            chunks = get_legal_chunks(content)

            for chunk in chunks:
                chunk.metadata["source"] = filename

            all_document_chunks.extend(chunks)
            logger.info(f"Created {len(chunks)} chunks for {filename}")

    if all_document_chunks:
        logger.info(f"Total chunks to vectorize {len(all_document_chunks)}")

        create_vector_store(all_document_chunks)

        logger.info(f"Vector store successfully created for  {len(all_document_chunks)} chunks")

    else:
        logger.warning(f"No chunks found in {md_dir}")

if __name__ == "__main__":
    ingest_policies()