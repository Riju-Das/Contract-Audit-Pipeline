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
        "first_verdicts" : verdicts,
        "final_verdicts" : verdicts,
        "requery_needed" : needs_requery
    }

def confidence_router(state: AuditState):
    if state["requery_needed"]:
        return "needs_requery"
    for v in state["first_verdicts"]:
        if v.get("confidence", 100) < 85:
            return "needs_requery"
    return "no_requery"

def deep_research_node(state: AuditState):
    first_verdicts = state["first_verdicts"]
    suspicious_items = state["suspicious_items"]
    retriever = state["retriever"]

    requery_map = {
        v["index"] : v["suggested_query"]
        for v in first_verdicts
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

    return {"final_verdicts" : second_verdicts}


def plain_language_node(state: AuditState) -> dict:
    final_verdicts   = state["final_verdicts"]
    suspicious_items = state["suspicious_items"]

    if not final_verdicts:
        return {"enriched_verdicts": []}

    logger.info(f"plain_language_node: {len(final_verdicts)} verdicts")

    batch = []
    for verdict in final_verdicts:
        orig = next(
            (x for x in suspicious_items
             if x["index"] == verdict["index"]),
            None
        )
        batch.append({
            "index":     verdict["index"],
            "severity":  verdict.get("severity", "GREEN"),
            "reasoning": verdict.get("explanation", ""),
            "clause":    orig["contract_text"] if orig else ""
        })

    try:
        chain  = (
            ChatPromptTemplate.from_template(PLAIN_LANGUAGE_TEMPLATE)
            | get_plain_llm()
        )
        result: PlainSummaryResponse = chain.invoke({
            "batch_data": json.dumps(batch)
        })

        summary_map = {s.index: s.plain_summary for s in result.summaries}

        enriched = []
        for verdict in final_verdicts:
            v = dict(verdict)
            v["plain_summary"] = summary_map.get(verdict["index"], "")
            enriched.append(v)

        return {"enriched_verdicts": enriched}

    except Exception as e:
        logger.error(f"plain_language_node failed: {e}")
        return {
            "enriched_verdicts": [
                dict(v) | {"plain_summary": ""}
                for v in final_verdicts
            ]
        }


def risk_score_node(state: AuditState) -> dict:
    enriched_verdicts = state["enriched_verdicts"]
    suspicious_items  = state["suspicious_items"]

    logger.info("risk_score_node: calculating risk score")

    relevant = [
        v for v in enriched_verdicts
        if v.get("severity") in ("RED", "YELLOW")
    ]

    if not relevant:
        return {
            "risk_score": {
                "overall":      5,
                "grade":        "LOW_RISK",
                "compensation": 0,
                "termination":  0,
                "non_compete":  0,
                "ip_rights":    0,
                "data_privacy": 0,
            }
        }

    violations_summary = []
    for verdict in relevant:
        orig = next(
            (x for x in suspicious_items
             if x["index"] == verdict["index"]),
            None
        )
        violations_summary.append({
            "severity":        verdict.get("severity"),
            "legal_principle": verdict.get("legal_principle", ""),
            "explanation":     verdict.get("explanation", ""),
            "clause":          orig["contract_text"] if orig else "",
            "confidence":      verdict.get("confidence", 0),
        })

    try:
        chain  = (
            ChatPromptTemplate.from_template(RISK_SCORE_TEMPLATE)
            | get_risk_llm()
        )
        result: RiskScore = chain.invoke({
            "violations_data": json.dumps(violations_summary)
        })

        return {"risk_score": result.model_dump()}

    except Exception as e:
        logger.error(f"risk_score_node failed: {e}")
        return {
            "risk_score": {
                "overall":      50,
                "grade":        "MEDIUM_RISK",
                "compensation": 0,
                "termination":  0,
                "non_compete":  0,
                "ip_rights":    0,
                "data_privacy": 0,
            }
        }






