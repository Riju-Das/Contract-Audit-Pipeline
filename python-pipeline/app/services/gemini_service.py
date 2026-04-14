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
You are a Senior Legal Compliance Officer in India. 
Your task is to review a batch of potential contract violations.

For each item in the batch:
1. Compare the 'contract_text' against the 'policy_text'.
2. Determine if the contract actually violates the legal rule or limit.
3. Be strict: If the contract is within legal limits (e.g., policy says max 8 hours, contract says 7 hours), mark is_violation as false.
4. Provide a 'confidence' score (0-100) and a brief 'explanation'.

Return the result strictly as a JSON array of objects:
[
  {{
    "index": int,
    "is_violation": bool,
    "confidence": int,
    "explanation": "string"
  }}
]

BATCH DATA:
{batch_data}
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
