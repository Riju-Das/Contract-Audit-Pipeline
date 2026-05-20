from app.models.schemas import Violation, AuditResponse, Severity
from app.services.chunker import get_legal_chunks
from app.services.retriever import LegalRetriever
from app.services.ai_service import call_ai_batch_audit
import logging

logger = logging.getLogger(__name__)

class LegalAuditor:
    def __init__(self):
        try:
            self.retriever = LegalRetriever()
            self.similarity_threshold = 0.4
        except Exception as e:
            logger.error(f"Failed to initialize legal auditor: {e}")
            raise

    async def _requery_and_reclassify(
            self,
            suspicious_items :list,
            first_verdicts: list
    ) -> list:

        requery_map = {
            v["index"] : v["suggested_query"]
            for v in first_verdicts
            if v.get("needs_requery") and v.get("suggested_query")
        }

        if not requery_map:
            return first_verdicts

        logger.info(f"Re-querying {len(requery_map)} low-confidence chunks")

        enriched_items = []

        for item in suspicious_items:
            if item["index"] in requery_map:

                followup_query =  requery_map[item["index"]]

                followup_results = self.retriever.search(followup_query, n_results=1)

                if followup_results and followup_results["distances"][0] :

                    extra_policies = [
                        {
                            "text":       doc,
                            "source":     meta.get("source", "Unknown"),
                            "similarity": round(1 - dist, 3)
                        }
                        for doc, meta, dist in zip(
                            followup_results["documents"][0],
                            followup_results["metadatas"][0],
                            followup_results["distances"][0]
                        )
                    ]

                    enriched = dict(item)
                    enriched["policies"] = item.get("policies",[]) + extra_policies
                    enriched["policy_text"] = enriched["policies"][0]["text"]
                    enriched_items.append(enriched)
                    continue

            enriched_items.append(item)

        return call_ai_batch_audit(enriched_items)



    async def analyze_contract(self, filename:str, content:str) -> AuditResponse:
        try:
            chunks = get_legal_chunks(content)

            suspicious_violations = []

            logger.info(f"Auditing {filename} : {len(chunks)} chunks found")

            for i,chunk in enumerate(chunks):

                try:
                    search_query = f"Legal principles and Indian law violations in: {chunk.page_content}"
                    results = self.retriever.search(search_query, n_results=2)

                    if results and results["distances"][0] and len(results["distances"][0]) > 0:

                        policies = []

                        for doc, meta, dist in zip(
                                results["documents"][0],
                                results["metadatas"][0],
                                results["distances"][0]
                        ):
                            similarity = 1 - dist
                            if similarity >= self.similarity_threshold:
                                policies.append({
                                    "text" : doc,
                                    "source" : meta.get("source", "Unknown"),
                                    "similarity" : round(similarity, 3),
                                })

                        if policies:
                            suspicious_violations.append({
                                "index" : i,
                                "contract_text" : chunk.page_content,
                                "policies" : policies,
                                "policy_text" : policies[0]["text"],
                                "source" : policies[0]["source"],

                            })


                except Exception as e:
                    logger.error(f"Error processing chunk: {e}")
                    continue

            final_violations = []

            if suspicious_violations:
                try:
                    ai_verdict = call_ai_batch_audit(suspicious_violations)

                    logger.info(f"AI RAW OUTPUT: {ai_verdict}")

                    low_conf = [v for v in ai_verdict if v.get("needs_requery")]

                    if low_conf:
                        logger.info(f"Re-querying {len(low_conf)} uncertain chunks")

                        ai_verdict = await self._requery_and_reclassify(
                            suspicious_violations,
                            ai_verdict,
                        )

                    for verdict in ai_verdict:

                        severity_value = verdict.get("severity", "GREEN")

                        if severity_value in ["RED", "YELLOW"]:

                            orig = next((item for item in suspicious_violations if item["index"]==verdict["index"]),None)

                            if orig:
                                final_violations.append(Violation(
                                    chunk_index=verdict["index"],
                                    chunk_text = orig["contract_text"],
                                    matched_policy=orig["policy_text"],
                                    severity=Severity(severity_value),
                                    legal_principle=verdict.get("legal_principle", "Unknown"),
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




            




