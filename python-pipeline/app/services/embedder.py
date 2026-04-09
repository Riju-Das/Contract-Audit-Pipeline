from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)

def get_embedding_model():
    try:
        model_name = "BAAI/bge-m3"
        encode_kwargs = {"normalize_embeddings": True}

        return HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwarge={"device":"cpu"},
            encode_kwargs=encode_kwargs,
        )
    except Exception as e:
        logger.error(f"Failed to load model BAAI/bge-m3 : {str(e)}")
        raise RuntimeError("Failed to load BAAI/bge-m3") from e

def create_vector_store(chunks):
    try:
        embeddings = get_embedding_model()
        print(f"Converting {len(chunks)} chunks into vectors")

        vector_db = Chroma.from_documents(
            documents=chunks,
            embeddings=embeddings,
            persist_directory=settings.db_dir
        )

        print(f"Successfully created vectors")

        return vector_db
    except PermissionError:
        logger.error(f"Permission Denied : Failed to create vectors")
        raise
    except Exception as e:
        logger.error(f"Failed to create vectors : {str(e)}")
        raise
