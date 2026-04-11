import sys
import logging
from pathlib import Path
import chromadb
from langchain_community.document_loaders import DirectoryLoader, TextLoader


BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

from app.services.chunker import get_legal_chunks
from app.services.embedder import generate_embeddings
from app.config.settings import settings

logging.basicConfig(
    level=logging.INFO,
    format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def get_chroma_collection():
    client = chromadb.HttpClient(
        host = settings.chroma_host,
        port = settings.chroma_port,
    )

    existing = [c.name for c in client.list_collections()]

    if settings.chroma_collection_name in existing:
        client.delete_collection(settings.chroma_collection_name)
        logger.info(f"Delete existing collection {settings.chroma_collection_name}")

    return client.get_or_create_collection(
        name= settings.chroma_collection_name,
        metadata = {"hnsw:space": "cosine"}
    )


def process_documents():
    md_dir = BASE_DIR / "app" / "output_md"

    loader = DirectoryLoader(str(md_dir), glob="**/*.md", loader_cls=TextLoader)
    documents = loader.load()

    all_document_chunks = []

    for doc in documents:
        chunks = get_legal_chunks(doc.page_content)

        for chunk in chunks:
            chunk.metadata.update(doc.metadata)
            all_document_chunks.append(chunk)

    logger.info(f"Processed {len(documents)} files into {len(all_document_chunks)} legal fragments.")
    return all_document_chunks


def upload_to_chroma(collection , chunks ):
    texts = [c.page_content for c in chunks]
    metadatas = [c.metadata for c in chunks]
    ids = [f"chunk_{i}" for i in range(len(chunks))]

    logger.info("Computing vectors..")

    vectors = generate_embeddings(texts).tolist()

    collection.add(
        documents = texts,
        embeddings = vectors,
        metadatas = metadatas,
        ids = ids
    )
    logger.info(f"Vector store successfully created for  {len(chunks)} chunks")


def ingest_policies():
    try:
        collection = get_chroma_collection()
        chunks = process_documents()
        upload_to_chroma(collection, chunks)
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")



if __name__ == "__main__":
    ingest_policies()