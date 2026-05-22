from typing import TypedDict , List

class AuditState(TypedDict):

    filename : str
    suspicious_items: List[dict]
    retriever : object

    first_verdicts : List[dict]
    final_verdicts : List[dict]

    requery_needed: bool

    enriched_verdicts: List[dict]

    risk_score: dict
