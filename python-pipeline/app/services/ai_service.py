import json
import logging
import re
from groq import Groq
from app.config.settings import settings
from app.prompts.legal_audit_prompt import LEGAL_AUDIT_TEMPLATE

logger = logging.getLogger(__name__)

client = Groq(api_key=settings.groq_api_key)



def call_ai_batch_audit(suspicious_items: list):

    if not suspicious_items:
        return []

    prompt = LEGAL_AUDIT_TEMPLATE.format(
        batch_data=json.dumps(suspicious_items)
    )
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[ #type:ignore
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )

        raw_text = response.choices[0].message.content.strip()
        print(f"Raw groq output: {raw_text}", flush=True)

        match = re.search(r'\[.*]', raw_text, re.DOTALL)

        if not match:
            raise ValueError("No valid json array found in groq response")

        clear_json = match.group(0)

        parsed = json.loads(clear_json)

        if not isinstance(parsed, list):
            raise ValueError("Parsed output is not a list")

        return parsed

    except Exception as e:
        logger.error(f"Error calling groq: {e}")
        raise