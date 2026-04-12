import chromadb
from app.config.settings import settings
from app.services.embedder import get_embedding_model
import logging

logger = logging.getLogger(__name__)

class LegalRetriever:

    def __init__(self):
        try:
            self.client = chromadb.HttpClient(
                host=settings.chroma_host,
                port=settings.chroma_port
            )

            self.collection = self.client.get_collection(name=settings.chroma_collection_name)

            self.model = get_embedding_model()
        except Exception as e:
            logger.error(f"Failed to initialize LegalRetriever: {str(e)}")
            raise RuntimeError(f"Database or model not available")


    def search(self,query_text:str , n_results:int =1):
        try:
            query_vector = self.model.encode(query_text).tolist()

            results = self.collection.query(
                query_embeddings=query_vector,
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            return results
        except Exception as e:
            logger.error(f"Failed to search: {str(e)}")
            return None