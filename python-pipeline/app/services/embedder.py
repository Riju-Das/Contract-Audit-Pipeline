from sentence_transformers import SentenceTransformer

import logging

logger = logging.getLogger(__name__)
_model = None

def get_embedding_model():

    global _model
    if _model is None:
        try:
            model_name = "BAAI/bge-m3"
            _model = SentenceTransformer(model_name)
            logger.info(f"Model: {model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model BAAI/bge-m3 : {str(e)}")
            raise RuntimeError("Failed to load BAAI/bge-m3") from e
    return _model

def generate_embeddings(chunks):
    if not chunks:
        raise ValueError("Chunk list is empty")

    try:
        model = get_embedding_model()

        print(f"Converting {len(chunks)} chunks into vectors")

        embeddings = model.encode(chunks)

        logger.info(f"Generated embeddings with shape : {embeddings.shape}")

        return embeddings

    except PermissionError:
        logger.error(f"Permission Denied : Failed to create vectors")
        raise
    except Exception as e:
        logger.error(f"Failed to create vectors : {str(e)}")
        raise
