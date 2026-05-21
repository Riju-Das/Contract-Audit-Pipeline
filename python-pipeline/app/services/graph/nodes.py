import json
import logging
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.services.ai_service import call_ai_batch_audit
from app.config.settings import settings
from app.models.schemas import PlainSummaryResponse, RiskScore
from app.prompts.legal_audit_prompt import (
    PLAIN_LANGUAGE_TEMPLATE,
    RISK_SCORE_TEMPLATE
)
from app.services.graph.state import AuditState

logger = logging.getLogger(__name__)

_plain_llm = None
_risk_llm = None

def get_plain_llm():
    global _plain_llm
    if _plain_llm is None:
        base = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=settings.groq_api_key,
            temperature=0.3
        )

        _plain_llm = base.with_structured_output(PlainSummaryResponse)
    return _plain_llm

def get_risk_llm():
    global _risk_llm
    if _risk_llm is None:
        base = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=settings.groq_api_key,
            temperature=0.1
        )
        _risk_llm = base.with_structured_output(RiskScore)
    return _risk_llm

def classify_node(state: AuditState):
    logger.info(f"classify_node: {len(state['suspicious_items'])} items")

    verdicts = call_ai_batch_audit(state["suspicious_items"])

    needs_requery = any(v.get("needs_requery") for v in verdicts)

    return {
        "first_verdict" : verdicts,
        "final_verdict" : verdicts,
        "requery_needed" : needs_requery
    }

def confidence_router(state: AuditState):
    if state["requery_needed"]:
        return "needs_requery"
    return "no_requery"

def deep_research_node(state: AuditState):
    first_verdict = state["first_verdict"]
    suspicious_items = state["suspicious_items"]
    retriever = state["retriever"]

    requery_map = {
        v["index"] : v["suggested_query"]
        for v in first_verdict
        if v.get("needs_requery") and v.get("suggested_query")
    }

    logger.info(f"deep_research_node: re-querying {len(requery_map)} items")

    enriched_items= []

    for item in suspicious_items:
        if item["index"] in requery_map:
            followup_results = retriever.search(
                requery_map[item["index"]], n_results=1
            )

            if followup_results and followup_results["documents"][0]:
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
                enriched["policies"]    = item.get("policies", []) + extra_policies
                enriched["policy_text"] = enriched["policies"][0]["text"]
                enriched_items.append(enriched)
                continue

        enriched_items.append(item)

    second_verdicts = call_ai_batch_audit(enriched_items)

    return {"final_verdict" : second_verdicts}







