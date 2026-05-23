from app.models.schemas import Violation, AuditResponse, Severity, RiskScore
from app.services.chunker import get_legal_chunks
from app.services.retriever import LegalRetriever
from app.services.ai_service import call_ai_batch_audit
from app.services.graph.graph import get_graph
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


            if not suspicious_violations:
                return AuditResponse(
                    filename=filename,
                    total_violations=0,
                    risk_score=RiskScore(
                        overall=0, grade="LOW_RISK",
                        compensation=0, termination=0,
                        non_compete=0, ip_rights=0, data_privacy=0
                    ),
                    violations=[]
                )

            try:

                result = get_graph().invoke({
                    "filename" : filename,
                    "suspicious_items": suspicious_violations,
                    "retriever": self.retriever,
                    "first_verdicts": [],
                    "final_verdicts": [],
                    "requery_needed": False,
                    "enriched_verdicts": [],
                    "risk_score": {},
                })

                enriched_verdicts = result["enriched_verdicts"]
                risk_score_data = result["risk_score"]

                logger.info(
                    f"Graph complete — "
                    f"requery={result['requery_needed']}, "
                    f"verdicts={len(enriched_verdicts)}, "
                    f"grade={risk_score_data.get('grade')}"
                )
            except Exception as e:
                logger.error(f"Graph pipeline failed: {e}")
                raise

            final_violations = []


            for verdict in enriched_verdicts:

                severity_value = verdict.get("severity", "GREEN")

                orig = next(
                    (item for item in suspicious_violations
                     if item["index"]==verdict["index"]),
                    None
                )

                if orig:
                    final_violations.append(Violation(
                        chunk_index=verdict["index"],
                        chunk_text=orig["contract_text"],
                        matched_policy=orig["policy_text"],
                        severity=Severity(severity_value),
                        legal_principle=verdict.get("legal_principle", ""),
                        confidence=verdict["confidence"],
                        reasoning=verdict["explanation"],
                        plain_summary=verdict.get("plain_summary", ""),
                        source_file=orig["source"]
                    ))

            total_violations = sum(
                1 for v in final_violations
                if v.severity in (Severity.RED , Severity.YELLOW)
            )

            risk_score = RiskScore(**risk_score_data)

            return AuditResponse(
                filename=filename,
                total_violations=total_violations,
                risk_score=risk_score,
                violations=final_violations
            )

        except Exception as e:
            logger.critical(f"Critical failure during audit of {filename}: {e}")
            return AuditResponse(
                filename=filename,
                total_violations=0,
                violations=[]
            )




            




