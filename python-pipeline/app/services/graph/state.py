from typing import TypedDict , List

class AuditState(TypedDict):

    filename : str
    suspicious_items: List[dict]
    retriever : object

    first_verdict : List[dict]
    final_verdict : List[dict]

    requery_needed: bool

    enriched_verdict: List[dict]

    risk_score: dict
