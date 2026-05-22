import logging
from langgraph.graph import StateGraph, END
from app.services.graph.state import AuditState
from app.services.graph.nodes import (
    classify_node,
    confidence_router,
    deep_research_node,
    plain_language_node,
    risk_score_node
)

logger = logging.getLogger(__name__)

def build_audit_graph():

    graph= StateGraph(AuditState)

    graph.add_node("classify_node", classify_node)
    graph.add_node("deep_research_node", deep_research_node)
    graph.add_node("plain_language_node", plain_language_node)
    graph.add_node("risk_score_node", risk_score_node)

    graph.set_entry_point("classify_node")

    graph.add_conditional_edges(
        "classify_node",
        confidence_router,
        {
            "needs_requery": "deep_research_node",
            "no_requery": "plain_language_node",
        }
    )

    graph.add_edge("deep_research_node", "plain_language_node")
    graph.add_edge("plain_language_node", "risk_score_node")

    graph.add_edge("risk_score_node", END)

    return graph.compile()

_graph = None

def get_graph():
    global _graph
    if _graph is None:
        logger.info("Building and compiling audit graph...")
        _graph = build_audit_graph()
        logger.info("Audit graph ready")
    return _graph

