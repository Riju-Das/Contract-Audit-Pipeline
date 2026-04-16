import google.generativeai as genai
import json
import logging
from app.config.settings import settings
from google.generativeai.types import GenerationConfig
import re

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
    model_name="gemini-3-flash-preview",
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
- RED (ILLEGAL): Clearly violates law OR creates an unenforceable/unfair condition.
- YELLOW (RISKY): Vague, broad, or one-sided terms that may lead to misuse.
- GREEN (ACCEPTABLE): Standard, balanced, and legally valid clauses.

IMPORTANT RULES:
- Output MUST be valid JSON.
- Output MUST start with '[' and end with ']'.
- Do NOT include any text before or after the JSON.
- Do NOT use markdown (no ```).
- Do NOT explain outside the JSON.
- Ensure all keys and strings use double quotes.
- Ensure the JSON is syntactically valid.

If unsure, still return best possible JSON.

Return ONLY this format:

[
  {{
    "index": int,
    "severity": "RED" | "YELLOW" | "GREEN",
    "legal_principle": "string",
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
        raw_text = response.text.strip()
        print(f"Raw gemini output: {raw_text}", flush=True)

        match = re.search(r'\[.*]', raw_text, re.DOTALL)

        if not match:
            raise ValueError(f"No valid json array found in gemini response")

        clear_json = match.group(0)

        parsed = json.loads(clear_json)

        if not isinstance(parsed, list):
            raise ValueError("Parsed output is not a list")

        return parsed


    except Exception as e:
        logger.error(f"Error calling gemini: {e}")
        raise
