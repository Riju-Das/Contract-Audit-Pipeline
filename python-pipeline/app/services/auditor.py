from app.models.schemas import Violation,AuditResponse
from app.services.chunker import get_legal_chunks
from app.services.retriever import LegalRetriever
from app.services.gemini_service import call_gemini_batch_audit
import logging

logger = logging.getLogger(__name__)

class LegalAuditor:
    def __init__(self):
        try:
            self.retriever = LegalRetriever()
            self.similarity_threshold = 0.45
        except Exception as e:
            logger.error(f"Failed to initialize legal auditor: {e}")
            raise

    async def analyze_contract(self, filename:str, content:str) -> AuditResponse:
        try:
            chunks = get_legal_chunks(content)

            suspicious_violations = []

            logger.info(f"Auditing {filename} : {len(chunks)} chunks found")

            for i,chunk in enumerate(chunks):

                try:
                    results = self.retriever.search(chunk.page_content)

                    if results and results["distances"][0] and len(results["distances"][0]) > 0:
                        distance = results["distances"][0][0]
                        similarity_score = 1 - distance

                        if similarity_score > self.similarity_threshold:
                            suspicious_violations.append({
                                "index": i ,
                                "contract_text": chunk.page_content,
                                "policy_text" : results["documents"][0][0],
                                "source": results["metadatas"][0][0].get("source", "Unknown")

                            })
                except Exception as e:
                    logger.error(f"Error processing chunk: {e}")
                    continue

            final_violations = []

            if suspicious_violations:
                try:
                    ai_verdict = await call_gemini_batch_audit(suspicious_violations)

                    for verdict in ai_verdict:

                        if verdict.get("is_violation"):

                            orig = next(item for item in suspicious_violations if item["index"]==verdict["index"])

                            if orig:
                                final_violations.append(Violation(
                                    chunk_index=verdict["index"],
                                    chunk_text = orig["contract_text"],
                                    matched_policy=orig["policy_text"],
                                    confidence=verdict["confidence"],
                                    reasoning=verdict["explanation"],
                                    source_file=orig["source"]
                                ))

                except Exception as e:
                    logger.error(f"Error calling gemini_batch_audit: {e}")
                    raise

            return AuditResponse(
                filename=filename,
                total_violations=len(final_violations),
                violations=final_violations
            )
        except Exception as e:
            logger.critical(f"Critical failure during audit of {filename}: {e}")
            return AuditResponse(filename=filename, total_violations=0, violations=[])




            




