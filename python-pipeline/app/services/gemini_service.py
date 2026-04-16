import google.generativeai as genai
import json
import logging
from app.config.settings import settings
from google.generativeai.types import GenerationConfig

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.gemini_api_key)

generation_config = GenerationConfig(
    temperature= 0.1,
    top_p = 0.95,
    top_k= 64,
    max_output_tokens= 8192,
    response_mime_type=  "application/json"
)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config
)

LEGAL_AUDIT_TEMPLATE = """
You are a senior Legal Auditor for Indian Law.

Analyze each contract clause using this 4-step reasoning process:

1. INTERPRET:
   - Identify semantic red flags like "sole discretion", "unlimited", "without notice", "as deemed appropriate".
   - Determine if the clause is one-sided, vague, or gives excessive power.

2. PRINCIPLE:
   - Identify the underlying legal principle involved 
     (e.g., Reasonableness, Equity, Consent, Purpose Limitation, Right to Remedy).

3. MAP TO POLICY:
   - Compare the clause with the provided policy_text.
   - Use policy_text as legal grounding, but DO NOT rely only on exact matches.

4. CLASSIFY:
   - RED (ILLEGAL): 
     Clearly violates law OR creates an unenforceable/unfair condition 
     (e.g., unlimited penalties, removal of legal rights, no consent).
   - YELLOW (RISKY): 
     Vague, broad, or one-sided terms that may lead to misuse.
   - GREEN (ACCEPTABLE): 
     Standard, balanced, and legally valid clauses.

IMPORTANT:
- Do NOT rely only on exact wording matches with policy_text.
- Use legal reasoning and fairness principles.
- If a clause gives unlimited or unchecked power to one party, treat it as RED.

Return JSON:
[
  {
    "index": int,
    "severity": "RED" | "YELLOW" | "GREEN",
    "legal_principle": "string",
    "confidence": int,
    "explanation": "string"
  }
]

BATCH DATA:
{context}
"""

async def call_gemini_batch_audit(suspicious_items: list):

    if not suspicious_items:
        return []

    prompt = LEGAL_AUDIT_TEMPLATE.format(batch_data= json.dumps(suspicious_items))
    try:
        response = await model.generate_content_async(prompt)
        clean_json = response.text.strip().replace("```json","").replace("```","")
        return json.loads(clean_json)

    except Exception as e:
        logger.error(f"Error calling gemini: {e}")
        return []
