import json
import logging
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config.settings import settings
from app.prompts.legal_audit_prompt import LEGAL_AUDIT_TEMPLATE
from app.models.schemas import BatchVerdictResponse

logger = logging.getLogger(__name__)


_llm = None

def get_llm():
    global _llm
    if _llm is None:
        base = ChatGroq(
            model = "llama-3.3-70b-versatile",
            api_key = settings.groq_api_key,
            temperature = 0.1
        )

        _llm = base.with_structured_output(BatchVerdictResponse)

    return _llm


def call_ai_batch_audit(suspicious_items : list) -> list:

    if not suspicious_items:
        return []

    try:
        prompt = ChatPromptTemplate.from_template(LEGAL_AUDIT_TEMPLATE)

        chain = prompt | get_llm()

        result: BatchVerdictResponse = chain.invoke({
            "batch_data": json.dumps(suspicious_items),
        })

        logger.info(f"Structured output received: {len(result.verdicts)}")

        return [v.model_dump() for v in result.verdicts]

    except Exception as e:
        logger.error(f"Structured AI call failed: {e}")
        raise



